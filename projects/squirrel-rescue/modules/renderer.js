(function (root) {
    function drawFlame(ctx, x, y, size, flicker) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 1 + (flicker * 0.06));

        ctx.fillStyle = "rgba(255, 213, 108, 0.88)";
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.26);
        ctx.quadraticCurveTo(size * 0.9, -size * 0.18, 0, size * 1.1);
        ctx.quadraticCurveTo(-size * 0.9, -size * 0.18, 0, -size * 1.26);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 111, 74, 0.9)";
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.94);
        ctx.quadraticCurveTo(size * 0.56, -size * 0.12, 0, size * 0.78);
        ctx.quadraticCurveTo(-size * 0.56, -size * 0.12, 0, -size * 0.94);
        ctx.fill();
        ctx.restore();
    }

    function drawSmoke(ctx, x, y, radius, alpha) {
        ctx.fillStyle = "rgba(27, 40, 52, " + alpha + ")";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.arc(x + (radius * 0.76), y + 2, radius * 0.72, 0, Math.PI * 2);
        ctx.arc(x - (radius * 0.76), y + 4, radius * 0.82, 0, Math.PI * 2);
        ctx.fill();
    }

    function getItemPalette(type) {
        if (type === "slow-fall") {
            return {
                glow: "rgba(124, 241, 210, 0.22)",
                body: "#7cf1d2",
                accent: "#1a403a"
            };
        }

        if (type === "bonus-points") {
            return {
                glow: "rgba(255, 211, 107, 0.24)",
                body: "#ffd36b",
                accent: "#5a4206"
            };
        }

        return {
            glow: "rgba(142, 214, 255, 0.24)",
            body: "#8ed6ff",
            accent: "#173041"
        };
    }

    function drawItem(ctx, item) {
        var palette = getItemPalette(item.type);

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.spin || 0);

        ctx.fillStyle = palette.glow;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius + 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.body;
        ctx.beginPath();
        ctx.moveTo(-item.radius * 0.78, -item.radius * 0.48);
        ctx.lineTo(0, -item.radius);
        ctx.lineTo(item.radius * 0.78, -item.radius * 0.48);
        ctx.lineTo(item.radius * 0.62, item.radius * 0.7);
        ctx.lineTo(-item.radius * 0.62, item.radius * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(-item.radius * 0.26, -item.radius * 0.84, item.radius * 0.52, item.radius * 0.26);

        ctx.fillStyle = palette.accent;
        ctx.font = "800 18px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.badge || "P", 0, 2);
        ctx.restore();
    }

    root.SquirrelRescueRenderer = {
        createRenderer: function (options) {
            var canvas = options.canvas;
            var ctx = canvas.getContext("2d");
            var config = options.config;
            var rules = options.rules;
            var stageStatus = options.stageStatus;
            var scoreValue = options.scoreValue;
            var livesValue = options.livesValue;
            var rescuedValue = options.rescuedValue;
            var comboValue = options.comboValue;
            var waveValue = options.waveValue;
            var powerValue = options.powerValue;
            var bestValue = options.bestValue;
            var gameOverOverlay = options.gameOverOverlay;
            var gameOverSummary = options.gameOverSummary;
            var laneToX = options.laneToX;
            var renderTick = 0;

            function updateHud(world) {
                var hudSnapshot = rules.buildHudSnapshot(world.runState);

                scoreValue.textContent = hudSnapshot.scoreLabel;
                livesValue.textContent = hudSnapshot.livesLabel;
                rescuedValue.textContent = hudSnapshot.rescuedLabel;
                comboValue.textContent = hudSnapshot.comboLabel;
                waveValue.textContent = world.waveLabel || (world.mode === "playing" ? "Stand By" : "Stand By");
                if (powerValue) {
                    powerValue.textContent = world.powerLabel || "None";
                }
                if (bestValue) {
                    bestValue.textContent = String(world.bestScore || 0);
                }
                stageStatus.textContent = world.message;

                if (world.mode === "over") {
                    gameOverOverlay.classList.add("active");
                    gameOverSummary.textContent = "Final score " + world.runState.score + " with " + world.runState.rescuedCount + " squirrels rescued.";
                } else {
                    gameOverOverlay.classList.remove("active");
                }
            }

            function drawWorld(world) {
                var groundY = canvas.height - config.groundOffset;
                var buildingX = 22;
                var buildingTop = config.buildingTop;
                var buildingWidth = canvas.width * 0.2;
                var playLaneSpacing = config.laneCount > 1 ? laneToX(1) - laneToX(0) : 0;
                var ambulanceDockX = laneToX(config.laneCount - 1) + playLaneSpacing;
                var ambulanceX = ambulanceDockX - 124;
                var ambulanceY = groundY - 98;
                var targetLane = world.activeSquirrel ? world.activeSquirrel.targetLane : world.currentTargetLane;
                var coveredLanes = world.coveredLanes || [world.teamLane];
                var coveredStartX = laneToX(coveredLanes[0]);
                var coveredEndX = laneToX(coveredLanes[coveredLanes.length - 1]);
                var trampolineX = (coveredStartX + coveredEndX) / 2;
                var trampolineRadius = 64 + Math.max(0, (coveredEndX - coveredStartX) * 0.5);
                var trampolineLeftHandleX = coveredStartX - 30;
                var trampolineRightHandleX = coveredEndX + 30;
                var laneIndex;
                var laneX;
                var flameIndex;
                var windowRow;
                var windowCol;
                var squirrelIndex;
                var activeSquirrels = world.activeSquirrels || [];
                var activeItems = world.activeItems || [];
                var flicker = 1 + Math.sin(renderTick / 7);
                var itemIndex;
                var stageCounterLabel;
                var coveredLaneLabel = coveredLanes.length > 1
                    ? "Lane " + (coveredLanes[0] + 1) + "-" + (coveredLanes[coveredLanes.length - 1] + 1)
                    : "Lane " + (coveredLanes[0] + 1);

                renderTick += 1;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                var sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
                sky.addColorStop(0, "#6dc9ff");
                sky.addColorStop(0.42, "#3575a7");
                sky.addColorStop(1, "#102131");
                ctx.fillStyle = sky;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "rgba(255, 150, 96, 0.18)";
                ctx.fillRect(0, 0, buildingWidth + 80, groundY - 60);

                ctx.fillStyle = "#293646";
                ctx.fillRect(buildingX, buildingTop, buildingWidth, groundY - buildingTop + 18);
                ctx.fillStyle = "#1b2631";
                ctx.fillRect(buildingX + 14, buildingTop - 14, buildingWidth - 28, 18);

                for (windowRow = 0; windowRow < 7; windowRow += 1) {
                    for (windowCol = 0; windowCol < 3; windowCol += 1) {
                        ctx.fillStyle = (windowRow + windowCol) % 2 === 0 ? "#ffcc77" : "#ff8c67";
                        ctx.fillRect(
                            buildingX + 30 + (windowCol * 62),
                            buildingTop + 40 + (windowRow * 82),
                            34,
                            48
                        );
                    }
                }

                for (flameIndex = 0; flameIndex < 7; flameIndex += 1) {
                    drawFlame(
                        ctx,
                        buildingX + 40 + (flameIndex * 34),
                        buildingTop + 10 + (Math.sin((renderTick / 11) + flameIndex) * 6),
                        20 + ((flameIndex % 3) * 2),
                        flicker
                    );
                }
                drawFlame(ctx, buildingX + buildingWidth - 34, buildingTop + 84, 22, flicker + 0.4);
                drawFlame(ctx, buildingX + buildingWidth - 52, buildingTop + 230, 18, flicker - 0.2);
                drawFlame(ctx, buildingX + buildingWidth - 36, buildingTop + 384, 24, flicker + 0.3);
                drawSmoke(ctx, buildingX + 66, buildingTop - 34, 26, 0.24);
                drawSmoke(ctx, buildingX + 110, buildingTop - 52, 34, 0.18);
                drawSmoke(ctx, buildingX + 166, buildingTop - 22, 24, 0.2);

                ctx.fillStyle = "#183045";
                ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
                ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
                ctx.fillRect(0, groundY + 34, canvas.width, 6);

                ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
                ctx.lineWidth = 2;
                for (laneIndex = 0; laneIndex < config.laneCount; laneIndex += 1) {
                    laneX = laneToX(laneIndex);
                    ctx.beginPath();
                    ctx.moveTo(laneX, groundY - 280);
                    ctx.lineTo(laneX, canvas.height - 74);
                    ctx.stroke();

                    ctx.fillStyle = laneIndex === targetLane
                        ? "rgba(255, 214, 107, 0.24)"
                        : (coveredLanes.indexOf(laneIndex) >= 0 ? "rgba(142, 214, 255, 0.18)" : "rgba(255, 255, 255, 0.08)");
                    ctx.beginPath();
                    ctx.arc(laneX, canvas.height - 48, laneIndex === targetLane ? 19 : 15, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = laneIndex === targetLane ? "#0d2233" : "rgba(255, 248, 239, 0.8)";
                    ctx.font = "700 18px Outfit, sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText(String(laneIndex + 1), laneX, canvas.height - 42);
                }

                ctx.save();
                ctx.setLineDash([10, 8]);
                ctx.strokeStyle = "rgba(255, 211, 107, 0.7)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(ambulanceDockX, groundY - 280);
                ctx.lineTo(ambulanceDockX, canvas.height - 74);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = "rgba(255, 211, 107, 0.16)";
                ctx.fillRect(ambulanceDockX - 32, groundY - 280, 64, 260);
                ctx.fillStyle = "rgba(255, 211, 107, 0.26)";
                ctx.beginPath();
                ctx.arc(ambulanceDockX, canvas.height - 48, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#102033";
                ctx.font = "800 18px Outfit, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(String(config.ambulanceLaneIndex + 1), ambulanceDockX, canvas.height - 42);
                ctx.fillStyle = "rgba(255, 248, 239, 0.85)";
                ctx.font = "700 14px Manrope, sans-serif";
                ctx.fillText("AMB", ambulanceDockX, groundY - 290);

                if (typeof targetLane === "number") {
                    ctx.fillStyle = "rgba(255, 213, 107, 0.12)";
                    ctx.fillRect(laneToX(targetLane) - 26, groundY - 300, 52, 280);
                }

                ctx.fillStyle = "#f85a4f";
                ctx.fillRect(ambulanceX, ambulanceY, 214, 92);
                ctx.fillStyle = "#ffe9b6";
                ctx.fillRect(ambulanceX + 92, ambulanceY + 18, 78, 34);
                ctx.fillStyle = "#f4f7fb";
                ctx.fillRect(ambulanceX + 174, ambulanceY + 34, 28, 24);
                ctx.fillStyle = "#fff3d1";
                ctx.fillRect(ambulanceX + 16, ambulanceY + 34, 54, 12);
                ctx.fillStyle = "#f24d42";
                ctx.fillRect(ambulanceX + 36, ambulanceY + 12, 16, 52);
                ctx.fillRect(ambulanceX + 18, ambulanceY + 30, 52, 16);
                ctx.fillStyle = "#ffcf5a";
                ctx.fillRect(ambulanceX + 120, ambulanceY - 8, 38, 10);
                ctx.fillStyle = "#1a232c";
                ctx.beginPath();
                ctx.arc(ambulanceX + 56, ambulanceY + 96, 20, 0, Math.PI * 2);
                ctx.arc(ambulanceX + 162, ambulanceY + 96, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(255, 240, 183, 0.18)";
                ctx.fillRect(ambulanceX - 24, groundY - 118, 128, 90);

                for (itemIndex = 0; itemIndex < activeItems.length; itemIndex += 1) {
                    drawItem(ctx, activeItems[itemIndex]);
                }

                ctx.fillStyle = "#fff3d2";
                ctx.beginPath();
                ctx.ellipse(trampolineX, canvas.height - 104, trampolineRadius, 21, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ff8655";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(trampolineX - (trampolineRadius - 8), canvas.height - 104);
                ctx.quadraticCurveTo(trampolineX, canvas.height - 144, trampolineX + (trampolineRadius - 8), canvas.height - 104);
                ctx.stroke();

                ctx.fillStyle = "#ffd36b";
                ctx.beginPath();
                ctx.arc(trampolineLeftHandleX, canvas.height - 66, 18, 0, Math.PI * 2);
                ctx.arc(trampolineRightHandleX, canvas.height - 66, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ff8655";
                ctx.fillRect(trampolineLeftHandleX - 14, canvas.height - 86, 14, 34);
                ctx.fillRect(trampolineRightHandleX, canvas.height - 86, 14, 34);

                ctx.fillStyle = "#102033";
                ctx.font = "700 22px Outfit, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(coveredLaneLabel, trampolineX, canvas.height - 150);

                for (squirrelIndex = 0; squirrelIndex < activeSquirrels.length; squirrelIndex += 1) {
                    var squirrel = activeSquirrels[squirrelIndex];

                    ctx.fillStyle = "#ffe7b4";
                    ctx.beginPath();
                    ctx.arc(squirrel.x, squirrel.y, squirrel.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#80492d";
                    ctx.beginPath();
                    ctx.ellipse(squirrel.x - 14, squirrel.y - 10, 10, 8, 0, 0, Math.PI * 2);
                    ctx.ellipse(squirrel.x + 12, squirrel.y - 12, 9, 8, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "#b46b3b";
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(squirrel.x - 10, squirrel.y + 8);
                    ctx.quadraticCurveTo(
                        squirrel.x - 42,
                        squirrel.y + 26 + (Math.sin((renderTick / 8) + squirrel.wobbleSeed) * 8),
                        squirrel.x - 12,
                        squirrel.y + 40
                    );
                    ctx.stroke();
                }

                if (world.activeSquirrel && world.activeSquirrel.phase === "ambulance") {
                    stageCounterLabel = "Lane 8 arrival";
                } else {
                    stageCounterLabel = "Catch "
                        + Math.min(world.runState.rescueStage + 1, config.playableCatchCount)
                        + " / "
                        + config.playableCatchCount;
                }

                ctx.fillStyle = "rgba(255, 248, 239, 0.9)";
                ctx.font = "700 24px Outfit, sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(stageCounterLabel, canvas.width - 306, 56);
                ctx.font = "600 16px Manrope, sans-serif";
                ctx.fillText(activeSquirrels.length + " squirrel(s) | " + activeItems.length + " supply drop(s)", canvas.width - 306, 82);
            }

            return {
                render: function (world) {
                    updateHud(world);
                    drawWorld(world);
                }
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
