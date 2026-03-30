import { readFile } from "node:fs/promises";
import path from "node:path";

const LEGAL_DIR = path.resolve("legal");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyTemplate(content, publicConfig) {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_match, key) => {
    return escapeHtml(publicConfig[key] ?? "");
  });
}

export async function getLegalContent(kind, publicConfig) {
  const filename = kind === "impressum" ? "impressum.html" : "datenschutz.html";
  const filePath = path.join(LEGAL_DIR, filename);
  const raw = await readFile(filePath, "utf8");
  return applyTemplate(raw, publicConfig);
}
