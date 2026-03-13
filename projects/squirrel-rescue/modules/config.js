(function (root) {
    root.SquirrelRescue = root.SquirrelRescue || {};
    root.SquirrelRescueConfig = {
        laneCount: 5,
        initialLane: 2,
        startingLives: 5,
        requiredCatches: 3,
        baseRescueScore: 100,
        baseCatchWindow: 64,
        wideCatchWindow: 92,
        gravityPerFrame: 0.17,
        slowFallGravityPerFrame: 0.11,
        waveCooldownMs: 1400,
        powerUpDurationMs: 8000,
        powerUpScoreBonus: 60,
        powerUpLabels: {
            "wide-trampoline": "Wide Trampoline",
            "slow-fall": "Slow Fall",
            "bonus-points": "Score Boost"
        },
        waveRotation: [
            {
                id: "quick-pickup",
                label: "Rescue 2 squirrels",
                targetRescues: 2,
                reward: "wide-trampoline"
            },
            {
                id: "steady-hands",
                label: "Rescue 3 squirrels",
                targetRescues: 3,
                reward: "slow-fall"
            },
            {
                id: "bonus-run",
                label: "Rescue 2 squirrels",
                targetRescues: 2,
                reward: "bonus-points"
            }
        ]
    };
})(typeof window !== "undefined" ? window : this);
