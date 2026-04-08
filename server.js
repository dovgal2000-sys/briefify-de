import "dotenv/config";
import express from "express";
import multer from "multer";
import { appendFileSync } from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";

import {
  getAllArticles,
  getAllCategories,
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryBySlug
} from "./src/articles/index.js";
import {
  buildAdminCookie,
  buildAdminLogoutCookie,
  buildFeedbackAccessCookie,
  createAdminSession,
  createFeedbackAccessToken,
  parseCookies,
  verifyAdminSession,
  verifyFeedbackAccessToken
} from "./src/admin-auth.js";
import { getPublicConfig, getServerConfig } from "./src/config.js";
import { extractDocumentPayload } from "./src/document.js";
import { createTranslator, detectLocale, getFrontendMessages, normalizeLocale } from "./src/i18n.js";
import { getLegalContent } from "./src/legal.js";
import { analyzeLetterWithOpenAI } from "./src/openai.js";
import { createRateLimiter } from "./src/rate-limit.js";
import { createStatsStore, getDefaultReportRange, parseAdminDateRange } from "./src/stats.js";
import {
  buildAdminDashboardPage,
  buildAdminLoginPage,
  buildArticlePage,
  buildArticlesIndexPage,
  buildFeedbackPage,
  buildHomePage,
  buildLegalPage
} from "./src/templates.js";

const app = express();
const config = getServerConfig();
const publicConfig = getPublicConfig(config);
const statsStore = createStatsStore(config);
const MIN_HUMAN_FILL_MS = 1500;
const bootstrapLogCandidates = [
  process.env.HOME ? path.join(process.env.HOME, "briefify-bootstrap.log") : "",
  path.join(process.cwd(), "briefify-bootstrap.log")
].filter(Boolean);

function writeBootstrapLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  for (const candidate of bootstrapLogCandidates) {
    try {
      appendFileSync(candidate, line);
      break;
    } catch {
      // Ignore bootstrap logging failures so startup can continue.
    }
  }
}

process.on("uncaughtException", (error) => {
  writeBootstrapLog(`uncaughtException: ${error.stack || error.message}`);
});

process.on("unhandledRejection", (error) => {
  const details = error instanceof Error ? error.stack || error.message : String(error);
  writeBootstrapLog(`unhandledRejection: ${details}`);
});

writeBootstrapLog(
  `boot start; cwd=${process.cwd()}; node=${process.version}; env.PORT=${process.env.PORT || ""}; config.port=${config.port}`
);

async function validateTurnstileToken(token, remoteIp, secretKey) {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
      remoteip: remoteIp || ""
    })
  });

  if (!response.ok) {
    throw new Error(`Turnstile siteverify failed with status ${response.status}`);
  }

  return response.json();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeBytes }
});

const rateLimiter = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.rateLimitMaxRequests
});

app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const locale = detectLocale({
    queryLang: typeof req.query?.lang === "string" ? req.query.lang : "",
    cookieLang: cookies.briefify_locale || "",
    acceptLanguage: req.headers["accept-language"] || ""
  });

  req.locale = locale;
  req.t = createTranslator(locale);
  res.locals.locale = locale;
  res.locals.t = req.t;

  if (typeof req.query?.lang === "string" && normalizeLocale(req.query.lang) === req.query.lang) {
    res.append(
      "Set-Cookie",
      `briefify_locale=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    );
  }

  next();
});

function isAdminConfigured() {
  return Boolean(config.adminUsername && config.adminPassword && config.adminSessionSecret);
}

function toDateTimeLocalValue(dateTime) {
  return dateTime.toFormat("yyyy-MM-dd'T'HH:mm");
}

function buildPresetHref(label, startLocal, endLocal) {
  const params = new URLSearchParams({
    start: toDateTimeLocalValue(startLocal),
    end: toDateTimeLocalValue(endLocal)
  });

  return {
    label,
    href: `/admin?${params.toString()}`
  };
}

function buildAdminPresets() {
  const endLocal = DateTime.now().setZone(config.adminTimeZone);
  return [
    buildPresetHref("Остання година", endLocal.minus({ hours: 1 }), endLocal),
    buildPresetHref("Остання доба", endLocal.minus({ days: 1 }), endLocal),
    buildPresetHref("Останній тиждень", endLocal.minus({ days: 7 }), endLocal),
    buildPresetHref("З початку місяця", endLocal.startOf("month"), endLocal)
  ];
}

function ensureAdminAccess(req, res) {
  if (!isAdminConfigured()) {
    res.status(503).type("html").send(
      buildAdminLoginPage(publicConfig, {
        errorMessage:
          "Адмінка ще не налаштована. Додайте ADMIN_USERNAME, ADMIN_PASSWORD і ADMIN_SESSION_SECRET.",
        locale: res.locals.locale,
        t: res.locals.t
      })
    );
    return false;
  }

  const cookies = parseCookies(req.headers.cookie || "");
  const sessionToken = cookies[config.adminCookieName];

  if (!verifyAdminSession(sessionToken, config)) {
    res.redirect("/admin/login");
    return false;
  }

  return true;
}

app.disable("x-powered-by");
app.use("/assets", express.static("public", { extensions: ["css", "js"] }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/favicon.ico", (_req, res) => {
  res.redirect(301, "/assets/favicon.svg");
});

app.get("/ads.txt", (_req, res) => {
  res.sendFile("ads.txt", { root: process.cwd() });
});

app.get("/", (_req, res) => {
  const articles = getAllArticles(res.locals.locale);
  const approvedFeedback = statsStore.getApprovedFeedback(6);
  res.type("html").send(
    buildHomePage(publicConfig, articles.slice(0, 6), approvedFeedback, {
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.get("/index.html", (_req, res) => {
  res.redirect(301, "/");
});

app.get("/index.htm", (_req, res) => {
  res.redirect(301, "/");
});

app.get("/statti", (_req, res) => {
  const articles = getAllArticles(res.locals.locale);
  const categories = getAllCategories(res.locals.locale);
  res.type("html").send(
    buildArticlesIndexPage(publicConfig, articles, categories, null, {
      locale: res.locals.locale,
      t: res.locals.t,
      currentPath: "/statti"
    })
  );
});

app.get("/feedback", (_req, res) => {
  const approvedFeedback = statsStore.getApprovedFeedback(24);
  const cookies = parseCookies(_req.headers.cookie || "");
  const hasFeedbackAccess = verifyFeedbackAccessToken(
    cookies[config.feedbackAccessCookieName],
    config
  );
  res.type("html").send(
    buildFeedbackPage(publicConfig, approvedFeedback, {
      locale: res.locals.locale,
      t: res.locals.t,
      hasFeedbackAccess
    })
  );
});

app.get("/statti/kategoria/:categorySlug", (req, res) => {
  const categories = getAllCategories(res.locals.locale);
  const category = getCategoryBySlug(req.params.categorySlug, res.locals.locale);

  if (!category) {
    return res.status(404).type("html").send(buildLegalPage(
      "404",
      "Категорію не знайдено",
      `
        <h1>404</h1>
        <p>Category was not found.</p>
        <p><a href="/statti">${res.locals.t("articlesAll")}</a></p>
      `,
      publicConfig,
      { locale: res.locals.locale, t: res.locals.t, currentPath: req.path }
    ));
  }

  const filteredArticles = getArticlesByCategory(category.slug, res.locals.locale);
  return res.type("html").send(
    buildArticlesIndexPage(publicConfig, filteredArticles, categories, category, {
      locale: res.locals.locale,
      t: res.locals.t,
      currentPath: req.path
    })
  );
});

app.get("/statti/:slug", (req, res) => {
  const article = getArticleBySlug(req.params.slug, res.locals.locale);

  if (!article) {
    return res.status(404).type("html").send(buildLegalPage(
      "404",
      "Статтю не знайдено",
      `
        <h1>404</h1>
        <p>Article was not found.</p>
        <p><a href="/statti">${res.locals.t("articlesAll")}</a></p>
      `,
      publicConfig,
      { locale: res.locals.locale, t: res.locals.t, currentPath: req.path }
    ));
  }

  const relatedArticles = getAllArticles(res.locals.locale)
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(0, 3);

  return res.type("html").send(
    buildArticlePage(article, relatedArticles, publicConfig, {
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    ["User-agent: *", "Allow: /", "Disallow: /api/", "", "Sitemap: /sitemap.xml"].join("\n")
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const baseUrl = publicConfig.siteOrigin.replace(/\/$/, "");
  const articles = getAllArticles("uk");
  const urls = [
    "/",
    "/statti",
    "/impressum",
    "/datenschutz",
    "/kontakt",
    ...articles.map((article) => `/statti/${article.slug}`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${baseUrl}${url}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

app.get("/impressum", async (_req, res) => {
  try {
    const legalHtml = await getLegalContent("impressum", publicConfig);
    res.type("html").send(
      buildLegalPage("impressum", "Impressum", legalHtml, publicConfig, {
        locale: res.locals.locale,
        t: res.locals.t
      })
    );
  } catch (error) {
    console.error("[briefify] impressum failed:", error.message);
    res.status(500).send("Impressum content is unavailable.");
  }
});

app.get("/datenschutz", async (_req, res) => {
  try {
    const legalHtml = await getLegalContent("datenschutz", publicConfig);
    res.type("html").send(
      buildLegalPage("datenschutz", "Datenschutzerklärung", legalHtml, publicConfig, {
        locale: res.locals.locale,
        t: res.locals.t
      })
    );
  } catch (error) {
    console.error("[briefify] datenschutz failed:", error.message);
    res.status(500).send("Datenschutz content is unavailable.");
  }
});

app.get("/kontakt", (_req, res) => {
  const legalHtml = `
    <h1>${res.locals.t("legalContactTitle")}</h1>
    <p>${res.locals.t("legalContactIntro")}</p>
    <p><a href="mailto:${publicConfig.contactEmail}">${publicConfig.contactEmail}</a></p>
  `;
  res.type("html").send(
    buildLegalPage("kontakt", res.locals.t("legalContactTitle"), legalHtml, publicConfig, {
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.get("/api/public-config", (_req, res) => {
  res.json({
    appName: publicConfig.appName,
    maxFileSizeMb: Math.floor(config.maxFileSizeBytes / (1024 * 1024)),
    supportedFormats: config.allowedExtensions
  });
});

app.get("/admin/login", (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).type("html").send(
      buildAdminLoginPage(publicConfig, {
        errorMessage:
          "Адмінка ще не налаштована. Додайте ADMIN_USERNAME, ADMIN_PASSWORD і ADMIN_SESSION_SECRET.",
        locale: res.locals.locale,
        t: res.locals.t
      })
    );
  }

  const cookies = parseCookies(req.headers.cookie || "");
  if (verifyAdminSession(cookies[config.adminCookieName], config)) {
    return res.redirect("/admin");
  }

  return res.type("html").send(
    buildAdminLoginPage(publicConfig, {
      errorMessage: req.query.error === "invalid" ? "Неправильний логін або пароль." : "",
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.post("/admin/login", (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).type("html").send(
      buildAdminLoginPage(publicConfig, {
        errorMessage:
          "Адмінка ще не налаштована. Додайте ADMIN_USERNAME, ADMIN_PASSWORD і ADMIN_SESSION_SECRET.",
        locale: res.locals.locale,
        t: res.locals.t
      })
    );
  }

  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (username !== config.adminUsername || password !== config.adminPassword) {
    return res.redirect("/admin/login?error=invalid");
  }

  res.setHeader("Set-Cookie", buildAdminCookie(createAdminSession(config), config));
  return res.redirect("/admin");
});

app.post("/admin/logout", (_req, res) => {
  res.setHeader("Set-Cookie", buildAdminLogoutCookie(config));
  return res.redirect("/admin/login");
});

app.get("/admin", (req, res) => {
  if (!ensureAdminAccess(req, res)) {
    return;
  }

  const feedbackFilterRaw = String(req.query.feedback_status || "all");
  const feedbackFilter = ["pending", "approved", "rejected"].includes(feedbackFilterRaw)
    ? feedbackFilterRaw
    : "all";

  const defaultRange = getDefaultReportRange(config.adminTimeZone);
  const parsedRange =
    req.query.start && req.query.end
      ? parseAdminDateRange({
          startLocalRaw: String(req.query.start),
          endLocalRaw: String(req.query.end),
          timeZone: config.adminTimeZone
        })
      : {
          ok: true,
          ...defaultRange
        };

  const effectiveRange = parsedRange.ok
    ? parsedRange
    : {
        ok: true,
        ...defaultRange
      };

  const report = statsStore.getReport({
    startUtcIso: effectiveRange.startUtcIso,
    endUtcIso: effectiveRange.endUtcIso
  });
  const feedbackModeration = statsStore.getFeedbackModeration({
    limit: 60,
    status: feedbackFilter === "all" ? null : feedbackFilter
  });

  return res.type("html").send(
    buildAdminDashboardPage(publicConfig, {
      quickStats: statsStore.getQuickStats(),
      report,
      reportRange: {
        startValue: toDateTimeLocalValue(effectiveRange.startLocal),
        endValue: toDateTimeLocalValue(effectiveRange.endLocal),
        startIso: effectiveRange.startUtcIso,
        endIso: effectiveRange.endUtcIso
      },
      feedbackModeration,
      feedbackFilter,
      presets: buildAdminPresets(),
      errorMessage: parsedRange.ok ? "" : parsedRange.error,
      timeZone: config.adminTimeZone,
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.post("/admin/feedback/:id/status", (req, res) => {
  if (!ensureAdminAccess(req, res)) {
    return;
  }

  const id = Number(req.params.id);
  const status = String(req.body?.status || "");

  if (!id || Number.isNaN(id) || !["approved", "rejected"].includes(status)) {
    return res.redirect("/admin");
  }

  statsStore.updateFeedbackStatus({
    id,
    status,
    reviewedBy: config.adminUsername
  });

  return res.redirect("/admin");
});

app.post("/api/analyze-letter", rateLimiter, upload.single("letter"), async (req, res) => {
  try {
    if (!config.turnstileSecretKey) {
      return res.status(500).json({
        error: req.t("apiTurnstileMissing")
      });
    }

    if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
      return res.status(400).json({
        error: req.t("apiBotRejected")
      });
    }

    const loadedAt = Number(req.body?.form_loaded_at || 0);
    if (!loadedAt || Date.now() - loadedAt < MIN_HUMAN_FILL_MS) {
      return res.status(400).json({
        error: req.t("apiBotWait")
      });
    }

    const turnstileToken = String(req.body?.cf_turnstile_response || "").trim();
    if (!turnstileToken) {
      return res.status(400).json({
        error: req.t("apiTurnstileConfirm")
      });
    }

    const turnstileResult = await validateTurnstileToken(
      turnstileToken,
      req.socket.remoteAddress,
      config.turnstileSecretKey
    );

    if (!turnstileResult.success) {
      return res.status(400).json({
        error: req.t("apiTurnstileFailed")
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: req.t("apiNeedFile")
      });
    }

    if (req.body?.consent !== "true") {
      return res.status(400).json({
        error: req.t("apiNeedConsent")
      });
    }

    const extraction = await extractDocumentPayload(req.file, {
      ...config,
      uploadTypesMessage: req.t("apiUploadTypes"),
      emptyFileMessage: req.t("apiEmptyFile")
    });
    const analysis = await analyzeLetterWithOpenAI({
      file: req.file,
      extraction,
      config: {
        ...config,
        outputLanguage: normalizeLocale(req.locale || "uk")
      }
    });

    statsStore.recordTranslationEvent({
      mimeType: req.file.mimetype,
      extractionMode: extraction.mode,
      originalFilename: req.file.originalname
    });

    res.append(
      "Set-Cookie",
      buildFeedbackAccessCookie(createFeedbackAccessToken(config), config)
    );

    return res.json({
      ...analysis,
      meta: {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        extractedTextLength: extraction.extractedText.length,
        extractionMode: extraction.mode
      }
    });
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    const message =
      error.publicMessage ||
      req.t("apiGenericError");

    if (status >= 500) {
      console.error("[briefify] analyze-letter failed:", error.message);
    }

    return res.status(status).json({ error: message });
  }
});

app.post("/api/feedback", rateLimiter, upload.none(), async (req, res) => {
  try {
    if (!config.turnstileSecretKey) {
      return res.status(500).json({
        error: req.t("apiTurnstileMissing")
      });
    }

    if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
      return res.status(400).json({
        error: req.t("apiBotRejected")
      });
    }

    const cookies = parseCookies(req.headers.cookie || "");
    if (!verifyFeedbackAccessToken(cookies[config.feedbackAccessCookieName], config)) {
      return res.status(403).json({
        error: req.t("apiFeedbackAccessRequired")
      });
    }

    const loadedAt = Number(req.body?.form_loaded_at || 0);
    if (!loadedAt || Date.now() - loadedAt < MIN_HUMAN_FILL_MS) {
      return res.status(400).json({
        error: req.t("apiBotWait")
      });
    }

    const turnstileToken = String(req.body?.cf_turnstile_response || "").trim();
    if (!turnstileToken) {
      return res.status(400).json({
        error: req.t("apiTurnstileConfirm")
      });
    }

    const turnstileResult = await validateTurnstileToken(
      turnstileToken,
      req.socket.remoteAddress,
      config.turnstileSecretKey
    );

    if (!turnstileResult.success) {
      return res.status(400).json({
        error: req.t("apiTurnstileFailed")
      });
    }

    const authorName = String(req.body?.author_name || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!authorName) {
      return res.status(400).json({
        error: req.t("apiFeedbackNameRequired")
      });
    }

    if (!message) {
      return res.status(400).json({
        error: req.t("apiFeedbackMessageRequired")
      });
    }

    if (authorName.length > 80 || message.length > 1200) {
      return res.status(400).json({
        error: req.t("apiFeedbackTooLong")
      });
    }

    statsStore.createFeedbackEntry({
      locale: normalizeLocale(req.locale || "uk"),
      authorName,
      message
    });

    return res.json({
      ok: true,
      message: req.t("feedbackPendingSuccess")
    });
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    const message = error.publicMessage || req.t("apiFeedbackGenericError");

    if (status >= 500) {
      console.error("[briefify] feedback failed:", error.message);
    }

    return res.status(status).json({ error: message });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: `Max file size: ${Math.floor(
        config.maxFileSizeBytes / (1024 * 1024)
      )} MB.`
    });
  }

  console.error("[briefify] unhandled error:", error.message);
  return res.status(500).json({
    error: "Сервер тимчасово недоступний. Спробуйте ще раз пізніше."
  });
});

app.listen(config.port, () => {
  writeBootstrapLog(`server listening on port ${config.port}`);
  console.log(`[briefify] server listening on http://localhost:${config.port}`);
});
