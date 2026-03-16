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

    function assertIncludes(text, fragment, label) {
        if (String(text).indexOf(fragment) >= 0) {
            pushResult(label, true, fragment);
            return;
        }

        pushResult(label, false, "missing fragment: " + fragment);
    }

    function resolvePath(relativePath) {
        var fso;
        var harnessFolder;
        var normalizedPath;

        if (!isWScript) {
            return "";
        }

        fso = new ActiveXObject("Scripting.FileSystemObject");
        harnessFolder = fso.GetParentFolderName(WScript.ScriptFullName);
        normalizedPath = relativePath.replace(/\//g, "\\");
        return fso.BuildPath(harnessFolder, normalizedPath);
    }

    function readText(relativePath) {
        var fso;
        var filePath;
        var file;

        if (!isWScript) {
            return "";
        }

        fso = new ActiveXObject("Scripting.FileSystemObject");
        filePath = resolvePath(relativePath);

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

    function loadScript(relativePath) {
        var text;

        if (!isWScript) {
            return;
        }

        text = readText(relativePath);
        if (!text) {
            pushResult("load " + relativePath, false, "missing file");
            return;
        }

        (0, eval)(text);
    }

    function assertFileExists(relativePath, label) {
        var fso;
        var filePath;

        if (!isWScript) {
            return;
        }

        fso = new ActiveXObject("Scripting.FileSystemObject");
        filePath = resolvePath(relativePath);
        pushResult(label, fso.FileExists(filePath), filePath);
    }

    function assertFileContains(relativePath, fragment, label) {
        var text = readText(relativePath);

        if (!text) {
            pushResult(label, false, "missing file");
            return;
        }

        assertIncludes(text, fragment, label);
    }

    function renderBrowserResults() {
        var summary;
        var list;
        var item;
        var index;
        var result;

        if (isWScript || !root.document) {
            return;
        }

        summary = root.document.getElementById("summaryText");
        list = root.document.getElementById("resultsList");
        list.innerHTML = "";

        for (index = 0; index < results.length; index += 1) {
            result = results[index];
            item = root.document.createElement("li");
            item.className = result.passed ? "pass" : "fail";
            item.textContent = (result.passed ? "PASS: " : "FAIL: ") + result.label + (result.details ? " (" + result.details + ")" : "");
            list.appendChild(item);
        }

        summary.textContent = results.every(function (entry) {
            return entry.passed;
        }) ? "All EduFlow Pro smoke checks passed." : "EduFlow Pro smoke checks found failures.";
    }

    function printWScriptResults() {
        var allPassed = true;
        var index;
        var result;

        if (!isWScript) {
            return;
        }

        for (index = 0; index < results.length; index += 1) {
            result = results[index];
            if (!result.passed) {
                allPassed = false;
            }

            WScript.Echo((result.passed ? "PASS: " : "FAIL: ") + result.label + (result.details ? " (" + result.details + ")" : ""));
        }

        if (allPassed) {
            WScript.Echo("All EduFlow Pro smoke checks passed.");
            return;
        }

        WScript.Quit(1);
    }

    function runShellChecks() {
        assertFileExists("../index.html", "landing file exists");
        assertFileExists("../admin.html", "admin file exists");
        assertFileContains("../index.html", 'data-surface="landing"', "landing surface tag");
        assertFileContains("../admin.html", 'data-surface="admin"', "admin surface tag");
        assertFileContains("../portal.html", 'data-surface="portal"', "portal surface tag");
        assertFileContains("../mobile.html", 'data-surface="mobile"', "mobile surface tag");
    }

    function runDataChecks() {
        loadScript("../modules/sample-data.js");
        loadScript("../modules/state-store.js");
        loadScript("../modules/metrics.js");

        if (!root.EduFlowData) {
            pushResult("EduFlowData namespace exists", false, "EduFlowData missing");
            return;
        }

        if (!root.EduFlowState) {
            pushResult("EduFlowState namespace exists", false, "EduFlowState missing");
            return;
        }

        if (!root.EduFlowMetrics) {
            pushResult("EduFlowMetrics namespace exists", false, "EduFlowMetrics missing");
            return;
        }

        assertEqual(root.EduFlowData.getAcademy().name, "Apex Admissions Lab", "academy name");
        assertEqual(root.EduFlowData.getBranches().length, 3, "three branches loaded");
        assertEqual(root.EduFlowMetrics.getCrmSnapshot(root.EduFlowData.snapshot()).stages.length, 6, "crm stage count");
        assertEqual(root.EduFlowMetrics.getOwnerKpis(root.EduFlowData.snapshot()).cards.length, 5, "owner KPI card count");
    }

    runShellChecks();
    runDataChecks();
    printWScriptResults();
    renderBrowserResults();
}(this));
