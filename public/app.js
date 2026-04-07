const form = document.querySelector("#analyze-form");
const fileInput = document.querySelector("#letter");
const statusBox = document.querySelector("#status-box");
const resultCard = document.querySelector("#result-card");
const copyButton = document.querySelector("#copy-reply");
const sendEmailButton = document.querySelector("#send-email");
const filePreview = document.querySelector("#file-preview");
const filePreviewName = document.querySelector("#file-preview-name");
const imagePreview = document.querySelector("#image-preview");
const pdfPreview = document.querySelector("#pdf-preview");
const cookieBanner = document.querySelector("#cookie-banner");
const cookieAccept = document.querySelector("#cookie-accept");
const cookieNecessary = document.querySelector("#cookie-necessary");
const consentInput = document.querySelector("#consent");
const formLoadedAtInput = document.querySelector("#form-loaded-at");
const replyEmailInput = document.querySelector("#reply-email");
const siteConfig = document.querySelector("#site-config");
let previewObjectUrl = "";
const COOKIE_BANNER_KEY = "briefify_cookie_notice_closed";
const COOKIE_PREFERENCES_KEY = "briefify_cookie_preferences";
const MIN_HUMAN_FILL_MS = 1800;
const iubendaEnabled = siteConfig?.dataset.iubendaEnabled === "true";
const localeMessages = window.__BRIEFIFY_I18N || {};

function resetPreview() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }

  filePreview?.classList.add("hidden");
  imagePreview?.classList.add("hidden");
  pdfPreview?.classList.add("hidden");

  if (imagePreview) imagePreview.src = "";
  if (pdfPreview) pdfPreview.src = "";
  if (filePreviewName) filePreviewName.textContent = "";
}

function renderPreview(file) {
  resetPreview();

  if (!file || !filePreview || !filePreviewName) return;

  filePreview.classList.remove("hidden");
  filePreviewName.textContent = file.name;
  previewObjectUrl = URL.createObjectURL(file);

  if (file.type === "application/pdf") {
    pdfPreview.classList.remove("hidden");
    pdfPreview.src = previewObjectUrl;
    return;
  }

  if (file.type.startsWith("image/")) {
    imagePreview.classList.remove("hidden");
    imagePreview.src = previewObjectUrl;
    return;
  }
}

function setStatus(message, tone = "info") {
  if (tone === "loading") {
    statusBox.innerHTML = `
      <span class="status-inline">
        <span class="hourglass" aria-hidden="true"></span>
        <span>${message}</span>
      </span>
    `;
  } else {
    statusBox.textContent = message;
  }

  statusBox.className = `status-box status-${tone}`;
}

function renderList(id, items, emptyText) {
  const target = document.getElementById(id);
  target.innerHTML = "";

  if (!Array.isArray(items) || !items.length) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    target.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function renderResult(data) {
  document.getElementById("summary").textContent = data.summary;
  document.getElementById("reply_text").textContent = data.reply_text;
  document.getElementById("reply_explanation").textContent = data.reply_explanation;
  document.getElementById("disclaimer").textContent = data.disclaimer;

  renderList("actions", data.actions, localeMessages.emptyActions || "No actions detected.");
  renderList("deadlines", data.deadlines, localeMessages.emptyDeadlines || "No deadlines found.");
  renderList("risks", data.risks, localeMessages.emptyRisks || "No risks detected.");

  resultCard.classList.remove("hidden");
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

fileInput?.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) {
    resetPreview();
    return;
  }

  renderPreview(file);
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = fileInput.files?.[0];
  const loadedAt = Number(formLoadedAtInput?.value || 0);
  const elapsed = Date.now() - loadedAt;

  if (!file) {
    setStatus(localeMessages.selectFile || "Please choose a file.", "error");
    return;
  }

  if (!consentInput?.checked) {
    setStatus(localeMessages.consentRequired || "Consent is required.", "error");
    return;
  }

  if (!loadedAt || elapsed < MIN_HUMAN_FILL_MS) {
    setStatus(localeMessages.wait || "Please wait a moment and try again.", "error");
    return;
  }

  const formData = new FormData();
  formData.set("letter", file);
  formData.set("consent", String(consentInput.checked));
  formData.set("form_loaded_at", String(loadedAt));
  formData.set("website", document.querySelector("#website")?.value || "");
  formData.set(
    "cf_turnstile_response",
    document.querySelector("[name='cf-turnstile-response']")?.value || ""
  );

  resultCard.classList.add("hidden");
  setStatus(localeMessages.uploading || "Uploading...", "loading");

  try {
    setStatus(localeMessages.analyzing || "Analyzing...", "loading");

    const response = await fetch("/api/analyze-letter", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Не вдалося проаналізувати документ.");
    }

    renderResult(payload);
    setStatus(localeMessages.ready || "Analysis is ready.", "success");
  } catch (error) {
    setStatus(error.message || "Сталася помилка. Спробуйте ще раз.", "error");
  }
});

copyButton?.addEventListener("click", async () => {
  const text = document.getElementById("reply_text").textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    setStatus(localeMessages.copySuccess || "Copied.", "success");
  } catch (_error) {
    setStatus(localeMessages.copyError || "Copy failed.", "error");
  }
});

sendEmailButton?.addEventListener("click", () => {
  const replyText = document.getElementById("reply_text").textContent.trim();
  const recipient = (replyEmailInput?.value || "").trim();

  if (!replyText) {
    setStatus(localeMessages.needReply || "Reply text is missing.", "error");
    return;
  }

  if (!recipient) {
    setStatus(localeMessages.needRecipient || "Recipient email is required.", "error");
    replyEmailInput?.focus();
    return;
  }

  const subject = encodeURIComponent(localeMessages.emailSubject || "Antwort auf Ihr Schreiben");
  const body = encodeURIComponent(replyText);
  window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${subject}&body=${body}`;
});

window.addEventListener("beforeunload", () => {
  resetPreview();
});

function initCookieBanner() {
  if (iubendaEnabled) return;
  if (!cookieBanner || !cookieAccept || !cookieNecessary) return;

  const storedPreferences = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!storedPreferences) {
    cookieBanner.classList.remove("hidden");
  }

  cookieAccept.addEventListener("click", () => {
    window.localStorage.setItem(
      COOKIE_PREFERENCES_KEY,
      JSON.stringify({ necessary: true, ads: true })
    );
    window.localStorage.setItem(COOKIE_BANNER_KEY, "true");
    cookieBanner.classList.add("hidden");
    initAdsense();
  });

  cookieNecessary.addEventListener("click", () => {
    window.localStorage.setItem(
      COOKIE_PREFERENCES_KEY,
      JSON.stringify({ necessary: true, ads: false })
    );
    window.localStorage.setItem(COOKIE_BANNER_KEY, "true");
    cookieBanner.classList.add("hidden");
  });
}

function getCookiePreferences() {
  try {
    return JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY) || "null");
  } catch (_error) {
    return null;
  }
}

function loadAdsenseScript(client) {
  if (!client) return Promise.resolve(false);
  if (document.querySelector("script[data-adsense-loader='true']")) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.adsenseLoader = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Не вдалося завантажити Google Ads."));
    document.head.appendChild(script);
  });
}

async function initAdsense(forceByConsent = false) {
  const preferences = getCookiePreferences();
  const client = siteConfig?.dataset.adsenseClient || "";
  const adSlots = document.querySelectorAll(".adsense-slot");
  const canLoadAds = iubendaEnabled ? forceByConsent : preferences?.ads;

  if (!client || !adSlots.length || !canLoadAds) {
    return;
  }

  try {
    await loadAdsenseScript(client);

    adSlots.forEach((slot) => {
      if (slot.dataset.adsInitialized === "true") return;

      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.dataset.adClient = slot.dataset.adClient || client;
      ins.dataset.adSlot = slot.dataset.adSlot || "";
      ins.dataset.adFormat = slot.dataset.adFormat || "auto";
      ins.dataset.fullWidthResponsive = slot.dataset.fullWidthResponsive || "true";

      slot.innerHTML = "";
      slot.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        slot.dataset.adsInitialized = "true";
      } catch (_error) {
        slot.innerHTML =
          "<p class='ad-consent-note'>Google Ads тимчасово недоступний для цього блоку.</p>";
      }
    });
  } catch (_error) {
    document.querySelectorAll(".adsense-slot").forEach((slot) => {
      if (!slot.textContent.trim()) {
        slot.innerHTML =
          "<p class='ad-consent-note'>Не вдалося завантажити рекламний блок.</p>";
      }
    });
  }
}

initCookieBanner();
initAdsense();

if (iubendaEnabled) {
  window.addEventListener("briefify:iubenda-consent-read", () => {
    initAdsense(true);
  });

  if (window.__briefifyIubendaConsentReady) {
    initAdsense(true);
  }
}

if (formLoadedAtInput) {
  formLoadedAtInput.value = String(Date.now());
}
