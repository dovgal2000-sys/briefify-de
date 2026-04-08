import path from "node:path";

const DEFAULT_ANALYSIS_PROMPT = `
You help people understand official and everyday letters or other documents written in different languages.
Analyze the uploaded document carefully and return JSON that matches the schema exactly.
Use plain language without legal jargon.
Always:
- briefly explain what kind of document this is;
- list the key actions the user should take;
- identify deadlines, amounts, risks, and consequences of doing nothing when present;
- generate a polite reply draft when appropriate;
- explain the meaning of that reply draft in the requested explanation language;
- mention uncertainty explicitly in disclaimer if any part of the document is unclear.
This is not legal advice.
`.trim();

export function getServerConfig() {
  const port = Number(process.env.PORT || 3000);
  return {
    port,
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    openAiModel: process.env.OPENAI_MODEL || "gpt-5",
    analysisPrompt: process.env.OPENAI_ANALYSIS_PROMPT || DEFAULT_ANALYSIS_PROMPT,
    appName: process.env.APP_NAME || "Briefify.de",
    siteOrigin: process.env.SITE_ORIGIN || `http://localhost:${port}`,
    adsenseEnabled: process.env.ENABLE_ADSENSE === "true",
    iubendaSiteId: process.env.IUBENDA_SITE_ID || "",
    iubendaCookiePolicyId: process.env.IUBENDA_COOKIE_POLICY_ID || "",
    iubendaLang: process.env.IUBENDA_LANG || "de",
    adsenseClient: process.env.GOOGLE_ADSENSE_CLIENT || "",
    adsenseHomeSlot: process.env.GOOGLE_ADSENSE_HOME_SLOT || "",
    adsenseArticleSlot: process.env.GOOGLE_ADSENSE_ARTICLE_SLOT || "",
    supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
    contactEmail: process.env.CONTACT_EMAIL || "privacy@example.com",
    phoneNumber: process.env.PHONE_NUMBER || "",
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || "",
    companyName: process.env.COMPANY_NAME || "Briefify.de",
    ownerName: process.env.OWNER_NAME || "Max Mustermann",
    streetAddress: process.env.STREET_ADDRESS || "Musterstrasse 1",
    postalCode: process.env.POSTAL_CODE || "10115",
    city: process.env.CITY || "Berlin",
    country: process.env.COUNTRY || "Deutschland",
    vatId: process.env.VAT_ID || "DE000000000",
    maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5),
    statsDbPath: process.env.STATS_DB_PATH || path.join(process.cwd(), "data", "briefify.sqlite"),
    adminUsername: process.env.ADMIN_USERNAME || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || "",
    adminCookieName: process.env.ADMIN_COOKIE_NAME || "briefify_admin_session",
    adminSessionMaxAgeMs: Number(process.env.ADMIN_SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 12),
    adminTimeZone: process.env.ADMIN_TIME_ZONE || "Europe/Berlin",
    feedbackAccessCookieName: process.env.FEEDBACK_ACCESS_COOKIE_NAME || "briefify_feedback_access",
    feedbackAccessMaxAgeMs: Number(process.env.FEEDBACK_ACCESS_MAX_AGE_MS || 1000 * 60 * 60 * 24 * 7),
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    allowedExtensions: ["JPG", "PNG", "PDF"],
    textExtractionMinChars: Number(process.env.TEXT_EXTRACTION_MIN_CHARS || 120)
  };
}

export function getPublicConfig(config) {
  return {
    APP_NAME: config.appName,
    SITE_ORIGIN: config.siteOrigin,
    ENABLE_ADSENSE: String(config.adsenseEnabled),
    IUBENDA_SITE_ID: config.adsenseEnabled ? config.iubendaSiteId : "",
    IUBENDA_COOKIE_POLICY_ID: config.adsenseEnabled ? config.iubendaCookiePolicyId : "",
    IUBENDA_LANG: config.iubendaLang,
    GOOGLE_ADSENSE_CLIENT: config.adsenseEnabled ? config.adsenseClient : "",
    GOOGLE_ADSENSE_HOME_SLOT: config.adsenseEnabled ? config.adsenseHomeSlot : "",
    GOOGLE_ADSENSE_ARTICLE_SLOT: config.adsenseEnabled ? config.adsenseArticleSlot : "",
    SUPPORT_EMAIL: config.supportEmail,
    CONTACT_EMAIL: config.contactEmail,
    PHONE_NUMBER: config.phoneNumber,
    TURNSTILE_SITE_KEY: config.turnstileSiteKey,
    COMPANY_NAME: config.companyName,
    OWNER_NAME: config.ownerName,
    STREET_ADDRESS: config.streetAddress,
    POSTAL_CODE: config.postalCode,
    CITY: config.city,
    COUNTRY: config.country,
    VAT_ID: config.vatId,
    appName: config.appName,
    siteOrigin: config.siteOrigin,
    adsenseEnabled: config.adsenseEnabled,
    iubendaSiteId: config.adsenseEnabled ? config.iubendaSiteId : "",
    iubendaCookiePolicyId: config.adsenseEnabled ? config.iubendaCookiePolicyId : "",
    iubendaLang: config.iubendaLang,
    adsenseClient: config.adsenseEnabled ? config.adsenseClient : "",
    adsenseHomeSlot: config.adsenseEnabled ? config.adsenseHomeSlot : "",
    adsenseArticleSlot: config.adsenseEnabled ? config.adsenseArticleSlot : "",
    supportEmail: config.supportEmail,
    contactEmail: config.contactEmail,
    phoneNumber: config.phoneNumber,
    turnstileSiteKey: config.turnstileSiteKey,
    companyName: config.companyName,
    ownerName: config.ownerName,
    streetAddress: config.streetAddress,
    postalCode: config.postalCode,
    city: config.city,
    country: config.country,
    vatId: config.vatId
  };
}
