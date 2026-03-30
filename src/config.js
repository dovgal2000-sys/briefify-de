const DEFAULT_ANALYSIS_PROMPT = `
Ти допомагаєш українськомовному користувачу зрозуміти офіційний або побутовий лист німецькою мовою.
Проаналізуй документ уважно та поверни JSON за схемою.
Пояснюй простою українською мовою без юридичного жаргону.
Обов'язково:
- коротко опиши, що це за лист;
- виділи ключові дії;
- знайди дедлайни, суми, ризики, наслідки бездіяльності;
- якщо доречно, згенеруй ввічливу чернетку відповіді німецькою;
- додай коротке українське пояснення цієї відповіді;
- якщо щось нечітко прочитано, прямо скажи про це в disclaimer.
Це не юридична консультація.
`.trim();

export function getServerConfig() {
  return {
    port: Number(process.env.PORT || 3000),
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    openAiModel: process.env.OPENAI_MODEL || "gpt-5",
    analysisPrompt: process.env.OPENAI_ANALYSIS_PROMPT || DEFAULT_ANALYSIS_PROMPT,
    appName: process.env.APP_NAME || "Briefify.de",
    siteOrigin: process.env.SITE_ORIGIN || `http://localhost:${Number(process.env.PORT || 3000)}`,
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
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    allowedExtensions: ["JPG", "PNG", "PDF"],
    textExtractionMinChars: Number(process.env.TEXT_EXTRACTION_MIN_CHARS || 120)
  };
}

export function getPublicConfig(config) {
  return {
    APP_NAME: config.appName,
    SITE_ORIGIN: config.siteOrigin,
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
