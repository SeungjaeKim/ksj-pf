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
            pushResult(label, true, expected);
            return;
        }

        pushResult(label, false, "expected '" + expected + "' but got '" + actual + "'");
    }

    function assertArrayEqual(actual, expected, label) {
        var actualText = actual.join(",");
        var expectedText = expected.join(",");
        assertEqual(actualText, expectedText, label);
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

    function loadHelper() {
        var source = readText("../projects/live-translation/live-translation-recognition.js");
        if (!source) {
            return null;
        }

        eval(source);
        return root.LiveTranslationRecognition;
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
            WScript.Echo("All live translation recognition checks passed.");
            return;
        }

        WScript.Quit(1);
    }

    function runRecognitionChecks(helper) {
        var buffer = helper.createRecognitionBuffer();
        var applied;

        applied = helper.applyRecognitionResults(buffer, [
            { index: 0, transcript: "안녕", isFinal: true }
        ]);
        assertEqual(applied.sourceText, "안녕", "initial final transcript renders once");
        assertArrayEqual(applied.changedFinalIndexes, [0], "initial final transcript marks changed index");

        applied = helper.applyRecognitionResults(buffer, [
            { index: 0, transcript: "안녕하세요", isFinal: true }
        ]);
        assertEqual(applied.sourceText, "안녕하세요", "updated final transcript replaces prefix");
        assertArrayEqual(applied.changedFinalIndexes, [0], "updated final transcript still points to same index");

        applied = helper.applyRecognitionResults(buffer, [
            { index: 0, transcript: "안녕하세요 식사는 하셨어요?", isFinal: true }
        ]);
        assertEqual(applied.sourceText, "안녕하세요 식사는 하셨어요?", "mobile cumulative final transcript does not duplicate lines");

        applied = helper.applyRecognitionResults(buffer, [
            { index: 0, transcript: "안녕하세요 식사는 하셨어요?", isFinal: true },
            { index: 1, transcript: "반갑", isFinal: false }
        ]);
        assertEqual(applied.sourceText, "안녕하세요 식사는 하셨어요?\n반갑", "interim transcript renders after stable final transcript");

        helper.updateTranslatedSegment(buffer, 0, "안녕하세요 식사는 하셨어요?", "Hello, have you eaten?");
        assertEqual(helper.getTranslatedText(buffer), "Hello, have you eaten?", "translated transcript stores per index");
        assertEqual(helper.getTranslatedSourceTranscript(buffer, 0), "안녕하세요 식사는 하셨어요?", "translated source transcript remembers latest source text");
    }

    function runMarkupChecks() {
        var markup = readText("../projects/live-translation/index.html");
        assertEqual(markup.indexOf('live-translation-recognition.js') >= 0, true, "recognition helper script loaded in page");
    }

    var helper = loadHelper();
    if (helper) {
        runRecognitionChecks(helper);
        runMarkupChecks();
    }
    printResults();
}(this));
