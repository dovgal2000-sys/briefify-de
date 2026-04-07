import articleAuslaenderbehoerde from "./auslaenderbehoerde.js";
import articleExamples from "./examples.js";
import articleHowToUnderstand from "./how-to-understand.js";
import articleJobcenterAnhoerung from "./jobcenter-anhoerung.js";
import articleJobcenterForms from "./jobcenter-forms.js";
import articleJobcenterLetter from "./jobcenter-letter.js";
import articleJobcenterReply from "./jobcenter-reply.js";
import articleKrankenkasse from "./krankenkasse.js";
import articleKuendigung from "./kuendigung.js";
import articleSchoolLetter from "./school-letter.js";

const categoryMap = {
  jobcenter: {
    slug: "jobcenter",
    translations: {
      uk: { title: "Jobcenter" },
      de: { title: "Jobcenter" }
    }
  },
  school: {
    slug: "school",
    translations: {
      uk: { title: "Школа" },
      de: { title: "Schule" }
    }
  },
  migration: {
    slug: "migration",
    translations: {
      uk: { title: "Auslaenderbehoerde" },
      de: { title: "Ausländerbehörde" }
    }
  },
  health: {
    slug: "health",
    translations: {
      uk: { title: "Krankenkasse" },
      de: { title: "Krankenkasse" }
    }
  },
  contracts: {
    slug: "contracts",
    translations: {
      uk: { title: "Розірвання договорів" },
      de: { title: "Verträge kündigen" }
    }
  },
  guides: {
    slug: "guides",
    translations: {
      uk: { title: "Гіди та приклади" },
      de: { title: "Leitfäden und Beispiele" }
    }
  }
};

const articleMeta = {
  "shcho-oznachaye-lyst-vid-jobcenter": {
    publishedAt: "2026-03-30",
    categoryKey: "jobcenter",
    coverTone: "cover-jobcenter",
    translations: {
      uk: { coverTitle: "Jobcenter", coverSubtitle: "лист, рішення, терміни" },
      de: { coverTitle: "Jobcenter", coverSubtitle: "Briefe, Bescheide, Fristen" }
    }
  },
  "anhoerung-jobcenter-poyasnennya": {
    publishedAt: "2026-03-29",
    categoryKey: "jobcenter",
    coverTone: "cover-warning",
    translations: {
      uk: { coverTitle: "Anhoerung", coverSubtitle: "пояснення перед рішенням" },
      de: { coverTitle: "Anhörung", coverSubtitle: "Erklärung vor einer Entscheidung" }
    }
  },
  "lyst-vid-shkoly-v-nimechchyni-shcho-robyty": {
    publishedAt: "2026-03-28",
    categoryKey: "school",
    coverTone: "cover-school",
    translations: {
      uk: { coverTitle: "Schule", coverSubtitle: "листи для батьків" },
      de: { coverTitle: "Schule", coverSubtitle: "Briefe für Eltern" }
    }
  },
  "kuendigung-yak-pravylno-napysaty": {
    publishedAt: "2026-03-27",
    categoryKey: "contracts",
    coverTone: "cover-contract",
    translations: {
      uk: { coverTitle: "Kuendigung", coverSubtitle: "розірвання договору" },
      de: { coverTitle: "Kündigung", coverSubtitle: "Vertrag korrekt beenden" }
    }
  },
  "lyst-vid-auslaenderbehoerde-poyasnennya": {
    publishedAt: "2026-03-26",
    categoryKey: "migration",
    coverTone: "cover-migration",
    translations: {
      uk: { coverTitle: "Aufenthalt", coverSubtitle: "міграційні листи" },
      de: { coverTitle: "Aufenthalt", coverSubtitle: "Briefe der Ausländerbehörde" }
    }
  },
  "yak-vidpovisty-jobcenter": {
    publishedAt: "2026-03-25",
    categoryKey: "jobcenter",
    coverTone: "cover-jobcenter",
    translations: {
      uk: { coverTitle: "Antwort", coverSubtitle: "як писати відповідь" },
      de: { coverTitle: "Antwort", coverSubtitle: "richtig an das Jobcenter schreiben" }
    }
  },
  "lyst-vid-krankenkasse-shcho-tse": {
    publishedAt: "2026-03-24",
    categoryKey: "health",
    coverTone: "cover-health",
    translations: {
      uk: { coverTitle: "Krankenkasse", coverSubtitle: "страхування та внески" },
      de: { coverTitle: "Krankenkasse", coverSubtitle: "Versicherung und Beiträge" }
    }
  },
  "nimetski-ofitsiyni-lysty-pryklady": {
    publishedAt: "2026-03-23",
    categoryKey: "guides",
    coverTone: "cover-guide",
    translations: {
      uk: { coverTitle: "Приклади", coverSubtitle: "типові фрази та шаблони" },
      de: { coverTitle: "Beispiele", coverSubtitle: "typische Formulierungen und Muster" }
    }
  },
  "yak-zrozumity-lyst-z-nimechchyny": {
    publishedAt: "2026-03-22",
    categoryKey: "guides",
    coverTone: "cover-guide",
    translations: {
      uk: { coverTitle: "Як зрозуміти", coverSubtitle: "покроковий розбір листа" },
      de: { coverTitle: "Verstehen", coverSubtitle: "Brief Schritt für Schritt lesen" }
    }
  },
  "formulyary-jobcenter-poyasnennya": {
    publishedAt: "2026-03-21",
    categoryKey: "jobcenter",
    coverTone: "cover-warning",
    translations: {
      uk: { coverTitle: "Формуляри", coverSubtitle: "анкети та додаткові дані" },
      de: { coverTitle: "Formulare", coverSubtitle: "Anträge und Zusatzangaben" }
    }
  }
};

const rawArticles = [
  articleJobcenterLetter,
  articleJobcenterAnhoerung,
  articleSchoolLetter,
  articleKuendigung,
  articleAuslaenderbehoerde,
  articleJobcenterReply,
  articleKrankenkasse,
  articleExamples,
  articleHowToUnderstand,
  articleJobcenterForms
];

function localizeCategory(categoryKey, locale) {
  const category = categoryMap[categoryKey] || categoryMap.guides;
  return {
    slug: category.slug,
    title: category.translations[locale]?.title || category.translations.uk.title
  };
}

function localizeArticle(article, locale) {
  const meta = articleMeta[article.slug] || {};
  const translation = article.translations[locale] || article.translations.uk;
  const metaTranslation = meta.translations?.[locale] || meta.translations?.uk || {};
  const category = localizeCategory(meta.categoryKey, locale);

  return {
    slug: article.slug,
    title: translation.title,
    description: translation.description,
    readingTime: translation.readingTime,
    keywords: translation.keywords,
    body: translation.body,
    publishedAt: meta.publishedAt || "2026-03-01",
    category,
    coverTitle: metaTranslation.coverTitle || translation.title,
    coverSubtitle: metaTranslation.coverSubtitle || category.title,
    coverTone: meta.coverTone || "cover-guide",
    ogImagePath: `/assets/og/${article.slug}.png`
  };
}

function sortArticles(articles) {
  return [...articles].sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
}

export function getAllArticles(locale = "uk") {
  return sortArticles(rawArticles.map((article) => localizeArticle(article, locale)));
}

export function getArticleBySlug(slug, locale = "uk") {
  const rawArticle = rawArticles.find((article) => article.slug === slug);
  return rawArticle ? localizeArticle(rawArticle, locale) : null;
}

export function getAllCategories(locale = "uk") {
  const categories = new Map();

  for (const article of rawArticles) {
    const meta = articleMeta[article.slug] || {};
    const category = localizeCategory(meta.categoryKey, locale);
    categories.set(category.slug, category);
  }

  return Array.from(categories.values());
}

export function getArticlesByCategory(categorySlug, locale = "uk") {
  return getAllArticles(locale).filter((article) => article.category.slug === categorySlug);
}

export function getCategoryBySlug(categorySlug, locale = "uk") {
  return getAllCategories(locale).find((category) => category.slug === categorySlug) || null;
}

