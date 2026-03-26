const RESPONSE_SCHEMA = {
  name: "briefify_letter_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary_uk: { type: "string" },
      actions: { type: "array", items: { type: "string" } },
      deadlines: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      reply_de: { type: "string" },
      reply_uk_explanation: { type: "string" },
      disclaimer: { type: "string" }
    },
    required: [
      "summary_uk",
      "actions",
      "deadlines",
      "risks",
      "reply_de",
      "reply_uk_explanation",
      "disclaimer"
    ]
  }
};

function createHttpError(statusCode, publicMessage, message = publicMessage) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

function buildUserInstruction(extraction) {
  const extractionNote =
    extraction.mode === "pdf_text"
      ? "Нижче вже є витягнутий текст з PDF. Використай його як головне джерело, але при потребі звіряй з файлом."
      : extraction.mode === "pdf_fallback_ocr"
        ? "PDF схожий на скан або текст витягнувся неповно. Проаналізуй сам файл і поясни його українською."
        : "Користувач завантажив зображення листа. Спочатку прочитай документ, потім поясни його українською.";

  return {
    role: "user",
    content: [
      {
        type: "input_text",
        text: extraction.extractedText
          ? `${extractionNote}\n\nВитягнутий текст документа:\n${extraction.extractedText}`
          : extractionNote
      },
      extraction.fileInput
    ]
  };
}

function extractTextOutput(responseJson) {
  const output = Array.isArray(responseJson.output) ? responseJson.output : [];
  const chunks = [];

  for (const item of output) {
    if (!Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

export async function analyzeLetterWithOpenAI({ extraction, config }) {
  if (!config.openAiApiKey) {
    throw createHttpError(
      500,
      "Сервер не налаштовано для AI-аналізу. Додайте OPENAI_API_KEY.",
      "Missing OPENAI_API_KEY"
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      instructions: config.analysisPrompt,
      input: [buildUserInstruction(extraction)],
      max_output_tokens: 1800,
      text: {
        format: {
          type: "json_schema",
          ...RESPONSE_SCHEMA
        }
      }
    })
  });

  if (!response.ok) {
    const raw = await response.text();
    throw createHttpError(
      response.status >= 500 ? 502 : response.status,
      response.status === 429
        ? "AI сервіс тимчасово перевантажений. Спробуйте ще раз трохи пізніше."
        : "Не вдалося отримати відповідь від AI сервісу.",
      `OpenAI API error (${response.status}): ${raw}`
    );
  }

  const data = await response.json();
  const outputText = extractTextOutput(data);

  if (!outputText) {
    throw createHttpError(
      502,
      "AI не повернув коректний результат. Спробуйте ще раз із чіткішим документом."
    );
  }

  try {
    return JSON.parse(outputText);
  } catch (_error) {
    throw createHttpError(
      502,
      "AI повернув результат у неочікуваному форматі. Спробуйте ще раз."
    );
  }
}
