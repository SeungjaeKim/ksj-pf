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

    function readText(relativePath) {
        var fso;
        var harnessFolder;
        var normalizedPath;
        var filePath;
        var file;

        if (!isWScript) {
            return "";
        }

        fso = new ActiveXObject("Scripting.FileSystemObject");
        harnessFolder = fso.GetParentFolderName(WScript.ScriptFullName);
        normalizedPath = relativePath.replace(/\//g, "\\");
        filePath = fso.BuildPath(harnessFolder, normalizedPath);

        if (!fso.FileExists(filePath)) {
            pushResult("read " + relativePath, false, "missing file");
            return "";
        }

        file = fso.OpenTextFile(filePath, 1);
        try {
            return file.ReadAll();
        } finally {
            file.Close();
        }
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

        if (!root.SquirrelRescueEntities) {
            pushResult("entities namespace exists", false, "SquirrelRescueEntities missing");
            return false;
        }

        if (typeof root.SquirrelRescueEntities.createWorld !== "function") {
            pushResult("createWorld exists", false, "createWorld missing");
            return false;
        }

        if (typeof root.SquirrelRescueEntities.createItem !== "function") {
            pushResult("createItem exists", false, "createItem missing");
            return false;
        }

        if (!root.SquirrelRescueSession) {
            pushResult("session namespace exists", false, "SquirrelRescueSession missing");
            return false;
        }

        if (typeof root.SquirrelRescueSession.createController !== "function") {
            pushResult("createController exists", false, "createController missing");
            return false;
        }

        if (typeof root.SquirrelRescueSession.resolveDifficultyProfile !== "function") {
            pushResult("resolveDifficultyProfile exists", false, "resolveDifficultyProfile missing");
            return false;
        }

        if (typeof root.SquirrelRescueSession.resolveCatchLanes !== "function") {
            pushResult("resolveCatchLanes exists", false, "resolveCatchLanes missing");
            return false;
        }

        if (!root.SquirrelRescueRenderer) {
            pushResult("renderer namespace exists", false, "SquirrelRescueRenderer missing");
            return false;
        }

        if (typeof root.SquirrelRescueRenderer.createRenderer !== "function") {
            pushResult("createRenderer exists", false, "createRenderer missing");
            return false;
        }

        return true;
    }

    function runSmokeChecks() {
        var runState;
        var missedState;
        var catchStates = [];
        var catchIndex;
        var hudSnapshot;
        var waveCatalog;
        var waveState;
        var warmedWave;
        var completedWave;
        var activatedPowerUp;
        var expiredPowerUp;
        var blockedWrite;
        var toggledSound;
        var difficultyStart;
        var difficultyMid;
        var difficultyLate;
        var difficultyEnd;
        var singleLaneCatch;
        var wideLaneCatch;
        var edgeWideLaneCatch;
        var indexHtml;
        var asideStart;
        var asideEnd;
        var stageShellPos;
        var scoreValuePos;
        var stageHudPos;

        if (!ensureNamespaces()) {
            return;
        }

        runState = root.SquirrelRescueRules.createRunState();
        missedState = root.SquirrelRescueRules.resolveMiss({ lives: 5, combo: 3 });
        catchStates[0] = root.SquirrelRescueRules.resolveCatch(runState);
        for (catchIndex = 1; catchIndex < 8; catchIndex += 1) {
            catchStates[catchIndex] = root.SquirrelRescueRules.resolveCatch(catchStates[catchIndex - 1]);
        }
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
        difficultyStart = root.SquirrelRescueSession.resolveDifficultyProfile(root.SquirrelRescueConfig, 0);
        difficultyMid = root.SquirrelRescueSession.resolveDifficultyProfile(root.SquirrelRescueConfig, 450);
        difficultyLate = root.SquirrelRescueSession.resolveDifficultyProfile(root.SquirrelRescueConfig, 950);
        difficultyEnd = root.SquirrelRescueSession.resolveDifficultyProfile(root.SquirrelRescueConfig, 1800);
        singleLaneCatch = root.SquirrelRescueSession.resolveCatchLanes(root.SquirrelRescueConfig, 2, null);
        wideLaneCatch = root.SquirrelRescueSession.resolveCatchLanes(root.SquirrelRescueConfig, 2, "wide-trampoline");
        edgeWideLaneCatch = root.SquirrelRescueSession.resolveCatchLanes(root.SquirrelRescueConfig, 6, "wide-trampoline");
        indexHtml = readText("../index.html");
        asideStart = indexHtml.indexOf("<aside");
        asideEnd = indexHtml.indexOf("</aside>");
        stageShellPos = indexHtml.indexOf("class=\"stage-shell\"");
        scoreValuePos = indexHtml.indexOf("id=\"scoreValue\"");
        stageHudPos = indexHtml.indexOf("class=\"stage-hud\"");

        assertEqual(runState.lives, 5, "run starts with 5 lives");
        assertEqual(runState.combo, 1, "run starts with combo x1");
        assertEqual(root.SquirrelRescueConfig.laneCount, 7, "game uses 7 lanes");
        assertEqual(root.SquirrelRescueConfig.playableCatchCount, 7, "game keeps 7 playable catches");
        assertEqual(root.SquirrelRescueConfig.requiredCatches, 8, "rescue resolves on the ambulance arrival step");
        assertEqual(root.SquirrelRescueConfig.spawnIntervalMinMs, 5000, "squirrel spawn minimum is 5 seconds");
        assertEqual(root.SquirrelRescueConfig.spawnIntervalMaxMs, 7000, "squirrel spawn maximum is 7 seconds");
        assertEqual(root.SquirrelRescueConfig.itemSpawnMinMs, 10000, "item spawn minimum is 10 seconds");
        assertEqual(root.SquirrelRescueConfig.itemSpawnMaxMs, 15000, "item spawn maximum is 15 seconds");
        assertEqual(root.SquirrelRescueConfig.ambulanceLaneIndex, 7, "ambulance sits on the fixed eighth lane");
        assertEqual(missedState.lives, 4, "miss drops one life");
        assertEqual(missedState.combo, 1, "miss resets combo");
        assertEqual(catchStates[0].rescueStage, 1, "first catch moves to stage 1");
        assertEqual(catchStates[5].rescueStage, 6, "sixth catch moves to stage 6");
        assertEqual(catchStates[6].rescueStage, 7, "seventh catch enters the ambulance arrival step");
        assertEqual(catchStates[6].rescuedCount, 0, "seventh catch does not score before ambulance arrival");
        assertEqual(catchStates[7].rescueStage, 0, "eighth arrival resets stage after rescue");
        assertEqual(catchStates[7].rescuedCount, 1, "eighth arrival increments rescued count");
        assertEqual(hudSnapshot.scoreLabel, "240", "HUD score label formats value");
        assertEqual(hudSnapshot.livesLabel, "3", "HUD lives label formats value");
        assertEqual(warmedWave.activeWave.id, "quick-pickup", "wave manager seeds first wave");
        assertEqual(completedWave.activePowerUp, "wide-trampoline", "completed wave grants its reward");
        assertEqual(activatedPowerUp.activePowerUp, "wide-trampoline", "power-up activates immediately");
        assertEqual(expiredPowerUp.activePowerUp, null, "expired power-up clears itself");
        assertEqual(blockedWrite.saved, false, "storage write fallback reports blocked save");
        assertEqual(toggledSound, true, "sound toggle helper flips to enabled");
        assertEqual(difficultyStart.spawnMinMs, 5800, "opening band uses the slowest spawn floor");
        assertEqual(difficultyMid.speedMultiplier, 1.08, "second band increases speed slightly");
        assertEqual(difficultyLate.spawnMaxMs, 5400, "third band shortens the spawn ceiling");
        assertEqual(difficultyEnd.speedMultiplier, 1.24, "final band uses the fastest speed multiplier");
        assertEqual(singleLaneCatch.join(","), "2", "default trampoline covers one lane");
        assertEqual(wideLaneCatch.join(","), "2,3", "wide trampoline covers the current lane and the next lane");
        assertEqual(edgeWideLaneCatch.join(","), "5,6", "wide trampoline clamps to the final two lanes");
        assertEqual(scoreValuePos > asideEnd, true, "HUD values render outside the sidebar");
        assertEqual(stageHudPos > stageShellPos, true, "HUD container sits below the stage shell in the game card");
        assertEqual(root.SquirrelRescueInput.moveLaneByStep(2, 1, 7), 3, "right arrow moves one lane");
        assertEqual(root.SquirrelRescueInput.moveLaneByStep(0, -1, 5), 0, "lane clamps at zero");
        assertEqual(root.SquirrelRescueInput.pointerToLane(0.92, 7), 6, "pointer maps to the final lane");
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
        loadScript("../modules/entity-manager.js");
        loadScript("../modules/session-controller.js");
        loadScript("../modules/renderer.js");
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
