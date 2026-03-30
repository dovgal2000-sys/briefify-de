function layout({ title, description, body, publicConfig }) {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
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

export function buildHomePage(publicConfig) {
  return layout({
    title: `${publicConfig.appName} - Пояснення німецьких листів українською`,
    description:
      "Завантажте фото або PDF з листом німецькою мовою та отримайте зрозуміле пояснення українською.",
    publicConfig,
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
                  <input id="letter" name="letter" type="file" accept=".jpg,.jpeg,.png,.pdf" required />
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
                  <input id="consent" name="consent" type="checkbox" required />
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
                  <button id="copy-reply" class="secondary-button" type="button">Скопіювати</button>
                </div>
                <pre id="reply_de" class="reply-box"></pre>
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
      </main>
      <script src="/assets/app.js" defer></script>
    `
  });
}

export function buildLegalPage(titleKey, title, legalHtml, publicConfig) {
  return layout({
    title: `${title} - ${publicConfig.appName}`,
    description: `${titleKey} for ${publicConfig.appName}`,
    publicConfig,
    body: `
      <main class="section">
        <div class="container legal-card">
          ${legalHtml}
        </div>
      </main>
    `
  });
}
