const SUPPORTED_LOCALES = ["uk", "de"];
const DEFAULT_LOCALE = "uk";

export const messages = {
  uk: {
    htmlLang: "uk",
    localeLabel: "Українська",
    localeSwitchLabel: "Мова сайту",
    navHowItWorks: "Як це працює",
    navArticles: "Статті",
    navLegal: "Правова інформація",
    footerDescription:
      "Пояснює листи та тексти іншими мовами зрозумілою мовою та допомагає підготувати відповідь.",
    footerLegal: "Правова інформація",
    footerContacts: "Контакти",
    footerCookieSettings: "Cookie-Einstellungen",
    homeTitle: "Завантажте лист або фото тексту та отримайте пояснення українською",
    homeDescription:
      "Завантажте фото або PDF з листом чи іншим текстом та отримайте зрозуміле пояснення українською.",
    homeEyebrow: "Сервіс для українців у Німеччині",
    homeLead:
      "Briefify допомагає зрозуміти зміст листа або тексту, знайти дедлайни, ризики та підготувати чернетку відповіді мовою оригіналу.",
    homePoint1: "Підтримка JPG, PNG і PDF",
    homePoint2: "Пояснення українською або німецькою",
    homePoint3: "Чернетка відповіді мовою оригінального документа",
    uploadButton: "Оберіть фото або PDF",
    uploadSubtitle: "Рекомендовано чітке фото без тіней або оригінальний PDF",
    previewTitle: "Попередній перегляд",
    consentLabel:
      "Я підтверджую, що погоджуюсь на обробку документа для AI-аналізу згідно з Datenschutzerklärung.",
    turnstileMissing:
      "Turnstile ще не налаштований. Додайте ключ сайту в .env для активації захисту від ботів.",
    submitButton: "Пояснити текст",
    formFinePrint:
      "Сервіс не є юридичною консультацією. Не завантажуйте документи, якщо у вас немає права передавати їх на обробку.",
    howItWorksEyebrow: "Як це працює",
    howItWorksTitle: "Один сценарій, без зайвої складності",
    step1Title: "Завантаження",
    step1Text: "Користувач додає фото або PDF з листом або текстом будь-якою мовою.",
    step2Title: "Розпізнавання",
    step2Text: "Система витягує текст або читає сам документ, якщо це скан чи фото.",
    step3Title: "Пояснення",
    step3Text:
      "AI формує короткий зміст, дії, дедлайни, ризики та чернетку відповіді мовою оригіналу.",
    resultEyebrow: "Результат",
    resultTitle: "Структурований розбір документа",
    resultSummary: "Що це за документ",
    resultActions: "Що потрібно зробити",
    resultDeadlines: "До якої дати",
    resultRisks: "Можливі ризики",
    resultReply: "Чернетка відповіді",
    resultReplyCopy: "Скопіювати",
    resultReplyEmail: "Відправити на email",
    resultReplyMeaning: "Що означає ця відповідь",
    resultImportant: "Важливо",
    emailRecipient: "Email одержувача",
    emailFinePrint:
      "Кнопка відкриє ваш поштовий клієнт з підставленою темою та чернеткою відповіді.",
    seoEyebrow: "SEO-статті",
    seoTitle: "Корисні пояснення про німецькі листи та формуляри",
    seoLead:
      "Ми зібрали прості статті українською про Jobcenter, Auslaenderbehoerde, Krankenkasse, Schule та інші часті листи, які приходять у Німеччині.",
    seoButton: "Переглянути всі статті",
    articlesTitle: "Статті про німецькі листи",
    articlesDescription:
      "Добірка статей українською про німецькі офіційні листи, Jobcenter, Krankenkasse, Auslaenderbehoerde та шкільні повідомлення.",
    articlesEyebrow: "База знань",
    articlesLead:
      "Тут зібрані прості пояснення українською мовою для типових листів з Німеччини: Jobcenter, Schule, Krankenkasse, Auslaenderbehoerde, Kündigung і формуляри.",
    articlesAll: "Усі статті",
    articleReadMore: "Читати статтю",
    adLabel: "Реклама",
    adArticleLabel: "Реклама в статті",
    adConsentNote: "Рекламний блок з'явиться після згоди на рекламні cookies.",
    articleSeoEyebrow: "SEO-стаття",
    articleDate: "Дата",
    articleReadingTime: "Час читання",
    articleCategory: "Категорія",
    articleRelated: "Ще корисні статті",
    homeBreadcrumb: "Головна",
    honeypotLabel: "Не заповнюйте це поле",
    imagePreviewAlt: "Попередній перегляд зображення",
    pdfPreviewTitle: "Попередній перегляд PDF",
    articleCtaTitle: "Потрібно розібрати реальний лист?",
    articleCtaText:
      "Завантажте фото або PDF у Briefify і отримайте коротке пояснення, дедлайни, ризики та чернетку відповіді мовою документа.",
    articleCtaButton: "Пояснити текст",
    legalContactTitle: "Kontakt",
    legalContactIntro:
      "Питання щодо сервісу, приватності або прав користувача можна надсилати на:",
    cookieText1:
      "Ми використовуємо технічні cookies та локальне збереження даних для коректної роботи сайту. Детальніше читайте у Datenschutzerklärung.",
    cookieText2:
      "Якщо ви погодитесь на рекламу, ми також зможемо завантажити Google Ads.",
    cookieText3:
      "Wir verwenden technische Cookies und lokale Speicherung, damit die Website korrekt funktioniert. Weitere Informationen finden Sie in der Datenschutzerklärung.",
    cookieNecessary: "Лише необхідні",
    cookieAccept: "Прийняти рекламу",
    frontendSelectFile: "Спочатку оберіть файл для аналізу.",
    frontendConsentRequired: "Потрібно підтвердити згоду на обробку документа.",
    frontendWait: "Будь ласка, зачекайте секунду й повторіть відправку форми.",
    frontendUploading: "Завантаження документа...",
    frontendAnalyzing: "Розпізнавання документа та аналіз змісту...",
    frontendReady:
      "Аналіз готовий. Перевірте короткий зміст, дедлайни та чернетку відповіді.",
    frontendCopySuccess: "Чернетку відповіді скопійовано у буфер обміну.",
    frontendCopyError:
      "Не вдалося скопіювати текст автоматично. Скопіюйте його вручну.",
    frontendNeedReply: "Спочатку отримайте чернетку відповіді.",
    frontendNeedRecipient: "Вкажіть email одержувача.",
    frontendEmailSubject: "Відповідь на ваш лист",
    emptyActions: "Дій не виявлено.",
    emptyDeadlines: "Явних дедлайнів не знайдено.",
    emptyRisks: "Явних ризиків не виявлено.",
    apiTurnstileMissing:
      "Turnstile не налаштований на сервері. Додайте TURNSTILE_SECRET_KEY.",
    apiBotRejected: "Запит відхилено системою захисту від автоматичних відправлень.",
    apiBotWait: "Запит виглядає автоматичним. Спробуйте відправити форму ще раз.",
    apiTurnstileConfirm: "Підтвердіть, будь ласка, що ви не бот.",
    apiTurnstileFailed: "Перевірка Turnstile не пройдена. Спробуйте ще раз.",
    apiNeedFile: "Будь ласка, завантажте файл у форматі JPG, PNG або PDF.",
    apiNeedConsent: "Щоб продовжити, потрібно підтвердити згоду на обробку документа.",
    apiUploadTypes: "Підтримуються лише файли JPG, PNG або PDF.",
    apiEmptyFile: "Файл порожній або пошкоджений.",
    apiGenericError: "Сталася помилка під час аналізу документа. Спробуйте ще раз трохи пізніше."
  },
  de: {
    htmlLang: "de",
    localeLabel: "Deutsch",
    localeSwitchLabel: "Sprache",
    navHowItWorks: "So funktioniert es",
    navArticles: "Artikel",
    navLegal: "Rechtliches",
    footerDescription:
      "Erklärt Briefe und Texte in anderen Sprachen verständlich und hilft beim Formulieren einer Antwort.",
    footerLegal: "Rechtliches",
    footerContacts: "Kontakt",
    footerCookieSettings: "Cookie-Einstellungen",
    homeTitle: "Laden Sie einen Brief oder ein Textfoto hoch und erhalten Sie eine Erklärung auf Deutsch",
    homeDescription:
      "Laden Sie ein Foto oder PDF eines Briefes oder anderen Textes hoch und erhalten Sie eine verständliche Erklärung auf Deutsch.",
    homeEyebrow: "Service für mehrsprachige Kommunikation",
    homeLead:
      "Briefify hilft dabei, den Inhalt eines Briefes oder Textes zu verstehen, Fristen und Risiken zu erkennen und eine Antwort in der Originalsprache vorzubereiten.",
    homePoint1: "Unterstützt JPG, PNG und PDF",
    homePoint2: "Erklärung auf Ukrainisch oder Deutsch",
    homePoint3: "Antwortentwurf in der Originalsprache des Dokuments",
    uploadButton: "Foto oder PDF auswählen",
    uploadSubtitle: "Am besten ein scharfes Foto ohne Schatten oder das originale PDF hochladen",
    previewTitle: "Vorschau",
    consentLabel:
      "Ich bestätige, dass ich der Verarbeitung des Dokuments zur KI-Analyse gemäß der Datenschutzerklärung zustimme.",
    turnstileMissing:
      "Turnstile ist noch nicht konfiguriert. Fügen Sie den Schlüssel in der .env-Datei hinzu, um den Bot-Schutz zu aktivieren.",
    submitButton: "Text erklären",
    formFinePrint:
      "Dieser Service ist keine Rechtsberatung. Laden Sie keine Dokumente hoch, wenn Sie nicht berechtigt sind, sie zur Verarbeitung weiterzugeben.",
    howItWorksEyebrow: "So funktioniert es",
    howItWorksTitle: "Ein klarer Ablauf ohne unnötige Komplexität",
    step1Title: "Upload",
    step1Text: "Die Person lädt ein Foto oder PDF mit einem Brief oder Text hoch, auch in <strong>beliebiger Sprache</strong>.",
    step2Title: "Erkennung",
    step2Text: "Das System extrahiert den Text oder liest das Dokument direkt, wenn es sich um einen Scan oder ein Foto handelt.",
    step3Title: "Erklärung",
    step3Text:
      "Die KI erstellt eine Zusammenfassung, To-dos, Fristen, Risiken und einen Antwortentwurf in der Originalsprache.",
    resultEyebrow: "Ergebnis",
    resultTitle: "Strukturierte Analyse des Dokuments",
    resultSummary: "Worum geht es in dem Dokument",
    resultActions: "Was ist zu tun",
    resultDeadlines: "Bis wann",
    resultRisks: "Mögliche Risiken",
    resultReply: "Antwortentwurf",
    resultReplyCopy: "Kopieren",
    resultReplyEmail: "Per E-Mail senden",
    resultReplyMeaning: "Was diese Antwort bedeutet",
    resultImportant: "Wichtig",
    emailRecipient: "E-Mail-Empfänger",
    emailFinePrint:
      "Die Schaltfläche öffnet Ihr E-Mail-Programm mit Betreff und vorbereitetem Antwortentwurf.",
    seoEyebrow: "SEO-Artikel",
    seoTitle: "Hilfreiche Erklärungen zu deutschen Briefen und Formularen",
    seoLead:
      "Hier finden Sie verständliche Artikel auf Ukrainisch über Jobcenter, Auslaenderbehoerde, Krankenkasse, Schule und andere häufige Schreiben in Deutschland.",
    seoButton: "Alle Artikel ansehen",
    articlesTitle: "Artikel über deutsche Briefe",
    articlesDescription:
      "Sammlung ukrainischer Artikel über deutsche Behördenbriefe, Jobcenter, Krankenkasse, Auslaenderbehoerde und Schulmitteilungen.",
    articlesEyebrow: "Wissensbasis",
    articlesLead:
      "Hier finden Sie einfache Erklärungen auf Ukrainisch zu typischen Schreiben aus Deutschland: Jobcenter, Schule, Krankenkasse, Auslaenderbehoerde, Kündigung und Formulare.",
    articlesAll: "Alle Artikel",
    articleReadMore: "Artikel lesen",
    adLabel: "Werbung",
    adArticleLabel: "Werbung im Artikel",
    adConsentNote: "Anzeigen werden nach Zustimmung zu Werbe-Cookies geladen.",
    articleSeoEyebrow: "SEO-Artikel",
    articleDate: "Datum",
    articleReadingTime: "Lesezeit",
    articleCategory: "Kategorie",
    articleRelated: "Weitere nützliche Artikel",
    homeBreadcrumb: "Startseite",
    honeypotLabel: "Dieses Feld nicht ausfüllen",
    imagePreviewAlt: "Bildvorschau",
    pdfPreviewTitle: "PDF-Vorschau",
    articleCtaTitle: "Möchten Sie ein echtes Schreiben analysieren?",
    articleCtaText:
      "Laden Sie ein Foto oder PDF bei Briefify hoch und erhalten Sie eine kurze Erklärung, Fristen, Risiken und einen Antwortentwurf in der Sprache des Dokuments.",
    articleCtaButton: "Text erklären",
    legalContactTitle: "Kontakt",
    legalContactIntro:
      "Fragen zum Service, zum Datenschutz oder zu Betroffenenrechten können gesendet werden an:",
    cookieText1:
      "Wir verwenden technische Cookies und lokale Speicherung, damit die Website korrekt funktioniert. Weitere Informationen finden Sie in der Datenschutzerklärung.",
    cookieText2:
      "Wenn Sie Werbung zustimmen, können wir zusätzlich Google Ads laden.",
    cookieText3:
      "Ми використовуємо технічні cookies та локальне збереження даних для коректної роботи сайту. Детальніше читайте у Datenschutzerklärung.",
    cookieNecessary: "Nur notwendige",
    cookieAccept: "Werbung erlauben",
    frontendSelectFile: "Bitte wählen Sie zuerst eine Datei zur Analyse aus.",
    frontendConsentRequired: "Bitte bestätigen Sie die Zustimmung zur Dokumentverarbeitung.",
    frontendWait: "Bitte warten Sie einen Moment und senden Sie das Formular erneut ab.",
    frontendUploading: "Dokument wird hochgeladen...",
    frontendAnalyzing: "Dokument wird erkannt und analysiert...",
    frontendReady:
      "Die Analyse ist fertig. Prüfen Sie die Zusammenfassung, Fristen und den Antwortentwurf.",
    frontendCopySuccess: "Der Antwortentwurf wurde in die Zwischenablage kopiert.",
    frontendCopyError:
      "Der Text konnte nicht automatisch kopiert werden. Bitte kopieren Sie ihn manuell.",
    frontendNeedReply: "Bitte erstellen Sie zuerst einen Antwortentwurf.",
    frontendNeedRecipient: "Bitte geben Sie die Empfänger-E-Mail ein.",
    frontendEmailSubject: "Antwort auf Ihr Schreiben",
    emptyActions: "Keine konkreten Maßnahmen erkannt.",
    emptyDeadlines: "Keine eindeutigen Fristen gefunden.",
    emptyRisks: "Keine eindeutigen Risiken erkannt.",
    apiTurnstileMissing:
      "Turnstile ist auf dem Server nicht konfiguriert. Bitte TURNSTILE_SECRET_KEY hinzufügen.",
    apiBotRejected: "Die Anfrage wurde vom Anti-Bot-Schutz abgelehnt.",
    apiBotWait: "Die Anfrage wirkt automatisiert. Bitte senden Sie das Formular erneut ab.",
    apiTurnstileConfirm: "Bitte bestätigen Sie, dass Sie kein Bot sind.",
    apiTurnstileFailed: "Die Turnstile-Prüfung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
    apiNeedFile: "Bitte laden Sie eine Datei im Format JPG, PNG oder PDF hoch.",
    apiNeedConsent: "Um fortzufahren, müssen Sie der Verarbeitung des Dokuments zustimmen.",
    apiUploadTypes: "Es werden nur JPG-, PNG- oder PDF-Dateien unterstützt.",
    apiEmptyFile: "Die Datei ist leer oder beschädigt.",
    apiGenericError:
      "Beim Analysieren des Dokuments ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
  }
};

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function detectLocale({ queryLang, cookieLang, acceptLanguage }) {
  if (SUPPORTED_LOCALES.includes(queryLang)) {
    return queryLang;
  }

  if (SUPPORTED_LOCALES.includes(cookieLang)) {
    return cookieLang;
  }

  const preferred = (acceptLanguage || "")
    .split(",")
    .map((entry) => entry.trim().slice(0, 2).toLowerCase())
    .find((value) => SUPPORTED_LOCALES.includes(value));

  return preferred || DEFAULT_LOCALE;
}

export function getMessages(locale) {
  return messages[normalizeLocale(locale)];
}

export function createTranslator(locale) {
  const dictionary = getMessages(locale);
  return function t(key) {
    return dictionary[key] || messages[DEFAULT_LOCALE][key] || key;
  };
}

export function getFrontendMessages(locale) {
  const t = createTranslator(locale);
  return {
    selectFile: t("frontendSelectFile"),
    consentRequired: t("frontendConsentRequired"),
    wait: t("frontendWait"),
    uploading: t("frontendUploading"),
    analyzing: t("frontendAnalyzing"),
    ready: t("frontendReady"),
    copySuccess: t("frontendCopySuccess"),
    copyError: t("frontendCopyError"),
    needReply: t("frontendNeedReply"),
    needRecipient: t("frontendNeedRecipient"),
    emailSubject: t("frontendEmailSubject"),
    emptyActions: t("emptyActions"),
    emptyDeadlines: t("emptyDeadlines"),
    emptyRisks: t("emptyRisks")
  };
}

export function getLocaleOptions() {
  return SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    label: messages[locale].localeLabel
  }));
}
