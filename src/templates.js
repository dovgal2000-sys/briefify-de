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

function layout({ title, description, body, publicConfig, extraHead = "" }) {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
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
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/">
        <img class="brand-logo" src="/assets/logo.svg" alt="${publicConfig.appName}" />
      </a>
      <nav class="nav-links">
        <a href="/#how-it-works">Як це працює</a>
        <a href="/statti">Статті</a>
        <a href="/#legal">Правова інформація</a>
      </nav>
    </div>
  </header>
  ${body}
  <footer class="site-footer" id="legal">
    <div class="container footer-grid">
      <div>
        <h3>${publicConfig.appName}</h3>
        <p>Пояснює німецькі листи українською мовою та допомагає підготувати відповідь.</p>
      </div>
      <div>
        <h4>Правова інформація</h4>
        <a href="/statti">Статті</a>
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutzerklärung</a>
        <a href="/kontakt">Kontakt</a>
      </div>
      <div>
        <h4>Контакти</h4>
        <a href="mailto:${publicConfig.supportEmail}">${publicConfig.supportEmail}</a>
        <p>${publicConfig.city}, ${publicConfig.country}</p>
      </div>
    </div>
  </footer>
  <div id="cookie-banner" class="cookie-banner hidden" role="dialog" aria-live="polite" aria-label="Повідомлення про cookies">
    <div class="cookie-banner-inner">
      <div class="cookie-copy">
        <p>
          Ми використовуємо технічні cookies та локальне збереження даних для коректної роботи сайту.
          Детальніше читайте у <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
        <p class="cookie-copy-secondary">
          Wir verwenden technische Cookies und lokale Speicherung, damit die Website korrekt funktioniert.
          Weitere Informationen finden Sie in der <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
      </div>
      <button id="cookie-accept" class="secondary-button" type="button">Зрозуміло</button>
    </div>
  </div>
</body>
</html>`;
}

function formatArticleDate(isoDate) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(isoDate));
}

function renderArticleCards(articles) {
  return articles
    .map(
      (article) => `
        <article class="article-card">
          <div class="article-cover ${article.coverTone}">
            <span class="article-cover-kicker">${article.category.title}</span>
            <strong>${article.coverTitle}</strong>
            <span>${article.coverSubtitle}</span>
          </div>
          <div class="article-card-topline">
            <span class="article-category-chip">${article.category.title}</span>
            <span class="article-card-meta">${formatArticleDate(article.publishedAt)} · ${article.readingTime}</span>
          </div>
          <h3><a href="/statti/${article.slug}">${article.title}</a></h3>
          <p>${article.description}</p>
          <a class="article-card-link" href="/statti/${article.slug}">Читати статтю</a>
        </article>
      `
    )
    .join("");
}

export function buildHomePage(publicConfig, featuredArticles = []) {
  const title = `${publicConfig.appName} - Пояснення німецьких листів українською`;
  const description =
    "Завантажте фото або PDF з листом німецькою мовою та отримайте зрозуміле пояснення українською.";
  return layout({
    title,
    description,
    publicConfig,
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
              <span class="eyebrow">Сервіс для українців у Німеччині</span>
              <h1>Завантажте лист на німецькій мові та отримайте пояснення українською</h1>
              <p class="lead">
                ${publicConfig.appName} допомагає зрозуміти зміст листа, знайти дедлайни, ризики та
                підготувати чернетку відповіді німецькою мовою.
              </p>
              <ul class="hero-points">
                <li>Підтримка JPG, PNG і PDF</li>
                <li>Пояснення простою українською</li>
                <li>Чернетка відповіді німецькою для копіювання</li>
              </ul>
            </div>
            <div class="upload-card">
              <form id="analyze-form" class="analyze-form">
                <input id="form-loaded-at" name="form_loaded_at" type="hidden" value="" />
                <div class="bot-trap" aria-hidden="true">
                  <label for="website">Не заповнюйте це поле</label>
                  <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
                </div>
                <label class="upload-zone" for="letter">
                  <input id="letter" name="letter" type="file" accept=".jpg,.jpeg,.png,.pdf" />
                  <span class="upload-button">Оберіть фото або PDF</span>
                  <span class="upload-subtitle">Рекомендовано чітке фото без тіней або оригінальний PDF</span>
                </label>
                <div id="file-preview" class="file-preview hidden" aria-live="polite">
                  <div class="file-preview-head">
                    <strong>Попередній перегляд</strong>
                    <span id="file-preview-name" class="file-preview-name"></span>
                  </div>
                  <img id="image-preview" class="image-preview hidden" alt="Попередній перегляд зображення" />
                  <iframe
                    id="pdf-preview"
                    class="pdf-preview hidden"
                    title="Попередній перегляд PDF"
                  ></iframe>
                </div>
                <label class="consent">
                  <input id="consent" name="consent" type="checkbox" />
                  <span>
                    Я підтверджую, що погоджуюсь на обробку документа для AI-аналізу згідно з
                    <a href="/datenschutz">Datenschutzerklärung</a>.
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
                  Turnstile ще не налаштований. Додайте ключ сайту в .env для активації захисту від ботів.
                </p>`
                }
                <button class="primary-button" type="submit">Пояснити лист</button>
                <p class="fine-print">
                  Сервіс не є юридичною консультацією. Не завантажуйте документи, якщо у вас немає права
                  передавати їх на обробку.
                </p>
              </form>
              <div id="status-box" class="status-box" aria-live="polite"></div>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow" id="how-it-works">Як це працює</span>
              <h2>Один сценарій, без зайвої складності</h2>
            </div>
            <div class="steps">
              <article class="step-card">
                <strong>1</strong>
                <h3>Завантаження</h3>
                <p>Користувач додає фото або PDF з листом німецькою мовою.</p>
              </article>
              <article class="step-card">
                <strong>2</strong>
                <h3>Розпізнавання</h3>
                <p>Система витягує текст або читає сам документ, якщо це скан чи фото.</p>
              </article>
              <article class="step-card">
                <strong>3</strong>
                <h3>Пояснення</h3>
                <p>AI формує короткий зміст, дії, дедлайни, ризики та чернетку відповіді.</p>
              </article>
            </div>
          </div>
        </section>

        <section class="section section-accent">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">Результат</span>
              <h2>Структурований розбір листа</h2>
            </div>
            <div id="result-card" class="result-card hidden">
              <div class="result-block">
                <h3>Що це за лист</h3>
                <p id="summary_uk"></p>
              </div>
              <div class="result-columns">
                <div class="result-block">
                  <h3>Що потрібно зробити</h3>
                  <ul id="actions"></ul>
                </div>
                <div class="result-block">
                  <h3>До якої дати</h3>
                  <ul id="deadlines"></ul>
                </div>
              </div>
              <div class="result-block alert-block">
                <h3>Можливі ризики</h3>
                <ul id="risks"></ul>
              </div>
              <div class="result-block">
                <div class="result-title-row">
                  <h3>Чернетка відповіді німецькою</h3>
                  <div class="result-actions">
                    <button id="copy-reply" class="secondary-button" type="button">Скопіювати</button>
                    <button id="send-email" class="secondary-button" type="button">Відправити на email</button>
                  </div>
                </div>
                <pre id="reply_de" class="reply-box"></pre>
                <div class="email-compose">
                  <label class="email-label" for="reply-email">Email одержувача</label>
                  <input
                    id="reply-email"
                    class="email-input"
                    type="email"
                    inputmode="email"
                    autocomplete="email"
                    placeholder="example@email.de"
                  />
                  <p class="fine-print">
                    Кнопка відкриє ваш поштовий клієнт з підставленою темою та чернеткою відповіді.
                  </p>
                </div>
              </div>
              <div class="result-block">
                <h3>Що означає ця відповідь</h3>
                <p id="reply_uk_explanation"></p>
              </div>
              <div class="result-block disclaimer-block">
                <h3>Важливо</h3>
                <p id="disclaimer"></p>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">SEO-статті</span>
              <h2>Корисні пояснення про німецькі листи та формуляри</h2>
              <p class="lead">
                Ми зібрали прості статті українською про Jobcenter, Auslaenderbehoerde, Krankenkasse,
                Schule та інші часті листи, які приходять у Німеччині.
              </p>
            </div>
            <div class="article-grid">
              ${renderArticleCards(featuredArticles)}
            </div>
            <div class="section-cta">
              <a class="secondary-button" href="/statti">Переглянути всі статті</a>
            </div>
          </div>
        </section>
      </main>
      <script src="/assets/app.js" defer></script>
    `
  });
}

export function buildLegalPage(titleKey, title, legalHtml, publicConfig) {
  const pageTitle = `${title} - ${publicConfig.appName}`;
  const description = `${titleKey} for ${publicConfig.appName}`;
  return layout({
    title: pageTitle,
    description,
    publicConfig,
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

function renderCategoryFilters(categories, activeCategorySlug = "") {
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
      <a class="${allChipClass}" href="${allHref}">Усі статті</a>
      ${categoryLinks}
    </div>
  `;
}

export function buildArticlesIndexPage(publicConfig, articles, categories, activeCategory = null) {
  const titlePrefix = activeCategory
    ? `Статті категорії ${activeCategory.title}`
    : "Статті про німецькі листи";
  const title = `${titlePrefix} - ${publicConfig.appName}`;
  const description =
    "Добірка статей українською про німецькі офіційні листи, Jobcenter, Krankenkasse, Auslaenderbehoerde та шкільні повідомлення.";
  const canonicalUrl = activeCategory
    ? `${publicConfig.siteOrigin}/statti/kategoria/${activeCategory.slug}`
    : `${publicConfig.siteOrigin}/statti`;
  return layout({
    title,
    description,
    publicConfig,
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
            <span class="eyebrow">База знань</span>
            <h1>${activeCategory ? `Категорія: ${activeCategory.title}` : "Статті про німецькі офіційні листи"}</h1>
            <p class="lead">
              Тут зібрані прості пояснення українською мовою для типових листів з Німеччини:
              Jobcenter, Schule, Krankenkasse, Auslaenderbehoerde, Kündigung і формуляри.
            </p>
          </div>
          ${renderCategoryFilters(categories, activeCategory?.slug || "")}
          <div class="article-grid article-grid-full">
            ${renderArticleCards(articles)}
          </div>
        </div>
      </main>
    `
  });
}

export function buildArticlePage(article, relatedArticles, publicConfig) {
  const keywords = article.keywords?.join(", ") || "";
  const title = `${article.title} - ${publicConfig.appName}`;
  const canonicalUrl = `${publicConfig.siteOrigin}/statti/${article.slug}`;
  const relatedHtml = relatedArticles.length
    ? `
      <section class="article-related">
        <h2>Ще корисні статті</h2>
        <div class="article-grid">
          ${renderArticleCards(relatedArticles)}
        </div>
      </section>
    `
    : "";

  return layout({
    title,
    description: article.description,
    publicConfig,
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
            <a href="/">Головна</a>
            <span>/</span>
            <a href="/statti">Статті</a>
            <span>/</span>
            <span>${article.title}</span>
          </nav>

          <header class="article-hero">
            <span class="eyebrow">SEO-стаття</span>
            <div class="article-cover article-cover-hero ${article.coverTone}">
              <span class="article-cover-kicker">${article.category.title}</span>
              <strong>${article.coverTitle}</strong>
              <span>${article.coverSubtitle}</span>
            </div>
            <h1>${article.title}</h1>
            <p class="lead">${article.description}</p>
            <div class="article-meta">
              <span>Дата: ${formatArticleDate(article.publishedAt)}</span>
              <span>Час читання: ${article.readingTime}</span>
              <span>Категорія: <a href="/statti/kategoria/${article.category.slug}">${article.category.title}</a></span>
            </div>
          </header>

          <div class="article-content">
            ${article.body}
          </div>

          <section class="article-cta-box">
            <h2>Потрібно розібрати реальний лист?</h2>
            <p>
              Завантажте фото або PDF у ${publicConfig.appName} і отримайте коротке пояснення
              українською, дедлайни, ризики та чернетку відповіді німецькою.
            </p>
            <a class="primary-button" href="/">Пояснити лист</a>
          </section>

          ${relatedHtml}
        </article>
      </main>
    `
  });
}
