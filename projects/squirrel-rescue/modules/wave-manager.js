(function (root) {
    function cloneState(state) {
        var next = {};
        var key;

        for (key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                next[key] = state[key];
            }
        }

        return next;
    }

    function cloneWave(wave) {
        return {
            id: wave.id,
            label: wave.label,
            targetRescues: wave.targetRescues,
            reward: wave.reward
        };
    }

    function getCatalog(config) {
        var waves = (config && config.waveRotation) || [];
        var catalog = [];
        var index;

        for (index = 0; index < waves.length; index += 1) {
            catalog.push(cloneWave(waves[index]));
        }

        return catalog;
    }

    function pickWave(catalog, index) {
        var safeIndex;

        if (!catalog.length) {
            return null;
        }

        safeIndex = index % catalog.length;
        if (safeIndex < 0) {
            safeIndex += catalog.length;
        }

        return cloneWave(catalog[safeIndex]);
    }

    root.SquirrelRescueWaveManager = {
        getWaveCatalog: function (config) {
            return getCatalog(config);
        },

        tick: function (state, deltaMs, catalog, rules) {
            var next = rules.tickPowerUp(state || {}, deltaMs || 0);
            var sourceCatalog = catalog && catalog.length ? catalog : [];

            next.waveCooldownMs = Math.max(0, (next.waveCooldownMs || 0) - (deltaMs || 0));

            if (!next.activeWave && next.waveCooldownMs <= 0) {
                next.activeWave = pickWave(sourceCatalog, next.waveIndex || 0);
                next.waveProgress = 0;
            }

            return next;
        },

        recordRescue: function (state, catalog, config, rules) {
            var next = cloneState(state || {});
            var sourceCatalog = catalog && catalog.length ? catalog : getCatalog(config);
            var activeWave = next.activeWave || pickWave(sourceCatalog, next.waveIndex || 0);

            if (!activeWave) {
                return next;
            }

            next.activeWave = activeWave;
            next.waveProgress = (next.waveProgress || 0) + 1;

            if (next.waveProgress >= activeWave.targetRescues) {
                next = rules.activatePowerUp(next, activeWave.reward, config.powerUpDurationMs);
                next.waveIndex = ((next.waveIndex || 0) + 1) % sourceCatalog.length;
                next.activeWave = null;
                next.waveProgress = 0;
                next.waveCooldownMs = config.waveCooldownMs;
                next.completedWaveId = activeWave.id;
            }

            return next;
        },

        formatWaveLabel: function (state) {
            if (state.activeWave) {
                return state.activeWave.label + " (" + (state.waveProgress || 0) + "/" + state.activeWave.targetRescues + ")";
            }

            if (state.waveCooldownMs > 0) {
                return "Cooldown";
            }

            return "Warm Up";
        },

        formatPowerLabel: function (state, config) {
            var labels = (config && config.powerUpLabels) || {};
            var seconds;

            if (!state.activePowerUp) {
                return "None";
            }

            seconds = Math.ceil((state.powerUpRemainingMs || 0) / 1000);
            return (labels[state.activePowerUp] || state.activePowerUp) + " " + seconds + "s";
        }
    };
})(typeof window !== "undefined" ? window : this);
