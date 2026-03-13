(function (root) {
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
            var gameOverOverlay = options.gameOverOverlay;
            var gameOverSummary = options.gameOverSummary;
            var laneToX = options.laneToX;

            function updateHud(world) {
                var hudSnapshot = rules.buildHudSnapshot(world.runState);

                scoreValue.textContent = hudSnapshot.scoreLabel;
                livesValue.textContent = hudSnapshot.livesLabel;
                rescuedValue.textContent = hudSnapshot.rescuedLabel;
                comboValue.textContent = hudSnapshot.comboLabel;
                waveValue.textContent = world.mode === "playing" ? "Rescue Loop" : "Warm Up";
                stageStatus.textContent = world.message;

                if (world.mode === "over") {
                    gameOverOverlay.classList.add("active");
                    gameOverSummary.textContent = "Final score " + world.runState.score + " with " + world.runState.rescuedCount + " squirrels rescued.";
                } else {
                    gameOverOverlay.classList.remove("active");
                }
            }

            function drawWorld(world) {
                var horizonY = canvas.height * 0.62;
                var laneIndex;
                var laneX;
                var trampolineX;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                var sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
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

            return {
                render: function (world) {
                    updateHud(world);
                    drawWorld(world);
                }
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
