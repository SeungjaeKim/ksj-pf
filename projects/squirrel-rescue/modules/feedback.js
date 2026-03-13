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

            function playTone(frequency, durationSeconds) {
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
                oscillator.type = "sine";
                oscillator.frequency.value = frequency;
                gainNode.gain.value = 0.045;
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                oscillator.start();
                oscillator.stop(context.currentTime + durationSeconds);
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
                        playTone(620, 0.11);
                        return;
                    }

                    if (event.type === "rescue") {
                        flashStage("feedback-rescue");
                        showPop(event.label || "Rescue!", "rescue");
                        playTone(760, 0.13);
                        return;
                    }

                    if (event.type === "wave") {
                        flashStage("feedback-wave");
                        showPop(event.label || "Power Up!", "wave");
                        playTone(920, 0.15);
                        return;
                    }

                    if (event.type === "miss") {
                        flashStage("feedback-miss");
                        showPop(event.label || "Miss!", "miss");
                        playTone(220, 0.16);
                        return;
                    }

                    if (event.type === "pause" || event.type === "resume") {
                        flashStage("feedback-pause");
                        showPop(event.label || "Paused", "pause");
                    }
                }
            };
        }
    };
})(typeof window !== "undefined" ? window : this);
