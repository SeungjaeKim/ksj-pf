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

        if (typeof root.SquirrelRescueRules.createRunState !== "function") {
            pushResult("createRunState exists", false, "createRunState missing");
            return false;
        }

        if (typeof root.SquirrelRescueRules.resolveMiss !== "function") {
            pushResult("resolveMiss exists", false, "resolveMiss missing");
            return false;
        }

        return true;
    }

    function runSmokeChecks() {
        var runState;
        var missedState;

        if (!ensureNamespaces()) {
            return;
        }

        runState = root.SquirrelRescueRules.createRunState();
        missedState = root.SquirrelRescueRules.resolveMiss({ lives: 5, combo: 3 });

        assertEqual(runState.lives, 5, "run starts with 5 lives");
        assertEqual(runState.combo, 1, "run starts with combo x1");
        assertEqual(missedState.lives, 4, "miss drops one life");
        assertEqual(missedState.combo, 1, "miss resets combo");
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
