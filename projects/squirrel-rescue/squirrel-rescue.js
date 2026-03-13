document.addEventListener("DOMContentLoaded", () => {
    const stageStatus = document.getElementById("stageStatus");
    const startRunBtn = document.getElementById("startRunBtn");
    const rulesReady = typeof window.SquirrelRescueRules !== "undefined";

    if (!stageStatus || !startRunBtn) {
        return;
    }

    if (rulesReady) {
        stageStatus.textContent = "Base rules loaded. Input handling and rescue timing are the next milestone.";
    }

    startRunBtn.addEventListener("click", () => {
        stageStatus.textContent = rulesReady
            ? "Base rules confirmed. Next up: lane controls, falling squirrels, and rescue staging."
            : "Stage shell confirmed. Input, rules, and rescue flow are the next milestone.";
    });
});
