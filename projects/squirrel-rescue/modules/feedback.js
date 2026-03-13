(function (root) {
    function removeAfterDelay(node, className, delayMs) {
        if (!node || !root.setTimeout) {
            return;
        }

        root.setTimeout(function () {
            node.classList.remove(className);
        }, delayMs);
    }

    root.SquirrelRescueFeedback = {
        nextSoundState: function (currentEnabled) {
            return !currentEnabled;
        },

        createController: function (options) {
            var stageShell = options.stageShell;
            var feedbackLayer = options.feedbackLayer;
            var soundToggleBtn = options.soundToggleBtn;
            var soundEnabled = true;
            var audioContext = null;

            function updateToggleLabel() {
                if (!soundToggleBtn) {
                    return;
                }

                soundToggleBtn.textContent = soundEnabled ? "Sound On" : "Sound Off";
                soundToggleBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
            }

            function ensureAudioContext() {
                var AudioContextCtor = root.AudioContext || root.webkitAudioContext;

                if (!AudioContextCtor) {
                    return null;
                }

                if (!audioContext) {
                    audioContext = new AudioContextCtor();
                }

                if (audioContext.state === "suspended" && typeof audioContext.resume === "function") {
                    audioContext.resume();
                }

                return audioContext;
            }

            function playTone(frequency, durationSeconds, type, gainAmount) {
                var context;
                var oscillator;
                var gainNode;

                if (!soundEnabled || !root.setTimeout) {
                    return;
                }

                context = ensureAudioContext();
                if (!context) {
                    return;
                }

                oscillator = context.createOscillator();
                gainNode = context.createGain();
                oscillator.type = type || "triangle";
                oscillator.frequency.value = frequency;
                gainNode.gain.value = gainAmount || 0.07;
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                oscillator.start();
                oscillator.stop(context.currentTime + durationSeconds);
            }

            function playSequence(tones) {
                var index;

                if (!tones || !tones.length) {
                    return;
                }

                for (index = 0; index < tones.length; index += 1) {
                    (function (tone, delayMs) {
                        root.setTimeout(function () {
                            playTone(tone.frequency, tone.duration, tone.type, tone.gain);
                        }, delayMs);
                    })(tones[index], tones[index].delay || 0);
                }
            }

            function flashStage(className) {
                var classNames = ["feedback-catch", "feedback-rescue", "feedback-wave", "feedback-miss", "feedback-pause"];
                var index;

                if (!stageShell) {
                    return;
                }

                for (index = 0; index < classNames.length; index += 1) {
                    stageShell.classList.remove(classNames[index]);
                }

                if (!className) {
                    return;
                }

                stageShell.classList.add(className);
                removeAfterDelay(stageShell, className, 320);
            }

            function showPop(text, variant) {
                var pill;

                if (!feedbackLayer || !root.document || !root.setTimeout || !text) {
                    return;
                }

                pill = root.document.createElement("span");
                pill.className = "feedback-pop " + variant;
                pill.textContent = text;
                feedbackLayer.appendChild(pill);
                root.setTimeout(function () {
                    if (pill.parentNode) {
                        pill.parentNode.removeChild(pill);
                    }
                }, 900);
            }

            updateToggleLabel();

            return {
                primeAudio: function () {
                    ensureAudioContext();
                },

                toggleSound: function () {
                    soundEnabled = root.SquirrelRescueFeedback.nextSoundState(soundEnabled);
                    updateToggleLabel();
                    return soundEnabled;
                },

                handleEvent: function (event) {
                    if (!event) {
                        return;
                    }

                    if (event.type === "catch") {
                        flashStage("feedback-catch");
                        showPop(event.label || "Catch", "catch");
                        playTone(780, 0.12, "triangle", 0.08);
                        return;
                    }

                    if (event.type === "rescue") {
                        flashStage("feedback-rescue");
                        showPop(event.label || "Rescue!", "rescue");
                        playSequence([
                            { frequency: 980, duration: 0.1, type: "triangle", gain: 0.08, delay: 0 },
                            { frequency: 1320, duration: 0.16, type: "triangle", gain: 0.08, delay: 90 }
                        ]);
                        return;
                    }

                    if (event.type === "wave") {
                        flashStage("feedback-wave");
                        showPop(event.label || "Power Up!", "wave");
                        playSequence([
                            { frequency: 740, duration: 0.08, type: "square", gain: 0.05, delay: 0 },
                            { frequency: 980, duration: 0.08, type: "square", gain: 0.05, delay: 80 },
                            { frequency: 1260, duration: 0.12, type: "triangle", gain: 0.06, delay: 160 }
                        ]);
                        return;
                    }

                    if (event.type === "item") {
                        flashStage("feedback-wave");
                        showPop(event.label || "Supply!", "wave");
                        playSequence([
                            { frequency: 680, duration: 0.08, type: "triangle", gain: 0.05, delay: 0 },
                            { frequency: 940, duration: 0.08, type: "triangle", gain: 0.05, delay: 80 },
                            { frequency: 1240, duration: 0.14, type: "triangle", gain: 0.06, delay: 160 }
                        ]);
                        return;
                    }

                    if (event.type === "miss") {
                        flashStage("feedback-miss");
                        showPop(event.label || "Miss!", "miss");
                        playSequence([
                            { frequency: 260, duration: 0.12, type: "square", gain: 0.06, delay: 0 },
                            { frequency: 180, duration: 0.18, type: "square", gain: 0.06, delay: 90 }
                        ]);
                        return;
                    }

                    if (event.type === "start") {
                        flashStage("feedback-rescue");
                        showPop(event.label || "Start!", "wave");
                        playSequence([
                            { frequency: 620, duration: 0.08, type: "triangle", gain: 0.06, delay: 0 },
                            { frequency: 820, duration: 0.08, type: "triangle", gain: 0.06, delay: 80 },
                            { frequency: 1120, duration: 0.14, type: "triangle", gain: 0.07, delay: 160 }
                        ]);
                        return;
                    }

                    if (event.type === "gameover") {
                        flashStage("feedback-miss");
                        showPop(event.label || "Game Over", "miss");
                        playSequence([
                            { frequency: 320, duration: 0.12, type: "sawtooth", gain: 0.05, delay: 0 },
                            { frequency: 240, duration: 0.14, type: "sawtooth", gain: 0.05, delay: 120 },
                            { frequency: 180, duration: 0.22, type: "sawtooth", gain: 0.05, delay: 260 }
                        ]);
                        return;
                    }

                    if (event.type === "pause" || event.type === "resume") {
                        flashStage("feedback-pause");
                        showPop(event.label || "Paused", "pause");
                        playTone(event.type === "pause" ? 420 : 620, 0.1, "triangle", 0.04);
                    }
                }
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
