function layout({ title, description, body, publicConfig }) {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="stylesheet" href="/assets/styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/">${publicConfig.appName}</a>
      <nav class="nav-links">
        <a href="/#how-it-works">Як це працює</a>
        <a href="/#legal">Правова інформація</a>
        <a href="/kontakt">Kontakt</a>
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
              <span class="eyebrow">MVP для українців у Німеччині</span>
              <h1>Завантажте німецький лист і отримайте пояснення українською</h1>
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
                <label class="upload-zone" for="letter">
                  <input id="letter" name="letter" type="file" accept=".jpg,.jpeg,.png,.pdf" required />
                  <span class="upload-title">Оберіть фото або PDF</span>
                  <span class="upload-subtitle">Рекомендовано чітке фото без тіней або оригінальний PDF</span>
                </label>
                <label class="consent">
                  <input id="consent" name="consent" type="checkbox" required />
                  <span>
                    Я підтверджую, що погоджуюсь на обробку документа для AI-аналізу згідно з
                    <a href="/datenschutz">Datenschutzerklärung</a>.
                  </span>
                </label>
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

function legalContent(kind, cfg) {
  if (kind === "impressum") {
  return `
    <h1>Impressum</h1>
    <p><strong>${cfg.companyName}</strong></p>
    <p>${cfg.ownerName}</p>
    <p>${cfg.streetAddress}</p>
    <p>${cfg.postalCode} ${cfg.city}</p>
    <p>${cfg.country}</p>
    <p>E-Mail: <a href="mailto:${cfg.supportEmail}">${cfg.supportEmail}</a></p>
    <h2>Haftung fuer Inhalte</h2>
    <p>
      Als Diensteanbieter sind wir gemaess § 7 Abs.1 TMG fuer eigene Inhalte auf diesen Seiten nach
      den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
      jedoch nicht verpflichtet, uebermittelte oder gespeicherte fremde Informationen zu ueberwachen
      oder nach Umstaenden zu forschen, die auf eine rechtswidrige Taetigkeit hinweisen.
      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
      Gesetzen bleiben hiervon unberuehrt. Eine diesbezuegliche Haftung ist jedoch erst ab dem
      Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung moeglich. Bei Bekanntwerden von
      entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
    </p>
    <h2>Haftung fuer Links</h2>
    <p>
      Unser Angebot enthaelt Links zu externen Websites Dritter, auf deren Inhalte wir keinen
      Einfluss haben. Deshalb koennen wir fuer diese fremden Inhalte auch keine Gewaehr uebernehmen.
      Fuer die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
      Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf moegliche
      Rechtsverstoesse ueberprueft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
      erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
      Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
      werden wir derartige Links umgehend entfernen.
    </p>
  `;
}

  if (kind === "datenschutz") {
  return `
    <h1>Datenschutzerklaerung</h1>

    <p>
      Mit dieser Datenschutzerklaerung informieren wir Sie ueber Art, Umfang und Zweck
      der Verarbeitung personenbezogener Daten bei der Nutzung dieser Website.
    </p>

    <h2>Verantwortlich fuer die Datenverarbeitung</h2>
    <p>${cfg.ownerName}</p>
    <p>${cfg.streetAddress}</p>
    <p>${cfg.postalCode} ${cfg.city}</p>
    <p>${cfg.country}</p>
    <p>E-Mail: <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></p>

    <h2>Welche Daten wir verarbeiten</h2>
    <p>
      Wir verarbeiten personenbezogene Daten, die Sie uns aktiv uebermitteln, insbesondere
      wenn Sie ueber diese Website Dokumente hochladen oder Kontakt mit uns aufnehmen.
    </p>
    <p>
      Dazu koennen insbesondere folgende Daten gehoeren:
    </p>
    <p>
      Name, Kontaktdaten, Inhalte hochgeladener Dokumente, technische Zugriffsdaten,
      IP-Adresse, Browserinformationen sowie Zeitpunkte des Zugriffs.
    </p>

    <h2>Zweck der Verarbeitung</h2>
    <p>
      Die Verarbeitung erfolgt zum Betrieb dieser Website, zur Bearbeitung von Anfragen,
      zur Analyse von durch Sie uebermittelten Schreiben sowie zur Bereitstellung von
      Erlaeuterungen und Antwortentwuerfen.
    </p>

    <h2>Rechtsgrundlagen</h2>
    <p>
      Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemaess Art. 6 Abs. 1
      lit. a DSGVO, zur Durchfuehrung vorvertraglicher oder vertraglicher Massnahmen
      gemaess Art. 6 Abs. 1 lit. b DSGVO, zur Erfuellung rechtlicher Verpflichtungen
      gemaess Art. 6 Abs. 1 lit. c DSGVO oder aufgrund berechtigter Interessen gemaess
      Art. 6 Abs. 1 lit. f DSGVO.
    </p>

    <h2>Dokumentenanalyse</h2>
    <p>
      Wenn Sie ein Foto oder PDF eines Schreibens hochladen, verarbeiten wir die darin
      enthaltenen Informationen ausschliesslich zum Zweck der Analyse und Erlaeuterung
      des Inhalts sowie zur Erstellung eines moeglichen Antwortentwurfs.
    </p>
    <p>
      Bitte laden Sie nur Dokumente hoch, zu deren Verarbeitung und Weitergabe Sie
      berechtigt sind.
    </p>

    <h2>Weitergabe an Dritte</h2>
    <p>
      Soweit dies technisch oder organisatorisch erforderlich ist, koennen Daten an
      externe Dienstleister weitergegeben werden. Dies betrifft insbesondere Hosting-
      Anbieter und technische Anbieter, die fuer die automatisierte Dokumentenanalyse
      eingesetzt werden.
    </p>
    <p>
      Fuer die KI-gestuetzte Analyse kann eine Uebermittlung an OpenAI erfolgen.
    </p>

    <h2>Speicherdauer</h2>
    <p>
      Personenbezogene Daten werden nur so lange gespeichert, wie dies fuer die
      jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
    </p>

    <h2>Ihre Rechte</h2>
    <p>
      Ihnen stehen die gesetzlichen Rechte auf Auskunft, Berichtigung, Loeschung,
      Einschraenkung der Verarbeitung, Datenuebertragbarkeit sowie Widerruf und
      Widerspruch zu.
    </p>
    <p>
      Zudem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehoerde zu
      beschweren.
    </p>

    <h2>Technische Zugriffsdaten</h2>
    <p>
      Beim Aufruf dieser Website werden technische Daten verarbeitet, insbesondere
      IP-Adresse, Datum und Uhrzeit des Zugriffs, Browsertyp, Betriebssystem und
      angeforderte Inhalte. Diese Verarbeitung ist erforderlich, um den sicheren und
      stabilen Betrieb der Website zu gewaehrleisten.
    </p>

    <h2>Sicherheitsmassnahmen</h2>
    <p>
      Wir treffen angemessene technische und organisatorische Massnahmen, um
      personenbezogene Daten vor Verlust, Manipulation und unbefugtem Zugriff zu
      schuetzen.
    </p>

    <h2>Kontakt</h2>
    <p>
      Bei Fragen zum Datenschutz koennen Sie uns unter
      <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>
      kontaktieren.
    </p>
  `;
}

  return `
    <h1>Kontakt</h1>
    <p>Питання щодо сервісу, приватності або прав користувача можна надсилати на:</p>
    <p><a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></p>
    <p>Загальна підтримка: <a href="mailto:${cfg.supportEmail}">${cfg.supportEmail}</a></p>
  `;
}

export function buildLegalPage(kind, publicConfig) {
  const titles = {
    impressum: "Impressum",
    datenschutz: "Datenschutzerklärung",
    kontakt: "Kontakt"
  };

  return layout({
    title: `${titles[kind]} - ${publicConfig.appName}`,
    description: `${titles[kind]} for ${publicConfig.appName}`,
    publicConfig,
    body: `
      <main class="section">
        <div class="container legal-card">
          ${legalContent(kind, publicConfig)}
        </div>
      </main>
    `
  });
}
