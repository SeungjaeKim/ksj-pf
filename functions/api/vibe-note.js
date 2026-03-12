import { clampNumber, cleanString, handleError, json, noContent, normalizeList, readJsonBody } from "../_shared/http.js";
import { generateStructuredJson } from "../_shared/gemini.js";

const MOOD_KEYS = ["calm", "joy", "focus", "blue", "fire"];
const VIBE_NOTE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        moodKey: {
            type: "string",
            enum: MOOD_KEYS
        },
        title: {
            type: "string",
            description: "A concise Korean title for the current mood."
        },
        summary: {
            type: "string",
            description: "A short Korean summary of the mood curation."
        },
        quote: {
            type: "string",
            description: "A one-line Korean quote or sentence for the user."
        },
        musicTag: {
            type: "string",
            description: "A short label describing the recommended music mood."
        },
        match: {
            type: "integer",
            minimum: 80,
            maximum: 99
        },
        songs: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    title: { type: "string" },
                    artist: { type: "string" },
                    note: { type: "string", description: "A short Korean explanation for why the song matches." }
                },
                required: ["title", "artist", "note"]
            }
        },
        media: {
            type: "array",
            minItems: 2,
            maxItems: 2,
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    title: { type: "string" },
                    note: { type: "string", description: "A short Korean recommendation note." }
                },
                required: ["title", "note"]
            }
        },
        action: {
            type: "string",
            description: "A small Korean action tip for the user."
        },
        reason: {
            type: "string",
            description: "A concise Korean reason for the curation."
        }
    },
    required: ["moodKey", "title", "summary", "quote", "musicTag", "match", "songs", "media", "action", "reason"]
};

function normalizeItems(items, minCount, defaults) {
    const result = normalizeList(items)
        .slice(0, defaults.length)
        .map((item, index) => ({
            title: cleanString(item?.title, defaults[index].title),
            artist: cleanString(item?.artist, defaults[index].artist),
            note: cleanString(item?.note, defaults[index].note)
        }));

    while (result.length < minCount) {
        result.push(defaults[result.length]);
    }

    return result;
}

export async function onRequestOptions() {
    return noContent();
}

export async function onRequestPost(context) {
    try {
        const body = await readJsonBody(context.request);
        const moodKey = cleanString(body.moodKey, "calm");
        const moodLabel = cleanString(body.moodLabel, "차분함");
        const note = cleanString(body.note);
        const energy = clampNumber(body.energy, { min: 0, max: 100, fallback: 50 });

        const prompt = [
            "You are an emotional curator for a Korean mood recommendation app.",
            "Write every sentence in Korean, but song titles and artist names may stay in English if natural.",
            "Keep the curation warm, specific, and concise enough for a portfolio UI.",
            `Selected mood key: ${moodKey}`,
            `Selected mood label: ${moodLabel}`,
            `Energy level: ${energy} / 100`,
            `User note: ${note || "(empty)"}`
        ].join("\n");

        const { data, model } = await generateStructuredJson(context, prompt, {
            temperature: 0.6,
            maxOutputTokens: 1200,
            schema: VIBE_NOTE_SCHEMA
        });

        const normalized = {
            moodKey: cleanString(data.moodKey, moodKey),
            title: cleanString(data.title, `${moodLabel}의 리듬`),
            summary: cleanString(data.summary, "지금 감정에 맞는 무드를 부드럽게 이어가도록 추천을 구성했습니다."),
            quote: cleanString(data.quote, "지금의 기분도 충분히 하나의 아름다운 결이에요."),
            musicTag: cleanString(data.musicTag, `${moodLabel} / Gemini Curation`),
            match: clampNumber(data.match, { min: 80, max: 99, fallback: 92 }),
            songs: normalizeItems(data.songs, 3, [
                { title: "Soft Window", artist: "Gemini Session", note: "지금 감정에 맞는 부드러운 결의 사운드입니다." },
                { title: "Night Marker", artist: "Mood Lane", note: "한 템포 가볍게 감정을 정리해 주는 흐름입니다." },
                { title: "Quiet Lift", artist: "Aurora Desk", note: "몰입과 휴식 사이를 자연스럽게 이어줍니다." }
            ]),
            media: normalizeList(data.media)
                .slice(0, 2)
                .map((item, index) => ({
                    title: cleanString(item?.title, index === 0 ? "짧은 영상 추천" : "읽기 콘텐츠 추천"),
                    note: cleanString(item?.note, "현재 감정선과 잘 맞는 작은 추천입니다.")
                })),
            action: cleanString(data.action, "물을 한 잔 마시고, 지금 감정을 한 문장으로 적어보세요."),
            reason: cleanString(data.reason, "입력한 감정과 에너지 수준을 바탕으로 자극과 안정감의 균형을 맞췄습니다.")
        };

        while (normalized.media.length < 2) {
            normalized.media.push({
                title: normalized.media.length === 0 ? "짧은 영상 추천" : "읽기 콘텐츠 추천",
                note: "현재 감정선과 잘 맞는 작은 추천입니다."
            });
        }

        return json({
            ...normalized,
            provider: "gemini",
            model
        });
    } catch (error) {
        return handleError(error);
    }
}