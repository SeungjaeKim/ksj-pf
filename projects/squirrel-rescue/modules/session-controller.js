(function (root) {
    root.SquirrelRescueSession = {
        createController: function (options) {
            var config = options.config;
            var rules = options.rules;
            var entities = options.entities;
            var storage = options.storage;
            var waveManager = options.waveManager;
            var laneToX = options.laneToX;
            var trampolineY = options.trampolineY;
            var world = entities.createWorld(config, storage);
            var waveCatalog = waveManager ? waveManager.getWaveCatalog(config) : [];

            world.waveState = rules.createWaveState();
            world.waveLabel = "Warm Up";
            world.powerLabel = "None";
            world.isPaused = false;
            world.feedbackEvent = null;

            function refreshBestScore() {
                var saveResult;

                if (world.runState.score > world.bestScore) {
                    world.bestScore = world.runState.score;
                    if (storage && typeof storage.writeBestScore === "function") {
                        saveResult = storage.writeBestScore(world.bestScore);
                        world.bestScore = saveResult.bestScore;
                    }
                }
            }

            function emitFeedback(type, label) {
                world.feedbackEvent = {
                    type: type,
                    label: label
                };
            }

            function syncWavePresentation() {
                if (!waveManager) {
                    world.waveLabel = world.mode === "playing" ? "Rescue Loop" : "Warm Up";
                    world.powerLabel = "None";
                    return;
                }

                world.waveLabel = waveManager.formatWaveLabel(world.waveState);
                world.powerLabel = waveManager.formatPowerLabel(world.waveState, config);
            }

            function queueNextSquirrel(delayMs) {
                world.activeSquirrel = null;
                world.pendingSpawnMs = delayMs;
            }

            function spawnSquirrel() {
                world.activeSquirrel = entities.createSquirrel();
                world.message = "Incoming squirrel. Guide it across three catches.";
                world.pendingSpawnMs = 0;
            }

            function startRun() {
                world.mode = "playing";
                world.message = "Run started. Catch each squirrel three times.";
                world.runState = rules.createRunState();
                world.waveState = rules.createWaveState();
                world.teamLane = config.initialLane;
                world.pendingSpawnMs = 0;
                world.activeSquirrel = null;
                world.isPaused = false;
                if (waveManager) {
                    world.waveState = waveManager.tick(world.waveState, 0, waveCatalog, rules);
                }
                syncWavePresentation();
                emitFeedback("resume", "Rescue!");
                spawnSquirrel();
            }

            function setLane(nextLane) {
                world.teamLane = Math.max(0, Math.min(config.laneCount - 1, nextLane));
            }

            function handleCatch() {
                var stageAfterCatch;
                var bounceBoost;
                var completedWaveId;
                var squirrel = world.activeSquirrel;

                world.runState = rules.resolveCatch(world.runState);
                stageAfterCatch = world.runState.rescueStage;

                if (stageAfterCatch === 0) {
                    if (world.waveState.activePowerUp === "bonus-points") {
                        world.runState.score += config.powerUpScoreBonus;
                    }
                    if (waveManager) {
                        world.waveState = waveManager.recordRescue(world.waveState, waveCatalog, config, rules);
                        syncWavePresentation();
                    }
                    completedWaveId = world.waveState.completedWaveId;
                    refreshBestScore();
                    if (completedWaveId) {
                        world.message = world.powerLabel + " active. Prepare for the next drop.";
                        emitFeedback("wave", world.powerLabel);
                        world.waveState.completedWaveId = null;
                    } else {
                        world.message = "Squirrel rescued. Prepare for the next drop.";
                        emitFeedback("rescue", "Rescue!");
                    }
                    queueNextSquirrel(680);
                    return;
                }

                bounceBoost = stageAfterCatch === 1 ? -6.6 : -5.7;
                squirrel.x = laneToX(world.teamLane);
                squirrel.y = trampolineY - 26;
                squirrel.vx = 2.8 + (stageAfterCatch * 0.55);
                squirrel.vy = bounceBoost;
                world.message = "Catch " + stageAfterCatch + " confirmed. Keep the chain alive.";
                emitFeedback("catch", "Catch " + stageAfterCatch);
            }

            function handleMiss() {
                world.runState = rules.resolveMiss(world.runState);
                refreshBestScore();
                emitFeedback("miss", "Miss!");

                if (world.runState.lives <= 0) {
                    world.mode = "over";
                    world.isPaused = false;
                    world.message = "Run over after the fifth miss.";
                    world.activeSquirrel = null;
                    syncWavePresentation();
                    return;
                }

                world.message = "Missed squirrel. Recover before the next drop.";
                queueNextSquirrel(820);
            }

            function tick(deltaMs) {
                var squirrel;
                var frameScale;
                var laneCenter;
                var catchWindow;
                var gravity;

                if (world.mode !== "playing" || world.isPaused) {
                    return world;
                }

                if (waveManager) {
                    world.waveState = waveManager.tick(world.waveState, deltaMs, waveCatalog, rules);
                    syncWavePresentation();
                }

                if (!world.activeSquirrel) {
                    world.pendingSpawnMs -= deltaMs;
                    if (world.pendingSpawnMs <= 0) {
                        spawnSquirrel();
                    }
                    return world;
                }

                squirrel = world.activeSquirrel;
                frameScale = deltaMs / 16.6667;
                gravity = world.waveState.activePowerUp === "slow-fall"
                    ? config.slowFallGravityPerFrame
                    : config.gravityPerFrame;
                catchWindow = world.waveState.activePowerUp === "wide-trampoline"
                    ? config.wideCatchWindow
                    : config.baseCatchWindow;
                squirrel.vy += gravity * frameScale;
                squirrel.x += squirrel.vx * frameScale;
                squirrel.y += squirrel.vy * frameScale;
                laneCenter = laneToX(world.teamLane);

                if (squirrel.vy > 0 && squirrel.y + squirrel.radius >= trampolineY - 10) {
                    if (Math.abs(squirrel.x - laneCenter) <= catchWindow) {
                        handleCatch();
                    }
                }

                if (world.activeSquirrel && world.activeSquirrel.y - world.activeSquirrel.radius > trampolineY + 60) {
                    handleMiss();
                }

                return world;
            }

            return {
                getWorld: function () {
                    return world;
                },
                setLane: setLane,
                startRun: startRun,
                restart: startRun,
                tick: tick,
                pause: function (reason) {
                    if (world.mode !== "playing" || world.isPaused) {
                        return;
                    }

                    world.isPaused = true;
                    world.message = reason || "Run paused.";
                    emitFeedback("pause", "Paused");
                },
                resume: function () {
                    if (world.mode !== "playing" || !world.isPaused) {
                        return;
                    }

                    world.isPaused = false;
                    world.message = "Run resumed. Keep the chain alive.";
                    emitFeedback("resume", "Resume");
                },
                consumeFeedbackEvent: function () {
                    var event = world.feedbackEvent;
                    world.feedbackEvent = null;
                    return event;
                }
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
