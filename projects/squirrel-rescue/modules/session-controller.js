(function (root) {
    root.SquirrelRescueSession = {
        createController: function (options) {
            var config = options.config;
            var rules = options.rules;
            var entities = options.entities;
            var storage = options.storage;
            var laneToX = options.laneToX;
            var trampolineY = options.trampolineY;
            var world = entities.createWorld(config, storage);

            function refreshBestScore() {
                if (world.runState.score > world.bestScore) {
                    world.bestScore = world.runState.score;
                }
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
                world.teamLane = config.initialLane;
                world.pendingSpawnMs = 0;
                world.activeSquirrel = null;
                spawnSquirrel();
            }

            function setLane(nextLane) {
                world.teamLane = Math.max(0, Math.min(config.laneCount - 1, nextLane));
            }

            function handleCatch() {
                var stageAfterCatch;
                var bounceBoost;
                var squirrel = world.activeSquirrel;

                world.runState = rules.resolveCatch(world.runState);
                stageAfterCatch = world.runState.rescueStage;

                if (stageAfterCatch === 0) {
                    refreshBestScore();
                    world.message = "Squirrel rescued. Prepare for the next drop.";
                    queueNextSquirrel(680);
                    return;
                }

                bounceBoost = stageAfterCatch === 1 ? -6.6 : -5.7;
                squirrel.x = laneToX(world.teamLane);
                squirrel.y = trampolineY - 26;
                squirrel.vx = 2.8 + (stageAfterCatch * 0.55);
                squirrel.vy = bounceBoost;
                world.message = "Catch " + stageAfterCatch + " confirmed. Keep the chain alive.";
            }

            function handleMiss() {
                world.runState = rules.resolveMiss(world.runState);
                refreshBestScore();

                if (world.runState.lives <= 0) {
                    world.mode = "over";
                    world.message = "Run over after the fifth miss.";
                    world.activeSquirrel = null;
                    return;
                }

                world.message = "Missed squirrel. Recover before the next drop.";
                queueNextSquirrel(820);
            }

            function tick(deltaMs) {
                var squirrel;
                var frameScale;
                var laneCenter;

                if (world.mode !== "playing") {
                    return world;
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
                squirrel.vy += 0.17 * frameScale;
                squirrel.x += squirrel.vx * frameScale;
                squirrel.y += squirrel.vy * frameScale;
                laneCenter = laneToX(world.teamLane);

                if (squirrel.vy > 0 && squirrel.y + squirrel.radius >= trampolineY - 10) {
                    if (Math.abs(squirrel.x - laneCenter) <= 64) {
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
                tick: tick
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
