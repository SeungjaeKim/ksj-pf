(function (root) {
    var config = root.SquirrelRescueConfig || { startingLives: 5 };

    function cloneState(state) {
        var next = {};
        var key;

        for (key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                next[key] = state[key];
            }
        }

        return next;
    }

    root.SquirrelRescueRules = {
        createRunState: function () {
            return {
                lives: config.startingLives,
                combo: 1,
                score: 0,
                rescueStage: 0,
                rescuedCount: 0
            };
        },

        resolveMiss: function (state) {
            var next = cloneState(state || {});
            var currentLives = typeof next.lives === "number" ? next.lives : config.startingLives;

            next.lives = Math.max(0, currentLives - 1);
            next.combo = 1;
            next.rescueStage = 0;

            return next;
        },

        resolveCatch: function (state) {
            var next = cloneState(state || {});
            var nextStage = (next.rescueStage || 0) + 1;

            if (nextStage >= config.requiredCatches) {
                next.rescueStage = 0;
                next.rescuedCount = (next.rescuedCount || 0) + 1;
                next.score = (next.score || 0) + (config.baseRescueScore * (next.combo || 1));
                next.combo = (next.combo || 1) + 1;
                return next;
            }

            next.rescueStage = nextStage;
            return next;
        },

        buildHudSnapshot: function (state) {
            return {
                scoreLabel: String(state.score || 0),
                livesLabel: String(state.lives || 0),
                rescuedLabel: String(state.rescuedCount || 0),
                comboLabel: "x" + String(state.combo || 1)
            };
        },

        createWaveState: function () {
            return {
                activeWave: null,
                waveProgress: 0,
                waveIndex: 0,
                waveCooldownMs: 0,
                activePowerUp: null,
                powerUpRemainingMs: 0,
                completedWaveId: null
            };
        },

        activatePowerUp: function (state, powerUpId, durationMs) {
            var next = cloneState(state || {});

            next.activePowerUp = powerUpId;
            next.powerUpRemainingMs = Math.max(0, durationMs || 0);

            return next;
        },

        tickPowerUp: function (state, deltaMs) {
            var next = cloneState(state || {});

            if (!next.activePowerUp) {
                next.powerUpRemainingMs = Math.max(0, next.powerUpRemainingMs || 0);
                return next;
            }

            next.powerUpRemainingMs = Math.max(0, (next.powerUpRemainingMs || 0) - (deltaMs || 0));

            if (next.powerUpRemainingMs <= 0) {
                next.activePowerUp = null;
                next.powerUpRemainingMs = 0;
            }

            return next;
        }
    };
})(typeof window !== "undefined" ? window : this);
