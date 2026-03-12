import { HttpError } from "./http.js";

const DEFAULT_MODEL = "gemini-2.5-flash";

function extractText(payload) {
    return (payload?.candidates?.[0]?.content?.parts || [])
        .map((part) => part?.text || "")
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

export async function generateStructuredJson(context, prompt, options = {}) {
    const apiKey = context.env.GEMINI_API_KEY;
    const model = context.env.GEMINI_MODEL || DEFAULT_MODEL;

    if (!apiKey) {
        throw new HttpError(500, "Cloudflare secret GEMINI_API_KEY is not configured.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                topP: options.topP ?? 0.9,
                maxOutputTokens: options.maxOutputTokens ?? 2048
            }
        })
    });

    if (!response.ok) {
        throw new HttpError(response.status, "Gemini request failed.", await response.text());
    }

    const payload = await response.json();
    const rawText = extractText(payload);

    if (!rawText) {
        throw new HttpError(502, "Gemini returned an empty response.");
    }

    try {
        return {
            data: JSON.parse(extractJsonCandidate(rawText)),
            model,
            rawText
        };
    } catch (error) {
        throw new HttpError(502, "Gemini JSON parsing failed.", rawText.slice(0, 1200));
    }
}
