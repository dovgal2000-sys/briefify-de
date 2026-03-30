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
  jobcenter: { slug: "jobcenter", title: "Jobcenter" },
  school: { slug: "school", title: "Schule" },
  migration: { slug: "migration", title: "Auslaenderbehoerde" },
  health: { slug: "health", title: "Krankenkasse" },
  contracts: { slug: "contracts", title: "Kuendigung" },
  guides: { slug: "guides", title: "Gidy ta pryklady" }
};

const articleMeta = {
  "shcho-oznachaye-lyst-vid-jobcenter": {
    publishedAt: "2026-03-30",
    categoryKey: "jobcenter",
    coverTitle: "Jobcenter",
    coverSubtitle: "лист, рішення, терміни",
    coverTone: "cover-jobcenter"
  },
  "anhoerung-jobcenter-poyasnennya": {
    publishedAt: "2026-03-29",
    categoryKey: "jobcenter",
    coverTitle: "Anhoerung",
    coverSubtitle: "пояснення перед рішенням",
    coverTone: "cover-warning"
  },
  "lyst-vid-shkoly-v-nimechchyni-shcho-robyty": {
    publishedAt: "2026-03-28",
    categoryKey: "school",
    coverTitle: "Schule",
    coverSubtitle: "листи для батьків",
    coverTone: "cover-school"
  },
  "kuendigung-yak-pravylno-napysaty": {
    publishedAt: "2026-03-27",
    categoryKey: "contracts",
    coverTitle: "Kuendigung",
    coverSubtitle: "розірвання договору",
    coverTone: "cover-contract"
  },
  "lyst-vid-auslaenderbehoerde-poyasnennya": {
    publishedAt: "2026-03-26",
    categoryKey: "migration",
    coverTitle: "Aufenthalt",
    coverSubtitle: "міграційні листи",
    coverTone: "cover-migration"
  },
  "yak-vidpovisty-jobcenter": {
    publishedAt: "2026-03-25",
    categoryKey: "jobcenter",
    coverTitle: "Antwort",
    coverSubtitle: "як писати відповідь",
    coverTone: "cover-jobcenter"
  },
  "lyst-vid-krankenkasse-shcho-tse": {
    publishedAt: "2026-03-24",
    categoryKey: "health",
    coverTitle: "Krankenkasse",
    coverSubtitle: "страхування та внески",
    coverTone: "cover-health"
  },
  "nimetski-ofitsiyni-lysty-pryklady": {
    publishedAt: "2026-03-23",
    categoryKey: "guides",
    coverTitle: "Pryklady",
    coverSubtitle: "типові фрази та шаблони",
    coverTone: "cover-guide"
  },
  "yak-zrozumity-lyst-z-nimechchyny": {
    publishedAt: "2026-03-22",
    categoryKey: "guides",
    coverTitle: "Jak zrozumity",
    coverSubtitle: "покроковий розбір листа",
    coverTone: "cover-guide"
  },
  "formulyary-jobcenter-poyasnennya": {
    publishedAt: "2026-03-21",
    categoryKey: "jobcenter",
    coverTitle: "Formulyary",
    coverSubtitle: "ankety ta dodatkovi dani",
    coverTone: "cover-warning"
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

const articles = rawArticles
  .map((article) => {
    const meta = articleMeta[article.slug] || {};
    const category = categoryMap[meta.categoryKey] || categoryMap.guides;

    return {
      ...article,
      publishedAt: meta.publishedAt || "2026-03-01",
      category,
      coverTitle: meta.coverTitle || article.title,
      coverSubtitle: meta.coverSubtitle || category.title,
      coverTone: meta.coverTone || "cover-guide"
    };
  })
  .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));

export function getAllArticles() {
  return articles;
}

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug) || null;
}

export function getAllCategories() {
  const categories = new Map();

  for (const article of articles) {
    categories.set(article.category.slug, article.category);
  }

  return Array.from(categories.values());
}

export function getArticlesByCategory(categorySlug) {
  return articles.filter((article) => article.category.slug === categorySlug);
}

export function getCategoryBySlug(categorySlug) {
  return getAllCategories().find((category) => category.slug === categorySlug) || null;
}
