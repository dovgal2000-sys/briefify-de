const SUPPORTED_LOCALES = ["uk", "de"];
const DEFAULT_LOCALE = "uk";

export const messages = {
  uk: {
    htmlLang: "uk",
    localeLabel: "Українська",
    localeSwitchLabel: "Мова сайту",
    navHowItWorks: "Як це працює",
    navArticles: "Статті",
    navPartners: "Партнери",
    navLegal: "Правова інформація",
    footerDescription:
      "Пояснює листи та тексти іншими мовами зрозумілою мовою та допомагає підготувати відповідь.",
    footerLegal: "Правова інформація",
    footerContacts: "Контакти",
    footerCookieSettings: "Cookie-Einstellungen",
    footerPartners: "Партнерські посилання",
    homeTitle: "Пояснення німецьких листів українською",
    homeDescription:
      "Briefify.de пояснює німецькі листи українською: завантажте фото або PDF, отримайте короткий зміст, дедлайни, ризики та чернетку відповіді.",
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
    faqEyebrow: "Питання та відповіді",
    faqTitle: "Що варто знати перед аналізом листа",
    faqQuestion1: "Чи є Briefify.de юридичною консультацією?",
    faqAnswer1:
      "Ні. Briefify.de пояснює зміст листа простими словами, але не замінює адвоката, Beratungsstelle або офіційний переклад.",
    faqQuestion2: "Які документи можна завантажувати?",
    faqAnswer2:
      "Можна завантажувати JPG, PNG або PDF з листом чи текстом, якщо ви маєте право передати цей документ на обробку.",
    faqQuestion3: "Що показує результат аналізу?",
    faqAnswer3:
      "Сервіс показує короткий зміст, можливі дії, дедлайни, ризики та, коли доречно, чернетку ввічливої відповіді.",
    faqQuestion4: "Чи треба перевіряти результат самостійно?",
    faqAnswer4:
      "Так. Завжди звіряйте імена, номери справ, суми, дати, адреси та реквізити з оригінальним документом.",
    feedbackEyebrow: "Відгуки",
    feedbackTitle: "Що кажуть користувачі",
    feedbackLead:
      "Можна залишити короткий відгук про сервіс. Після перевірки адміністратором він з'явиться на сайті.",
    feedbackPageTitle: "Залишити відгук про Briefify",
    feedbackPageDescription:
      "Сторінка для відгуків користувачів Briefify. Відгук публікується після перевірки адміністратором.",
    feedbackNameLabel: "Ваше ім'я або нік",
    feedbackNamePlaceholder: "Наприклад, Олена з Берліна",
    feedbackMessageLabel: "Ваш відгук",
    feedbackMessagePlaceholder:
      "Що було корисно? Чи допоміг сервіс зрозуміти лист, строки або наступні кроки?",
    feedbackSubmit: "Надіслати відгук",
    feedbackFinePrint:
      "Ми публікуємо лише перевірені відгуки. Не вказуйте у відгуку конфіденційні дані або текст листа повністю.",
    feedbackEmpty: "Поки що немає опублікованих відгуків. Ви можете залишити перший.",
    feedbackPendingSuccess:
      "Дякуємо. Відгук отримано і він з'явиться на сайті після перевірки.",
    feedbackFormTitle: "Залишити відгук",
    feedbackAdminTitle: "Модерація відгуків",
    feedbackAdminPending: "Очікують перевірки",
    feedbackAdminApproved: "Опубліковано",
    feedbackAdminRejected: "Відхилено",
    feedbackAdminApprove: "Схвалити",
    feedbackAdminReject: "Відхилити",
    feedbackAdminEmpty: "Нових відгуків на модерацію ще немає.",
    feedbackStatusPending: "Очікує перевірки",
    feedbackStatusApproved: "Опубліковано",
    feedbackStatusRejected: "Відхилено",
    feedbackOpenForm: "Залишити відгук",
    feedbackViewAll: "Усі відгуки",
    feedbackCarouselPrev: "Попередній відгук",
    feedbackCarouselNext: "Наступний відгук",
    feedbackFormLead:
      "Розкажіть коротко, чи був сервіс корисний і в чому саме. Після перевірки відгук може з'явитися на сайті.",
    feedbackLockedTitle: "Спочатку проаналізуйте документ",
    feedbackLockedLead:
      "Залишити відгук можна лише після того, як ви успішно завантажили та розпізнали документ у Briefify.",
    feedbackLockedCta: "Перейти до аналізу документа",
    articlesTitle: "Статті про німецькі листи",
    articlesDescription:
      "Добірка статей українською про німецькі офіційні листи, Jobcenter, Krankenkasse, Auslaenderbehoerde та шкільні повідомлення.",
    articlesEyebrow: "База знань",
    articlesLead:
      "Тут зібрані прості пояснення українською мовою для типових листів з Німеччини: Jobcenter, Schule, Krankenkasse, Auslaenderbehoerde, Kündigung і формуляри.",
    articlesAll: "Усі статті",
    articleReadMore: "Читати статтю",
    partnersTitle: "Партнерські посилання для українців у Німеччині",
    partnersDescription:
      "Добірка корисних партнерських ресурсів для українців у Німеччині: каталоги сервісів, довідники та практичні сайти.",
    partnersEyebrow: "Партнерські ресурси",
    partnersLead:
      "Тут зібрані зовнішні сайти, які можуть бути корисними українцям у Німеччині: каталоги послуг, довідкові платформи та локальні ресурси.",
    partnersWhyTitle: "Чому варто зберегти цю сторінку",
    partnersWhyPoint1: "Один список корисних зовнішніх ресурсів без зайвого пошуку.",
    partnersWhyPoint2: "Швидкий перехід до каталогів та сервісів для життя в Німеччині.",
    partnersWhyPoint3: "Сторінка буде поступово доповнюватися новими партнерськими сайтами.",
    partnersVisit: "Перейти на сайт",
    partnersSiteLabel: "Сайт партнера",
    partnersCategoryLabel: "Категорія",
    partnersCategoryDirectories: "Каталоги та довідники",
    partnersAboutTitle: "Що це за ресурс",
    partnersFirstName: "Dovidka.de",
    partnersFirstDescription:
      "Жовто-блакитні сторінки Німеччини з українськими бізнесами, сервісами та локальними контактами.",
    partnersFirstBenefit1: "Пошук українських бізнесів у різних містах Німеччини.",
    partnersFirstBenefit2: "Категорії послуг: юристи, лікарі, перекладачі, перевезення, навчання та інші.",
    partnersFirstBenefit3: "Зручний формат каталогу для швидкого пошуку потрібних контактів.",
    partnersSecondName: "SchweizDaten.com",
    partnersSecondDescription:
      "Статистичний портал про Швейцарію з даними про зарплати, податки, житло, вартість життя, кантони та медичне страхування.",
    partnersSecondBenefit1: "Порівняння кантонів за зарплатами, податками, населенням і витратами.",
    partnersSecondBenefit2: "Зведення по темах: житло, Krankenkasse, безробіття, освіта та інші показники.",
    partnersSecondBenefit3: "Корисно для тих, хто шукає цифри та орієнтири по життю у Швейцарії.",
    partnersDisclosure:
      "Ми додаємо лише ті зовнішні ресурси, які можуть бути практично корисними нашій аудиторії.",
    adLabel: "Реклама",
    adArticleLabel: "Реклама в статті",
    adConsentNote: "Рекламний блок з'явиться після згоди на рекламні cookies.",
    articleSeoEyebrow: "SEO-стаття",
    articleAuthor: "Автор",
    articleAuthorName: "Редакція Briefify.de",
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
    frontendFeedbackNameRequired: "Вкажіть, будь ласка, ім'я або нік для відгуку.",
    frontendFeedbackMessageRequired: "Напишіть короткий текст відгуку.",
    frontendFeedbackSending: "Надсилаємо відгук...",
    frontendFeedbackReady:
      "Дякуємо. Відгук отримано і буде опублікований після перевірки.",
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
    apiGenericError: "Сталася помилка під час аналізу документа. Спробуйте ще раз трохи пізніше.",
    apiFeedbackNameRequired: "Вкажіть, будь ласка, ім'я або нік.",
    apiFeedbackMessageRequired: "Напишіть, будь ласка, текст відгуку.",
    apiFeedbackTooLong: "Відгук занадто довгий. Скоротіть його, будь ласка.",
    apiFeedbackGenericError: "Не вдалося надіслати відгук. Спробуйте ще раз трохи пізніше.",
    apiFeedbackAccessRequired:
      "Відгук можна залишити лише після успішного аналізу документа на сайті."
  },
  de: {
    htmlLang: "de",
    localeLabel: "Deutsch",
    localeSwitchLabel: "Sprache",
    navHowItWorks: "So funktioniert es",
    navArticles: "Artikel",
    navPartners: "Partner",
    navLegal: "Rechtliches",
    footerDescription:
      "Erklärt Briefe und Texte in anderen Sprachen verständlich und hilft beim Formulieren einer Antwort.",
    footerLegal: "Rechtliches",
    footerContacts: "Kontakt",
    footerCookieSettings: "Cookie-Einstellungen",
    footerPartners: "Partnerlinks",
    homeTitle: "Deutsche Briefe verständlich erklären",
    homeDescription:
      "Briefify.de erklärt deutsche Briefe verständlich: Foto oder PDF hochladen und Zusammenfassung, Fristen, Risiken sowie einen Antwortentwurf erhalten.",
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
    faqEyebrow: "Fragen und Antworten",
    faqTitle: "Was Sie vor der Analyse wissen sollten",
    faqQuestion1: "Ist Briefify.de eine Rechtsberatung?",
    faqAnswer1:
      "Nein. Briefify.de erklärt den Inhalt eines Schreibens verständlich, ersetzt aber keine Rechtsberatung, Beratungsstelle oder amtliche Übersetzung.",
    faqQuestion2: "Welche Dokumente kann ich hochladen?",
    faqAnswer2:
      "Sie können JPG, PNG oder PDF mit einem Brief oder Text hochladen, wenn Sie berechtigt sind, dieses Dokument verarbeiten zu lassen.",
    faqQuestion3: "Was zeigt die Analyse?",
    faqAnswer3:
      "Der Service zeigt eine Zusammenfassung, mögliche Schritte, Fristen, Risiken und, wenn passend, einen höflichen Antwortentwurf.",
    faqQuestion4: "Soll ich das Ergebnis selbst prüfen?",
    faqAnswer4:
      "Ja. Prüfen Sie Namen, Aktenzeichen, Beträge, Daten, Adressen und Kontodaten immer mit dem Originaldokument.",
    feedbackEyebrow: "Feedback",
    feedbackTitle: "Was Nutzer sagen",
    feedbackLead:
      "Sie können ein kurzes Feedback zum Service hinterlassen. Nach der Prüfung durch den Administrator erscheint es auf der Website.",
    feedbackPageTitle: "Feedback zu Briefify hinterlassen",
    feedbackPageDescription:
      "Seite für Rückmeldungen zu Briefify. Feedback wird nach der Prüfung durch einen Administrator veröffentlicht.",
    feedbackNameLabel: "Ihr Name oder Spitzname",
    feedbackNamePlaceholder: "Zum Beispiel Olena aus Berlin",
    feedbackMessageLabel: "Ihr Feedback",
    feedbackMessagePlaceholder:
      "Was war hilfreich? Hat der Service geholfen, den Brief, die Fristen oder die nächsten Schritte zu verstehen?",
    feedbackSubmit: "Feedback senden",
    feedbackFinePrint:
      "Wir veröffentlichen nur geprüfte Rückmeldungen. Bitte schreiben Sie keine vertraulichen Daten oder den vollständigen Brieftext in das Feedback.",
    feedbackEmpty: "Es gibt noch keine veröffentlichten Rückmeldungen. Sie können die erste hinterlassen.",
    feedbackPendingSuccess:
      "Danke. Ihr Feedback wurde erhalten und erscheint nach der Prüfung auf der Website.",
    feedbackFormTitle: "Feedback hinterlassen",
    feedbackAdminTitle: "Feedback-Moderation",
    feedbackAdminPending: "Warten auf Prüfung",
    feedbackAdminApproved: "Veröffentlicht",
    feedbackAdminRejected: "Abgelehnt",
    feedbackAdminApprove: "Freigeben",
    feedbackAdminReject: "Ablehnen",
    feedbackAdminEmpty: "Es gibt noch kein neues Feedback zur Moderation.",
    feedbackStatusPending: "Wartet auf Prüfung",
    feedbackStatusApproved: "Veröffentlicht",
    feedbackStatusRejected: "Abgelehnt",
    feedbackOpenForm: "Feedback hinterlassen",
    feedbackViewAll: "Alle Rückmeldungen",
    feedbackCarouselPrev: "Vorheriges Feedback",
    feedbackCarouselNext: "Nächstes Feedback",
    feedbackFormLead:
      "Schreiben Sie kurz, ob der Service hilfreich war und wobei genau. Nach der Prüfung kann das Feedback auf der Website erscheinen.",
    feedbackLockedTitle: "Bitte zuerst ein Dokument analysieren",
    feedbackLockedLead:
      "Feedback kann erst hinterlassen werden, nachdem Sie ein Dokument in Briefify erfolgreich hochgeladen und analysiert haben.",
    feedbackLockedCta: "Zur Dokumentanalyse",
    articlesTitle: "Artikel über deutsche Briefe",
    articlesDescription:
      "Sammlung ukrainischer Artikel über deutsche Behördenbriefe, Jobcenter, Krankenkasse, Auslaenderbehoerde und Schulmitteilungen.",
    articlesEyebrow: "Wissensbasis",
    articlesLead:
      "Hier finden Sie einfache Erklärungen auf Ukrainisch zu typischen Schreiben aus Deutschland: Jobcenter, Schule, Krankenkasse, Auslaenderbehoerde, Kündigung und Formulare.",
    articlesAll: "Alle Artikel",
    articleReadMore: "Artikel lesen",
    partnersTitle: "Partnerlinks fuer Ukrainer in Deutschland",
    partnersDescription:
      "Sammlung nuetzlicher Partnerressourcen fuer Ukrainer in Deutschland: Verzeichnisse, Wegweiser und praktische Websites.",
    partnersEyebrow: "Partnerressourcen",
    partnersLead:
      "Hier sammeln wir externe Websites, die fuer Ukrainer in Deutschland hilfreich sein koennen: Dienstleistungsverzeichnisse, Informationsplattformen und lokale Ressourcen.",
    partnersWhyTitle: "Warum diese Seite hilfreich ist",
    partnersWhyPoint1: "Ein Ort mit nuetzlichen externen Ressourcen ohne lange Suche.",
    partnersWhyPoint2: "Schneller Zugang zu Verzeichnissen und Services fuer das Leben in Deutschland.",
    partnersWhyPoint3: "Die Seite wird schrittweise um weitere Partner-Websites erweitert.",
    partnersVisit: "Website besuchen",
    partnersSiteLabel: "Partner-Website",
    partnersCategoryLabel: "Kategorie",
    partnersCategoryDirectories: "Verzeichnisse und Wegweiser",
    partnersAboutTitle: "Was ist das fuer ein Angebot",
    partnersFirstName: "Dovidka.de",
    partnersFirstDescription:
      "Gelb-blaue Seiten Deutschlands mit ukrainischen Unternehmen, Services und lokalen Kontakten.",
    partnersFirstBenefit1: "Suche nach ukrainischen Unternehmen in verschiedenen Staedten Deutschlands.",
    partnersFirstBenefit2: "Kategorien wie Rechtsberatung, Medizin, Uebersetzungen, Transporte, Bildung und weitere Dienstleistungen.",
    partnersFirstBenefit3: "Katalogformat fuer eine schnelle Suche nach passenden Kontakten.",
    partnersSecondName: "SchweizDaten.com",
    partnersSecondDescription:
      "Statistikportal zur Schweiz mit Daten zu Loehnen, Steuern, Wohnen, Lebenshaltungskosten, Kantonen und Krankenversicherung.",
    partnersSecondBenefit1: "Vergleiche zwischen Kantonen nach Lohn, Steuern, Bevoelkerung und Kosten.",
    partnersSecondBenefit2: "Uebersichten zu Wohnen, Krankenkasse, Arbeitslosigkeit, Bildung und weiteren Kennzahlen.",
    partnersSecondBenefit3: "Nuetzlich fuer Menschen, die Zahlen und Orientierung zum Leben in der Schweiz suchen.",
    partnersDisclosure:
      "Wir verlinken nur externe Ressourcen, die fuer unsere Zielgruppe praktisch nuetzlich sein koennen.",
    adLabel: "Werbung",
    adArticleLabel: "Werbung im Artikel",
    adConsentNote: "Anzeigen werden nach Zustimmung zu Werbe-Cookies geladen.",
    articleSeoEyebrow: "SEO-Artikel",
    articleAuthor: "Autor",
    articleAuthorName: "Briefify.de Redaktion",
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
    frontendFeedbackNameRequired: "Bitte geben Sie Ihren Namen oder Spitznamen an.",
    frontendFeedbackMessageRequired: "Bitte schreiben Sie einen kurzen Feedback-Text.",
    frontendFeedbackSending: "Feedback wird gesendet...",
    frontendFeedbackReady:
      "Danke. Ihr Feedback wurde erhalten und wird nach der Prüfung veröffentlicht.",
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
      "Beim Analysieren des Dokuments ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
    apiFeedbackNameRequired: "Bitte geben Sie einen Namen oder Spitznamen an.",
    apiFeedbackMessageRequired: "Bitte schreiben Sie einen kurzen Feedback-Text.",
    apiFeedbackTooLong: "Das Feedback ist zu lang. Bitte kürzen Sie den Text.",
    apiFeedbackGenericError:
      "Das Feedback konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
    apiFeedbackAccessRequired:
      "Feedback kann nur nach einer erfolgreichen Dokumentanalyse auf der Website gesendet werden."
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
    feedbackNameRequired: t("frontendFeedbackNameRequired"),
    feedbackMessageRequired: t("frontendFeedbackMessageRequired"),
    feedbackSending: t("frontendFeedbackSending"),
    feedbackReady: t("frontendFeedbackReady"),
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
