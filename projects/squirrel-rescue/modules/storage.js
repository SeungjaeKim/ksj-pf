(function (root) {
    var fallbackScore = { bestScore: 0 };

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
                    return fallbackScore;
                }

                return JSON.parse(storedValue);
            } catch (error) {
                return fallbackScore;
            }
        }
    };
})(typeof window !== "undefined" ? window : this);
