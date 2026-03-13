(function (root) {
    root.SquirrelRescueEntities = {
        createWorld: function (config, storage) {
            var bestScoreState = storage && typeof storage.readBestScore === "function"
                ? storage.readBestScore()
                : { bestScore: 0 };

            return {
                mode: "idle",
                message: "Stage shell ready. Start a run to begin the rescue loop.",
                teamLane: config.initialLane,
                pendingSpawnMs: 0,
                bestScore: bestScoreState.bestScore || 0,
                runState: root.SquirrelRescueRules.createRunState(),
                activeSquirrel: null
            };
        },

        createSquirrel: function () {
            return {
                x: 136,
                y: 148,
                vx: 2.7,
                vy: 0.8,
                radius: 18
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
