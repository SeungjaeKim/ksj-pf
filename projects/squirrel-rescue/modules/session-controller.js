(function (root) {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function copyRunState(state) {
        return {
            lives: state.lives,
            combo: state.combo,
            score: state.score,
            rescueStage: state.rescueStage,
            rescuedCount: state.rescuedCount
        };
    }

    function resolveDifficultyProfile(config, score) {
        var safeConfig = config || {};
        var bands = safeConfig.difficultyBands || [];
        var profile = {
            minScore: 0,
            spawnMinMs: safeConfig.spawnIntervalMinMs || 5000,
            spawnMaxMs: safeConfig.spawnIntervalMaxMs || 7000,
            speedMultiplier: 1
        };
        var safeScore = typeof score === "number" ? score : 0;
        var index;
        var band;

        for (index = 0; index < bands.length; index += 1) {
            band = bands[index];
            if (safeScore >= (band.minScore || 0)) {
                profile = {
                    minScore: band.minScore || 0,
                    spawnMinMs: band.spawnMinMs || profile.spawnMinMs,
                    spawnMaxMs: band.spawnMaxMs || profile.spawnMaxMs,
                    speedMultiplier: band.speedMultiplier || 1
                };
            }
        }

        return profile;
    }

    function resolveCatchLanes(config, teamLane, activePowerUp) {
        var laneCount = (config && config.laneCount) || 1;
        var safeLane = clamp(typeof teamLane === "number" ? teamLane : 0, 0, laneCount - 1);

        if (activePowerUp !== "wide-trampoline" || laneCount < 2) {
            return [safeLane];
        }

        if (safeLane >= laneCount - 1) {
            return [laneCount - 2, laneCount - 1];
        }

        return [safeLane, safeLane + 1];
    }

    root.SquirrelRescueSession = {
        resolveDifficultyProfile: resolveDifficultyProfile,
        resolveCatchLanes: resolveCatchLanes,

        createController: function (options) {
            var config = options.config;
            var rules = options.rules;
            var entities = options.entities;
            var storage = options.storage;
            var laneToX = options.laneToX;
            var trampolineY = options.trampolineY;
            var world = entities.createWorld(config, storage);
            var powerUpIds = (config.powerUpDropOrder || []).slice();

            world.waveState = rules.createWaveState();
            world.waveLabel = "Stand By";
            world.powerLabel = "None";
            world.isPaused = false;
            world.feedbackEvent = null;
            world.difficultyProfile = resolveDifficultyProfile(config, 0);
            world.coveredLanes = resolveCatchLanes(config, config.initialLane, null);

            if (!powerUpIds.length) {
                powerUpIds = Object.keys(config.powerUpLabels || {});
            }

            function randomBetween(min, max) {
                return min + (Math.random() * (max - min));
            }

            function getRouteLane(index) {
                var routePattern = config.routePattern || [];

                if (!routePattern.length) {
                    return clamp(index, 0, config.laneCount - 1);
                }

                return routePattern[clamp(index, 0, routePattern.length - 1)];
            }

            function getDifficultyProfile() {
                return resolveDifficultyProfile(config, (world.runState && world.runState.score) || 0);
            }

            function syncDifficultyProfile() {
                world.difficultyProfile = getDifficultyProfile();
            }

            function getAmbulanceTargetX() {
                return laneToX(config.ambulanceLaneIndex);
            }

            function getPrimarySquirrel() {
                return world.activeSquirrels.length ? world.activeSquirrels[0] : null;
            }

            function getPowerUpLabel(powerUpId) {
                return (config.powerUpLabels && config.powerUpLabels[powerUpId]) || powerUpId;
            }

            function getPowerUpBadge(powerUpId) {
                if (powerUpId === "wide-trampoline") {
                    return "W";
                }

                if (powerUpId === "slow-fall") {
                    return "S";
                }

                if (powerUpId === "bonus-points") {
                    return "B";
                }

                return "P";
            }

            function formatPowerLabel() {
                var seconds;

                if (!world.waveState.activePowerUp) {
                    return "None";
                }

                seconds = Math.max(1, Math.ceil((world.waveState.powerUpRemainingMs || 0) / 1000));
                return getPowerUpLabel(world.waveState.activePowerUp) + " " + seconds + "s";
            }

            function formatSupplyLabel() {
                var firstItem;

                if (world.mode !== "playing") {
                    return "Stand By";
                }

                firstItem = world.activeItems[0];
                if (firstItem) {
                    return firstItem.label + " lane " + (firstItem.lane + 1);
                }

                return "Next drop " + Math.max(1, Math.ceil((world.pendingItemSpawnMs || 0) / 1000)) + "s";
            }

            function syncPrimarySquirrel() {
                world.activeSquirrel = getPrimarySquirrel();
                world.currentTargetLane = world.activeSquirrel
                    ? world.activeSquirrel.targetLane
                    : getRouteLane(0);

                if (world.runState) {
                    if (world.activeSquirrel) {
                        world.runState.rescueStage = world.activeSquirrel.phase === "ambulance"
                            ? config.playableCatchCount
                            : (world.activeSquirrel.catchCount || 0);
                    } else {
                        world.runState.rescueStage = 0;
                    }
                }
            }

            function syncCoveredLanes() {
                world.coveredLanes = resolveCatchLanes(
                    config,
                    world.teamLane,
                    world.waveState && world.waveState.activePowerUp
                );
            }

            function syncStatusLabels() {
                world.waveLabel = formatSupplyLabel();
                world.powerLabel = formatPowerLabel();
            }

            function getSpeedMultiplier() {
                return (world.difficultyProfile && world.difficultyProfile.speedMultiplier) || 1;
            }

            function getCatchWindow() {
                return world.waveState.activePowerUp === "wide-trampoline"
                    ? config.wideCatchWindow
                    : config.baseCatchWindow;
            }

            function getItemCatchWindow() {
                return getCatchWindow() + 10;
            }

            function isWithinCatchLanes(entityX, catchWindow) {
                var coveredLanes = world.coveredLanes || [world.teamLane];
                var laneIndex;

                for (laneIndex = 0; laneIndex < coveredLanes.length; laneIndex += 1) {
                    if (Math.abs(entityX - laneToX(coveredLanes[laneIndex])) <= catchWindow) {
                        return true;
                    }
                }

                return false;
            }

            function getGravity() {
                var baseGravity = world.waveState.activePowerUp === "slow-fall"
                    ? config.slowFallGravityPerFrame
                    : config.gravityPerFrame;

                return baseGravity * getSpeedMultiplier();
            }

            function getLaunchVelocityForApex(startY, gravity) {
                var apexTop = config.buildingTop + config.bounceApexTopOffset;
                var apexBottom = config.buildingTop + config.bounceApexBottomOffset;
                var targetApexY = randomBetween(apexTop, apexBottom);
                var heightDelta = Math.max(24, startY - targetApexY);

                return Math.sqrt(2 * gravity * heightDelta);
            }

            function scheduleNextSpawn() {
                syncDifficultyProfile();
                world.pendingSpawnMs = randomBetween(
                    world.difficultyProfile.spawnMinMs,
                    world.difficultyProfile.spawnMaxMs
                );
            }

            function scheduleNextItemSpawn() {
                world.pendingItemSpawnMs = randomBetween(config.itemSpawnMinMs, config.itemSpawnMaxMs);
            }

            function pickRandomPowerUpId() {
                var safeIds = powerUpIds.length ? powerUpIds : ["wide-trampoline"];
                return safeIds[Math.floor(Math.random() * safeIds.length)];
            }

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

            function createGuidedSquirrel(firstLane) {
                var speedMultiplier = getSpeedMultiplier();

                return entities.createSquirrel({
                    x: laneToX(firstLane) + config.buildingExitOffsetX,
                    y: config.spawnYOffset,
                    vx: config.spawnVelocityX * speedMultiplier,
                    vy: config.spawnVelocityY * speedMultiplier,
                    radius: config.squirrelRadius,
                    targetLane: firstLane,
                    targetX: laneToX(firstLane),
                    bounceIndex: 0,
                    catchCount: 0,
                    phase: "route",
                    wobbleSeed: Math.random() * Math.PI * 2
                });
            }

            function createDropItem(lane, powerUpId) {
                return entities.createItem({
                    x: laneToX(lane),
                    y: config.itemSpawnYOffset,
                    vx: randomBetween(-0.28, 0.28),
                    vy: config.itemFallVelocityY,
                    radius: config.itemRadius,
                    lane: lane,
                    type: powerUpId,
                    label: getPowerUpLabel(powerUpId),
                    badge: getPowerUpBadge(powerUpId),
                    spin: 0,
                    spinRate: randomBetween(0.04, 0.08)
                });
            }

            function spawnSquirrel() {
                var firstLane;

                if (world.activeSquirrels.length >= config.maxActiveSquirrels) {
                    scheduleNextSpawn();
                    return;
                }

                firstLane = getRouteLane(0);
                world.activeSquirrels.push(createGuidedSquirrel(firstLane));
                syncPrimarySquirrel();
                world.message = "A squirrel is dropping. Open the trampoline on lane " + (firstLane + 1) + ".";
                scheduleNextSpawn();
            }

            function spawnItem() {
                var powerUpId;
                var lane;
                var item;

                if (world.activeItems.length >= config.maxActiveItems) {
                    scheduleNextItemSpawn();
                    return;
                }

                powerUpId = pickRandomPowerUpId();
                lane = Math.floor(Math.random() * config.laneCount);
                item = createDropItem(lane, powerUpId);
                world.activeItems.push(item);
                world.message = item.label + " drop incoming on lane " + (lane + 1) + ". Catch it with the trampoline.";
                scheduleNextItemSpawn();
                syncStatusLabels();
            }

            function launchTowardLane(squirrel, targetLane, message) {
                var targetX = laneToX(targetLane);
                var launchStartY = trampolineY - 34;
                var gravity = getGravity();
                var maxGuidedSpeed = config.maxGuidedSpeed * getSpeedMultiplier();
                var launchVelocity = getLaunchVelocityForApex(launchStartY, gravity);

                squirrel.x = laneToX(world.teamLane);
                squirrel.y = launchStartY;
                squirrel.vy = -launchVelocity;
                squirrel.vx = clamp((targetX - squirrel.x) * 0.022, -maxGuidedSpeed, maxGuidedSpeed);
                squirrel.targetLane = targetLane;
                squirrel.targetX = targetX;
                squirrel.phase = "route";
                squirrel.wobbleSeed = Math.random() * Math.PI * 2;
                world.currentTargetLane = targetLane;
                world.message = message;
            }

            function launchTowardAmbulance(squirrel) {
                var targetX = getAmbulanceTargetX();
                var launchStartY = trampolineY - 34;
                var gravity = getGravity();
                var maxGuidedSpeed = config.maxGuidedSpeed * getSpeedMultiplier();
                var launchVelocity = getLaunchVelocityForApex(launchStartY, gravity);

                squirrel.x = laneToX(world.teamLane);
                squirrel.y = launchStartY;
                squirrel.vy = -launchVelocity;
                squirrel.vx = clamp((targetX - squirrel.x) * 0.024, -maxGuidedSpeed, maxGuidedSpeed);
                squirrel.targetLane = config.ambulanceLaneIndex;
                squirrel.targetX = targetX;
                squirrel.phase = "ambulance";
                squirrel.wobbleSeed = Math.random() * Math.PI * 2;
                world.currentTargetLane = config.ambulanceLaneIndex;
                world.message = "Catch " + config.playableCatchCount + "! Final bounce toward ambulance lane 8.";
            }

            function startRun() {
                world.mode = "playing";
                world.message = "Run started. Score makes the drop pace and speed climb.";
                world.runState = rules.createRunState();
                world.waveState = rules.createWaveState();
                world.teamLane = getRouteLane(0);
                world.currentTargetLane = getRouteLane(0);
                world.pendingSpawnMs = 0;
                world.pendingItemSpawnMs = 0;
                world.activeSquirrel = null;
                world.activeSquirrels = [];
                world.activeItems = [];
                world.isPaused = false;
                syncDifficultyProfile();
                syncCoveredLanes();
                scheduleNextItemSpawn();
                syncStatusLabels();
                emitFeedback("start", "Start!");
                spawnSquirrel();
            }

            function setLane(nextLane) {
                world.teamLane = clamp(nextLane, 0, config.laneCount - 1);
                syncCoveredLanes();
            }

            function applyCatchRules(squirrel) {
                var stagedState = copyRunState(world.runState);
                var nextState;

                stagedState.rescueStage = squirrel.catchCount || 0;
                nextState = rules.resolveCatch(stagedState);
                world.runState = nextState;
                squirrel.catchCount = nextState.rescueStage;
            }

            function applyArrivalRules(squirrel) {
                var stagedState = copyRunState(world.runState);

                stagedState.rescueStage = squirrel.catchCount || config.playableCatchCount;
                world.runState = rules.resolveCatch(stagedState);
            }

            function removeSquirrelAt(index) {
                world.activeSquirrels.splice(index, 1);
                syncPrimarySquirrel();
            }

            function removeItemAt(index) {
                world.activeItems.splice(index, 1);
                syncStatusLabels();
            }

            function activateItem(item) {
                world.waveState = rules.activatePowerUp(world.waveState, item.type, config.powerUpDurationMs);
                world.message = item.label + " is active. Keep the route alive.";
                syncCoveredLanes();
                syncStatusLabels();
                emitFeedback("item", item.label);
            }

            function handleCatch(index) {
                var squirrel = world.activeSquirrels[index];

                if (!squirrel) {
                    return;
                }

                applyCatchRules(squirrel);

                if (squirrel.catchCount >= config.requiredCatches) {
                    return;
                }

                if (squirrel.catchCount === config.playableCatchCount) {
                    launchTowardAmbulance(squirrel);
                    syncPrimarySquirrel();
                    emitFeedback("catch", "Lane 8");
                    return;
                }

                launchTowardLane(
                    squirrel,
                    getRouteLane(squirrel.catchCount),
                    "Catch " + squirrel.catchCount + " secured. Shift to lane " + (getRouteLane(squirrel.catchCount) + 1) + "."
                );
                syncPrimarySquirrel();
                emitFeedback("catch", "Catch " + squirrel.catchCount);
            }

            function handleAmbulanceArrival(index) {
                var squirrel = world.activeSquirrels[index];

                if (!squirrel) {
                    return;
                }

                applyArrivalRules(squirrel);

                if (world.waveState.activePowerUp === "bonus-points") {
                    world.runState.score += config.powerUpScoreBonus;
                }

                refreshBestScore();
                removeSquirrelAt(index);
                syncDifficultyProfile();
                world.message = "Lane 8 arrival! The squirrel lands in the ambulance.";
                syncStatusLabels();
                emitFeedback("rescue", "Ambulance!");
            }

            function handleMiss(index) {
                world.runState = rules.resolveMiss(copyRunState(world.runState));
                refreshBestScore();
                removeSquirrelAt(index);

                if (world.runState.lives <= 0) {
                    world.mode = "over";
                    world.isPaused = false;
                    world.message = "Game over. The brigade ran out of chances.";
                    world.activeSquirrel = null;
                    world.activeSquirrels = [];
                    world.activeItems = [];
                    syncStatusLabels();
                    emitFeedback("gameover", "Game Over");
                    return;
                }

                world.message = "Missed one squirrel. Hold steady, another drop is already on the way.";
                syncStatusLabels();
                emitFeedback("miss", "Miss!");
            }

            function handleItemCatch(index) {
                var item = world.activeItems[index];

                if (!item) {
                    return;
                }

                removeItemAt(index);
                activateItem(item);
            }

            function handleItemMiss(index) {
                var item = world.activeItems[index];

                if (!item) {
                    return;
                }

                removeItemAt(index);
                world.message = item.label + " slipped past the trampoline. Another supply drop will arrive soon.";
            }

            function tick(deltaMs) {
                var index;
                var squirrel;
                var item;
                var frameScale;
                var desiredVx;
                var speedMultiplier;
                var maxGuidedSpeed;
                var ambulanceTargetX = getAmbulanceTargetX();

                if (world.mode !== "playing" || world.isPaused) {
                    return world;
                }

                syncDifficultyProfile();
                world.waveState = rules.tickPowerUp(world.waveState, deltaMs);
                syncCoveredLanes();

                world.pendingSpawnMs -= deltaMs;
                if (world.pendingSpawnMs <= 0) {
                    spawnSquirrel();
                }

                world.pendingItemSpawnMs -= deltaMs;
                if (world.pendingItemSpawnMs <= 0) {
                    spawnItem();
                }

                for (index = world.activeSquirrels.length - 1; index >= 0; index -= 1) {
                    squirrel = world.activeSquirrels[index];
                    frameScale = deltaMs / 16.6667;
                    speedMultiplier = getSpeedMultiplier();
                    maxGuidedSpeed = config.maxGuidedSpeed * speedMultiplier;
                    desiredVx = clamp(
                        (squirrel.targetX - squirrel.x) * config.laneGuidanceStrength * speedMultiplier,
                        -maxGuidedSpeed,
                        maxGuidedSpeed
                    );

                    squirrel.vx += (desiredVx - squirrel.vx) * config.guidanceSmoothing * frameScale;
                    squirrel.vy += getGravity() * frameScale;
                    squirrel.x += squirrel.vx * frameScale;
                    squirrel.y += squirrel.vy * frameScale;

                    if (squirrel.phase === "ambulance") {
                        if (squirrel.vy > 0 && Math.abs(squirrel.x - ambulanceTargetX) <= 42 && squirrel.y + squirrel.radius >= trampolineY - 18) {
                            handleAmbulanceArrival(index);
                            continue;
                        }
                    } else if (squirrel.vy > 0 && squirrel.y + squirrel.radius >= trampolineY - 12) {
                        if (isWithinCatchLanes(squirrel.x, getCatchWindow())) {
                            handleCatch(index);
                            continue;
                        }
                    }

                    if (world.activeSquirrels[index] && world.activeSquirrels[index].y - world.activeSquirrels[index].radius > trampolineY + 72) {
                        handleMiss(index);
                    }
                }

                for (index = world.activeItems.length - 1; index >= 0; index -= 1) {
                    item = world.activeItems[index];
                    frameScale = deltaMs / 16.6667;

                    item.spin += item.spinRate * frameScale;
                    item.vx += (laneToX(item.lane) - item.x) * 0.004 * frameScale;
                    item.x += item.vx * frameScale;
                    item.y += item.vy * frameScale;

                    if (item.vy > 0 && item.y + item.radius >= trampolineY - 10) {
                        if (isWithinCatchLanes(item.x, getItemCatchWindow())) {
                            handleItemCatch(index);
                            continue;
                        }
                    }

                    if (world.activeItems[index] && world.activeItems[index].y - world.activeItems[index].radius > trampolineY + 76) {
                        handleItemMiss(index);
                    }
                }

                syncPrimarySquirrel();
                syncStatusLabels();
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
                    world.message = "Run resumed. Follow the next lane.";
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
