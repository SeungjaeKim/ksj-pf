(function (root) {
    root.SquirrelRescue = root.SquirrelRescue || {};
    root.SquirrelRescueConfig = {
        laneCount: 5,
        initialLane: 2,
        startingLives: 5,
        requiredCatches: 3,
        baseRescueScore: 100
    };
})(typeof window !== "undefined" ? window : this);
