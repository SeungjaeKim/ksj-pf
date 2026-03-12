import { clampNumber, cleanString, handleError, json, noContent, normalizeList, readJsonBody } from "../_shared/http.js";
import { generateStructuredJson } from "../_shared/gemini.js";

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
            "Return JSON only. Do not include markdown fences or explanation.",
            "Write every string in Korean, but music titles and artist names may be English if natural.",
            `Selected mood key: ${moodKey}`,
            `Selected mood label: ${moodLabel}`,
            `Energy level: ${energy} / 100`,
            `User note: ${note || "(empty)"}`,
            "JSON schema:",
            JSON.stringify({
                moodKey: "string",
                title: "string",
                summary: "string",
                quote: "string",
                musicTag: "string",
                match: 95,
                songs: [{ title: "string", artist: "string", note: "string" }],
                media: [{ title: "string", note: "string" }],
                action: "string",
                reason: "string"
            }),
            "Rules:",
            "- songs must contain exactly 3 items.",
            "- media must contain exactly 2 items.",
            "- summary, action, reason should feel warm and specific.",
            "- match should be between 80 and 99.",
            "- Keep the tone portfolio-friendly and emotionally coherent."
        ].join("\n");

        const { data, model } = await generateStructuredJson(context, prompt, {
            temperature: 1,
            maxOutputTokens: 1400
        });

        const normalized = {
            moodKey: cleanString(data.moodKey, moodKey),
            title: cleanString(data.title, `${moodLabel}의 리듬`),
            summary: cleanString(data.summary, `지금 감정에 맞는 무드를 부드럽게 이어가도록 추천을 구성했습니다.`),
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
