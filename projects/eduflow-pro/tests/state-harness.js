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

        try {
            (0, eval)(text);
        } catch (error) {
            pushResult("load " + relativePath, false, error.message || String(error));
        }
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

        assertEqual(root.EduFlowData.getAcademy().name, "\uC5D0\uC774\uD399\uC2A4 \uC785\uC2DC\uC804\uB7B5 \uD559\uC6D0", "academy name");
        assertEqual(root.EduFlowData.getBranches().length, 3, "three branches loaded");
        assertEqual(root.EduFlowMetrics.getCrmSnapshot(root.EduFlowData.snapshot()).stages.length, 6, "crm stage count");
        assertEqual(root.EduFlowMetrics.getOwnerKpis(root.EduFlowData.snapshot()).cards.length, 5, "owner KPI card count");
    }

    function runLandingChecks() {
        loadScript("../modules/landing-view.js");
        assertFileContains("../index.html", 'id="landingHero"', "landing hero section");
        assertFileContains("../index.html", 'data-cta-target="admin"', "admin CTA exists");
        assertFileContains("../index.html", 'data-cta-target="portal"', "portal CTA exists");

        if (!root.EduFlowLandingView) {
            pushResult("EduFlowLandingView namespace exists", false, "EduFlowLandingView missing");
            return;
        }

        assertIncludes(root.EduFlowLandingView.renderPreviewStats(root.EduFlowData.snapshot()), "\uBB38\uC758 \uB300\uBE44 \uB4F1\uB85D \uC804\uD658\uC728", "landing preview stats copy");
    }

    function runAdminShellChecks() {
        var crmHtml;

        loadScript("../modules/admin-view.js");
        if (!root.EduFlowAdminView) {
            pushResult("EduFlowAdminView namespace exists", false, "EduFlowAdminView missing");
            return;
        }

        crmHtml = root.EduFlowAdminView.renderCrmBoard(root.EduFlowData.snapshot(), root.EduFlowState.createStore());
        assertIncludes(crmHtml, "\uBB38\uC758 \uC811\uC218", "crm stage heading");
        assertIncludes(crmHtml, "\uCCB4\uD5D8 \uC644\uB8CC", "trial completed heading");
        assertIncludes(crmHtml, "\uCD5C\uBBFC\uC11C", "featured lead card");
    }

    function runConversionChecks() {
        var store = root.EduFlowState.createStore();

        if (typeof root.EduFlowState.convertLead !== "function") {
            pushResult("convertLead exists", false, "convertLead missing");
            return;
        }

        if (typeof root.EduFlowState.getLinkedStudentId !== "function") {
            pushResult("getLinkedStudentId exists", false, "getLinkedStudentId missing");
            return;
        }

        if (typeof root.EduFlowState.getDraftInvoice !== "function") {
            pushResult("getDraftInvoice exists", false, "getDraftInvoice missing");
            return;
        }

        if (typeof root.EduFlowState.getLeadStage !== "function") {
            pushResult("getLeadStage exists", false, "getLeadStage missing");
            return;
        }

        root.EduFlowState.convertLead(store, "lead-minseo");
        assertEqual(root.EduFlowState.getLinkedStudentId(store, "lead-minseo"), "student-minseo", "student record created");
        assertEqual(root.EduFlowState.getDraftInvoice(store, "student-minseo").status, "pending", "invoice draft created");
        assertEqual(root.EduFlowState.getLeadStage(store, "lead-minseo"), "enrolled", "lead moved to enrolled stage");
    }

    function runAdminOperationsChecks() {
        var store = root.EduFlowState.createStore();
        var dashboardHtml;
        var studentHtml;
        var paymentHtml;
        var reportHtml;

        if (!root.EduFlowAdminView) {
            pushResult("EduFlowAdminView namespace for operations", false, "EduFlowAdminView missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderOwnerDashboard !== "function") {
            pushResult("renderOwnerDashboard exists", false, "renderOwnerDashboard missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderStudentDetail !== "function") {
            pushResult("renderStudentDetail exists", false, "renderStudentDetail missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderPaymentCenter !== "function") {
            pushResult("renderPaymentCenter exists", false, "renderPaymentCenter missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderReportEditor !== "function") {
            pushResult("renderReportEditor exists", false, "renderReportEditor missing");
            return;
        }

        dashboardHtml = root.EduFlowAdminView.renderOwnerDashboard(root.EduFlowData.snapshot(), store);
        studentHtml = root.EduFlowAdminView.renderStudentDetail(root.EduFlowData.snapshot(), store, "student-minseo");
        paymentHtml = root.EduFlowAdminView.renderPaymentCenter(root.EduFlowData.snapshot(), store);
        reportHtml = root.EduFlowAdminView.renderReportEditor(root.EduFlowData.snapshot(), store, "student-minseo");

        assertIncludes(dashboardHtml, "\uC624\uB298 \uC2E0\uADDC \uBB38\uC758", "dashboard KPI label");
        assertIncludes(studentHtml, "\uBAA9\uD45C \uD559\uAD50/\uD2B8\uB799", "student 360 goal block");
        assertIncludes(paymentHtml, "\uBBF8\uB0A9 \uAD00\uB9AC", "payment overdue block");
        assertIncludes(reportHtml, "AI \uCD08\uC548 \uC0DD\uC131", "report editor AI draft button");
    }

    function runAdminSecondaryChecks() {
        if (!root.EduFlowAdminView) {
            pushResult("EduFlowAdminView namespace for secondary views", false, "EduFlowAdminView missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderAttendanceView !== "function") {
            pushResult("renderAttendanceView exists", false, "renderAttendanceView missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderTimetableView !== "function") {
            pushResult("renderTimetableView exists", false, "renderTimetableView missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderAnalyticsView !== "function") {
            pushResult("renderAnalyticsView exists", false, "renderAnalyticsView missing");
            return;
        }

        if (typeof root.EduFlowAdminView.renderBranchView !== "function") {
            pushResult("renderBranchView exists", false, "renderBranchView missing");
            return;
        }

        assertIncludes(root.EduFlowAdminView.renderAttendanceView(root.EduFlowData.snapshot(), root.EduFlowState.createStore()), "\uACB0\uC11D", "attendance status label");
        assertIncludes(root.EduFlowAdminView.renderTimetableView(root.EduFlowData.snapshot(), root.EduFlowState.createStore()), "\uAC15\uB0A8 \uBCF8\uC6D0", "timetable branch label");
        assertIncludes(root.EduFlowAdminView.renderAnalyticsView(root.EduFlowData.snapshot(), root.EduFlowState.createStore()), "\uB4F1\uB85D \uC804\uD658\uC728", "analytics metric");
        assertIncludes(root.EduFlowAdminView.renderBranchView(root.EduFlowData.snapshot(), root.EduFlowState.createStore()), "\uB300\uCE58 \uCEA0\uD37C\uC2A4", "branch comparison row");
    }

    function runPortalChecks() {
        var store = root.EduFlowState.createStore();
        var portalHome;
        var reportDetail;

        loadScript("../modules/portal-view.js");

        if (!root.EduFlowPortalView) {
            pushResult("EduFlowPortalView namespace exists", false, "EduFlowPortalView missing");
            return;
        }

        portalHome = root.EduFlowPortalView.renderPortalHome(root.EduFlowData.snapshot(), store, "student-minseo");
        reportDetail = root.EduFlowPortalView.renderReportDetail(root.EduFlowData.snapshot(), store, "student-minseo");

        assertIncludes(portalHome, "\uC624\uB298 \uC218\uC5C5", "portal home card");
        assertIncludes(portalHome, "\uC0C1\uB2F4 \uC608\uC57D", "portal booking CTA");
        assertIncludes(reportDetail, "\uAC15\uC0AC \uCF54\uBA58\uD2B8", "report detail teacher comment block");
        assertIncludes(reportDetail, "\uB2E4\uC74C \uC8FC \uC9D1\uC911 \uD3EC\uC778\uD2B8", "report detail next focus block");
    }

    runShellChecks();
    runDataChecks();
    runLandingChecks();
    runAdminShellChecks();
    runConversionChecks();
    runAdminOperationsChecks();
    runAdminSecondaryChecks();
    runPortalChecks();
    printWScriptResults();
    renderBrowserResults();
}(this));
