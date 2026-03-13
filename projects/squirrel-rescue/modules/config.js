(function (root) {
    root.SquirrelRescue = root.SquirrelRescue || {};
    root.SquirrelRescueConfig = {
        laneCount: 7,
        initialLane: 0,
        startingLives: 5,
        playableCatchCount: 7,
        requiredCatches: 8,
        routePattern: [0, 1, 2, 3, 4, 5, 6],
        baseRescueScore: 140,
        baseCatchWindow: 46,
        wideCatchWindow: 72,
        gravityPerFrame: 0.19,
        slowFallGravityPerFrame: 0.13,
        waveCooldownMs: 2200,
        powerUpDurationMs: 8500,
        powerUpScoreBonus: 90,
        squirrelRadius: 18,
        itemRadius: 22,
        spawnYOffset: 146,
        itemSpawnYOffset: 124,
        spawnVelocityX: 1.3,
        spawnVelocityY: 1.1,
        itemFallVelocityY: 1.5,
        buildingExitOffsetX: -126,
        bounceApexTopOffset: 8,
        bounceApexBottomOffset: 202,
        laneGuidanceStrength: 0.032,
        guidanceSmoothing: 0.18,
        maxGuidedSpeed: 5.8,
        groundOffset: 120,
        buildingTop: 42,
        spawnIntervalMinMs: 5000,
        spawnIntervalMaxMs: 7000,
        itemSpawnMinMs: 10000,
        itemSpawnMaxMs: 15000,
        maxActiveSquirrels: 2,
        maxActiveItems: 1,
        ambulanceLaneIndex: 7,
        powerUpDropOrder: ["wide-trampoline", "slow-fall", "bonus-points"],
        difficultyBands: [
            {
                minScore: 0,
                spawnMinMs: 5800,
                spawnMaxMs: 7000,
                speedMultiplier: 1
            },
            {
                minScore: 400,
                spawnMinMs: 5000,
                spawnMaxMs: 6200,
                speedMultiplier: 1.08
            },
            {
                minScore: 900,
                spawnMinMs: 4200,
                spawnMaxMs: 5400,
                speedMultiplier: 1.16
            },
            {
                minScore: 1600,
                spawnMinMs: 3600,
                spawnMaxMs: 4800,
                speedMultiplier: 1.24
            }
        ],
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
