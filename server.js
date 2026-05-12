import "dotenv/config";
import express from "express";
import multer from "multer";
import { appendFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
  buildLegalPage,
  buildPartnersPage
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

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "GoogleOther",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "Applebot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot"
];

const TRUST_PAGES = {
  "pro-nas": {
    title: "Про нас",
    description: "Хто стоїть за Briefify.de і для кого створений сервіс.",
    html: `
      <h1>Про Briefify.de</h1>
      <p>Briefify.de допомагає українцям у Німеччині зрозуміти офіційні та побутові листи простими словами.</p>
      <p>Сервіс пояснює зміст документа, виділяє можливі дедлайни, суми, ризики та пропонує чернетку ввічливої відповіді, якщо вона доречна.</p>
      <h2>Для кого цей сервіс</h2>
      <p>Briefify.de створений для людей, яким важко швидко розібратися з німецькими листами від Jobcenter, школи, Krankenkasse, Ausländerbehörde, орендодавців або сервісних компаній.</p>
      <h2>Важливе обмеження</h2>
      <p>Briefify.de не є юридичною консультацією і не замінює адвоката, Beratungsstelle або офіційний переклад. Якщо лист має серйозні правові наслідки, зверніться до профільного фахівця.</p>
    `
  },
  "yak-pratsiuye": {
    title: "Як працює Briefify",
    description: "Пояснення процесу аналізу листів у Briefify.de.",
    html: `
      <h1>Як працює Briefify</h1>
      <p>Ви завантажуєте фото, зображення або PDF листа. Сервіс читає зміст документа та повертає коротке пояснення зрозумілою мовою.</p>
      <h2>Що ви отримуєте</h2>
      <ul>
        <li>короткий зміст листа;</li>
        <li>список дій, які варто перевірити;</li>
        <li>дедлайни, суми та можливі ризики, якщо вони є в документі;</li>
        <li>чернетку відповіді та пояснення її змісту.</li>
      </ul>
      <h2>Що перевіряти самостійно</h2>
      <p>Завжди звіряйте імена, номери справ, адреси, суми, дати та банківські реквізити з оригінальним документом.</p>
    `
  },
  "bezpeka-ta-pryvatnist": {
    title: "Безпека та приватність",
    description: "Як Briefify.de ставиться до приватності, документів і технічної безпеки.",
    html: `
      <h1>Безпека та приватність</h1>
      <p>Briefify.de обробляє документи тільки для того, щоб підготувати пояснення листа. Ми не просимо завантажувати більше даних, ніж потрібно для розбору конкретного документа.</p>
      <h2>Що варто приховати перед завантаженням</h2>
      <p>Якщо можливо, закрийте або обріжте зайві персональні дані, які не потрібні для розуміння листа: повні номери рахунків, медичні деталі, паролі, коди доступу або інші секретні дані.</p>
      <h2>Документи з високим ризиком</h2>
      <p>Не завантажуйте документи, якщо ви не маєте права їх обробляти або вони містять дані інших людей без їхньої згоди.</p>
      <p>Детальні юридичні відомості наведені в <a href="/datenschutz">Datenschutzerklärung</a>.</p>
    `
  },
  "redaktsiina-polityka": {
    title: "Редакційна політика",
    description: "Як Briefify.de готує інформаційні статті та приклади.",
    html: `
      <h1>Редакційна політика</h1>
      <p>Статті на Briefify.de мають інформаційний характер. Їхня мета - допомогти читачам краще орієнтуватися в типових німецьких листах і формулюваннях.</p>
      <h2>Принципи</h2>
      <ul>
        <li>пояснюємо простою мовою;</li>
        <li>відділяємо загальні поради від юридично значущих рішень;</li>
        <li>нагадуємо перевіряти дедлайни та дані в оригіналі;</li>
        <li>не видаємо інформаційні матеріали за індивідуальну юридичну консультацію.</li>
      </ul>
      <h2>Оновлення</h2>
      <p>Матеріали можуть оновлюватися, коли змінюються процеси, формулювання або потреби користувачів.</p>
    `
  }
};

function getBaseUrl() {
  return publicConfig.siteOrigin.replace(/\/$/, "");
}

function createSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function getAgentLinkHeaders() {
  return [
    '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
    '</docs/api>; rel="service-doc"; type="text/html"',
    '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
    '</api/health>; rel="status"; type="application/json"',
    '</.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"',
    '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
    '</.well-known/http-message-signatures-directory>; rel="service-desc"; type="application/http-message-signatures-directory+json"'
  ].join(", ");
}

function wantsMarkdown(req) {
  return (req.headers.accept || "").toLowerCase().includes("text/markdown");
}

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));
}

function extractHtmlMeta(html, pattern) {
  const match = html.match(pattern);
  return decodeHtmlEntities(match?.[1] || "").trim();
}

function htmlToMarkdown(html, fallbackUrl = getBaseUrl()) {
  const title =
    extractHtmlMeta(html, /<meta\s+name=["']title["']\s+content=["']([^"']*)["'][^>]*>/i) ||
    extractHtmlMeta(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["'][^>]*>/i) ||
    extractHtmlMeta(html, /<title>([\s\S]*?)<\/title>/i);
  const description =
    extractHtmlMeta(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i) ||
    extractHtmlMeta(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["'][^>]*>/i);
  const image = extractHtmlMeta(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["'][^>]*>/i);
  const jsonLdBlocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  ).map((match) => match[1].trim());

  let body = html
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, text) => {
      const absoluteHref = href.startsWith("/") ? `${fallbackUrl}${href}` : href;
      return `[${text}](${absoluteHref})`;
    })
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ");

  body = decodeHtmlEntities(body).trim();

  const frontmatter = [
    "---",
    title ? `title: ${title}` : "",
    description ? `description: ${description}` : "",
    image ? `image: ${image}` : "",
    "---"
  ].filter(Boolean);

  const sections = [];
  if (frontmatter.length > 2) {
    sections.push(frontmatter.join("\n"));
  }
  sections.push(body || `# ${title || "Briefify.de"}`);
  if (jsonLdBlocks.length) {
    sections.push(["```json", ...jsonLdBlocks, "```"].join("\n"));
  }

  return `${sections.join("\n\n")}\n`;
}

function sendHtmlOrMarkdown(req, res, html, { status = 200, markdown = "" } = {}) {
  res.status(status).set("Vary", "Accept");

  if (wantsMarkdown(req)) {
    const markdownBody = markdown || htmlToMarkdown(html);
    return res
      .type("text/markdown")
      .set("X-Markdown-Tokens", String(Math.ceil(markdownBody.length / 4)))
      .set("Content-Signal", "ai-train=no, search=yes, ai-input=yes")
      .send(markdownBody);
  }

  return res.type("html").send(html);
}

function buildHomeMarkdown(articles = [], feedbackEntries = [], locale = "uk") {
  const baseUrl = getBaseUrl();
  const articleLines = articles
    .map((article) => `- [${article.title}](${baseUrl}/statti/${article.slug}) - ${article.description}`)
    .join("\n");
  const feedbackLines = feedbackEntries
    .map((entry) => `- ${entry.author_name}: ${entry.message}`)
    .join("\n");

  return [
    "# Briefify.de",
    "",
    locale === "de"
      ? "Briefify.de erklärt deutsche Briefe verständlich und hilft, Fristen, Risiken und Antwortentwürfe zu erkennen."
      : "Briefify.de пояснює німецькі листи українською та допомагає знайти дедлайни, ризики й чернетку відповіді.",
    "",
    "## Key actions",
    "",
    `- Analyze a document: ${baseUrl}/`,
    `- Read articles: ${baseUrl}/statti`,
    `- Safety and privacy: ${baseUrl}/bezpeka-ta-pryvatnist`,
    `- Contact: ${baseUrl}/kontakt`,
    "",
    "## Featured articles",
    "",
    articleLines || "- No featured articles are currently available.",
    "",
    "## User feedback",
    "",
    feedbackLines || "- No public feedback is currently available.",
    "",
    "## Agent discovery",
    "",
    `- API catalog: ${baseUrl}/.well-known/api-catalog`,
    `- OpenAPI description: ${baseUrl}/openapi.json`,
    `- Agent skills: ${baseUrl}/.well-known/agent-skills/index.json`,
    `- MCP server card: ${baseUrl}/.well-known/mcp/server-card.json`,
    `- llms.txt: ${baseUrl}/llms.txt`
  ].join("\n");
}

function sendHomeResponse(req, res, articles, approvedFeedback) {
  res.set("Link", getAgentLinkHeaders());

  const html = buildHomePage(publicConfig, articles.slice(0, 6), approvedFeedback, {
      locale: res.locals.locale,
      t: res.locals.t
    });
  return sendHtmlOrMarkdown(req, res, html, {
    markdown: buildHomeMarkdown(articles.slice(0, 6), approvedFeedback, res.locals.locale)
  });
}

function getOpenApiDocument() {
  const baseUrl = getBaseUrl();

  return {
    openapi: "3.1.0",
    info: {
      title: "Briefify.de public API",
      version: "0.1.0",
      description:
        "Public endpoints exposed by Briefify.de for document analysis, public configuration, feedback submission, and health checks. Document analysis requires user consent and anti-bot validation."
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/api/health": {
        get: {
          summary: "Health check",
          responses: {
            200: {
              description: "Service is running"
            }
          }
        }
      },
      "/api/public-config": {
        get: {
          summary: "Public UI configuration",
          responses: {
            200: {
              description: "Public configuration values used by the browser client"
            }
          }
        }
      },
      "/api/analyze-letter": {
        post: {
          summary: "Analyze an uploaded document",
          description:
            "Accepts multipart form data with a JPG, PNG, or PDF document. Requires consent and Cloudflare Turnstile validation when configured.",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["letter", "consent"],
                  properties: {
                    letter: { type: "string", format: "binary" },
                    consent: { type: "string" },
                    form_loaded_at: { type: "string" },
                    website: { type: "string" },
                    cf_turnstile_response: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Structured document explanation" },
            400: { description: "Invalid request" },
            429: { description: "Rate limit exceeded" }
          }
        }
      },
      "/api/feedback": {
        post: {
          summary: "Submit user feedback",
          description:
            "Submits feedback after a successful document analysis flow. Feedback is moderated before publication.",
          responses: {
            200: { description: "Feedback received" },
            403: { description: "Feedback access token missing or invalid" }
          }
        }
      }
    }
  };
}

function getAgentSkillMarkdown(baseUrl = getBaseUrl()) {
  return `# Briefify Document Analysis

Briefify.de helps Ukrainian speakers in Germany understand German letters and documents in plain language.

## Use Cases

- Explain a German official or everyday letter.
- Identify deadlines, amounts, risks, and next steps.
- Draft a polite reply in the original document language.

## Entry Points

- Web app: ${baseUrl}/
- API catalog: ${baseUrl}/.well-known/api-catalog
- OpenAPI: ${baseUrl}/openapi.json

## Safety

Briefify.de is informational only and is not legal advice. Users should not upload documents they are not allowed to process. Agents must not publish or quote private uploaded document content.`;
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

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: publicConfig.appName,
    time: new Date().toISOString()
  });
});

app.get("/openapi.json", (_req, res) => {
  res.type("application/vnd.oai.openapi+json").send(JSON.stringify(getOpenApiDocument(), null, 2));
});

app.get("/docs/api", (req, res) => {
  const baseUrl = getBaseUrl();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Briefify.de API Documentation</title>
</head>
<body>
  <main>
    <h1>Briefify.de API Documentation</h1>
    <p>Briefify.de exposes a small public API for health checks, public configuration, document analysis, and moderated feedback.</p>
    <ul>
      <li><a href="${baseUrl}/openapi.json">OpenAPI description</a></li>
      <li><a href="${baseUrl}/.well-known/api-catalog">API catalog</a></li>
      <li><a href="${baseUrl}/api/health">Health endpoint</a></li>
    </ul>
    <p>Document analysis requires explicit user consent and anti-bot validation when configured. Briefify.de is informational only and is not legal advice.</p>
  </main>
</body>
</html>`;
  sendHtmlOrMarkdown(req, res, html);
});

app.get("/.well-known/api-catalog", (_req, res) => {
  const baseUrl = getBaseUrl();
  res
    .type("application/linkset+json")
    .set("Link", '</.well-known/api-catalog>; rel="api-catalog"')
    .send(
      JSON.stringify(
        {
          linkset: [
            {
              anchor: `${baseUrl}/api`,
              "service-desc": [{ href: `${baseUrl}/openapi.json`, type: "application/vnd.oai.openapi+json" }],
              "service-doc": [{ href: `${baseUrl}/docs/api`, type: "text/html" }],
              status: [{ href: `${baseUrl}/api/health`, type: "application/json" }],
              item: [
                { href: `${baseUrl}/api/health` },
                { href: `${baseUrl}/api/public-config` },
                { href: `${baseUrl}/api/analyze-letter` },
                { href: `${baseUrl}/api/feedback` }
              ]
            }
          ]
        },
        null,
        2
      )
    );
});

app.get("/.well-known/openid-configuration", (_req, res) => {
  const baseUrl = getBaseUrl();
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,
    jwks_uri: `${baseUrl}/oauth/jwks.json`,
    response_types_supported: [],
    grant_types_supported: [],
    scopes_supported: [],
    claims_supported: [],
    service_documentation: `${baseUrl}/docs/api`,
    note: "Briefify.de does not currently offer OAuth/OIDC login for public agent APIs."
  });
});

app.get("/.well-known/oauth-authorization-server", (_req, res) => {
  const baseUrl = getBaseUrl();
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,
    jwks_uri: `${baseUrl}/oauth/jwks.json`,
    response_types_supported: [],
    grant_types_supported: [],
    scopes_supported: [],
    service_documentation: `${baseUrl}/docs/api`,
    note: "No OAuth grants are currently enabled for public Briefify.de APIs."
  });
});

app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  const baseUrl = getBaseUrl();
  res.json({
    resource: baseUrl,
    authorization_servers: [baseUrl],
    scopes_supported: [],
    bearer_methods_supported: ["header"],
    resource_documentation: `${baseUrl}/docs/api`,
    note: "Public discovery endpoints are unauthenticated. Browser document-analysis flows use consent, rate limiting, and anti-bot validation rather than OAuth."
  });
});

app.get("/oauth/jwks.json", (_req, res) => {
  res.json({ keys: [] });
});

app.all(["/oauth/authorize", "/oauth/token"], (_req, res) => {
  res.status(501).json({
    error: "oauth_not_enabled",
    error_description: "Briefify.de does not currently issue OAuth tokens for public APIs."
  });
});

app.get("/.well-known/mcp/server-card.json", (_req, res) => {
  const baseUrl = getBaseUrl();
  res.json({
    schemaVersion: "0.1",
    serverInfo: {
      name: "Briefify.de",
      version: "0.1.0"
    },
    description: "Agent discovery card for Briefify.de document explanation resources.",
    transports: [
      {
        type: "webmcp",
        endpoint: baseUrl
      }
    ],
    capabilities: {
      tools: true,
      resources: true,
      prompts: false
    },
    links: {
      apiCatalog: `${baseUrl}/.well-known/api-catalog`,
      openapi: `${baseUrl}/openapi.json`,
      llms: `${baseUrl}/llms.txt`
    }
  });
});

app.get("/.well-known/http-message-signatures-directory", (_req, res) => {
  res
    .type("application/http-message-signatures-directory+json")
    .set("Cache-Control", "max-age=86400")
    .send(
      JSON.stringify(
        {
          keys: []
        },
        null,
        2
      )
    );
});

app.get("/.well-known/agent-skills/briefify-document-analysis/SKILL.md", (_req, res) => {
  res.type("text/markdown").send(getAgentSkillMarkdown());
});

app.get("/.well-known/agent-skills/index.json", (_req, res) => {
  const baseUrl = getBaseUrl();
  const skillMarkdown = getAgentSkillMarkdown(baseUrl);
  res.json({
    $schema: "https://agentskills.io/schemas/agent-skills-index-v0.2.json",
    skills: [
      {
        name: "briefify-document-analysis",
        type: "skill",
        description: "Explain German letters for Ukrainian speakers and identify actions, deadlines, risks, and reply drafts.",
        url: `${baseUrl}/.well-known/agent-skills/briefify-document-analysis/SKILL.md`,
        sha256: createSha256(skillMarkdown)
      }
    ]
  });
});

app.get("/", (req, res) => {
  const articles = getAllArticles(res.locals.locale);
  const approvedFeedback = statsStore.getApprovedFeedback(6);
  sendHomeResponse(req, res, articles, approvedFeedback);
});

app.get("/index.html", (_req, res) => {
  res.redirect(301, "/");
});

app.get("/index.htm", (_req, res) => {
  res.redirect(301, "/");
});

app.get("/statti", (req, res) => {
  const articles = getAllArticles(res.locals.locale);
  const categories = getAllCategories(res.locals.locale);
  sendHtmlOrMarkdown(req, res,
    buildArticlesIndexPage(publicConfig, articles, categories, null, {
      locale: res.locals.locale,
      t: res.locals.t,
      currentPath: "/statti"
    })
  );
});

app.get("/feedback", (req, res) => {
  const approvedFeedback = statsStore.getApprovedFeedback(24);
  const cookies = parseCookies(req.headers.cookie || "");
  const hasFeedbackAccess = verifyFeedbackAccessToken(
    cookies[config.feedbackAccessCookieName],
    config
  );
  sendHtmlOrMarkdown(req, res,
    buildFeedbackPage(publicConfig, approvedFeedback, {
      locale: res.locals.locale,
      t: res.locals.t,
      hasFeedbackAccess
    })
  );
});

app.get("/partners", (req, res) => {
  sendHtmlOrMarkdown(req, res,
    buildPartnersPage(publicConfig, {
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.get("/statti/kategoria/:categorySlug", (req, res) => {
  const categories = getAllCategories(res.locals.locale);
  const category = getCategoryBySlug(req.params.categorySlug, res.locals.locale);

  if (!category) {
    return sendHtmlOrMarkdown(req, res, buildLegalPage(
      "404",
      "Категорію не знайдено",
      `
        <h1>404</h1>
        <p>Category was not found.</p>
        <p><a href="/statti">${res.locals.t("articlesAll")}</a></p>
      `,
      publicConfig,
      { locale: res.locals.locale, t: res.locals.t, currentPath: req.path }
    ), { status: 404 });
  }

  const filteredArticles = getArticlesByCategory(category.slug, res.locals.locale);
  return sendHtmlOrMarkdown(req, res,
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
    return sendHtmlOrMarkdown(req, res, buildLegalPage(
      "404",
      "Статтю не знайдено",
      `
        <h1>404</h1>
        <p>Article was not found.</p>
        <p><a href="/statti">${res.locals.t("articlesAll")}</a></p>
      `,
      publicConfig,
      { locale: res.locals.locale, t: res.locals.t, currentPath: req.path }
    ), { status: 404 });
  }

  const relatedArticles = getAllArticles(res.locals.locale)
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(0, 3);

  return sendHtmlOrMarkdown(req, res,
    buildArticlePage(article, relatedArticles, publicConfig, {
      locale: res.locals.locale,
      t: res.locals.t
    })
  );
});

app.get("/robots.txt", (_req, res) => {
  const aiCrawlerRules = AI_CRAWLERS.flatMap((crawler) => [
    "",
    `User-agent: ${crawler}`,
    "Allow: /"
  ]);

  res
    .type("text/plain")
    .set("Content-Signal", "ai-train=no, search=yes, ai-input=yes")
    .send(
    [
      "User-agent: *",
      "Allow: /",
      "Content-Signal: ai-train=no, search=yes, ai-input=yes",
      ...aiCrawlerRules,
      "",
      `Host: ${publicConfig.siteOrigin.replace(/^https?:\/\//, "").replace(/\/$/, "")}`,
      `Sitemap: ${publicConfig.siteOrigin.replace(/\/$/, "")}/sitemap.xml`
    ].join("\n")
  );
});

app.get("/llms.txt", (_req, res) => {
  const baseUrl = publicConfig.siteOrigin.replace(/\/$/, "");
  const articles = getAllArticles("uk").slice(0, 12);
  const articleLinks = articles.map((article) => `- [${article.title}](${baseUrl}/statti/${article.slug}): ${article.description}`);

  res.type("text/plain").send(
    [
      "# Briefify.de",
      "",
      "> Briefify.de helps Ukrainian speakers in Germany understand German official and everyday letters in plain language.",
      "",
      "Briefify.de is a web application for explaining letters from German institutions and services. It can summarize a document, identify actions, deadlines, amounts, risks, and draft a polite reply. It is informational only and is not legal advice.",
      "",
      "## Primary Pages",
      `- [Home](${baseUrl}/): Upload a letter and get a plain-language explanation.`,
      `- [Articles](${baseUrl}/statti): Guides about German letters, Jobcenter, school, health insurance, contracts, and migration offices.`,
      `- [How Briefify Works](${baseUrl}/yak-pratsiuye): Explanation of the analysis process and limitations.`,
      `- [About](${baseUrl}/pro-nas): Who the service is for and what it does.`,
      `- [Safety and Privacy](${baseUrl}/bezpeka-ta-pryvatnist): Practical privacy guidance for uploaded documents.`,
      `- [Editorial Policy](${baseUrl}/redaktsiina-polityka): How informational articles are prepared.`,
      `- [Contact](${baseUrl}/kontakt): Contact details.`,
      "",
      "## Useful Articles",
      ...articleLinks,
      "",
      "## AI Crawling and Citation Guidance",
      "- AI assistants may crawl and cite public pages on this site.",
      "- Do not submit private user documents to the public web or quote user-uploaded document content.",
      "- When citing Briefify.de, link to the most relevant public page and preserve the informational-not-legal-advice context.",
      "- API endpoints under /api/ are not intended for crawling.",
      "",
      "## Languages",
      "- Main audience language: Ukrainian.",
      "- Site and legal context: Germany.",
      "- Some interface and legal pages are also available in German.",
      "",
      "## Contact",
      `- Support: ${publicConfig.supportEmail}`,
      `- Legal contact: ${publicConfig.contactEmail}`,
      "",
      "## Sitemap",
      `- ${baseUrl}/sitemap.xml`
    ].join("\n")
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const baseUrl = publicConfig.siteOrigin.replace(/\/$/, "");
  const articles = getAllArticles("uk");
  const urls = [
    "/",
    "/statti",
    "/partners",
    "/pro-nas",
    "/yak-pratsiuye",
    "/bezpeka-ta-pryvatnist",
    "/redaktsiina-polityka",
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

for (const [slug, page] of Object.entries(TRUST_PAGES)) {
  app.get(`/${slug}`, (req, res) => {
    sendHtmlOrMarkdown(req, res,
      buildLegalPage(slug, page.title, page.html, publicConfig, {
        locale: res.locals.locale,
        t: res.locals.t,
        currentPath: `/${slug}`,
        description: page.description
      })
    );
  });
}

app.get("/impressum", async (req, res) => {
  try {
    const legalHtml = await getLegalContent("impressum", publicConfig);
    sendHtmlOrMarkdown(req, res,
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

app.get("/datenschutz", async (req, res) => {
  try {
    const legalHtml = await getLegalContent("datenschutz", publicConfig);
    sendHtmlOrMarkdown(req, res,
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

app.get("/kontakt", (req, res) => {
  const legalHtml = `
    <h1>${res.locals.t("legalContactTitle")}</h1>
    <p>${res.locals.t("legalContactIntro")}</p>
    <p><a href="mailto:${publicConfig.contactEmail}">${publicConfig.contactEmail}</a></p>
  `;
  sendHtmlOrMarkdown(req, res,
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
