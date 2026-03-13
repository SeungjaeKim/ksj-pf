document.addEventListener("DOMContentLoaded", () => {
    const stageStatus = document.getElementById("stageStatus");
    const startRunBtn = document.getElementById("startRunBtn");

    if (!stageStatus || !startRunBtn) {
        return;
    }

    startRunBtn.addEventListener("click", () => {
        stageStatus.textContent = "Stage shell confirmed. Input, rules, and rescue flow are the next milestone.";
    });
});
