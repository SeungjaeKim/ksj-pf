(function (root) {
    var fallbackScore = { bestScore: 0 };

    function normalizeBestScore(value) {
        var score = value && typeof value.bestScore === "number"
            ? value.bestScore
            : parseInt(value && value.bestScore, 10);

        if (isNaN(score) || score < 0) {
            score = 0;
        }

        return { bestScore: score };
    }

    function parseStoredScore(storedValue) {
        var parsedValue;
        var match;

        if (!storedValue) {
            return normalizeBestScore(fallbackScore);
        }

        if (typeof storedValue !== "string") {
            return normalizeBestScore(storedValue);
        }

        if (root.JSON && typeof root.JSON.parse === "function") {
            parsedValue = root.JSON.parse(storedValue);
            return normalizeBestScore(parsedValue);
        }

        match = /"bestScore"\s*:\s*(-?\d+)/.exec(storedValue);
        if (match) {
            return normalizeBestScore({ bestScore: parseInt(match[1], 10) });
        }

        return normalizeBestScore(fallbackScore);
    }

    function serializeBestScore(bestScore) {
        var normalized = normalizeBestScore({ bestScore: bestScore });

        if (root.JSON && typeof root.JSON.stringify === "function") {
            return root.JSON.stringify(normalized);
        }

        return "{\"bestScore\":" + normalized.bestScore + "}";
    }

    root.SquirrelRescueStorage = {
        readBestScore: function (reader) {
            var storedValue;

            try {
                storedValue = typeof reader === "function"
                    ? reader()
                    : root.localStorage
                        ? root.localStorage.getItem("squirrel-rescue-best-score")
                        : null;

                if (!storedValue) {
                    return normalizeBestScore(fallbackScore);
                }

                return parseStoredScore(storedValue);
            } catch (error) {
                return normalizeBestScore(fallbackScore);
            }
        },

        writeBestScore: function (bestScore, writer) {
            var normalizedScore = normalizeBestScore({ bestScore: bestScore });
            var payload = serializeBestScore(normalizedScore.bestScore);

            try {
                if (typeof writer === "function") {
                    writer(payload);
                    return { saved: true, bestScore: normalizedScore.bestScore };
                }

                if (!root.localStorage) {
                    return { saved: false, bestScore: normalizedScore.bestScore };
                }

                root.localStorage.setItem("squirrel-rescue-best-score", payload);
                return { saved: true, bestScore: normalizedScore.bestScore };
            } catch (error) {
                return { saved: false, bestScore: normalizedScore.bestScore };
            }
        }
    };
})(typeof window !== "undefined" ? window : this);
