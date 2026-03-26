import "dotenv/config";
import express from "express";
import multer from "multer";

import { getPublicConfig, getServerConfig } from "./src/config.js";
import { extractDocumentPayload } from "./src/document.js";
import { analyzeLetterWithOpenAI } from "./src/openai.js";
import { createRateLimiter } from "./src/rate-limit.js";
import { buildHomePage, buildLegalPage } from "./src/templates.js";

const app = express();
const config = getServerConfig();
const publicConfig = getPublicConfig(config);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeBytes }
});

const rateLimiter = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.rateLimitMaxRequests
});

app.disable("x-powered-by");
app.use("/assets", express.static("public", { extensions: ["css", "js"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.type("html").send(buildHomePage(publicConfig));
});

app.get("/index.html", (_req, res) => {
  res.redirect(301, "/");
});

app.get("/index.htm", (_req, res) => {
  res.redirect(301, "/");
});

app.get("/impressum", (_req, res) => {
  res.type("html").send(buildLegalPage("impressum", publicConfig));
});

app.get("/datenschutz", (_req, res) => {
  res.type("html").send(buildLegalPage("datenschutz", publicConfig));
});

app.get("/kontakt", (_req, res) => {
  res.type("html").send(buildLegalPage("kontakt", publicConfig));
});

app.get("/api/public-config", (_req, res) => {
  res.json({
    appName: publicConfig.appName,
    maxFileSizeMb: Math.floor(config.maxFileSizeBytes / (1024 * 1024)),
    supportedFormats: config.allowedExtensions
  });
});

app.post("/api/analyze-letter", rateLimiter, upload.single("letter"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Будь ласка, завантажте файл у форматі JPG, PNG або PDF."
      });
    }

    if (req.body?.consent !== "true") {
      return res.status(400).json({
        error: "Щоб продовжити, потрібно підтвердити згоду на обробку документа."
      });
    }

    const extraction = await extractDocumentPayload(req.file, config);
    const analysis = await analyzeLetterWithOpenAI({
      file: req.file,
      extraction,
      config
    });

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
      "Сталася помилка під час аналізу листа. Спробуйте ще раз трохи пізніше.";

    if (status >= 500) {
      console.error("[briefify] analyze-letter failed:", error.message);
    }

    return res.status(status).json({ error: message });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: `Файл завеликий. Максимальний розмір: ${Math.floor(
        config.maxFileSizeBytes / (1024 * 1024)
      )} МБ.`
    });
  }

  console.error("[briefify] unhandled error:", error.message);
  return res.status(500).json({
    error: "Сервер тимчасово недоступний. Спробуйте ще раз пізніше."
  });
});

app.listen(config.port, () => {
  console.log(`[briefify] server listening on http://localhost:${config.port}`);
});
