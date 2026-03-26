import pdfParse from "pdf-parse";

function createHttpError(statusCode, publicMessage, message = publicMessage) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

export async function extractDocumentPayload(file, config) {
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    throw createHttpError(
      400,
      "Підтримуються лише файли JPG, PNG або PDF.",
      `Unsupported mime type: ${file.mimetype}`
    );
  }

  if (!file.buffer || !file.buffer.length) {
    throw createHttpError(400, "Файл порожній або пошкоджений.");
  }

  if (file.mimetype === "application/pdf") {
    try {
      const parsed = await pdfParse(file.buffer);
      const extractedText = (parsed.text || "").replace(/\s+/g, " ").trim();
      const isProbablyScanned = extractedText.length < config.textExtractionMinChars;

      return {
        mode: isProbablyScanned ? "pdf_fallback_ocr" : "pdf_text",
        extractedText,
        fileInput: {
          type: "input_file",
          filename: file.originalname,
          file_data: file.buffer.toString("base64")
        }
      };
    } catch (_error) {
      return {
        mode: "pdf_fallback_ocr",
        extractedText: "",
        fileInput: {
          type: "input_file",
          filename: file.originalname,
          file_data: file.buffer.toString("base64")
        }
      };
    }
  }

  return {
    mode: "image_vision",
    extractedText: "",
    fileInput: {
      type: "input_image",
      detail: "high",
      image_url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    }
  };
}
