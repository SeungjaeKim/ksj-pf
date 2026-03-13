(function (root) {
    var isWScript = typeof WScript !== "undefined";
    var results = [];

    function pushResult(label, passed, details) {
        results.push({
            label: label,
            passed: passed,
            details: details || ""
        });
    }

    function assertEqual(actual, expected, label) {
        if (actual === expected) {
            pushResult(label, true, String(actual));
            return;
        }

        pushResult(label, false, "expected " + expected + ", got " + actual);
    }

    function loadScript(relativePath) {
        var fso;
        var harnessFolder;
        var normalizedPath;
        var filePath;
        var file;
        var source;

        if (!isWScript) {
            return;
        }

        fso = new ActiveXObject("Scripting.FileSystemObject");
        harnessFolder = fso.GetParentFolderName(WScript.ScriptFullName);
        normalizedPath = relativePath.replace(/\//g, "\\");
        filePath = fso.BuildPath(harnessFolder, normalizedPath);

        if (!fso.FileExists(filePath)) {
            pushResult("load " + relativePath, false, "missing file");
            return;
        }

        file = fso.OpenTextFile(filePath, 1);
        source = file.ReadAll();
        file.Close();
        (0, eval)(source);
    }

    function ensureNamespaces() {
        if (!root.SquirrelRescueConfig) {
            pushResult("config namespace exists", false, "SquirrelRescueConfig missing");
        }

        if (!root.SquirrelRescueRules) {
            pushResult("rules namespace exists", false, "SquirrelRescueRules missing");
            return false;
        }

        if (!root.SquirrelRescueStorage) {
            pushResult("storage namespace exists", false, "SquirrelRescueStorage missing");
            return false;
        }

        if (typeof root.SquirrelRescueStorage.writeBestScore !== "function") {
            pushResult("writeBestScore exists", false, "writeBestScore missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.createRunState !== "function") {
            pushResult("createRunState exists", false, "createRunState missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.resolveMiss !== "function") {
            pushResult("resolveMiss exists", false, "resolveMiss missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.resolveCatch !== "function") {
            pushResult("resolveCatch exists", false, "resolveCatch missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.buildHudSnapshot !== "function") {
            pushResult("buildHudSnapshot exists", false, "buildHudSnapshot missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.createWaveState !== "function") {
            pushResult("createWaveState exists", false, "createWaveState missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.activatePowerUp !== "function") {
            pushResult("activatePowerUp exists", false, "activatePowerUp missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.tickPowerUp !== "function") {
            pushResult("tickPowerUp exists", false, "tickPowerUp missing");
            return false;
        }

        if (!root.SquirrelRescueInput) {
            pushResult("input namespace exists", false, "SquirrelRescueInput missing");
            return false;
        }

        if (typeof root.SquirrelRescueInput.moveLaneByStep !== "function") {
            pushResult("moveLaneByStep exists", false, "moveLaneByStep missing");
            return false;
        }

        if (typeof root.SquirrelRescueInput.pointerToLane !== "function") {
            pushResult("pointerToLane exists", false, "pointerToLane missing");
            return false;
        }

        if (!root.SquirrelRescueWaveManager) {
            pushResult("wave manager namespace exists", false, "SquirrelRescueWaveManager missing");
            return false;
        }

        if (typeof root.SquirrelRescueWaveManager.getWaveCatalog !== "function") {
            pushResult("getWaveCatalog exists", false, "getWaveCatalog missing");
            return false;
        }

        if (typeof root.SquirrelRescueWaveManager.tick !== "function") {
            pushResult("wave tick exists", false, "wave manager tick missing");
            return false;
        }

        if (typeof root.SquirrelRescueWaveManager.recordRescue !== "function") {
            pushResult("recordRescue exists", false, "recordRescue missing");
            return false;
        }

        if (!root.SquirrelRescueFeedback) {
            pushResult("feedback namespace exists", false, "SquirrelRescueFeedback missing");
            return false;
        }

        if (typeof root.SquirrelRescueFeedback.nextSoundState !== "function") {
            pushResult("nextSoundState exists", false, "nextSoundState missing");
            return false;
        }

        return true;
    }

    function runSmokeChecks() {
        var runState;
        var missedState;
        var afterCatch1;
        var afterCatch2;
        var afterCatch3;
        var hudSnapshot;
        var waveCatalog;
        var waveState;
        var warmedWave;
        var completedWave;
        var activatedPowerUp;
        var expiredPowerUp;
        var blockedWrite;
        var toggledSound;

        if (!ensureNamespaces()) {
            return;
        }

        runState = root.SquirrelRescueRules.createRunState();
        missedState = root.SquirrelRescueRules.resolveMiss({ lives: 5, combo: 3 });
        afterCatch1 = root.SquirrelRescueRules.resolveCatch(runState);
        afterCatch2 = root.SquirrelRescueRules.resolveCatch(afterCatch1);
        afterCatch3 = root.SquirrelRescueRules.resolveCatch(afterCatch2);
        hudSnapshot = root.SquirrelRescueRules.buildHudSnapshot({ score: 240, lives: 3, rescuedCount: 2, combo: 4 });
        waveCatalog = root.SquirrelRescueWaveManager.getWaveCatalog(root.SquirrelRescueConfig);
        waveState = root.SquirrelRescueRules.createWaveState();
        warmedWave = root.SquirrelRescueWaveManager.tick(waveState, 16, waveCatalog, root.SquirrelRescueRules);
        completedWave = root.SquirrelRescueWaveManager.recordRescue(
            root.SquirrelRescueWaveManager.recordRescue(warmedWave, waveCatalog, root.SquirrelRescueConfig, root.SquirrelRescueRules),
            waveCatalog,
            root.SquirrelRescueConfig,
            root.SquirrelRescueRules
        );
        activatedPowerUp = root.SquirrelRescueRules.activatePowerUp({ activePowerUp: null, powerUpRemainingMs: 0 }, "wide-trampoline", 8000);
        expiredPowerUp = root.SquirrelRescueRules.tickPowerUp({ activePowerUp: "wide-trampoline", powerUpRemainingMs: 0 }, 16);
        blockedWrite = root.SquirrelRescueStorage.writeBestScore(420, function () {
            throw new Error("storage blocked");
        });
        toggledSound = root.SquirrelRescueFeedback.nextSoundState(false);

        assertEqual(runState.lives, 5, "run starts with 5 lives");
        assertEqual(runState.combo, 1, "run starts with combo x1");
        assertEqual(missedState.lives, 4, "miss drops one life");
        assertEqual(missedState.combo, 1, "miss resets combo");
        assertEqual(afterCatch1.rescueStage, 1, "first catch moves to stage 1");
        assertEqual(afterCatch2.rescueStage, 2, "second catch moves to stage 2");
        assertEqual(afterCatch3.rescueStage, 0, "third catch resets stage after rescue");
        assertEqual(afterCatch3.rescuedCount, 1, "third catch increments rescued count");
        assertEqual(hudSnapshot.scoreLabel, "240", "HUD score label formats value");
        assertEqual(hudSnapshot.livesLabel, "3", "HUD lives label formats value");
        assertEqual(warmedWave.activeWave.id, "quick-pickup", "wave manager seeds first wave");
        assertEqual(completedWave.activePowerUp, "wide-trampoline", "completed wave grants its reward");
        assertEqual(activatedPowerUp.activePowerUp, "wide-trampoline", "power-up activates immediately");
        assertEqual(expiredPowerUp.activePowerUp, null, "expired power-up clears itself");
        assertEqual(blockedWrite.saved, false, "storage write fallback reports blocked save");
        assertEqual(toggledSound, true, "sound toggle helper flips to enabled");
        assertEqual(root.SquirrelRescueInput.moveLaneByStep(2, 1, 5), 3, "right arrow moves one lane");
        assertEqual(root.SquirrelRescueInput.moveLaneByStep(0, -1, 5), 0, "lane clamps at zero");
        assertEqual(root.SquirrelRescueInput.pointerToLane(0.92, 5), 4, "pointer maps to final lane");
    }

    function renderBrowserReport() {
        var summaryText = document.getElementById("summaryText");
        var resultsList = document.getElementById("resultsList");
        var failures = 0;
        var index;
        var item;

        for (index = 0; index < results.length; index += 1) {
            if (!results[index].passed) {
                failures += 1;
            }
        }

        summaryText.textContent = failures === 0
            ? "All tests passed"
            : failures + " checks failed";

        for (index = 0; index < results.length; index += 1) {
            item = document.createElement("li");
            item.className = results[index].passed ? "pass" : "fail";
            item.textContent = (results[index].passed ? "PASS: " : "FAIL: ")
                + results[index].label
                + (results[index].details ? " (" + results[index].details + ")" : "");
            resultsList.appendChild(item);
        }
    }

    function renderWScriptReport() {
        var failures = 0;
        var index;
        var lines = [];

        for (index = 0; index < results.length; index += 1) {
            if (!results[index].passed) {
                failures += 1;
            }

            lines.push((results[index].passed ? "PASS: " : "FAIL: ")
                + results[index].label
                + (results[index].details ? " (" + results[index].details + ")" : ""));
        }

        if (!lines.length) {
            lines.push("FAIL: no tests executed");
            failures = 1;
        }

        WScript.Echo(lines.join("\n"));
        WScript.Quit(failures === 0 ? 0 : 1);
    }

    if (isWScript) {
        loadScript("../modules/config.js");
        loadScript("../modules/storage.js");
        loadScript("../modules/rules-engine.js");
        loadScript("../modules/input-controller.js");
        loadScript("../modules/wave-manager.js");
        loadScript("../modules/feedback.js");
    }

    runSmokeChecks();

    if (isWScript) {
        renderWScriptReport();
        return;
    }

    if (typeof document !== "undefined") {
        renderBrowserReport();
    }
})(typeof window !== "undefined" ? window : this);
