const RESPONSE_SCHEMA = {
  name: "briefify_letter_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      actions: { type: "array", items: { type: "string" } },
      deadlines: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      reply_text: { type: "string" },
      reply_explanation: { type: "string" },
      disclaimer: { type: "string" },
      detected_document_language: { type: "string" }
    },
    required: [
      "summary",
      "actions",
      "deadlines",
      "risks",
      "reply_text",
      "reply_explanation",
      "disclaimer",
      "detected_document_language"
    ]
  }
};

function createHttpError(statusCode, publicMessage, message = publicMessage) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

function getExplanationLanguageName(outputLanguage) {
  return outputLanguage === "de" ? "German" : "Ukrainian";
}

function buildDynamicInstructions(outputLanguage) {
  const explanationLanguage = getExplanationLanguageName(outputLanguage);

  return `
Explain the uploaded document in ${explanationLanguage}.
Always return the explanation fields (summary, actions, deadlines, risks, reply_explanation, disclaimer) in ${explanationLanguage}.
Write reply_text in the original language of the uploaded document whenever that is reasonably clear from the document.
Set detected_document_language to the language name you identified for the uploaded document.
If the document language is unclear, state that uncertainty in disclaimer and still provide the most likely language in detected_document_language.
`.trim();
}

function buildUserInstruction(extraction, outputLanguage) {
  const extractionNote =
    extraction.mode === "pdf_text"
      ? "Below is extracted text from the PDF. Use it as the primary source, but compare it with the file if needed."
      : extraction.mode === "pdf_fallback_ocr"
        ? `The PDF looks like a scan or the extracted text is incomplete. Analyze the file itself and explain it in ${getExplanationLanguageName(outputLanguage)}.`
        : `The user uploaded an image of a document. Read the document first, then explain it in ${getExplanationLanguageName(outputLanguage)}.`;

  const content = [
    {
      type: "input_text",
      text: extraction.extractedText
        ? `${extractionNote}\n\nВитягнутий текст документа:\n${extraction.extractedText}`
        : extractionNote
    }
  ];

  if (extraction.fileInput) {
    content.push(extraction.fileInput);
  }

  return {
    role: "user",
    content
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

  const outputLanguage = config.outputLanguage === "de" ? "de" : "uk";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      instructions: `${config.analysisPrompt}\n\n${buildDynamicInstructions(outputLanguage)}`,
      input: [buildUserInstruction(extraction, outputLanguage)],
      max_output_tokens: 900,
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
