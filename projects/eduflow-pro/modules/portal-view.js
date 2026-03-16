(function (root) {
    function findStudent(snapshot, studentId) {
        var index;

        for (index = 0; index < snapshot.students.length; index += 1) {
            if (snapshot.students[index].id === studentId) {
                return snapshot.students[index];
            }
        }

        return snapshot.students[0];
    }

    function findBranchName(snapshot, branchId) {
        var index;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            if (snapshot.branches[index].id === branchId) {
                return snapshot.branches[index].name;
            }
        }

        return snapshot.branches[0].name;
    }

    function renderPortalTabs(activeView) {
        function renderTab(label, viewId) {
            var activeClass = activeView === viewId ? " is-active" : "";
            return '<button type="button" class="portal-tab' + activeClass + '" data-portal-view="' + viewId + '">' + label + "</button>";
        }

        return "" +
            '<div class="portal-nav">' +
                renderTab("\uD648", "home") +
                renderTab("\uB9AC\uD3EC\uD2B8", "report") +
                renderTab("\uACB0\uC81C", "payments") +
                renderTab("\uC2DC\uAC04\uD45C", "timetable") +
                renderTab("\uC219\uC81C", "homework") +
                renderTab("\uACF5\uC9C0", "notices") +
                renderTab("\uC0C1\uB2F4 \uC608\uC57D", "booking") +
            "</div>";
    }

    function renderPortalHome(snapshot, store, studentId) {
        var student = findStudent(snapshot, studentId);
        var summary = root.EduFlowMetrics.getPortalSummary(snapshot, store, studentId);

        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero">' +
                    '<div><span class="panel-label">\uD559\uBD80\uBAA8 \uD3EC\uD138</span><h1>' + student.name + ' \uD559\uC0DD \uC694\uC57D</h1><p>\uCD9C\uACB0, \uC218\uC5C5, \uB9AC\uD3EC\uD2B8, \uACB0\uC81C \uC0C1\uD0DC\uB97C \uD55C\uBC88\uC5D0 \uD655\uC778\uD569\uB2C8\uB2E4.</p></div>' +
                    '<div class="portal-highlight"><span class="panel-label">\uC9C0\uC810</span><strong>' + findBranchName(snapshot, store.currentBranchId) + '</strong></div>' +
                "</div>" +
                '<div class="portal-grid">' +
                    '<article class="portal-card"><span class="panel-label">\uC624\uB298 \uC218\uC5C5</span><strong>\uACE02 \uC0AC\uD0D0 \uCEE8\uC124\uD305</strong><p>19:00 | \uCEE8\uC124\uD305\uC2E4 2 | \uCD9C\uC11D \uC608\uC815</p></article>' +
                    '<article class="portal-card"><span class="panel-label">\uCD5C\uADFC \uCD9C\uACB0</span><strong>\uC815\uC0C1 \uCD9C\uC11D</strong><p>\uC9C0\uB09C 2\uC8FC \uAE30\uC900 \uACB0\uC11D \uC5C6\uC74C, \uC9C0\uAC01 1\uD68C</p></article>' +
                    '<article class="portal-card"><span class="panel-label">\uD559\uC2B5 \uB9AC\uD3EC\uD2B8</span><strong>' + summary.reportState + '</strong><p>\uAC15\uC0AC \uCF54\uBA58\uD2B8\uC640 \uB2E4\uC74C \uC8FC \uD3EC\uC778\uD2B8\uB97C \uD655\uC778\uD558\uC138\uC694.</p></article>' +
                    '<article class="portal-card"><span class="panel-label">\uACB0\uC81C \uC0C1\uD0DC</span><strong>\uB0A9\uBD80 \uC608\uC815 890,000\uC6D0</strong><p>\uB9D0\uC77C \uCCAD\uAD6C \uAE30\uC900 | \uBBF8\uB0A9 \uC5C6\uC74C</p></article>' +
                "</div>" +
                '<div class="portal-grid portal-grid-wide">' +
                    '<article class="portal-card portal-wide-card"><span class="panel-label">\uCD5C\uADFC \uCF54\uBA58\uD2B8</span><strong>\uAC15\uC0AC \uCF54\uBA58\uD2B8</strong><p>\uB17C\uC220 \uAD6C\uC131\uC774 \uD55C \uC8FC \uC0AC\uC774 \uD55C\uCE35 \uC548\uC815\uB418\uC5C8\uACE0, \uADFC\uAC70 \uC81C\uC2DC \uC18D\uB3C4\uB3C4 \uC88B\uC544\uC84C\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article class="portal-card portal-wide-card"><span class="panel-label">\uC0C1\uB2F4 \uC608\uC57D</span><strong>\uC0C1\uB2F4 \uC608\uC57D</strong><p>' + summary.bookingText + '</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderReportDetail(snapshot, store, studentId) {
        var student = findStudent(snapshot, studentId);
        var reportState = store.publishedReports[studentId] ? "\uBC1C\uD589 \uC644\uB8CC" : "\uC791\uC131 \uC911";

        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero">' +
                    '<div><span class="panel-label">\uD559\uC2B5 \uB9AC\uD3EC\uD2B8</span><h1>' + student.name + ' \uC8FC\uAC04 \uB9AC\uD3EC\uD2B8</h1><p>\uC218\uC5C5 \uC9C4\uB3C4, \uCF54\uBA58\uD2B8, \uB2E4\uC74C \uC8FC \uD559\uC2B5 \uD3EC\uC778\uD2B8\uB97C \uC815\uB9AC\uD569\uB2C8\uB2E4.</p></div>' +
                    '<div class="portal-highlight"><span class="panel-label">\uC0C1\uD0DC</span><strong>' + reportState + '</strong></div>' +
                "</div>" +
                '<div class="portal-grid portal-grid-wide">' +
                    '<article class="portal-card portal-wide-card"><span class="panel-label">\uAC15\uC0AC \uCF54\uBA58\uD2B8</span><strong>\uAC15\uC0AC \uCF54\uBA58\uD2B8</strong><p>\uCEE8\uC124\uD305 \uBAA8\uC758 \uBA74\uB2F4\uC5D0\uC11C \uC790\uC2E0\uC758 \uADFC\uAC70\uB97C \uB354 \uBB85\uD655\uD558\uAC8C \uC81C\uC2DC\uD588\uACE0, \uC0AC\uD68C\uD0D0\uAD6C \uB17C\uC220 \uAD6C\uC870\uAC00 \uC548\uC815\uC801\uC73C\uB85C \uC815\uB9AC\uB418\uACE0 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article class="portal-card portal-wide-card"><span class="panel-label">\uB2E4\uC74C \uC8FC \uC9D1\uC911 \uD3EC\uC778\uD2B8</span><strong>\uB2E4\uC74C \uC8FC \uC9D1\uC911 \uD3EC\uC778\uD2B8</strong><p>\uC0AC\uD68C\uD0D0\uAD6C \uC57D\uC810 \uB2E8\uC6D0 \uBCF5\uC2B5, \uB17C\uC220 \uC11C\uB860 \uAD6C\uC131 \uC18D\uB3C4 \uAC15\uD654, \uD559\uC0DD\uBD80 \uAE30\uB85D \uC694\uC18C \uC815\uB9AC\uAC00 \uD575\uC2EC\uC785\uB2C8\uB2E4.</p></article>' +
                "</div>" +
                '<div class="portal-grid">' +
                    '<article class="portal-card"><span class="panel-label">\uC219\uC81C \uC9C4\uD589</span><strong>4 / 5 \uC644\uB8CC</strong><p>\uC778\uBB38 \uB17C\uC220 \uCD08\uC548\uB9CC \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article class="portal-card"><span class="panel-label">\uC131\uC801 \uD750\uB984</span><strong>\uC0AC\uD68C 2.4 \u2192 1.9</strong><p>\uCD5C\uADFC 3\uD68C \uC2DC\uD5D8 \uAE30\uC900 \uC0C1\uC2B9 \uD750\uB984</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderPaymentView() {
        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero"><div><span class="panel-label">\uACB0\uC81C \uB0B4\uC5ED</span><h1>\uC218\uB0A9 \uD604\uD669</h1><p>\uCCAD\uAD6C \uB0B4\uC5ED, \uB0A9\uBD80 \uC774\uB825, \uD560\uC778 \uC801\uC6A9 \uB0B4\uC5ED\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.</p></div></div>' +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uC6D4</span><span>\uB0B4\uC5ED</span><span>\uC0C1\uD0DC</span><span>\uBE44\uACE0</span></div>' +
                    '<div class="data-row"><span>2026-03</span><span>\uC6D4 \uC218\uAC15\uB8CC 890,000\uC6D0</span><span class="status-pill status-warn">\uB0A9\uBD80 \uC608\uC815</span><span>\uB9D0\uC77C \uCCAD\uAD6C</span></div>' +
                    '<div class="data-row"><span>2026-02</span><span>\uC6D4 \uC218\uAC15\uB8CC 890,000\uC6D0</span><span class="status-pill status-ok">\uB0A9\uBD80 \uC644\uB8CC</span><span>\uCE74\uB4DC \uACB0\uC81C</span></div>' +
                "</div>" +
            "</section>";
    }

    function renderTimetableView() {
        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero"><div><span class="panel-label">\uC2DC\uAC04\uD45C</span><h1>\uAC1C\uC778 \uC2DC\uAC04\uD45C</h1><p>\uC815\uADDC \uC218\uC5C5, \uBCF4\uAC15, \uC0C1\uB2F4 \uC77C\uC815\uC744 \uD568\uAED8 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.</p></div></div>' +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uC694\uC77C</span><span>\uC2DC\uAC04</span><span>\uC218\uC5C5</span><span>\uBE44\uACE0</span></div>' +
                    '<div class="data-row"><span>\uD654\uC694\uC77C</span><span>19:00</span><span>\uACE02 \uC0AC\uD0D0 \uCEE8\uC124\uD305</span><span>\uCEE8\uC124\uD305\uC2E4 2</span></div>' +
                    '<div class="data-row"><span>\uBAA9\uC694\uC77C</span><span>20:00</span><span>\uB17C\uC220 \uC2EC\uD654</span><span>\uB9AC\uD3EC\uD2B8 \uC81C\uCD9C \uD3EC\uD568</span></div>' +
                "</div>" +
            "</section>";
    }

    function renderHomeworkView() {
        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero"><div><span class="panel-label">\uC219\uC81C</span><h1>\uACFC\uC81C \uCCB4\uD06C</h1><p>\uC81C\uCD9C \uC5EC\uBD80\uC640 \uAC15\uC0AC \uD53C\uB4DC\uBC31\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.</p></div></div>' +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uACFC\uBAA9</span><span>\uACFC\uC81C</span><span>\uC0C1\uD0DC</span><span>\uB9C8\uAC10</span></div>' +
                    '<div class="data-row"><span>\uB17C\uC220</span><span>\uC11C\uB860 \uAD6C\uC131 \uCD08\uC548</span><span class="status-pill status-warn">\uC791\uC131 \uC911</span><span>03-18</span></div>' +
                    '<div class="data-row"><span>\uC0AC\uD68C\uD0D0\uAD6C</span><span>\uC57D\uC810 \uB2E8\uC6D0 \uC624\uB2F5</span><span class="status-pill status-ok">\uC81C\uCD9C \uC644\uB8CC</span><span>03-17</span></div>' +
                "</div>" +
            "</section>";
    }

    function renderNoticeView() {
        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero"><div><span class="panel-label">\uACF5\uC9C0</span><h1>\uACF5\uC9C0 \uBC0F \uC548\uB0B4</h1><p>\uC218\uC5C5 \uBCC0\uACBD, \uD559\uBD80\uBAA8 \uC548\uB0B4, \uC124\uBA85\uD68C \uC77C\uC815\uC744 \uBAA8\uC544 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.</p></div></div>' +
                '<div class="detail-stack">' +
                    '<article><strong>3\uC6D4 \uBAA8\uC758\uBA74\uC811 \uC548\uB0B4</strong><p>03-22 \uD1A0\uC694\uC77C 14:00, \uC0C1\uB2F4\uC2E4 \uC2DC\uBBAC\uB808\uC774\uC158 \uBAA8\uC758\uBA74\uC811 \uC9C4\uD589</p></article>' +
                    '<article><strong>\uC8FC\uAC04 \uB9AC\uD3EC\uD2B8 \uBC1C\uD589 \uC77C\uC815</strong><p>\uB9E4\uC8FC \uAE08\uC694\uC77C 20:00 \uAE30\uC900 \uD559\uBD80\uBAA8 \uD3EC\uD138\uB85C \uBC1C\uD589\uB429\uB2C8\uB2E4.</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderBookingView(snapshot, store, studentId) {
        var bookingText = store.portalBookings[studentId] || "2026-03-21T19:00";

        return "" +
            '<section class="portal-panel-stack">' +
                '<div class="portal-hero"><div><span class="panel-label">\uC0C1\uB2F4 \uC608\uC57D</span><h1>\uBCF4\uD638\uC790 \uC0C1\uB2F4 \uC2AC\uB86F</h1><p>\uAC00\uB2A5 \uC2DC\uAC04\uC744 \uD655\uC778\uD558\uACE0 \uC694\uCCAD \uBA54\uBAA8\uB97C \uB0A8\uAE38 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p></div></div>' +
                '<div class="portal-grid">' +
                    '<article class="portal-card"><span class="panel-label">\uCD94\uCC9C \uC2AC\uB86F</span><strong>' + bookingText + '</strong><p>\uC785\uC2DC \uC804\uB7B5 \uC0C1\uB2F4 30\uBD84 \uC608\uC57D \uAC00\uB2A5</p></article>' +
                    '<article class="portal-card"><span class="panel-label">\uC694\uCCAD \uC0AC\uD56D</span><strong>\uC0C1\uB2F4 \uC608\uC57D</strong><p>\uC0AC\uD68C\uD0D0\uAD6C \uC57D\uC810 \uBCF4\uC644\uACFC \uB17C\uC220 \uC804\uD615 \uC900\uBE44 \uC0C1\uB2F4 \uD76C\uB9DD</p><div class="portal-slot-actions"><button type="button" class="landing-btn primary" data-booking-slot="2026-03-21T19:00">03-21 19:00 \uC608\uC57D</button><button type="button" class="landing-btn secondary" data-booking-slot="2026-03-22T14:00">03-22 14:00 \uC608\uC57D</button></div></article>' +
                "</div>" +
            "</section>";
    }

    function renderPortalBody(snapshot, store, studentId, activeView) {
        if (activeView === "report") {
            return renderReportDetail(snapshot, store, studentId);
        }

        if (activeView === "payments") {
            return renderPaymentView(snapshot, store, studentId);
        }

        if (activeView === "timetable") {
            return renderTimetableView(snapshot, store, studentId);
        }

        if (activeView === "homework") {
            return renderHomeworkView(snapshot, store, studentId);
        }

        if (activeView === "notices") {
            return renderNoticeView(snapshot, store, studentId);
        }

        if (activeView === "booking") {
            return renderBookingView(snapshot, store, studentId);
        }

        return renderPortalHome(snapshot, store, studentId);
    }

    function renderPortalShell(snapshot, store, studentId, activeView) {
        var student = findStudent(snapshot, studentId);

        return "" +
            '<div class="portal-shell">' +
                '<header class="portal-header">' +
                    '<div><span class="panel-label">EduFlow Pro</span><h1>\uD559\uBD80\uBAA8/\uD559\uC0DD \uD3EC\uD138</h1><p>' + student.name + ' | ' + student.currentClass + '</p></div>' +
                    '<a class="landing-btn secondary" href="./admin.html">\uAD00\uB9AC\uC790 \uB370\uBAA8</a>' +
                "</header>" +
                renderPortalTabs(activeView) +
                renderPortalBody(snapshot, store, studentId, activeView) +
            "</div>";
    }

    root.EduFlowPortalView = {
        renderPortalShell: renderPortalShell,
        renderPortalHome: renderPortalHome,
        renderReportDetail: renderReportDetail,
        renderBookingView: renderBookingView,
        renderPaymentView: renderPaymentView,
        renderTimetableView: renderTimetableView,
        renderHomeworkView: renderHomeworkView,
        renderNoticeView: renderNoticeView
    };
}(this));
