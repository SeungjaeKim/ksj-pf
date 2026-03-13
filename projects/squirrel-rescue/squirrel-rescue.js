document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("rescueCanvas");
    const stageStatus = document.getElementById("stageStatus");
    const startRunBtn = document.getElementById("startRunBtn");
    const livesValue = document.getElementById("livesValue");
    const waveValue = document.getElementById("waveValue");
    const rescuedValue = document.getElementById("rescuedValue");
    const rulesReady = typeof window.SquirrelRescueRules !== "undefined";
    const inputReady = typeof window.SquirrelRescueInput !== "undefined";
    const config = window.SquirrelRescueConfig || { laneCount: 5, initialLane: 2 };
    const previewState = {
        lane: config.initialLane,
        dragActive: false
    };

    if (!canvas || !stageStatus || !startRunBtn) {
        return;
    }

    if (rulesReady) {
        stageStatus.textContent = "Base rules loaded. Input handling and rescue timing are the next milestone.";
    }

    if (inputReady && waveValue) {
        waveValue.textContent = "Lane Preview";
    }

    if (livesValue) {
        livesValue.textContent = String(config.startingLives || 5);
    }

    if (rescuedValue) {
        rescuedValue.textContent = "Lane " + (previewState.lane + 1);
    }

    function laneToX(laneIndex) {
        const gutter = 120;
        const availableWidth = canvas.width - (gutter * 2);
        const spacing = availableWidth / (config.laneCount - 1);
        return gutter + (spacing * laneIndex);
    }

    function drawStage() {
        const ctx = canvas.getContext("2d");
        const horizonY = canvas.height * 0.62;
        let laneIndex = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, "#77c7ff");
        sky.addColorStop(0.56, "#1f5f8b");
        sky.addColorStop(1, "#142330");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255, 129, 80, 0.22)";
        ctx.fillRect(0, horizonY - 120, 200, 180);
        ctx.fillStyle = "#2c3745";
        ctx.fillRect(44, horizonY - 200, 176, 250);
        ctx.fillStyle = "#ffb067";
        ctx.fillRect(70, horizonY - 170, 30, 36);
        ctx.fillRect(120, horizonY - 128, 30, 36);
        ctx.fillRect(170, horizonY - 84, 30, 36);

        ctx.fillStyle = "#22303d";
        ctx.fillRect(canvas.width - 220, horizonY - 66, 148, 96);
        ctx.fillStyle = "#ffe6a6";
        ctx.fillRect(canvas.width - 176, horizonY - 42, 60, 30);
        ctx.fillStyle = "#f2f5f8";
        ctx.fillRect(canvas.width - 112, horizonY - 20, 30, 18);
        ctx.fillStyle = "#1a232c";
        ctx.beginPath();
        ctx.arc(canvas.width - 188, horizonY + 26, 18, 0, Math.PI * 2);
        ctx.arc(canvas.width - 100, horizonY + 26, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1d3342";
        ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        for (laneIndex = 0; laneIndex < config.laneCount; laneIndex += 1) {
            const laneX = laneToX(laneIndex);
            ctx.beginPath();
            ctx.moveTo(laneX, horizonY - 24);
            ctx.lineTo(laneX, canvas.height - 70);
            ctx.stroke();
        }

        const trampolineX = laneToX(previewState.lane);
        ctx.fillStyle = "#fff3d2";
        ctx.beginPath();
        ctx.ellipse(trampolineX, canvas.height - 92, 54, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ff7f50";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(trampolineX - 48, canvas.height - 92);
        ctx.quadraticCurveTo(trampolineX, canvas.height - 120, trampolineX + 48, canvas.height - 92);
        ctx.stroke();

        ctx.fillStyle = "#ff7f50";
        ctx.beginPath();
        ctx.arc(trampolineX - 34, canvas.height - 60, 14, 0, Math.PI * 2);
        ctx.arc(trampolineX + 34, canvas.height - 60, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#102033";
        ctx.font = "700 20px Outfit, sans-serif";
        ctx.fillText("Lane " + (previewState.lane + 1), trampolineX - 32, canvas.height - 132);
    }

    function setLane(nextLane) {
        previewState.lane = Math.max(0, Math.min(config.laneCount - 1, nextLane));
        if (rescuedValue) {
            rescuedValue.textContent = "Lane " + (previewState.lane + 1);
        }
        stageStatus.textContent = "Lane preview ready. Current lane: " + (previewState.lane + 1) + " of " + config.laneCount + ".";
        drawStage();
    }

    function laneFromPointer(event) {
        const rect = canvas.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width;
        return window.SquirrelRescueInput.pointerToLane(normalizedX, config.laneCount);
    }

    if (inputReady) {
        window.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                setLane(window.SquirrelRescueInput.moveLaneByStep(previewState.lane, -1, config.laneCount));
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                setLane(window.SquirrelRescueInput.moveLaneByStep(previewState.lane, 1, config.laneCount));
            }
        });

        canvas.addEventListener("pointerdown", (event) => {
            previewState.dragActive = true;
            setLane(laneFromPointer(event));
        });

        canvas.addEventListener("pointermove", (event) => {
            if (!previewState.dragActive) {
                return;
            }

            setLane(laneFromPointer(event));
        });

        window.addEventListener("pointerup", () => {
            previewState.dragActive = false;
        });
    }

    startRunBtn.addEventListener("click", () => {
        stageStatus.textContent = inputReady
            ? "Lane preview confirmed. Next up: falling squirrels and rescue staging."
            : rulesReady
                ? "Base rules confirmed. Next up: lane controls, falling squirrels, and rescue staging."
                : "Stage shell confirmed. Input, rules, and rescue flow are the next milestone.";
    });

    drawStage();
});
