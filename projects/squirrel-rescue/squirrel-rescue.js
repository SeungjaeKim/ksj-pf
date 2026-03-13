document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("rescueCanvas");
    const stageStatus = document.getElementById("stageStatus");
    const startRunBtn = document.getElementById("startRunBtn");
    const retryBtn = document.getElementById("retryBtn");
    const introOverlay = document.getElementById("introOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const gameOverSummary = document.getElementById("gameOverSummary");
    const scoreValue = document.getElementById("scoreValue");
    const livesValue = document.getElementById("livesValue");
    const rescuedValue = document.getElementById("rescuedValue");
    const comboValue = document.getElementById("comboValue");
    const waveValue = document.getElementById("waveValue");
    const powerValue = document.getElementById("powerValue");
    const inputReady = typeof window.SquirrelRescueInput !== "undefined";
    const config = window.SquirrelRescueConfig || { laneCount: 5, initialLane: 2, startingLives: 5 };
    const previewState = { dragActive: false };
    let lastFrameTime = 0;

    if (!canvas || !stageStatus || !startRunBtn || !window.SquirrelRescueSession || !window.SquirrelRescueEntities || !window.SquirrelRescueRenderer || !window.SquirrelRescueWaveManager) {
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
        waveManager: window.SquirrelRescueWaveManager,
        laneToX: laneToX,
        trampolineY: canvas.height - 92
    });

    const renderer = window.SquirrelRescueRenderer.createRenderer({
        canvas: canvas,
        config: config,
        rules: window.SquirrelRescueRules,
        stageStatus: stageStatus,
        scoreValue: scoreValue,
        livesValue: livesValue,
        rescuedValue: rescuedValue,
        comboValue: comboValue,
        waveValue: waveValue,
        powerValue: powerValue,
        gameOverOverlay: gameOverOverlay,
        gameOverSummary: gameOverSummary,
        laneToX: laneToX
    });

    function setLane(nextLane) {
        controller.setLane(nextLane);
        renderer.render(controller.getWorld());
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
        renderer.render(controller.getWorld());
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

    renderer.render(controller.getWorld());
    window.requestAnimationFrame(loop);
});
