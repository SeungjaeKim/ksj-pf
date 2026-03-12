import { HttpError } from "./http.js";

const DEFAULT_MODEL = "gemini-2.5-flash";

function extractText(payload) {
    return (payload?.candidates?.[0]?.content?.parts || [])
        .map((part) => typeof part?.text === "string" ? part.text : "")
        .join("")
        .trim();
}

function extractJsonCandidate(text) {
    const cleaned = text
        .replace(/^\s*```json/i, "")
        .replace(/^\s*```/i, "")
        .replace(/```\s*$/, "")
        .trim();

    const objectStart = cleaned.indexOf("{");
    const arrayStart = cleaned.indexOf("[");
    const startCandidates = [objectStart, arrayStart].filter((value) => value >= 0);

    if (!startCandidates.length) {
        return cleaned;
    }

    const startIndex = Math.min(...startCandidates);
    const startChar = cleaned[startIndex];
    const endChar = startChar === "{" ? "}" : "]";
    const endIndex = cleaned.lastIndexOf(endChar);

    if (endIndex < startIndex) {
        return cleaned.slice(startIndex).trim();
    }

    return cleaned.slice(startIndex, endIndex + 1).trim();
}

function buildGenerationConfig(options = {}) {
    const generationConfig = {
        temperature: options.temperature ?? 0.7,
        topP: options.topP ?? 0.9,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        responseMimeType: options.responseMimeType ?? "application/json"
    };

    if (options.schema) {
        generationConfig.responseJsonSchema = options.schema;
    }

    return generationConfig;
}

function buildRetryPrompt(prompt) {
    return [
        prompt,
        "",
        "The previous response may have been too long.",
        "Return the same JSON schema again with much shorter strings.",
        "Keep titles, summaries, notes, and descriptions compact and concise.",
        "Do not omit required fields."
    ].join("\n");
}

async function requestGeneration(apiKey, model, prompt, options = {}) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: buildGenerationConfig(options)
        })
    });

    if (!response.ok) {
        throw new HttpError(response.status, "Gemini request failed.", await response.text());
    }

    const payload = await response.json();
    return {
        payload,
        rawText: extractText(payload),
        finishReason: payload?.candidates?.[0]?.finishReason || "UNKNOWN"
    };
}

function parseStructuredJson(rawText, finishReason) {
    try {
        return JSON.parse(extractJsonCandidate(rawText));
    } catch (error) {
        const message = finishReason === "MAX_TOKENS"
            ? "Gemini JSON response was truncated by maxOutputTokens."
            : "Gemini JSON parsing failed.";
        throw new HttpError(502, message, rawText.slice(0, 1200));
    }
}

export async function generateStructuredJson(context, prompt, options = {}) {
    const apiKey = context.env.GEMINI_API_KEY;
    const model = context.env.GEMINI_MODEL || DEFAULT_MODEL;

    if (!apiKey) {
        throw new HttpError(500, "Cloudflare secret GEMINI_API_KEY is not configured.");
    }

    const attempts = [
        {
            prompt,
            options
        }
    ];

    if (options.allowCompactRetry !== false) {
        attempts.push({
            prompt: buildRetryPrompt(prompt),
            options: {
                ...options,
                temperature: Math.min(options.temperature ?? 0.7, 0.35),
                maxOutputTokens: Math.max(options.maxOutputTokens ?? 2048, 4096)
            }
        });
    }

    let lastError = null;
    for (const attempt of attempts) {
        const { rawText, finishReason } = await requestGeneration(apiKey, model, attempt.prompt, attempt.options);

        if (!rawText) {
            lastError = new HttpError(502, "Gemini returned an empty response.");
            continue;
        }

        try {
            return {
                data: parseStructuredJson(rawText, finishReason),
                model,
                rawText
            };
        } catch (error) {
            lastError = error;
            const isTruncated = finishReason === "MAX_TOKENS";
            if (!isTruncated) {
                break;
            }
        }
    }

    throw lastError || new HttpError(502, "Gemini JSON parsing failed.");
}