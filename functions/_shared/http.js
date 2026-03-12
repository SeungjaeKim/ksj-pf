export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

export class HttpError extends Error {
    constructor(status, message, detail) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.detail = detail;
    }
}

export function json(data, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json; charset=UTF-8");

    Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
    });

    return new Response(JSON.stringify(data), {
        ...init,
        headers
    });
}

export function noContent() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function readJsonBody(request) {
    try {
        return await request.json();
    } catch (error) {
        throw new HttpError(400, "Request body must be valid JSON.");
    }
}

export function cleanString(value, fallback = "") {
    if (typeof value !== "string") {
        return fallback;
    }

    const normalized = value.trim();
    return normalized || fallback;
}

export function clampNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, parsed));
}

export function normalizeList(value) {
    return Array.isArray(value) ? value : [];
}

export function handleError(error) {
    if (error instanceof HttpError) {
        return json({
            error: error.message,
            detail: error.detail
        }, { status: error.status });
    }

    console.error(error);
    return json({ error: "Unexpected server error." }, { status: 500 });
}
