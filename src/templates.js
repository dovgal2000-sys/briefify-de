import { getFrontendMessages, getLocaleOptions } from "./i18n.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatUserText(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function buildSocialMeta({ title, description, imageUrl, canonicalUrl, type = "website" }) {
  return `
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="canonical" href="${canonicalUrl}" />`;
}

function buildIubendaHeadStart(publicConfig) {
  if (!publicConfig.iubendaSiteId || !publicConfig.iubendaCookiePolicyId) {
    return "";
  }

  return `
  <script>
    var _iub = _iub || [];
    _iub.csConfiguration = {
      siteId: ${JSON.stringify(publicConfig.iubendaSiteId)},
      cookiePolicyId: ${JSON.stringify(publicConfig.iubendaCookiePolicyId)},
      lang: ${JSON.stringify(publicConfig.iubendaLang || "de")},
      storage: { useSiteId: true },
      enableTcf: true,
      askConsentAtCookiePolicyUpdate: true,
      banner: {
        position: "float-bottom-center",
        acceptButtonDisplay: true,
        customizeButtonDisplay: true,
        rejectButtonDisplay: true,
        closeButtonDisplay: false,
        closeButtonRejects: true,
        listPurposes: true
      },
      callback: {
        onConsentRead: function () {
          window.__briefifyIubendaConsentReady = true;
          window.dispatchEvent(new CustomEvent("briefify:iubenda-consent-read"));
        }
      }
    };
  </script>
  <script type="text/javascript" src="https://cs.iubenda.com/autoblocking/${publicConfig.iubendaSiteId}.js"></script>
  <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script>`;
}

function renderAdSlot({ slotId, client, label, note, modifier = "" }) {
  if (!client || !slotId) {
    return "";
  }

  return `
    <section class="ad-slot ${modifier}">
      <div class="ad-slot-head">
        <span>${label}</span>
        <small>Google Ads</small>
      </div>
      <div
        class="adsense-slot"
        data-ad-client="${client}"
        data-ad-slot="${slotId}"
        data-ad-format="auto"
        data-full-width-responsive="true"
      >
        <p class="ad-consent-note">
          ${note}
        </p>
      </div>
    </section>
  `;
}

function renderLocaleSwitcher(currentPath, locale, t) {
  const links = getLocaleOptions()
    .map((option) => {
      const href = `${currentPath}${currentPath.includes("?") ? "&" : "?"}lang=${option.value}`;
      const isActive = option.value === locale;
      const flagClass = option.value === "de" ? "locale-flag-de" : "locale-flag-ua";
      return `
        <a class="locale-link locale-link-${option.value}${isActive ? " locale-link-active" : ""}" href="${href}" hreflang="${option.value}">
          <span class="locale-flag ${flagClass}" aria-hidden="true"></span>
          <span>${option.label}</span>
        </a>
      `;
    })
    .join("");

  return `
    <div class="locale-switcher" aria-label="${t("localeSwitchLabel")}">
      ${links}
    </div>
  `;
}

function layout({ title, description, body, publicConfig, extraHead = "", locale = "uk", currentPath = "/", t }) {
  return `<!DOCTYPE html>
<html lang="${t("htmlLang")}">
<head>
  ${buildIubendaHeadStart(publicConfig)}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  ${extraHead}
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/android-chrome-192x192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/assets/android-chrome-512x512.png" />
  <link rel="manifest" href="/assets/site.webmanifest" />
  <link rel="mask-icon" href="/assets/safari-pinned-tab.svg" color="#0057b7" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <meta name="theme-color" content="#0057b7" />
  <link rel="stylesheet" href="/assets/styles.css" />
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
  <div
    id="site-config"
    data-locale="${locale}"
    data-iubenda-enabled="${publicConfig.iubendaSiteId && publicConfig.iubendaCookiePolicyId ? "true" : "false"}"
    data-adsense-client="${publicConfig.adsenseClient || ""}"
    data-adsense-home-slot="${publicConfig.adsenseHomeSlot || ""}"
    data-adsense-article-slot="${publicConfig.adsenseArticleSlot || ""}"
    hidden
  ></div>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/">
        <img class="brand-logo" src="/assets/logo.svg" alt="${publicConfig.appName}" />
      </a>
      <nav class="nav-links">
        <a href="/#how-it-works">${t("navHowItWorks")}</a>
        <a href="/statti">${t("navArticles")}</a>
        <a href="/partners">${t("navPartners")}</a>
        <a href="/#legal">${t("navLegal")}</a>
      </nav>
      ${renderLocaleSwitcher(currentPath, locale, t)}
    </div>
  </header>
  ${body}
  <footer class="site-footer" id="legal">
    <div class="container footer-grid">
      <div>
        <h3>${publicConfig.appName}</h3>
        <p>${t("footerDescription")}</p>
      </div>
      <div>
        <h4>${t("footerLegal")}</h4>
        <a href="/statti">${t("navArticles")}</a>
        <a href="/partners">${t("footerPartners")}</a>
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutzerklärung</a>
        <a href="/kontakt">${t("legalContactTitle")}</a>
        ${
          publicConfig.iubendaSiteId && publicConfig.iubendaCookiePolicyId
            ? `<a href="#" class="iubenda-cs-preferences-link">${t("footerCookieSettings")}</a>`
            : ""
        }
      </div>
      <div>
        <h4>${t("footerContacts")}</h4>
        <a href="mailto:${publicConfig.supportEmail}">${publicConfig.supportEmail}</a>
        <p>${publicConfig.city}, ${publicConfig.country}, ${new Date().getFullYear()}</p>
      </div>
    </div>
  </footer>
  ${
    publicConfig.iubendaSiteId && publicConfig.iubendaCookiePolicyId
      ? ""
      : `<div id="cookie-banner" class="cookie-banner hidden" role="dialog" aria-live="polite" aria-label="Повідомлення про cookies">
    <div class="cookie-banner-inner">
      <div class="cookie-copy">
        <p>
          ${t("cookieText1").replace("Datenschutzerklärung", '<a href="/datenschutz">Datenschutzerklärung</a>')}
        </p>
        <p class="cookie-copy-secondary">
          ${t("cookieText2")}
        </p>
        <p class="cookie-copy-secondary">
          ${t("cookieText3").replace("Datenschutzerklärung", '<a href="/datenschutz">Datenschutzerklärung</a>')}
        </p>
      </div>
      <div class="cookie-actions">
        <button id="cookie-necessary" class="secondary-button" type="button">${t("cookieNecessary")}</button>
        <button id="cookie-accept" class="primary-button" type="button">${t("cookieAccept")}</button>
      </div>
    </div>
  </div>`
  }
</body>
</html>`;
}

function formatArticleDate(isoDate, locale = "uk") {
  const dateLocale = locale === "de" ? "de-DE" : "uk-UA";

  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(isoDate));
}

function formatAdminDateTime(dateTime, timeZone) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  }).format(new Date(dateTime));
}

function formatFeedbackDate(isoDate, locale = "uk") {
  const dateLocale = locale === "de" ? "de-DE" : "uk-UA";
  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(isoDate));
}

function renderApprovedFeedback(feedbackEntries, { locale = "uk", t }) {
  if (!feedbackEntries.length) {
    return `<p class="lead feedback-empty">${t("feedbackEmpty")}</p>`;
  }

  return feedbackEntries
    .map(
      (entry) => `
        <article class="feedback-card">
          <div class="feedback-card-head">
            <strong>${escapeHtml(entry.author_name)}</strong>
            <span>${formatFeedbackDate(entry.created_at, locale)}</span>
          </div>
          <p>${formatUserText(entry.message)}</p>
        </article>
      `
    )
    .join("");
}

function renderFeedbackCarousel(feedbackEntries, { locale = "uk", t }) {
  if (!feedbackEntries.length) {
    return `<p class="lead feedback-empty">${t("feedbackEmpty")}</p>`;
  }

  return `
    <div class="feedback-carousel-shell">
      <div class="feedback-carousel-controls">
        <button class="secondary-button feedback-carousel-button" type="button" data-feedback-carousel="prev" aria-label="${t("feedbackCarouselPrev")}">←</button>
        <button class="secondary-button feedback-carousel-button" type="button" data-feedback-carousel="next" aria-label="${t("feedbackCarouselNext")}">→</button>
      </div>
      <div class="feedback-carousel" data-feedback-carousel-track>
        ${feedbackEntries
          .map(
            (entry) => `
              <article class="feedback-card feedback-card-carousel">
                <div class="feedback-card-head">
                  <strong>${escapeHtml(entry.author_name)}</strong>
                  <span>${formatFeedbackDate(entry.created_at, locale)}</span>
                </div>
                <p>${formatUserText(entry.message)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderFeedbackStatus(status, t) {
  switch (status) {
    case "approved":
      return t("feedbackStatusApproved");
    case "rejected":
      return t("feedbackStatusRejected");
    default:
      return t("feedbackStatusPending");
  }
}

function renderArticleCover(article, { hero = false } = {}) {
  const logoHtml = article.logoPath
    ? `
      <div class="article-cover-logo-shell${hero ? " article-cover-logo-shell-hero" : ""}">
        <img class="article-cover-logo${hero ? " article-cover-logo-hero" : ""}" src="${article.logoPath}" alt="${escapeHtml(article.logoAlt || article.coverTitle)}" loading="lazy" />
      </div>
    `
    : "";

  return `
    <div class="article-cover ${hero ? "article-cover-hero " : ""}${article.coverTone}">
      ${logoHtml}
      <span class="article-cover-kicker">${article.category.title}</span>
      <strong>${article.coverTitle}</strong>
      <span>${article.coverSubtitle}</span>
    </div>
  `;
}

function renderArticleCards(articles, { locale = "uk", t }) {
  return articles
    .map(
      (article) => `
        <article class="article-card">
          ${renderArticleCover(article)}
          <div class="article-card-topline">
            <span class="article-category-chip">${article.category.title}</span>
            <span class="article-card-meta">${formatArticleDate(article.publishedAt, locale)} · ${article.readingTime}</span>
          </div>
          <h3><a href="/statti/${article.slug}">${article.title}</a></h3>
          <p>${article.description}</p>
          <a class="article-card-link" href="/statti/${article.slug}">${t("articleReadMore")}</a>
        </article>
      `
    )
    .join("");
}

export function buildHomePage(publicConfig, featuredArticles = [], feedbackEntries = [], { locale = "uk", t }) {
  const title = `${publicConfig.appName} - ${t("homeTitle")}`;
  const description = t("homeDescription");
  const frontendMessages = JSON.stringify(getFrontendMessages(locale));
  return layout({
    title,
    description,
    publicConfig,
    locale,
    currentPath: "/",
    t,
    extraHead: buildSocialMeta({
      title,
      description,
      imageUrl: `${publicConfig.siteOrigin}/assets/og-image.png`,
      canonicalUrl: `${publicConfig.siteOrigin}/`,
      type: "website"
    }),
    body: `
      <main>
        <section class="hero">
          <div class="container hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">${t("homeEyebrow")}</span>
              <h1>${t("homeTitle")}</h1>
              <p class="lead">
                ${t("homeLead")}
              </p>
              <ul class="hero-points">
                <li>${t("homePoint1")}</li>
                <li>${t("homePoint2")}</li>
                <li>${t("homePoint3")}</li>
              </ul>
            </div>
            <div class="upload-card">
              <form id="analyze-form" class="analyze-form">
                <input id="form-loaded-at" name="form_loaded_at" type="hidden" value="" />
                <div class="bot-trap" aria-hidden="true">
                  <label for="website">${t("honeypotLabel")}</label>
                  <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
                </div>
                <label class="upload-zone" for="letter">
                  <input id="letter" name="letter" type="file" accept=".jpg,.jpeg,.png,.pdf" />
                  <span class="upload-button">${t("uploadButton")}</span>
                  <span class="upload-subtitle">${t("uploadSubtitle")}</span>
                </label>
                <div id="file-preview" class="file-preview hidden" aria-live="polite">
                  <div class="file-preview-head">
                    <strong>${t("previewTitle")}</strong>
                    <span id="file-preview-name" class="file-preview-name"></span>
                  </div>
                  <img id="image-preview" class="image-preview hidden" alt="${t("imagePreviewAlt")}" />
                  <iframe
                    id="pdf-preview"
                    class="pdf-preview hidden"
                    title="${t("pdfPreviewTitle")}"
                  ></iframe>
                </div>
                <label class="consent">
                  <input id="consent" name="consent" type="checkbox" />
                  <span>
                    ${t("consentLabel").replace("Datenschutzerklärung", '<a href="/datenschutz">Datenschutzerklärung</a>')}
                  </span>
                </label>
                ${
                  publicConfig.turnstileSiteKey
                    ? `
                <div
                  class="cf-turnstile"
                  data-sitekey="${publicConfig.turnstileSiteKey}"
                  data-theme="light"
                  data-language="uk"
                ></div>`
                    : `
                <p class="fine-print">
                  ${t("turnstileMissing")}
                </p>`
                }
                <button class="primary-button" type="submit">${t("submitButton")}</button>
                <p class="fine-print">
                  ${t("formFinePrint")}
                </p>
              </form>
              <div id="status-box" class="status-box" aria-live="polite"></div>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow" id="how-it-works">${t("howItWorksEyebrow")}</span>
              <h2>${t("howItWorksTitle")}</h2>
            </div>
            <div class="steps">
              <article class="step-card">
                <strong>1</strong>
                <h3>${t("step1Title")}</h3>
                <p>${t("step1Text")}</p>
              </article>
              <article class="step-card">
                <strong>2</strong>
                <h3>${t("step2Title")}</h3>
                <p>${t("step2Text")}</p>
              </article>
              <article class="step-card">
                <strong>3</strong>
                <h3>${t("step3Title")}</h3>
                <p>${t("step3Text")}</p>
              </article>
            </div>
          </div>
        </section>

        <section class="section section-accent">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">${t("resultEyebrow")}</span>
              <h2>${t("resultTitle")}</h2>
            </div>
            <div id="result-card" class="result-card hidden">
              <div class="result-block">
                <h3>${t("resultSummary")}</h3>
                <p id="summary"></p>
              </div>
              <div class="result-columns">
                <div class="result-block">
                  <h3>${t("resultActions")}</h3>
                  <ul id="actions"></ul>
                </div>
                <div class="result-block">
                  <h3>${t("resultDeadlines")}</h3>
                  <ul id="deadlines"></ul>
                </div>
              </div>
              <div class="result-block alert-block">
                <h3>${t("resultRisks")}</h3>
                <ul id="risks"></ul>
              </div>
              <div class="result-block">
                <div class="result-title-row">
                  <h3>${t("resultReply")}</h3>
                  <div class="result-actions">
                    <button id="copy-reply" class="secondary-button" type="button">${t("resultReplyCopy")}</button>
                    <button id="send-email" class="secondary-button" type="button">${t("resultReplyEmail")}</button>
                  </div>
                </div>
                <pre id="reply_text" class="reply-box"></pre>
                <div class="email-compose">
                  <label class="email-label" for="reply-email">${t("emailRecipient")}</label>
                  <input
                    id="reply-email"
                    class="email-input"
                    type="email"
                    inputmode="email"
                    autocomplete="email"
                    placeholder="example@email.de"
                  />
                  <p class="fine-print">
                    ${t("emailFinePrint")}
                  </p>
                </div>
              </div>
              <div class="result-block">
                <h3>${t("resultReplyMeaning")}</h3>
                <p id="reply_explanation"></p>
              </div>
              <div class="result-block disclaimer-block">
                <h3>${t("resultImportant")}</h3>
                <p id="disclaimer"></p>
              </div>
            </div>
          </div>
        </section>

        ${renderAdSlot({
          slotId: publicConfig.adsenseHomeSlot,
          client: publicConfig.adsenseClient,
          label: t("adLabel"),
          note: t("adConsentNote"),
          modifier: "container ad-slot-home"
        })}

        <section class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">${t("seoEyebrow")}</span>
              <h2>${t("seoTitle")}</h2>
              <p class="lead">
                ${t("seoLead")}
              </p>
            </div>
            <div class="article-grid">
                ${renderArticleCards(featuredArticles, { locale, t })}
            </div>
            <div class="section-cta">
              <a class="secondary-button" href="/statti">${t("seoButton")}</a>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">${t("feedbackEyebrow")}</span>
              <h2>${t("feedbackTitle")}</h2>
              <p class="lead">${t("feedbackLead")}</p>
            </div>
            ${renderFeedbackCarousel(feedbackEntries, { locale, t })}
            <div class="section-cta feedback-cta">
              <a class="primary-button" href="/feedback">${t("feedbackOpenForm")}</a>
            </div>
          </div>
        </section>
      </main>
      <script>
        window.__BRIEFIFY_I18N = ${frontendMessages};
      </script>
      <script src="/assets/app.js" defer></script>
    `
  });
}

export function buildFeedbackPage(publicConfig, feedbackEntries = [], { locale = "uk", t, hasFeedbackAccess = false }) {
  const title = `${t("feedbackPageTitle")} - ${publicConfig.appName}`;
  const description = t("feedbackPageDescription");
  const frontendMessages = JSON.stringify(getFrontendMessages(locale));

  return layout({
    title,
    description,
    publicConfig,
    locale,
    currentPath: "/feedback",
    t,
    extraHead: buildSocialMeta({
      title,
      description,
      imageUrl: `${publicConfig.siteOrigin}/assets/og-image.png`,
      canonicalUrl: `${publicConfig.siteOrigin}/feedback`,
      type: "website"
    }),
    body: `
      <main class="section">
        <div class="container feedback-page-layout">
          <section class="feedback-form-card feedback-page-form">
            <span class="eyebrow">${t("feedbackEyebrow")}</span>
            <h1>${t("feedbackFormTitle")}</h1>
            ${
              hasFeedbackAccess
                ? `
            <p class="lead">${t("feedbackFormLead")}</p>
            <form id="feedback-form" class="feedback-form">
              <input id="feedback-loaded-at" name="form_loaded_at" type="hidden" value="" />
              <div class="bot-trap" aria-hidden="true">
                <label for="feedback-website">${t("honeypotLabel")}</label>
                <input id="feedback-website" name="website" type="text" tabindex="-1" autocomplete="off" />
              </div>
              <label class="admin-field">
                <span>${t("feedbackNameLabel")}</span>
                <input
                  id="feedback-name"
                  name="author_name"
                  type="text"
                  maxlength="80"
                  placeholder="${t("feedbackNamePlaceholder")}"
                  required
                />
              </label>
              <label class="admin-field">
                <span>${t("feedbackMessageLabel")}</span>
                <textarea
                  id="feedback-message"
                  name="message"
                  rows="6"
                  maxlength="1200"
                  placeholder="${t("feedbackMessagePlaceholder")}"
                  required
                ></textarea>
              </label>
              ${
                publicConfig.turnstileSiteKey
                  ? `
              <div
                class="cf-turnstile"
                data-sitekey="${publicConfig.turnstileSiteKey}"
                data-theme="light"
                data-language="${locale}"
              ></div>`
                  : `
              <p class="fine-print">
                ${t("turnstileMissing")}
              </p>`
              }
              <button class="primary-button" type="submit">${t("feedbackSubmit")}</button>
              <p class="fine-print">${t("feedbackFinePrint")}</p>
            </form>`
                : `
            <div class="feedback-locked-card">
              <h2>${t("feedbackLockedTitle")}</h2>
              <p>${t("feedbackLockedLead")}</p>
              <a class="primary-button" href="/">${t("feedbackLockedCta")}</a>
            </div>`
            }
            <div id="feedback-status-box" class="status-box hidden" aria-live="polite"></div>
          </section>
          <section class="feedback-page-list">
            <div class="section-head section-head-left">
              <h2>${t("feedbackTitle")}</h2>
            </div>
            <div class="feedback-list">
              ${renderApprovedFeedback(feedbackEntries, { locale, t })}
            </div>
          </section>
        </div>
      </main>
      <script>
        window.__BRIEFIFY_I18N = ${frontendMessages};
      </script>
      <script src="/assets/app.js" defer></script>
    `
  });
}

export function buildLegalPage(titleKey, title, legalHtml, publicConfig, { locale = "uk", t, currentPath = `/${titleKey}` } = {}) {
  const pageTitle = `${title} - ${publicConfig.appName}`;
  const description = `${titleKey} for ${publicConfig.appName}`;
  return layout({
    title: pageTitle,
    description,
    publicConfig,
    locale,
    currentPath,
    t,
    extraHead: buildSocialMeta({
      title: pageTitle,
      description,
      imageUrl: `${publicConfig.siteOrigin}/assets/og-image.png`,
      canonicalUrl: `${publicConfig.siteOrigin}/${titleKey === "kontakt" ? "kontakt" : titleKey}`,
      type: "website"
    }),
    body: `
      <main class="section">
        <div class="container legal-card">
          ${legalHtml}
        </div>
      </main>
    `
  });
}

function renderCategoryFilters(categories, activeCategorySlug = "", t) {
  const allChipClass = activeCategorySlug ? "category-filter" : "category-filter category-filter-active";
  const allHref = "/statti";
  const categoryLinks = categories
    .map((category) => {
      const isActive = category.slug === activeCategorySlug;
      return `<a class="category-filter${isActive ? " category-filter-active" : ""}" href="/statti/kategoria/${category.slug}">${category.title}</a>`;
    })
    .join("");

  return `
    <div class="category-filters">
      <a class="${allChipClass}" href="${allHref}">${t("articlesAll")}</a>
      ${categoryLinks}
    </div>
  `;
}

export function buildArticlesIndexPage(publicConfig, articles, categories, activeCategory = null, { locale = "uk", t, currentPath = "/statti" } = {}) {
  const titlePrefix = activeCategory
    ? `${t("articlesTitle")}: ${activeCategory.title}`
    : t("articlesTitle");
  const title = `${titlePrefix} - ${publicConfig.appName}`;
  const description = t("articlesDescription");
  const canonicalUrl = activeCategory
    ? `${publicConfig.siteOrigin}/statti/kategoria/${activeCategory.slug}`
    : `${publicConfig.siteOrigin}/statti`;
  return layout({
    title,
    description,
    publicConfig,
    locale,
    currentPath,
    t,
    extraHead: buildSocialMeta({
      title,
      description,
      imageUrl: `${publicConfig.siteOrigin}/assets/og-image.png`,
      canonicalUrl,
      type: "website"
    }),
    body: `
      <main class="section">
        <div class="container">
          <div class="section-head section-head-left">
            <span class="eyebrow">${t("articlesEyebrow")}</span>
            <h1>${activeCategory ? `${t("articleCategory")}: ${activeCategory.title}` : t("articlesTitle")}</h1>
            <p class="lead">
              ${t("articlesLead")}
            </p>
          </div>
          ${renderCategoryFilters(categories, activeCategory?.slug || "", t)}
          <div class="article-grid article-grid-full">
              ${renderArticleCards(articles, { locale, t })}
          </div>
        </div>
      </main>
    `
  });
}

export function buildPartnersPage(publicConfig, { locale = "uk", t, currentPath = "/partners" } = {}) {
  const title = `${t("partnersTitle")} - ${publicConfig.appName}`;
  const description = t("partnersDescription");
  const canonicalUrl = `${publicConfig.siteOrigin}/partners`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("partnersTitle"),
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "WebSite",
          name: t("partnersFirstName"),
          url: "https://dovidka.de/"
        }
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "WebSite",
          name: t("partnersSecondName"),
          url: "https://schweizdaten.com/"
        }
      }
    ]
  };

  return layout({
    title,
    description,
    publicConfig,
    locale,
    currentPath,
    t,
    extraHead: `
      ${buildSocialMeta({
        title,
        description,
        imageUrl: `${publicConfig.siteOrigin}/assets/og-image.png`,
        canonicalUrl,
        type: "website"
      })}
      <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    `,
    body: `
      <main class="section">
        <section class="container">
          <div class="section-head section-head-left">
            <span class="eyebrow">${t("partnersEyebrow")}</span>
            <h1>${t("partnersTitle")}</h1>
            <p class="lead">${t("partnersLead")}</p>
          </div>

          <div class="partners-layout">
            <aside class="partner-note">
              <h2>${t("partnersWhyTitle")}</h2>
              <ul>
                <li>${t("partnersWhyPoint1")}</li>
                <li>${t("partnersWhyPoint2")}</li>
                <li>${t("partnersWhyPoint3")}</li>
              </ul>
              <p>${t("partnersDisclosure")}</p>
            </aside>

            <article class="partner-card">
              <div class="partner-card-head">
                <img class="partner-logo" src="/assets/partner-dovidka.jpg" alt="${t("partnersFirstName")} logo" loading="lazy" />
                <div class="partner-card-copy">
                  <div class="partner-meta">
                    <span class="article-category-chip">${t("partnersCategoryDirectories")}</span>
                    <span class="partner-site">${t("partnersSiteLabel")}: <a href="https://dovidka.de/" target="_blank" rel="noopener noreferrer">dovidka.de</a></span>
                  </div>
                  <h2>Dovidka<wbr>.de</h2>
                  <p>${t("partnersFirstDescription")}</p>
                </div>
              </div>

              <div class="partner-card-body">
                <div class="partner-details">
                  <strong>${t("partnersCategoryLabel")}</strong>
                  <span>${t("partnersCategoryDirectories")}</span>
                </div>
                <section class="partner-about">
                  <h3>${t("partnersAboutTitle")}</h3>
                  <ul>
                    <li>${t("partnersFirstBenefit1")}</li>
                    <li>${t("partnersFirstBenefit2")}</li>
                    <li>${t("partnersFirstBenefit3")}</li>
                  </ul>
                </section>
              </div>

              <div class="partner-actions">
                <a class="primary-button" href="https://dovidka.de/" target="_blank" rel="noopener noreferrer">${t("partnersVisit")}</a>
              </div>
            </article>

            <article class="partner-card">
              <div class="partner-card-head">
                <div class="partner-logo partner-logo-schweizdaten" aria-label="${t("partnersSecondName")} logo" role="img">
                  <span class="schweizdaten-badge" aria-hidden="true">+</span>
                  <span class="schweizdaten-wordmark" aria-hidden="true">
                    <span class="schweizdaten-wordmark-dark">Schweiz</span><span class="schweizdaten-wordmark-accent">Daten</span>
                  </span>
                </div>
                <div class="partner-card-copy">
                  <div class="partner-meta">
                    <span class="article-category-chip">${t("partnersCategoryDirectories")}</span>
                    <span class="partner-site">${t("partnersSiteLabel")}: <a href="https://schweizdaten.com/" target="_blank" rel="noopener noreferrer">schweizdaten.com</a></span>
                  </div>
                  <h2 class="visually-hidden">${t("partnersSecondName")}</h2>
                  <p>${t("partnersSecondDescription")}</p>
                </div>
              </div>

              <div class="partner-card-body">
                <div class="partner-details">
                  <strong>${t("partnersCategoryLabel")}</strong>
                  <span>${t("partnersCategoryDirectories")}</span>
                </div>
                <section class="partner-about">
                  <h3>${t("partnersAboutTitle")}</h3>
                  <ul>
                    <li>${t("partnersSecondBenefit1")}</li>
                    <li>${t("partnersSecondBenefit2")}</li>
                    <li>${t("partnersSecondBenefit3")}</li>
                  </ul>
                </section>
              </div>

              <div class="partner-actions">
                <a class="primary-button" href="https://schweizdaten.com/" target="_blank" rel="noopener noreferrer">${t("partnersVisit")}</a>
              </div>
            </article>
          </div>
        </section>
      </main>
    `
  });
}

export function buildArticlePage(article, relatedArticles, publicConfig, { locale = "uk", t }) {
  const keywords = article.keywords?.join(", ") || "";
  const title = `${article.title} - ${publicConfig.appName}`;
  const canonicalUrl = `${publicConfig.siteOrigin}/statti/${article.slug}`;
  const relatedHtml = relatedArticles.length
    ? `
      <section class="article-related">
        <h2>${t("articleRelated")}</h2>
        <div class="article-grid">
                ${renderArticleCards(relatedArticles, { locale, t })}
        </div>
      </section>
    `
    : "";

  return layout({
    title,
    description: article.description,
    publicConfig,
    locale,
    currentPath: `/statti/${article.slug}`,
    t,
    extraHead: `
      ${keywords ? `<meta name="keywords" content="${keywords}" />` : ""}
      ${buildSocialMeta({
        title,
        description: article.description,
        imageUrl: `${publicConfig.siteOrigin}${article.ogImagePath || "/assets/og-image.png"}`,
        canonicalUrl,
        type: "article"
      })}
    `,
    body: `
      <main class="section">
        <article class="container article-shell">
          <nav class="breadcrumbs" aria-label="breadcrumb">
            <a href="/">${t("homeBreadcrumb")}</a>
            <span>/</span>
            <a href="/statti">${t("navArticles")}</a>
            <span>/</span>
            <span>${article.title}</span>
          </nav>

          <header class="article-hero">
            <span class="eyebrow">${t("articleSeoEyebrow")}</span>
            ${renderArticleCover(article, { hero: true })}
            <h1>${article.title}</h1>
            <p class="lead">${article.description}</p>
            <div class="article-meta">
              <span>${t("articleDate")}: ${formatArticleDate(article.publishedAt, locale)}</span>
              <span>${t("articleReadingTime")}: ${article.readingTime}</span>
              <span>${t("articleCategory")}: <a href="/statti/kategoria/${article.category.slug}">${article.category.title}</a></span>
            </div>
          </header>

          <div class="article-content">
            ${article.body}
          </div>

          ${renderAdSlot({
            slotId: publicConfig.adsenseArticleSlot,
            client: publicConfig.adsenseClient,
            label: t("adArticleLabel"),
            note: t("adConsentNote"),
            modifier: "ad-slot-article"
          })}

          <section class="article-cta-box">
            <h2>${t("articleCtaTitle")}</h2>
            <p>${t("articleCtaText")}</p>
            <a class="primary-button" href="/">${t("articleCtaButton")}</a>
          </section>

          ${relatedHtml}
        </article>
      </main>
    `
  });
}

export function buildAdminLoginPage(publicConfig, { errorMessage = "", locale = "uk", t } = {}) {
  const title = `Адмінка - вхід - ${publicConfig.appName}`;
  const description = "Вхід до внутрішньої статистики Briefify.";

  return layout({
    title,
    description,
    publicConfig,
    locale,
    currentPath: "/admin/login",
    t,
    body: `
      <main class="section">
        <div class="container admin-shell">
          <section class="admin-login-card">
            <span class="eyebrow">Адмінка</span>
            <h1>Вхід до статистики</h1>
            <p class="lead">Увійдіть під адмінським логіном, щоб переглядати звіти по перекладах листів.</p>
            ${
              errorMessage
                ? `<div class="admin-alert admin-alert-error">${errorMessage}</div>`
                : ""
            }
            <form class="admin-form" method="post" action="/admin/login">
              <label class="admin-field">
                <span>Логін</span>
                <input name="username" type="text" autocomplete="username" required />
              </label>
              <label class="admin-field">
                <span>Пароль</span>
                <input name="password" type="password" autocomplete="current-password" required />
              </label>
              <button class="primary-button" type="submit">Увійти</button>
            </form>
          </section>
        </div>
      </main>
    `
  });
}

export function buildAdminDashboardPage(
  publicConfig,
  {
    quickStats,
    report,
    reportRange,
    feedbackModeration,
    feedbackFilter = "all",
    presets,
    errorMessage = "",
    timeZone,
    locale = "uk",
    t
  }
) {
  const title = `Адмінка - статистика - ${publicConfig.appName}`;
  const description = "Статистика використання Briefify за вибраний період.";

  return layout({
    title,
    description,
    publicConfig,
    locale,
    currentPath: "/admin",
    t,
    body: `
      <main class="section">
        <div class="container admin-shell">
          <section class="admin-panel">
            <div class="admin-panel-head">
              <div>
                <span class="eyebrow">Адмінка</span>
                <h1>Статистика перекладів листів</h1>
                <p class="lead">Швидкі зрізи та ручний звіт за довільний період у часовій зоні ${timeZone}.</p>
              </div>
              <form method="post" action="/admin/logout">
                <button class="secondary-button" type="submit">Вийти</button>
              </form>
            </div>

            <section class="admin-stats-grid">
              <article class="admin-stat-card">
                <span>За останню годину</span>
                <strong>${quickStats.lastHour}</strong>
              </article>
              <article class="admin-stat-card">
                <span>За останню добу</span>
                <strong>${quickStats.lastDay}</strong>
              </article>
              <article class="admin-stat-card">
                <span>За останній тиждень</span>
                <strong>${quickStats.lastWeek}</strong>
              </article>
              <article class="admin-stat-card">
                <span>З початку місяця</span>
                <strong>${quickStats.monthToDate}</strong>
              </article>
              <article class="admin-stat-card admin-stat-card-wide">
                <span>Всього успішних перекладів</span>
                <strong>${quickStats.total}</strong>
              </article>
            </section>

            <section class="admin-report-card">
              <div class="admin-report-head">
                <h2>Звіт за період</h2>
                <div class="admin-preset-list">
                  ${presets
                    .map(
                      (preset) => `
                        <a class="category-filter" href="${preset.href}">${preset.label}</a>
                      `
                    )
                    .join("")}
                </div>
              </div>

              ${
                errorMessage
                  ? `<div class="admin-alert admin-alert-error">${errorMessage}</div>`
                  : ""
              }

              <form class="admin-form admin-range-form" method="get" action="/admin">
                <label class="admin-field">
                  <span>Початок</span>
                  <input name="start" type="datetime-local" value="${reportRange.startValue}" required />
                </label>
                <label class="admin-field">
                  <span>Кінець</span>
                  <input name="end" type="datetime-local" value="${reportRange.endValue}" required />
                </label>
                <button class="primary-button" type="submit">Побудувати звіт</button>
              </form>

              <div class="admin-summary-grid">
                <article class="admin-summary-card">
                  <span>Період</span>
                  <strong>${formatAdminDateTime(reportRange.startIso, timeZone)} - ${formatAdminDateTime(reportRange.endIso, timeZone)}</strong>
                </article>
                <article class="admin-summary-card">
                  <span>Успішних перекладів</span>
                  <strong>${report.total}</strong>
                </article>
              </div>

              <div class="admin-table-card">
                <h3>Розбивка за типом файлу</h3>
                ${
                  report.breakdownByMimeType.length
                    ? `
                      <table class="admin-table">
                        <thead>
                          <tr>
                            <th>Тип файлу</th>
                            <th>Кількість</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${report.breakdownByMimeType
                            .map(
                              (row) => `
                                <tr>
                                  <td>${row.mime_type}</td>
                                  <td>${row.total}</td>
                                </tr>
                              `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    `
                    : `<p class="fine-print">За цей період ще немає успішних перекладів.</p>`
                }
              </div>
            </section>

            <section id="feedback-moderation" class="admin-report-card">
              <div class="admin-report-head">
                <h2>${t("feedbackAdminTitle")}</h2>
              </div>

              <div class="admin-summary-grid admin-summary-grid-feedback">
                <a class="admin-summary-card admin-summary-card-link${feedbackFilter === "pending" ? " admin-summary-card-active" : ""}" href="/admin?feedback_status=pending#feedback-moderation">
                  <span>${t("feedbackAdminPending")}</span>
                  <strong>${feedbackModeration.counts.pending || 0}</strong>
                </a>
                <a class="admin-summary-card admin-summary-card-link${feedbackFilter === "approved" ? " admin-summary-card-active" : ""}" href="/admin?feedback_status=approved#feedback-moderation">
                  <span>${t("feedbackAdminApproved")}</span>
                  <strong>${feedbackModeration.counts.approved || 0}</strong>
                </a>
                <a class="admin-summary-card admin-summary-card-link${feedbackFilter === "rejected" ? " admin-summary-card-active" : ""}" href="/admin?feedback_status=rejected#feedback-moderation">
                  <span>${t("feedbackAdminRejected")}</span>
                  <strong>${feedbackModeration.counts.rejected || 0}</strong>
                </a>
              </div>

              <div class="admin-preset-list">
                <a class="category-filter${feedbackFilter === "all" ? " category-filter-active" : ""}" href="/admin#feedback-moderation">Усі</a>
                <a class="category-filter${feedbackFilter === "pending" ? " category-filter-active" : ""}" href="/admin?feedback_status=pending#feedback-moderation">${t("feedbackAdminPending")}</a>
                <a class="category-filter${feedbackFilter === "approved" ? " category-filter-active" : ""}" href="/admin?feedback_status=approved#feedback-moderation">${t("feedbackAdminApproved")}</a>
                <a class="category-filter${feedbackFilter === "rejected" ? " category-filter-active" : ""}" href="/admin?feedback_status=rejected#feedback-moderation">${t("feedbackAdminRejected")}</a>
              </div>

              <div class="admin-feedback-list">
                ${
                  feedbackModeration.entries.length
                    ? feedbackModeration.entries
                        .map(
                          (entry) => `
                            <article class="admin-feedback-card">
                              <div class="admin-feedback-head">
                                <div>
                                  <strong>${escapeHtml(entry.author_name)}</strong>
                                  <span>${formatAdminDateTime(entry.created_at, timeZone)}</span>
                                </div>
                                <span class="admin-feedback-status admin-feedback-status-${entry.status}">
                                  ${renderFeedbackStatus(entry.status, t)}
                                </span>
                              </div>
                              <p>${formatUserText(entry.message)}</p>
                              <div class="admin-feedback-meta">
                                <span>Locale: ${entry.locale}</span>
                                ${
                                  entry.reviewed_at
                                    ? `<span>Reviewed: ${formatAdminDateTime(entry.reviewed_at, timeZone)}</span>`
                                    : ""
                                }
                              </div>
                              <div class="admin-feedback-actions">
                                <form method="post" action="/admin/feedback/${entry.id}/status">
                                  <input type="hidden" name="status" value="approved" />
                                  <button class="secondary-button" type="submit">${t("feedbackAdminApprove")}</button>
                                </form>
                                <form method="post" action="/admin/feedback/${entry.id}/status">
                                  <input type="hidden" name="status" value="rejected" />
                                  <button class="secondary-button" type="submit">${t("feedbackAdminReject")}</button>
                                </form>
                              </div>
                            </article>
                          `
                        )
                        .join("")
                    : `<p class="fine-print">${t("feedbackAdminEmpty")}</p>`
                }
              </div>
            </section>
          </section>
        </div>
      </main>
    `
  });
}
