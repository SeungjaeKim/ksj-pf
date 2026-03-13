document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("rescueCanvas");
    const stageStatus = document.getElementById("stageStatus");
    const startRunBtn = document.getElementById("startRunBtn");
    const retryBtn = document.getElementById("retryBtn");
    const introOverlay = document.getElementById("introOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const gameOverSummary = document.getElementById("gameOverSummary");
    const stageShell = document.querySelector(".stage-shell");
    const feedbackLayer = document.getElementById("feedbackLayer");
    const soundToggleBtn = document.getElementById("soundToggleBtn");
    const scoreValue = document.getElementById("scoreValue");
    const livesValue = document.getElementById("livesValue");
    const rescuedValue = document.getElementById("rescuedValue");
    const comboValue = document.getElementById("comboValue");
    const waveValue = document.getElementById("waveValue");
    const powerValue = document.getElementById("powerValue");
    const bestValue = document.getElementById("bestValue");
    const inputReady = typeof window.SquirrelRescueInput !== "undefined";
    const config = window.SquirrelRescueConfig || { laneCount: 5, initialLane: 2, startingLives: 5 };
    const previewState = { dragActive: false };
    let autoPauseReason = null;
    let lastFrameTime = 0;

    if (!canvas || !stageStatus || !startRunBtn || !window.SquirrelRescueSession || !window.SquirrelRescueEntities || !window.SquirrelRescueRenderer || !window.SquirrelRescueWaveManager || !window.SquirrelRescueFeedback) {
        return;
    }

    function laneToX(laneIndex) {
        const playfieldLeft = canvas.width * 0.27;
        const playfieldRight = canvas.width * 0.82;
        const spacing = (playfieldRight - playfieldLeft) / (config.laneCount - 1);
        return playfieldLeft + (spacing * laneIndex);
    }

    const controller = window.SquirrelRescueSession.createController({
        config: config,
        rules: window.SquirrelRescueRules,
        entities: window.SquirrelRescueEntities,
        storage: window.SquirrelRescueStorage,
        waveManager: window.SquirrelRescueWaveManager,
        laneToX: laneToX,
        trampolineY: canvas.height - 104
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
        bestValue: bestValue,
        gameOverOverlay: gameOverOverlay,
        gameOverSummary: gameOverSummary,
        laneToX: laneToX
    });

    const feedback = window.SquirrelRescueFeedback.createController({
        stageShell: stageShell,
        feedbackLayer: feedbackLayer,
        soundToggleBtn: soundToggleBtn
    });

    function renderWorld() {
        renderer.render(controller.getWorld());
        feedback.handleEvent(controller.consumeFeedbackEvent());
    }

    function shouldPauseForPortrait() {
        return window.innerWidth <= 900 && window.innerHeight > window.innerWidth;
    }

    function syncEnvironmentSafety() {
        const world = controller.getWorld();

        if (world.mode !== "playing") {
            autoPauseReason = null;
            renderWorld();
            return;
        }

        if (document.hidden) {
            autoPauseReason = "hidden";
            controller.pause("Paused while the tab is inactive.");
        } else if (shouldPauseForPortrait()) {
            autoPauseReason = "portrait";
            controller.pause("Rotate to landscape to continue the rescue.");
        } else if (autoPauseReason) {
            autoPauseReason = null;
            controller.resume();
        }

        renderWorld();
    }

    function handleWindowBlur() {
        const world = controller.getWorld();

        if (world.mode !== "playing") {
            return;
        }

        autoPauseReason = "blur";
        controller.pause("Paused while the tab is inactive.");
        renderWorld();
    }

    function setLane(nextLane) {
        controller.setLane(nextLane);
        renderWorld();
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
        renderWorld();
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
        feedback.primeAudio();
        controller.startRun();
        syncEnvironmentSafety();
    });

    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            introOverlay.classList.remove("active");
            gameOverOverlay.classList.remove("active");
            feedback.primeAudio();
            controller.restart();
            syncEnvironmentSafety();
        });
    }

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            feedback.toggleSound();
        });
    }

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", syncEnvironmentSafety);
    window.addEventListener("resize", syncEnvironmentSafety);
    document.addEventListener("visibilitychange", syncEnvironmentSafety);

    renderWorld();
    window.requestAnimationFrame(loop);
});
