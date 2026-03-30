const form = document.querySelector("#analyze-form");
const fileInput = document.querySelector("#letter");
const statusBox = document.querySelector("#status-box");
const resultCard = document.querySelector("#result-card");
const copyButton = document.querySelector("#copy-reply");
const filePreview = document.querySelector("#file-preview");
const filePreviewName = document.querySelector("#file-preview-name");
const imagePreview = document.querySelector("#image-preview");
const pdfPreview = document.querySelector("#pdf-preview");
let previewObjectUrl = "";

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
  statusBox.textContent = message;
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
  document.getElementById("summary_uk").textContent = data.summary_uk;
  document.getElementById("reply_de").textContent = data.reply_de;
  document.getElementById("reply_uk_explanation").textContent = data.reply_uk_explanation;
  document.getElementById("disclaimer").textContent = data.disclaimer;

  renderList("actions", data.actions, "Дій не виявлено.");
  renderList("deadlines", data.deadlines, "Явних дедлайнів не знайдено.");
  renderList("risks", data.risks, "Явних ризиків не виявлено.");

  resultCard.classList.remove("hidden");
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
  if (!file) {
    setStatus("Спочатку оберіть файл для аналізу.", "error");
    return;
  }

  const formData = new FormData();
  formData.set("letter", file);
  formData.set("consent", String(document.querySelector("#consent").checked));

  resultCard.classList.add("hidden");
  setStatus("Завантаження документа...", "loading");

  try {
    setStatus("Розпізнавання документа та аналіз змісту...", "loading");

    const response = await fetch("/api/analyze-letter", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Не вдалося проаналізувати документ.");
    }

    renderResult(payload);
    setStatus("Аналіз готовий. Перевірте короткий зміст, дедлайни та чернетку відповіді.", "success");
  } catch (error) {
    setStatus(error.message || "Сталася помилка. Спробуйте ще раз.", "error");
  }
});

copyButton?.addEventListener("click", async () => {
  const text = document.getElementById("reply_de").textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Чернетку відповіді скопійовано у буфер обміну.", "success");
  } catch (_error) {
    setStatus("Не вдалося скопіювати текст автоматично. Скопіюйте його вручну.", "error");
  }
});

window.addEventListener("beforeunload", () => {
  resetPreview();
});
