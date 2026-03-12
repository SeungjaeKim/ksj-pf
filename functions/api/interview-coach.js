import { clampNumber, cleanString, handleError, json, noContent, normalizeList, readJsonBody, HttpError } from "../_shared/http.js";
import { generateStructuredJson } from "../_shared/gemini.js";

const DEFAULT_METRICS = [
    { label: "Clarity", description: "답변 전달력과 핵심 문장 선명도" },
    { label: "Specificity", description: "숫자, 사례, 역할의 구체성" },
    { label: "Structure", description: "STAR 흐름과 이야기 구조" },
    { label: "Confidence", description: "주도성, 책임감, 확신의 표현" }
];

const QUESTIONS_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        opening: {
            type: "string",
            description: "One or two warm Korean coaching sentences."
        },
        readinessScore: {
            type: "integer",
            minimum: 50,
            maximum: 99
        },
        questions: {
            type: "array",
            minItems: 5,
            maxItems: 7,
            items: {
                type: "string",
                description: "A Korean interview question."
            }
        }
    },
    required: ["opening", "readinessScore", "questions"]
};

const REVIEW_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        summary: {
            type: "string",
            description: "A concise Korean summary of the answer feedback."
        },
        total: {
            type: "integer",
            minimum: 40,
            maximum: 99
        },
        metrics: {
            type: "array",
            minItems: DEFAULT_METRICS.length,
            maxItems: DEFAULT_METRICS.length,
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    label: {
                        type: "string",
                        enum: DEFAULT_METRICS.map((metric) => metric.label)
                    },
                    score: {
                        type: "integer",
                        minimum: 40,
                        maximum: 99
                    },
                    description: {
                        type: "string",
                        description: "A short Korean explanation for the metric."
                    }
                },
                required: ["label", "score", "description"]
            }
        },
        notes: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
                type: "string",
                description: "A concise Korean coaching note."
            }
        },
        starDraft: {
            type: "string",
            description: "A practical Korean STAR draft with line breaks."
        }
    },
    required: ["summary", "total", "metrics", "notes", "starDraft"]
};

const DRAFT_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        starDraft: {
            type: "string",
            description: "A concise Korean STAR draft with line breaks for 상황, 과제, 행동, 결과."
        }
    },
    required: ["starDraft"]
};

function normalizeMetrics(metrics) {
    return DEFAULT_METRICS.map((defaultMetric, index) => {
        const candidate = normalizeList(metrics).find((item) => cleanString(item?.label) === defaultMetric.label) || normalizeList(metrics)[index] || {};
        return {
            label: defaultMetric.label,
            score: clampNumber(candidate.score, { min: 40, max: 99, fallback: 78 + index * 3 }),
            description: cleanString(candidate.description, defaultMetric.description)
        };
    });
}

export async function onRequestOptions() {
    return noContent();
}

export async function onRequestPost(context) {
    try {
        const body = await readJsonBody(context.request);
        const mode = cleanString(body.mode);
        const role = cleanString(body.role, "backend");
        const intro = cleanString(body.intro);
        const question = cleanString(body.question);
        const answer = cleanString(body.answer);

        if (!mode) {
            throw new HttpError(400, "mode is required.");
        }

        let prompt = "";
        let schema = null;
        if (mode === "questions") {
            if (!intro) {
                throw new HttpError(400, "intro is required for questions mode.");
            }

            schema = QUESTIONS_SCHEMA;
            prompt = [
                "You are an experienced Korean interview coach.",
                "Write every string in Korean.",
                "Keep the opening warm and concise, and keep each interview question practical and interview-ready.",
                `Target role: ${role}`,
                `Candidate self introduction: ${intro}`
            ].join("\n");
        } else if (mode === "review") {
            if (!intro || !question || !answer) {
                throw new HttpError(400, "intro, question, and answer are required for review mode.");
            }

            schema = REVIEW_SCHEMA;
            prompt = [
                "You are an experienced Korean interview coach.",
                "Write every string in Korean.",
                "Keep the review practical, concise, and immediately editable in a portfolio UI.",
                `Target role: ${role}`,
                `Candidate self introduction: ${intro}`,
                `Interview question: ${question}`,
                `Candidate answer: ${answer}`
            ].join("\n");
        } else if (mode === "draft") {
            if (!intro || !question) {
                throw new HttpError(400, "intro and question are required for draft mode.");
            }

            schema = DRAFT_SCHEMA;
            prompt = [
                "You are an experienced Korean interview coach.",
                "Write every string in Korean.",
                "Return a concise, realistic STAR draft that is easy to edit in a UI.",
                `Target role: ${role}`,
                `Candidate self introduction: ${intro}`,
                `Interview question: ${question}`
            ].join("\n");
        } else {
            throw new HttpError(400, "Unsupported mode.");
        }

        const { data, model } = await generateStructuredJson(context, prompt, {
            temperature: mode === "review" ? 0.35 : 0.5,
            maxOutputTokens: mode === "review" ? 1400 : 1000,
            schema
        });

        if (mode === "questions") {
            const questions = normalizeList(data.questions)
                .map((item) => cleanString(item))
                .filter(Boolean)
                .slice(0, 7);

            if (!questions.length) {
                throw new HttpError(502, "Gemini returned no interview questions.");
            }

            return json({
                opening: cleanString(data.opening, "자기소개를 바탕으로 면접관이 물을 가능성이 높은 질문을 정리했습니다."),
                readinessScore: clampNumber(data.readinessScore, { min: 50, max: 99, fallback: 84 }),
                questions,
                provider: "gemini",
                model
            });
        }

        if (mode === "review") {
            const notes = normalizeList(data.notes)
                .map((item) => cleanString(item))
                .filter(Boolean)
                .slice(0, 4);

            while (notes.length < 4) {
                notes.push("답변 구조를 조금만 더 선명하게 정리하면 설득력이 더 좋아집니다.");
            }

            return json({
                summary: cleanString(data.summary, "질문의 의도에는 맞지만, 행동과 결과를 더 또렷하게 말하면 훨씬 강한 답변이 됩니다."),
                total: clampNumber(data.total, { min: 40, max: 99, fallback: 82 }),
                metrics: normalizeMetrics(data.metrics),
                notes,
                starDraft: cleanString(data.starDraft, "상황: 관련 프로젝트에서 중요한 이슈가 있었습니다.\n과제: 문제를 빠르게 정리하고 해결 방향을 제시해야 했습니다.\n행동: 우선순위를 정하고 팀과 협업하며 직접 실행했습니다.\n결과: 일정과 품질 모두에서 개선된 결과를 만들었습니다."),
                provider: "gemini",
                model
            });
        }

        return json({
            starDraft: cleanString(data.starDraft, "상황: 관련 프로젝트에서 중요한 이슈가 있었습니다.\n과제: 문제를 빠르게 정리하고 해결 방향을 제시해야 했습니다.\n행동: 우선순위를 정하고 팀과 협업하며 직접 실행했습니다.\n결과: 일정과 품질 모두에서 개선된 결과를 만들었습니다."),
            provider: "gemini",
            model
        });
    } catch (error) {
        return handleError(error);
    }
}