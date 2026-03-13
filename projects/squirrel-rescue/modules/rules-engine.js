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
        }
    };
})(typeof window !== "undefined" ? window : this);
