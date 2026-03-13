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
                pendingItemSpawnMs: 0,
                bestScore: bestScoreState.bestScore || 0,
                runState: root.SquirrelRescueRules.createRunState(),
                activeSquirrel: null,
                activeSquirrels: [],
                activeItems: [],
                currentTargetLane: config.initialLane,
                coveredLanes: [config.initialLane]
            };
        },

        createSquirrel: function (overrides) {
            var next = overrides || {};

            return {
                x: typeof next.x === "number" ? next.x : 136,
                y: typeof next.y === "number" ? next.y : 148,
                vx: typeof next.vx === "number" ? next.vx : 2.7,
                vy: typeof next.vy === "number" ? next.vy : 0.8,
                radius: typeof next.radius === "number" ? next.radius : 18,
                targetLane: typeof next.targetLane === "number" ? next.targetLane : 0,
                targetX: typeof next.targetX === "number" ? next.targetX : 136,
                bounceIndex: typeof next.bounceIndex === "number" ? next.bounceIndex : 0,
                catchCount: typeof next.catchCount === "number" ? next.catchCount : 0,
                phase: next.phase || "route",
                wobbleSeed: typeof next.wobbleSeed === "number" ? next.wobbleSeed : 0
            };
        },

        createItem: function (overrides) {
            var next = overrides || {};

            return {
                x: typeof next.x === "number" ? next.x : 136,
                y: typeof next.y === "number" ? next.y : 124,
                vx: typeof next.vx === "number" ? next.vx : 0,
                vy: typeof next.vy === "number" ? next.vy : 1.4,
                radius: typeof next.radius === "number" ? next.radius : 22,
                lane: typeof next.lane === "number" ? next.lane : 0,
                type: next.type || "wide-trampoline",
                label: next.label || "Wide Trampoline",
                badge: next.badge || "W",
                spin: typeof next.spin === "number" ? next.spin : 0,
                spinRate: typeof next.spinRate === "number" ? next.spinRate : 0.05
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
