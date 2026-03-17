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

    function assertIncludes(text, fragment, label) {
        if (String(text).indexOf(fragment) >= 0) {
            pushResult(label, true, fragment);
            return;
        }

        pushResult(label, false, "missing fragment: " + fragment);
    }

    function printResults() {
        var allPassed = true;
        var index;
        var result;

        for (index = 0; index < results.length; index += 1) {
            result = results[index];
            if (!result.passed) {
                allPassed = false;
            }

            WScript.Echo((result.passed ? "PASS: " : "FAIL: ") + result.label + (result.details ? " (" + result.details + ")" : ""));
        }

        if (allPassed) {
            WScript.Echo("All portfolio mobile nav checks passed.");
            return;
        }

        WScript.Quit(1);
    }

    function runMarkupChecks() {
        assertIncludes(readText("../index.html"), 'data-mobile-nav-toggle', "home mobile nav toggle");
        assertIncludes(readText("../index.html"), 'href="about/index.html"', "home about link in mobile nav");
        assertIncludes(readText("../about/index.html"), 'href="index.html"', "about self link in mobile nav");
        assertIncludes(readText("../projects/index.html"), 'href="../about/index.html"', "projects about link in mobile nav");
        assertIncludes(readText("../projects/index.html"), 'data-mobile-nav-panel', "projects mobile nav panel");
        assertIncludes(readText("../index.html"), 'aria-controls=\"mobileNavPanel\"', "mobile nav aria controls");
    }

    runMarkupChecks();
    printResults();
}(this));
