(function (root) {
    root.SquirrelRescueInput = {
        moveLaneByStep: function (currentLane, delta, laneCount) {
            var maxLane = laneCount - 1;
            var nextLane = currentLane + delta;

            return Math.max(0, Math.min(maxLane, nextLane));
        },

        pointerToLane: function (normalizedX, laneCount) {
            var clampedX = Math.max(0, Math.min(1, normalizedX));
            return Math.max(0, Math.min(laneCount - 1, Math.round(clampedX * (laneCount - 1))));
        }
    };
})(typeof window !== "undefined" ? window : this);
