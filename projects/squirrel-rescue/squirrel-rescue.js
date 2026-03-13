document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("rescueCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const stageStatus = document.getElementById("stageStatus");
    const startRunBtn = document.getElementById("startRunBtn");
    const retryBtn = document.getElementById("retryBtn");
    const introOverlay = document.getElementById("introOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const gameOverSummary = document.getElementById("gameOverSummary");
    const scoreValue = document.getElementById("scoreValue");
    const livesValue = document.getElementById("livesValue");
    const waveValue = document.getElementById("waveValue");
    const rescuedValue = document.getElementById("rescuedValue");
    const inputReady = typeof window.SquirrelRescueInput !== "undefined";
    const config = window.SquirrelRescueConfig || { laneCount: 5, initialLane: 2, startingLives: 5 };
    const previewState = { dragActive: false };
    let lastFrameTime = 0;

    if (!canvas || !ctx || !stageStatus || !startRunBtn || !window.SquirrelRescueSession || !window.SquirrelRescueEntities) {
        return;
    }

    function laneToX(laneIndex) {
        const gutter = 120;
        const availableWidth = canvas.width - (gutter * 2);
        const spacing = availableWidth / (config.laneCount - 1);
        return gutter + (spacing * laneIndex);
    }

    const controller = window.SquirrelRescueSession.createController({
        config: config,
        rules: window.SquirrelRescueRules,
        entities: window.SquirrelRescueEntities,
        storage: window.SquirrelRescueStorage,
        laneToX: laneToX,
        trampolineY: canvas.height - 92
    });

    function updateHud(world) {
        if (scoreValue) {
            scoreValue.textContent = String(world.runState.score);
        }

        if (livesValue) {
            livesValue.textContent = String(world.runState.lives);
        }

        if (rescuedValue) {
            rescuedValue.textContent = String(world.runState.rescuedCount);
        }

        if (waveValue) {
            waveValue.textContent = world.mode === "playing" ? "Rescue Loop" : "Warm Up";
        }

        if (stageStatus) {
            stageStatus.textContent = world.message;
        }

        if (gameOverOverlay && gameOverSummary) {
            if (world.mode === "over") {
                gameOverOverlay.classList.add("active");
                gameOverSummary.textContent = "Final score " + world.runState.score + " with " + world.runState.rescuedCount + " squirrels rescued.";
            } else {
                gameOverOverlay.classList.remove("active");
            }
        }
    }

    function drawStage(world) {
        const horizonY = canvas.height * 0.62;
        let laneIndex = 0;
        let laneX;
        let trampolineX;

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
            laneX = laneToX(laneIndex);
            ctx.beginPath();
            ctx.moveTo(laneX, horizonY - 24);
            ctx.lineTo(laneX, canvas.height - 70);
            ctx.stroke();
        }

        trampolineX = laneToX(world.teamLane);
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
        ctx.fillText("Lane " + (world.teamLane + 1), trampolineX - 32, canvas.height - 132);

        if (world.activeSquirrel) {
            ctx.fillStyle = "#ffe3a8";
            ctx.beginPath();
            ctx.arc(world.activeSquirrel.x, world.activeSquirrel.y, world.activeSquirrel.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#7f4a2b";
            ctx.beginPath();
            ctx.arc(world.activeSquirrel.x + 8, world.activeSquirrel.y - 10, 7, 0, Math.PI * 2);
            ctx.arc(world.activeSquirrel.x - 10, world.activeSquirrel.y - 9, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function setLane(nextLane) {
        controller.setLane(nextLane);
        updateHud(controller.getWorld());
        drawStage(controller.getWorld());
    }

    function laneFromPointer(event) {
        const rect = canvas.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width;
        return window.SquirrelRescueInput.pointerToLane(normalizedX, config.laneCount);
    }

    function loop(timestamp) {
        const delta = lastFrameTime === 0 ? 16.6667 : Math.min(32, timestamp - lastFrameTime);
        lastFrameTime = timestamp;
        controller.tick(delta);
        updateHud(controller.getWorld());
        drawStage(controller.getWorld());
        window.requestAnimationFrame(loop);
    }

    if (inputReady) {
        window.addEventListener("keydown", (event) => {
            const world = controller.getWorld();

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                setLane(window.SquirrelRescueInput.moveLaneByStep(world.teamLane, -1, config.laneCount));
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                setLane(window.SquirrelRescueInput.moveLaneByStep(world.teamLane, 1, config.laneCount));
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
        introOverlay.classList.remove("active");
        gameOverOverlay.classList.remove("active");
        controller.startRun();
    });

    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            introOverlay.classList.remove("active");
            gameOverOverlay.classList.remove("active");
            controller.restart();
        });
    }

    updateHud(controller.getWorld());
    drawStage(controller.getWorld());
    window.requestAnimationFrame(loop);
});
