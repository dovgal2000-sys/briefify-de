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
    supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
    contactEmail: process.env.CONTACT_EMAIL || "privacy@example.com",
    companyName: process.env.COMPANY_NAME || "Briefify.de",
    ownerName: process.env.OWNER_NAME || "Max Mustermann",
    streetAddress: process.env.STREET_ADDRESS || "Musterstrasse 1",
    postalCode: process.env.POSTAL_CODE || "10115",
    city: process.env.CITY || "Berlin",
    country: process.env.COUNTRY || "Deutschland",
    vatId: process.env.VAT_ID || "DE000000000",
    maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 10),
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    allowedExtensions: ["JPG", "PNG", "PDF"],
    textExtractionMinChars: Number(process.env.TEXT_EXTRACTION_MIN_CHARS || 120)
  };
}

export function getPublicConfig(config) {
  return {
    appName: config.appName,
    supportEmail: config.supportEmail,
    contactEmail: config.contactEmail,
    companyName: config.companyName,
    ownerName: config.ownerName,
    streetAddress: config.streetAddress,
    postalCode: config.postalCode,
    city: config.city,
    country: config.country,
    vatId: config.vatId
  };
}
