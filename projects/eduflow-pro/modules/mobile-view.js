(function (root) {
    function renderMobileTabs(activeView) {
        function renderTab(label, viewId) {
            var activeClass = activeView === viewId ? " is-active" : "";
            return '<button type="button" class="mobile-tab' + activeClass + '" data-mobile-view="' + viewId + '">' + label + "</button>";
        }

        return "" +
            '<div class="mobile-nav">' +
                renderTab("\uC624\uB298", "today") +
                renderTab("\uB9AC\uB4DC", "leads") +
                renderTab("\uC218\uB0A9", "payments") +
                renderTab("\uC54C\uB9BC", "alerts") +
            "</div>";
    }

    function renderToday(snapshot) {
        var firstBranch = snapshot.branches[0];

        return "" +
            '<section class="mobile-panel-stack">' +
                '<div class="mobile-card mobile-hero-card"><span class="panel-label">\uC624\uB298 \uC694\uC57D</span><strong>\uC6D0\uC7A5 \uBAA8\uB4DC</strong><p>' + firstBranch.name + ' \uAE30\uC900 \uD575\uC2EC \uC9C0\uD45C\uB97C \uC694\uC57D\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="mobile-stat-grid">' +
                    '<article class="mobile-card"><span class="panel-label">\uC624\uB298 \uC2E0\uADDC \uBB38\uC758</span><strong>12</strong></article>' +
                    '<article class="mobile-card"><span class="panel-label">\uC624\uB298 \uC0C1\uB2F4</span><strong>8</strong></article>' +
                    '<article class="mobile-card"><span class="panel-label">\uBBF8\uB0A9 \uAD00\uB9AC</span><strong>16</strong></article>' +
                    '<article class="mobile-card"><span class="panel-label">\uAE34\uAE09 \uC54C\uB9BC</span><strong>3</strong></article>' +
                "</div>" +
            "</section>";
    }

    function renderLeads(snapshot) {
        var items = [];
        var index;
        var lead;
        var likelihood;

        for (index = 0; index < 3; index += 1) {
            lead = snapshot.leads[index];
            likelihood = index === 0 ? "\uB192\uC74C" : (index === 1 ? "\uC911\uAC04" : "\uAD00\uC2EC");
            items.push(
                '<article class="mobile-card"><span class="panel-label">\uB4F1\uB85D \uAC00\uB2A5\uC131 ' + likelihood + '</span><strong>' + lead.name + '</strong><p>' + lead.source + ' | ' + lead.targetTrack + '</p></article>'
            );
        }

        return '<section class="mobile-panel-stack">' + items.join("") + "</section>";
    }

    function renderPayments() {
        return "" +
            '<section class="mobile-panel-stack">' +
                '<article class="mobile-card"><span class="panel-label">\uC624\uB298 \uBBF8\uB0A9</span><strong>5\uAC74 \uC989\uC2DC \uD655\uC778</strong><p>\uAC15\uB0A8 \uBCF8\uC6D0 2\uAC74, \uB300\uCE58 \uCEA0\uD37C\uC2A4 2\uAC74, \uBAA9\uB3D9 \uCEA0\uD37C\uC2A4 1\uAC74</p></article>' +
                '<article class="mobile-card"><span class="panel-label">\uC790\uB3D9 \uB9AC\uB9C8\uC778\uB4DC</span><strong>03-18 11:00 \uBC1C\uC1A1 \uC608\uC815</strong><p>\uBBF8\uB0A9 5\uC77C \uACBD\uACFC \uD559\uBD80\uBAA8 \uB300\uC0C1\uC73C\uB85C \uC548\uB0B4 \uC608\uC815</p></article>' +
            "</section>";
    }

    function renderAlerts() {
        return "" +
            '<section class="mobile-panel-stack">' +
                '<article class="mobile-card"><span class="panel-label">\uD6C4\uC18D \uC0C1\uB2F4 \uD544\uC694</span><strong>\uCCB4\uD5D8 \uC644\uB8CC \uD6C4 24\uC2DC\uAC04 \uACBD\uACFC</strong><p>\uCD5C\uBBFC\uC11C \uD559\uBD80\uBAA8\uAC00 \uB4F1\uB85D \uC81C\uC548 \uAE30\uB2E4\uB9AC\uB294 \uC911\uC785\uB2C8\uB2E4.</p></article>' +
                '<article class="mobile-card"><span class="panel-label">\uCD9C\uACB0 \uC774\uC0C1</span><strong>\uACE03 \uD30C\uC774\uB110 \uBC18 \uACB0\uC11D 1\uBA85</strong><p>\uD559\uBD80\uBAA8 \uD6C4\uC18D \uC804\uD654\uAC00 \uC544\uC9C1 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</p></article>' +
                '<article class="mobile-card"><span class="panel-label">\uBBF8\uB0A9 \uC54C\uB9BC</span><strong>\uAC15\uB0A8 \uBCF8\uC6D0 \uBBF8\uB0A9 2\uAC74</strong><p>\uC624\uB298 \uC624\uD6C4 \uAE30\uC900 \uBB38\uC790 \uC548\uB0B4 \uB300\uAE30 \uC911</p></article>' +
            "</section>";
    }

    function renderMobileBody(snapshot, store, activeView) {
        if (activeView === "leads") {
            return renderLeads(snapshot, store);
        }

        if (activeView === "payments") {
            return renderPayments(snapshot, store);
        }

        if (activeView === "alerts") {
            return renderAlerts(snapshot, store);
        }

        return renderToday(snapshot, store);
    }

    function renderMobileShell(snapshot, store, activeView) {
        return "" +
            '<div class="mobile-shell">' +
                '<header class="mobile-header"><div><span class="panel-label">EduFlow Pro</span><h1>\uBAA8\uBC14\uC77C \uC6D0\uC7A5 \uBAA8\uB4DC</h1><p>\uC624\uB298 \uBCFC \uC22B\uC790\uC640 \uC545\uC158\uB9CC \uB0A8\uACBC\uC2B5\uB2C8\uB2E4.</p></div></header>' +
                renderMobileTabs(activeView) +
                renderMobileBody(snapshot, store, activeView) +
            "</div>";
    }

    root.EduFlowMobileView = {
        renderMobileShell: renderMobileShell,
        renderToday: renderToday,
        renderLeads: renderLeads,
        renderPayments: renderPayments,
        renderAlerts: renderAlerts
    };
}(this));
