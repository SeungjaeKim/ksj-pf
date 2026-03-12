import { clampNumber, cleanString, handleError, json, noContent, normalizeList, readJsonBody, HttpError } from "../_shared/http.js";
import { generateStructuredJson } from "../_shared/gemini.js";

const SLOT_TAGS = ["Morning", "Afternoon", "Evening"];
const BUDGET_LABELS = ["항공/이동", "숙소", "식비", "입장권/기타"];

function normalizeSpotNames(candidateNames, availableSpotNames, desiredLength = 5) {
    const normalizedAvailable = availableSpotNames.map((name) => name.toLowerCase());
    const picked = [];

    normalizeList(candidateNames).forEach((candidate) => {
        const value = cleanString(candidate).toLowerCase();
        const index = normalizedAvailable.findIndex((name) => name === value || name.includes(value) || value.includes(name));
        if (index >= 0) {
            const spotName = availableSpotNames[index];
            if (!picked.includes(spotName)) {
                picked.push(spotName);
            }
        }
    });

    availableSpotNames.forEach((spotName) => {
        if (picked.length < desiredLength && !picked.includes(spotName)) {
            picked.push(spotName);
        }
    });

    return picked.slice(0, Math.min(desiredLength, availableSpotNames.length));
}

function createFallbackAmount(label, duration, travelers, budgetTone) {
    const dailyBase = budgetTone === "premium" ? 260 : budgetTone === "comfort" ? 190 : 130;
    const total = dailyBase * duration * travelers;
    const ratioMap = {
        "항공/이동": 0.34,
        "숙소": 0.31,
        "식비": 0.2,
        "입장권/기타": 0.15
    };

    return Math.round(total * (ratioMap[label] || 0.1));
}

function createTravelPlanSchema(duration, availableSpotNames) {
    const spotNameSchema = {
        type: "string",
        enum: availableSpotNames,
        description: "Use one of the provided spot names exactly as-is."
    };

    return {
        type: "object",
        additionalProperties: false,
        properties: {
            tripTitle: {
                type: "string",
                description: "A short Korean trip title suitable for a portfolio card."
            },
            tripNarrative: {
                type: "string",
                description: "One or two concise Korean sentences summarizing the trip mood and route."
            },
            styleLabel: {
                type: "string",
                description: "The Korean label for the selected travel style."
            },
            mapSpots: {
                type: "array",
                minItems: Math.min(3, availableSpotNames.length),
                maxItems: Math.min(5, availableSpotNames.length),
                items: spotNameSchema,
                description: "Highlighted places for the map view."
            },
            dayPlans: {
                type: "array",
                minItems: duration,
                maxItems: duration,
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        day: {
                            type: "integer",
                            minimum: 1,
                            maximum: duration
                        },
                        headline: {
                            type: "string",
                            description: "A short Korean heading for the day."
                        },
                        focus: {
                            type: "string",
                            description: "A concise Korean sentence explaining the day's flow."
                        },
                        slots: {
                            type: "array",
                            minItems: SLOT_TAGS.length,
                            maxItems: SLOT_TAGS.length,
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    tag: {
                                        type: "string",
                                        enum: SLOT_TAGS
                                    },
                                    spot: spotNameSchema,
                                    title: {
                                        type: "string",
                                        description: "A short Korean slot title."
                                    },
                                    description: {
                                        type: "string",
                                        description: "A concise Korean sentence for the activity."
                                    }
                                },
                                required: ["tag", "spot", "title", "description"]
                            }
                        }
                    },
                    required: ["day", "headline", "focus", "slots"]
                }
            },
            budgetBreakdown: {
                type: "array",
                minItems: BUDGET_LABELS.length,
                maxItems: BUDGET_LABELS.length,
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        label: {
                            type: "string",
                            enum: BUDGET_LABELS
                        },
                        amount: {
                            type: "integer",
                            minimum: 50,
                            maximum: 20000
                        },
                        note: {
                            type: "string",
                            description: "A short Korean note for the budget item."
                        }
                    },
                    required: ["label", "amount", "note"]
                }
            },
            checklist: {
                type: "array",
                minItems: 4,
                maxItems: 5,
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        title: {
                            type: "string",
                            description: "A concise Korean checklist title."
                        },
                        note: {
                            type: "string",
                            description: "A short Korean preparation note."
                        },
                        priority: {
                            type: "string",
                            description: "A short Korean priority label such as 우선 or 준비."
                        }
                    },
                    required: ["title", "note", "priority"]
                }
            }
        },
        required: ["tripTitle", "tripNarrative", "styleLabel", "mapSpots", "dayPlans", "budgetBreakdown", "checklist"]
    };
}

function normalizeTravelPlan(data, request) {
    const availableSpotNames = request.points.map((point) => point.name);
    const mapSpots = normalizeSpotNames(data.mapSpots, availableSpotNames, Math.min(5, availableSpotNames.length));

    const dayPlans = Array.from({ length: request.duration }, (_, index) => {
        const candidate = normalizeList(data.dayPlans)[index] || {};
        const fallbackSpots = [
            mapSpots[index % mapSpots.length],
            mapSpots[(index + 1) % mapSpots.length],
            mapSpots[(index + 2) % mapSpots.length]
        ];

        const slots = SLOT_TAGS.map((tag, slotIndex) => {
            const slotCandidate = normalizeList(candidate.slots).find((item) => cleanString(item?.tag).toLowerCase() === tag.toLowerCase()) || normalizeList(candidate.slots)[slotIndex] || {};
            const resolvedSpot = normalizeSpotNames([slotCandidate.spot], availableSpotNames, 1)[0] || fallbackSpots[slotIndex];

            return {
                tag,
                spot: resolvedSpot,
                title: cleanString(slotCandidate.title, `${resolvedSpot} 중심 ${tag} 코스`),
                description: cleanString(slotCandidate.description, `${resolvedSpot}을 중심으로 하루 리듬에 맞는 동선을 이어가세요.`)
            };
        });

        return {
            day: index + 1,
            headline: cleanString(candidate.headline, `Day ${index + 1} 추천 일정`),
            focus: cleanString(candidate.focus, `${slots[0].spot}에서 시작해 ${slots[2].spot}까지 자연스럽게 이어지는 하루입니다.`),
            slots
        };
    });

    const budgetBreakdown = BUDGET_LABELS.map((label, index) => {
        const candidate = normalizeList(data.budgetBreakdown).find((item) => cleanString(item?.label) === label) || normalizeList(data.budgetBreakdown)[index] || {};
        const amount = clampNumber(candidate.amount, {
            min: 50,
            max: 20000,
            fallback: createFallbackAmount(label, request.duration, request.travelers, request.budgetTone)
        });

        return {
            label,
            amount,
            note: cleanString(candidate.note, `${label} 항목을 여행 일정에 맞춰 여유 있게 잡았습니다.`)
        };
    });

    const checklist = normalizeList(data.checklist)
        .slice(0, 5)
        .map((item, index) => ({
            title: cleanString(item?.title, request.checklistSeeds[index]?.title || `준비 항목 ${index + 1}`),
            note: cleanString(item?.note, request.checklistSeeds[index]?.note || "여행 전 확인해 두면 좋은 항목입니다."),
            priority: cleanString(item?.priority, index === 0 ? "우선" : "준비")
        }));

    while (checklist.length < 4) {
        const fallback = request.checklistSeeds[checklist.length] || { title: `준비 항목 ${checklist.length + 1}`, note: "여행 전 확인해 두면 좋은 항목입니다." };
        checklist.push({
            title: fallback.title,
            note: fallback.note,
            priority: checklist.length === 0 ? "우선" : "준비"
        });
    }

    return {
        tripTitle: cleanString(data.tripTitle, `${request.cityName} ${request.duration}일 플랜`),
        tripNarrative: cleanString(data.tripNarrative, `${request.cityName}에서 ${request.styleLabel} 취향을 살린 ${request.duration}일 여정을 구성했습니다.`),
        styleLabel: cleanString(data.styleLabel, request.styleLabel),
        mapSpots,
        dayPlans,
        budgetBreakdown,
        budgetTotal: budgetBreakdown.reduce((sum, item) => sum + item.amount, 0),
        checklist
    };
}

export async function onRequestOptions() {
    return noContent();
}

export async function onRequestPost(context) {
    try {
        const body = await readJsonBody(context.request);
        const cityName = cleanString(body.cityName);
        const country = cleanString(body.country);
        const duration = clampNumber(body.duration, { min: 2, max: 7, fallback: 4 });
        const travelers = clampNumber(body.travelers, { min: 1, max: 8, fallback: 2 });
        const styleLabel = cleanString(body.styleLabel, "밸런스");
        const budgetTone = cleanString(body.budgetTone, "smart");
        const additionalRequest = cleanString(body.additionalRequest);
        const points = normalizeList(body.points)
            .map((point) => ({ name: cleanString(point?.name) }))
            .filter((point) => point.name);
        const checklistSeeds = normalizeList(body.checklistSeeds).map((item) => ({
            title: cleanString(item?.title),
            note: cleanString(item?.note)
        }));

        if (!cityName || !country || points.length < 3) {
            throw new HttpError(400, "cityName, country, and at least three points are required.");
        }
        const prompt = [
            "You are a travel itinerary planner for a Korean portfolio web app.",
            "Write every string in natural Korean.",
            "Keep all copy concise, practical, and ready for a portfolio UI.",
            "Prefer short titles, short notes, and compact descriptions over long paragraphs.",
            "Keep tripNarrative to one or two short sentences.",
            "Keep each headline, focus, slot title, slot description, budget note, and checklist note brief.",
            `Destination: ${cityName}, ${country}`,
            `Duration: ${duration} days`,
            `Travelers: ${travelers}`,
            `Travel style: ${styleLabel}`,
            `Budget tone: ${budgetTone}`,
            additionalRequest ? `Additional request: ${additionalRequest}` : "Additional request: none",
            `Available spot names: ${points.map((point) => point.name).join(", ")}`,
            "Use only the provided spot names for mapSpots and slot.spot.",
            "Return a realistic, family-friendly, presentation-ready trip plan."
        ].join("\n");
        const { data, model } = await generateStructuredJson(context, prompt, {
            temperature: 0.35,
            maxOutputTokens: 4096,
            schema: createTravelPlanSchema(duration, points.map((point) => point.name))
        });

        const normalized = normalizeTravelPlan(data, {
            cityName,
            country,
            duration,
            travelers,
            styleLabel,
            budgetTone,
            points,
            checklistSeeds
        });

        return json({
            ...normalized,
            provider: "gemini",
            model
        });
    } catch (error) {
        return handleError(error);
    }
}