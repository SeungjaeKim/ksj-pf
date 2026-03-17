(function (root) {
    function findStudent(snapshot, studentId) {
        var index;

        for (index = 0; index < snapshot.students.length; index += 1) {
            if (snapshot.students[index].id === studentId) {
                return snapshot.students[index];
            }
        }

        return null;
    }

    function findLead(snapshot, leadId) {
        var index;

        for (index = 0; index < snapshot.leads.length; index += 1) {
            if (snapshot.leads[index].id === leadId) {
                return snapshot.leads[index];
            }
        }

        return null;
    }

    function findStageLabel(snapshot, stageId) {
        var index;

        for (index = 0; index < snapshot.crmStages.length; index += 1) {
            if (snapshot.crmStages[index].id === stageId) {
                return snapshot.crmStages[index].label;
            }
        }

        return "\uBB38\uC758 \uC811\uC218";
    }

    function findBranchName(snapshot, branchId) {
        var index;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            if (snapshot.branches[index].id === branchId) {
                return snapshot.branches[index].name;
            }
        }

        return branchId;
    }

    function getInvoiceStatusLabel(status) {
        if (status === "pending") {
            return "\uCCAD\uAD6C \uC608\uC815";
        }

        if (status === "missing") {
            return "\uBBF8\uC0DD\uC131";
        }

        return status;
    }

    function formatAmount(amount) {
        var text = String(amount || 0);
        var chunks = [];

        while (text.length > 3) {
            chunks.unshift(text.slice(text.length - 3));
            text = text.slice(0, text.length - 3);
        }

        if (text) {
            chunks.unshift(text);
        }

        return chunks.join(",") + "\uC6D0";
    }

    function renderLeadCard(lead, store) {
        var selectedClass = lead.id === store.selectedLeadId ? " is-selected" : "";
        var currentStage = root.EduFlowState.getLeadStage(store, lead.id);

        return "" +
            '<button type="button" class="crm-lead-card' + selectedClass + '" data-lead-id="' + lead.id + '" data-stage-id="' + currentStage + '" draggable="true">' +
                '<span class="crm-lead-grade">' + lead.grade + "</span>" +
                '<strong class="crm-lead-name">' + lead.name + "</strong>" +
                '<span class="crm-lead-source">' + lead.source + "</span>" +
            "</button>";
    }

    function renderStageActions(snapshot, currentStage) {
        var actions = [];
        var index;
        var stage;
        var activeClass;

        for (index = 0; index < snapshot.crmStages.length; index += 1) {
            stage = snapshot.crmStages[index];
            activeClass = stage.id === currentStage ? " is-active" : "";
            actions.push(
                '<button type="button" class="crm-stage-action' + activeClass + '" data-stage-action="' + stage.id + '">' + stage.label + "</button>"
            );
        }

        return '<div class="crm-stage-actions">' + actions.join("") + "</div>";
    }

    function renderPendingStageOverlay(snapshot, store) {
        var pending = store.pendingStageChange;
        var lead;
        var stageLabel;

        if (!pending) {
            return "";
        }

        lead = findLead(snapshot, pending.leadId);
        stageLabel = findStageLabel(snapshot, pending.stageId);

        return "" +
            '<div class="crm-confirm-overlay" role="presentation">' +
                '<div class="crm-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="crmStageConfirmTitle">' +
                    '<span class="panel-label">\uC911\uC694 \uB2E8\uACC4 \uC774\uB3D9</span>' +
                    '<h2 id="crmStageConfirmTitle">\uB2E8\uACC4 \uBCC0\uACBD \uD655\uC778</h2>' +
                    '<p class="detail-muted">' + (lead ? lead.name : "\uC120\uD0DD\uD55C \uB9AC\uB4DC") + ' \uB9AC\uB4DC\uB97C "' + stageLabel + '" \uB2E8\uACC4\uB85C \uC774\uB3D9\uD560\uAE4C\uC694?</p>' +
                    '<div class="detail-actions">' +
                        '<button type="button" class="landing-btn secondary" data-confirm-stage-change="cancel">\uCDE8\uC18C</button>' +
                        '<button type="button" class="landing-btn primary" data-confirm-stage-change="confirm">\uC774\uB3D9 \uD655\uC778</button>' +
                    "</div>" +
                "</div>" +
            "</div>";
    }

    function renderCrmBoard(snapshot, store) {
        var columns = [];
        var columnIndex;
        var leadIndex;
        var stage;
        var lead;
        var cards;

        for (columnIndex = 0; columnIndex < snapshot.crmStages.length; columnIndex += 1) {
            stage = snapshot.crmStages[columnIndex];
            cards = [];

            for (leadIndex = 0; leadIndex < snapshot.leads.length; leadIndex += 1) {
                lead = snapshot.leads[leadIndex];
                if ((store.leadStages[lead.id] || "inquiry") === stage.id) {
                    cards.push(renderLeadCard(lead, store));
                }
            }

            columns.push("" +
                '<section class="crm-column" data-stage-id="' + stage.id + '">' +
                    '<header class="crm-column-header"><h3>' + stage.label + "</h3><span>" + String(cards.length) + "</span></header>" +
                    '<div class="crm-column-body">' + cards.join("") + "</div>" +
                "</section>");
        }

        return '<section class="crm-board">' + columns.join("") + "</section>";
    }

    function renderLeadDetail(snapshot, store) {
        var lead = findLead(snapshot, store.selectedLeadId) || snapshot.leads[0];
        var currentStage = root.EduFlowState.getLeadStage(store, lead.id);
        var studentId = root.EduFlowState.getLinkedStudentId(store, lead.id);
        var linkedStudentMarkup = "";
        var linkedStudent = studentId ? findStudent(snapshot, studentId) : null;

        if (studentId) {
            linkedStudentMarkup = '<p class="detail-muted">\uC5F0\uACB0 \uD559\uC0DD: ' + (linkedStudent ? linkedStudent.name : studentId) + "</p>";
        }

        return "" +
            '<aside class="admin-detail-panel">' +
                '<span class="panel-label">\uC120\uD0DD \uB9AC\uB4DC</span>' +
                "<h2>" + lead.name + "</h2>" +
                '<p class="detail-muted">' + lead.grade + " | " + lead.source + "</p>" +
                renderStageActions(snapshot, currentStage) +
                '<div class="detail-stack">' +
                    "<article><strong>\uD604\uC7AC \uB2E8\uACC4</strong><p>" + findStageLabel(snapshot, currentStage) + "</p></article>" +
                    "<article><strong>\uBAA9\uD45C \uAD00\uB9AC \uCF54\uC2A4</strong><p>" + (lead.targetTrack || "\uC785\uC2DC \uCEE8\uC124\uD305") + "</p></article>" +
                    "<article><strong>\uD559\uBD80\uBAA8 \uC5F0\uB77D</strong><p>010-1234-5678 | \uC800\uB141 \uC0C1\uB2F4 \uC120\uD638</p></article>" +
                    "<article><strong>\uCCB4\uD5D8 \uC218\uC5C5</strong><p>" + (lead.trialDate || "\uC77C\uC815 \uBBF8\uC815") + "</p></article>" +
                    "<article><strong>\uB2E4\uC74C \uC561\uC158</strong><p>" + (studentId ? "\uB4F1\uB85D\uC774 \uC644\uB8CC\uB418\uC5B4 \uCCAB \uC218\uB0A9 \uCD08\uC548\uC774 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4." : "\uCCB4\uD5D8 \uD53C\uB4DC\uBC31\uC744 \uD655\uC778\uD558\uACE0 \uB4F1\uB85D \uC81C\uC548\uC744 \uC900\uBE44\uD558\uC138\uC694.") + "</p></article>" +
                "</div>" +
                '<div class="detail-actions">' +
                    '<button type="button" class="landing-btn primary" data-action="convert-lead">\uB4F1\uB85D \uC804\uD658</button>' +
                    linkedStudentMarkup +
                "</div>" +
            "</aside>";
    }

    function renderSidebar() {
        function renderNavItem(label, viewId, store) {
            var activeClass = store.currentAdminView === viewId ? " is-active" : "";
            var pressed = store.currentAdminView === viewId ? "true" : "false";
            return '<button type="button" class="admin-nav-item' + activeClass + '" data-admin-view="' + viewId + '" aria-pressed="' + pressed + '">' + label + "</button>";
        }

        return "" +
            '<nav class="admin-sidebar" aria-label="\uAD00\uB9AC\uC790 \uD0D0\uC0C9">' +
                '<a href="#" class="admin-brand">EduFlow Pro</a>' +
                renderNavItem("\uC0C1\uB2F4 CRM", "crm", root.__eduFlowActiveStore) +
                renderNavItem("\uC6D0\uC7A5 \uB300\uC2DC\uBCF4\uB4DC", "dashboard", root.__eduFlowActiveStore) +
                renderNavItem("\uD559\uC0DD 360", "students", root.__eduFlowActiveStore) +
                renderNavItem("\uC2DC\uAC04\uD45C", "timetable", root.__eduFlowActiveStore) +
                renderNavItem("\uCD9C\uACB0 \uAD00\uB9AC", "attendance", root.__eduFlowActiveStore) +
                renderNavItem("\uC218\uB0A9 \uAD00\uB9AC", "payments", root.__eduFlowActiveStore) +
                renderNavItem("\uD559\uC2B5 \uB9AC\uD3EC\uD2B8", "reports", root.__eduFlowActiveStore) +
                renderNavItem("\uBA54\uC2DC\uC9C0 \uC13C\uD130", "messages", root.__eduFlowActiveStore) +
                renderNavItem("\uD1B5\uACC4 \uBD84\uC11D", "analytics", root.__eduFlowActiveStore) +
                renderNavItem("\uC9C0\uC810 \uBE44\uAD50", "branches", root.__eduFlowActiveStore) +
                renderNavItem("\uC124\uC815", "settings", root.__eduFlowActiveStore) +
            "</nav>";
    }

    function renderTopbar(snapshot, store) {
        return "" +
            '<header class="admin-topbar">' +
                '<div><span class="panel-label">\uD604\uC7AC \uC9C0\uC810</span><strong>' + findBranchName(snapshot, store.currentBranchId) + "</strong></div>" +
                '<div><span class="panel-label">\uC6B4\uC601 \uBE0C\uB79C\uB4DC</span><strong>' + snapshot.academy.name + "</strong></div>" +
            "</header>";
    }

    function renderOwnerDashboard(snapshot) {
        var metrics = root.EduFlowMetrics.getOwnerKpis(snapshot);
        var cards = [];
        var index;
        var card;

        for (index = 0; index < metrics.cards.length; index += 1) {
            card = metrics.cards[index];
            cards.push(
                '<article class="metric-card"><span class="panel-label">' + card.label + '</span><strong>' + card.value + "</strong></article>"
            );
        }

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uC6D0\uC7A5 \uC694\uC57D</span><h1>\uC6B4\uC601 \uB300\uC2DC\uBCF4\uB4DC</h1></div><p class="detail-muted">\uC624\uB298 \uC2E0\uADDC \uBB38\uC758, \uC0C1\uB2F4 \uC77C\uC815, \uBBF8\uB0A9 \uC704\uD5D8, \uC9C0\uC810 \uD604\uD669\uC744 \uD55C \uD654\uBA74\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="metric-grid">' + cards.join("") + "</div>" +
                '<div class="detail-stack">' +
                    '<article><strong>\uC804\uD658 \uD30C\uC774\uD504\uB77C\uC778</strong><p>\uBB38\uC758 \uB300\uBE44 \uB4F1\uB85D \uC804\uD658\uC728\uC740 31%\uB85C \uC720\uC9C0\uB418\uACE0 \uC788\uC73C\uBA70, \uAC15\uB0A8 \uBCF8\uC6D0\uC774 \uAC00\uC7A5 \uB192\uC740 \uD6A8\uC728\uC744 \uBCF4\uC785\uB2C8\uB2E4.</p></article>' +
                    '<article><strong>\uC704\uD5D8 \uC2E0\uD638</strong><p>\uCD9C\uACB0 \uD6C4\uC18D \uAD00\uB9AC\uAC00 \uD544\uC694\uD55C \uD559\uC0DD 3\uBA85\uACFC 7\uC77C \uC774\uB0B4 \uC7AC\uB4F1\uB85D \uD655\uC778\uC774 \uD544\uC694\uD55C \uBC18 2\uAC74\uC774 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderStudentDetail(snapshot, store, studentId) {
        var student = findStudent(snapshot, studentId);

        if (!student) {
            student = snapshot.students[0];
        }

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uD559\uC0DD 360</span><h1>' + student.name + '</h1></div><p class="detail-muted">\uCD9C\uACB0, \uC218\uB0A9, \uB9AC\uD3EC\uD2B8, \uC9C4\uD559 \uBAA9\uD45C\uB97C \uD55C \uD654\uBA74\uC5D0\uC11C \uC5F0\uACB0\uD574 \uBCF4\uB294 \uD1B5\uD569 \uC2DC\uC57C\uC785\uB2C8\uB2E4.</p></div>' +
                '<div class="detail-stack">' +
                    '<article><strong>\uBAA9\uD45C \uD559\uAD50/\uD2B8\uB799</strong><p>' + student.goalSchool + "</p></article>" +
                    '<article><strong>\uD604\uC7AC \uBC18</strong><p>' + student.currentClass + "</p></article>" +
                    '<article><strong>\uCD9C\uACB0 \uCD94\uC774</strong><p>\uC774\uBC88 \uB2EC\uC740 1\uD68C \uC9C0\uAC01\uC744 \uC81C\uC678\uD558\uBA74 \uC548\uC815\uC801\uC73C\uB85C \uC720\uC9C0\uB418\uACE0 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article><strong>\uCD5C\uADFC \uC0C1\uB2F4 \uBA54\uBAA8</strong><p>\uB2E4\uC74C \uC0C1\uB2F4\uC5D0\uC11C\uB294 \uC778\uBB38 \uACC4\uC5F4 \uC131\uC801 \uCD94\uC774\uC640 \uD559\uC0DD\uBD80 \uAD00\uB9AC \uBE44\uC911\uC744 \uB354 \uD06C\uAC8C \uB2E4\uB8E8\uAE30\uB85C \uD588\uC2B5\uB2C8\uB2E4.</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderPaymentCenter(snapshot, store) {
        var invoice = root.EduFlowState.getDraftInvoice(store, "student-minseo");

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uC218\uB0A9 \uC13C\uD130</span><h1>\uC218\uB0A9 \uAD00\uB9AC</h1></div><p class="detail-muted">\uBBF8\uB0A9, \uCCAD\uAD6C \uCD08\uC548, \uC7AC\uB4F1\uB85D \uC608\uC815\uC790\uB97C \uD568\uAED8 \uAD00\uB9AC\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="detail-stack">' +
                    '<article><strong>\uBBF8\uB0A9 \uAD00\uB9AC</strong><p>\uC804 \uC9C0\uC810\uC5D0\uC11C 16\uAC1C \uACC4\uC815\uC774 \uD6C4\uC18D \uC548\uB0B4 \uB300\uC0C1\uC785\uB2C8\uB2E4.</p></article>' +
                    '<article><strong>\uCCAD\uAD6C \uCD08\uC548</strong><p>' + getInvoiceStatusLabel(invoice.status) + ' | \uCD5C\uBBFC\uC11C \uD559\uC0DD ' + formatAmount(invoice.amount) + ' \uCCAD\uAD6C\uC11C\uAC00 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article><strong>\uC7AC\uB4F1\uB85D \uC608\uC815</strong><p>7\uC77C \uC774\uB0B4 \uAC31\uC2E0 \uD655\uC778\uC774 \uD544\uC694\uD55C \uB4F1\uB85D 5\uAC74\uC774 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderReportEditor(snapshot, store, studentId) {
        var published = store.publishedReports[studentId] ? "\uBC1C\uD589 \uC644\uB8CC" : "\uC791\uC131 \uC911";

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uB9AC\uD3EC\uD2B8 \uD3B8\uC9D1\uAE30</span><h1>\uD559\uC2B5 \uB9AC\uD3EC\uD2B8</h1></div><p class="detail-muted">\uC8FC\uAC04 \uD559\uC2B5 \uCF54\uBA58\uD2B8\uB97C \uC791\uC131\uD558\uACE0 \uD559\uBD80\uBAA8 \uD3EC\uD138\uB85C \uC5F0\uACB0\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="detail-stack">' +
                    '<article><strong>\uC0C1\uD0DC</strong><p>' + published + "</p></article>" +
                    '<article><strong>\uAC15\uC0AC \uCF54\uBA58\uD2B8</strong><p>\uCEE8\uC124\uD305 \uBAA8\uC758 \uBA74\uB2F4\uC5D0\uC11C \uADFC\uAC70 \uAE30\uBC18 \uC124\uB4DD\uB825\uC774 \uC804\uC8FC \uB300\uBE44 \uB354 \uC88B\uC544\uC84C\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article><strong>\uB2E4\uC74C \uC8FC \uC9D1\uC911 \uD3EC\uC778\uD2B8</strong><p>\uC0AC\uD68C\uD0D0\uAD6C \uC57D\uC810 \uB2E8\uC6D0\uC744 \uBCF4\uC644\uD558\uACE0 \uB17C\uC220 \uAD6C\uC131\uC744 \uAE30\uBC18 \uC911\uC2EC\uC73C\uB85C \uB2E4\uC2DC \uC810\uAC80\uD569\uB2C8\uB2E4.</p></article>' +
                "</div>" +
                '<div class="detail-actions">' +
                    '<button type="button" class="landing-btn secondary">AI \uCD08\uC548 \uC0DD\uC131</button>' +
                    '<button type="button" class="landing-btn primary" data-action="publish-report">\uB9AC\uD3EC\uD2B8 \uBC1C\uD589</button>' +
                "</div>" +
            "</section>";
    }

    function renderTimetableView(snapshot) {
        var branch = snapshot.branches[0];

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uC2DC\uAC04\uD45C</span><h1>\uC8FC\uAC04 \uC218\uC5C5 \uC6B4\uC601</h1></div><p class="detail-muted">\uAC15\uC0AC, \uAD50\uC2E4, \uBC18 \uC2A4\uCF00\uC904\uC744 \uD55C \uD654\uBA74\uC5D0\uC11C \uC815\uB9AC\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="admin-grid-two">' +
                    '<article class="admin-mini-panel"><span class="panel-label">\uC6B4\uC601 \uC911 \uC9C0\uC810</span><strong>' + branch.name + '</strong><p>\uACE03 \uD30C\uC774\uB110 \uCEE8\uC124\uD305 \uBC18\uACFC \uACE02 \uC778\uBB38 \uB17C\uC220 \uBC18\uC774 \uC624\uD6C4 \uC2DC\uAC04\uC5D0 \uC9D1\uC911 \uBC30\uCE58\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                    '<article class="admin-mini-panel"><span class="panel-label">\uCDA9\uB3CC \uC54C\uB9BC</span><strong>2\uAC74</strong><p>\uAC15\uC0AC \uC911\uBCF5 1\uAC74, \uC0C1\uB2F4\uC2E4 \uC0AC\uC6A9 \uC911\uBCF5 1\uAC74\uC744 \uD655\uC778\uD558\uC138\uC694.</p></article>' +
                "</div>" +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uC2DC\uAC04</span><span>\uBC18</span><span>\uAC15\uC0AC</span><span>\uAD50\uC2E4</span></div>' +
                    '<div class="data-row"><span>17:00</span><span>\uACE02 \uC0AC\uD0D0 \uCEE8\uC124\uD305</span><span>\uBC15\uC218\uC544 \uC120\uC0DD\uB2D8</span><span>A-201</span></div>' +
                    '<div class="data-row"><span>19:00</span><span>\uACE03 \uD30C\uC774\uB110 \uB17C\uC220</span><span>\uD55C\uC608\uC9C0 \uC120\uC0DD\uB2D8</span><span>\uCEE8\uC124\uD305\uC2E4 2</span></div>' +
                    '<div class="data-row"><span>20:00</span><span>\uACE01 \uC218\uD559 \uAE30\uCD08 \uBCF4\uAC15</span><span>\uAE40\uD604\uC6B0 \uC120\uC0DD\uB2D8</span><span>B-102</span></div>' +
                "</div>" +
            "</section>";
    }

    function renderAttendanceView() {
        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uCD9C\uACB0</span><h1>\uC624\uB298 \uCD9C\uACB0 \uAD00\uB9AC</h1></div><p class="detail-muted">\uBC18 \uB2E8\uC704 \uCD9C\uC11D, \uC9C0\uAC01, \uACB0\uC11D, \uC870\uD1F4 \uC0C1\uD0DC\uB97C \uBC14\uB85C \uCC98\uB9AC\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="admin-grid-two">' +
                    '<article class="admin-mini-panel"><span class="panel-label">\uC704\uD5D8 \uC54C\uB9BC</span><strong>\uACB0\uC11D 3\uBA85</strong><p>\uBB34\uB2E8\uACB0\uC11D 1\uBA85, \uC5F0\uC18D \uC9C0\uAC01 2\uBA85\uC774 \uD6C4\uC18D \uC5F0\uB77D \uB300\uC0C1\uC785\uB2C8\uB2E4.</p></article>' +
                    '<article class="admin-mini-panel"><span class="panel-label">\uD559\uBD80\uBAA8 \uC54C\uB9BC</span><strong>5\uAC74</strong><p>\uCD9C\uACB0 \uC774\uC0C1 \uD559\uC0DD \uAE30\uC900\uC73C\uB85C \uC790\uB3D9 \uC548\uB0B4 \uC608\uC815 \uBA54\uC2DC\uC9C0\uAC00 \uC900\uBE44\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                "</div>" +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uD559\uC0DD</span><span>\uBC18</span><span>\uC0C1\uD0DC</span><span>\uBE44\uACE0</span></div>' +
                    '<div class="data-row"><span>\uCD5C\uBBFC\uC11C</span><span>\uACE02 \uC0AC\uD0D0 \uCEE8\uC124\uD305</span><span class="status-pill status-ok">\uCD9C\uC11D</span><span>\uC815\uC2DC \uC785\uC2E4</span></div>' +
                    '<div class="data-row"><span>\uC11C\uB3D9\uD604</span><span>\uACE01 \uC131\uC7A5 \uC218\uD559</span><span class="status-pill status-warn">\uC9C0\uAC01</span><span>10\uBD84 \uC9C0\uC5F0</span></div>' +
                    '<div class="data-row"><span>\uD55C\uC608\uC9C0</span><span>\uACE03 \uD30C\uC774\uB110 \uB17C\uC220</span><span class="status-pill status-danger">\uACB0\uC11D</span><span>\uD559\uBD80\uBAA8 \uD6C4\uC18D \uC804\uD654 \uD544\uC694</span></div>' +
                "</div>" +
            "</section>";
    }

    function renderMessageView() {
        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uBA54\uC2DC\uC9C0</span><h1>\uBA54\uC2DC\uC9C0 \uC13C\uD130</h1></div><p class="detail-muted">\uACF5\uC9C0, \uBBF8\uB0A9 \uC548\uB0B4, \uCCB4\uD5D8 \uD6C4\uC18D \uC5F0\uB77D\uC744 \uD15C\uD50C\uB9BF \uAE30\uBC18\uC73C\uB85C \uBC1C\uC1A1\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="detail-stack">' +
                    '<article><strong>\uC624\uB298 \uC608\uC57D \uBC1C\uC1A1</strong><p>\uCCB4\uD5D8 \uC644\uB8CC \uD559\uBD80\uBAA8 4\uBA85, \uBBF8\uB0A9 \uC548\uB0B4 3\uAC74, \uCD9C\uACB0 \uC774\uC0C1 \uC548\uB0B4 2\uAC74.</p></article>' +
                    '<article><strong>\uC800\uC7A5 \uD15C\uD50C\uB9BF</strong><p>\uCCB4\uD5D8 \uD6C4\uC18D, \uC7AC\uB4F1\uB85D \uC548\uB0B4, \uBBF8\uB0A9 \uB9AC\uB9C8\uC778\uB4DC, \uC6D4\uAC04 \uB9AC\uD3EC\uD2B8 \uBC1C\uD589 \uD15C\uD50C\uB9BF\uC774 \uC900\uBE44\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderAnalyticsView(snapshot) {
        var branchRows = [];
        var index;
        var branch;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            branch = snapshot.branches[index];
            branchRows.push('<div class="data-row"><span>' + branch.name + '</span><span>' + branch.studentCount + '\uBA85</span><span>' + branch.conversionRate + '%</span><span>' + branch.overdueCount + '\uAC74</span></div>');
        }

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uD1B5\uACC4</span><h1>\uC6B4\uC601 \uBD84\uC11D</h1></div><p class="detail-muted">\uB4F1\uB85D \uC804\uD658\uC728, \uC9C0\uC810 \uBCC4 \uB9E4\uCD9C \uAC10\uC774, \uBBF8\uB0A9 \uC704\uD5D8\uC744 \uD558\uB098\uC758 \uBCF4\uB4DC\uB85C \uC694\uC57D\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="metric-grid metric-grid-compact">' +
                    '<article class="metric-card"><span class="panel-label">\uB4F1\uB85D \uC804\uD658\uC728</span><strong>31%</strong></article>' +
                    '<article class="metric-card"><span class="panel-label">\uC7AC\uB4F1\uB85D \uC608\uC815</span><strong>5\uAC74</strong></article>' +
                    '<article class="metric-card"><span class="panel-label">\uBBF8\uB0A9 \uBE44\uC728</span><strong>8.6%</strong></article>' +
                "</div>" +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uC9C0\uC810</span><span>\uC7AC\uC6D0</span><span>\uB4F1\uB85D \uC804\uD658\uC728</span><span>\uBBF8\uB0A9</span></div>' +
                    branchRows.join("") +
                "</div>" +
            "</section>";
    }

    function renderBranchView(snapshot) {
        var rows = [];
        var index;
        var branch;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            branch = snapshot.branches[index];
            rows.push('<div class="data-row"><span>' + branch.name + '</span><span>' + branch.studentCount + '\uBA85</span><span>' + branch.conversionRate + '%</span><span>' + branch.overdueCount + '\uAC74</span></div>');
        }

        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uC9C0\uC810 \uBE44\uAD50</span><h1>\uB2E4\uC9C0\uC810 \uD604\uD669</h1></div><p class="detail-muted">\uBCF8\uC6D0\uACFC \uCEA0\uD37C\uC2A4\uC758 \uD559\uC0DD \uC218, \uC804\uD658\uC728, \uBBF8\uB0A9 \uC9C0\uD45C\uB97C \uBE44\uAD50\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="data-table">' +
                    '<div class="data-row data-head"><span>\uC9C0\uC810</span><span>\uC7AC\uC6D0</span><span>\uC804\uD658\uC728</span><span>\uBBF8\uB0A9</span></div>' +
                    rows.join("") +
                "</div>" +
            "</section>";
    }

    function renderSettingsView() {
        return "" +
            '<section class="admin-panel-stack">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uC124\uC815</span><h1>\uAD8C\uD55C \uBC0F \uC6B4\uC601 \uC815\uCC45</h1></div><p class="detail-muted">\uC5ED\uD560\uBCC4 \uC5F4\uB78C \uAD8C\uD55C, \uC54C\uB9BC \uADDC\uCE59, \uBCF8\uC0AC \uD15C\uD50C\uB9BF\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="detail-stack">' +
                    '<article><strong>\uC5ED\uD560 \uAD8C\uD55C</strong><p>\uC0C1\uB2F4\uC2E4\uC7A5\uC740 CRM \uC804\uCCB4 \uC218\uC815 \uAC00\uB2A5, \uAC15\uC0AC\uB294 \uB9AC\uD3EC\uD2B8 \uC791\uC131 \uC911\uC2EC, \uD68C\uACC4 \uB2F4\uB2F9\uC740 \uC218\uB0A9 \uD654\uBA74 \uC804\uC6A9 \uAD8C\uD55C\uC744 \uAC00\uC9D1\uB2C8\uB2E4.</p></article>' +
                    '<article><strong>\uC790\uB3D9\uD654 \uADDC\uCE59</strong><p>\uC5F0\uC18D \uACB0\uC11D 3\uD68C \uC2DC \uD559\uBD80\uBAA8 \uC54C\uB9BC, \uC7AC\uB4F1\uB85D 7\uC77C \uC804 \uC0C1\uB2F4 \uC54C\uB9BC\uC744 \uD65C\uC131\uD654\uD574 \uB450\uC5C8\uC2B5\uB2C8\uB2E4.</p></article>' +
                "</div>" +
            "</section>";
    }

    function renderAdminBody(snapshot, store) {
        if (store.currentAdminView === "dashboard") {
            return renderOwnerDashboard(snapshot, store);
        }

        if (store.currentAdminView === "students") {
            return renderStudentDetail(snapshot, store, store.selectedStudentId);
        }

        if (store.currentAdminView === "timetable") {
            return renderTimetableView(snapshot, store);
        }

        if (store.currentAdminView === "attendance") {
            return renderAttendanceView(snapshot, store);
        }

        if (store.currentAdminView === "payments") {
            return renderPaymentCenter(snapshot, store);
        }

        if (store.currentAdminView === "reports") {
            return renderReportEditor(snapshot, store, store.selectedStudentId);
        }

        if (store.currentAdminView === "messages") {
            return renderMessageView(snapshot, store);
        }

        if (store.currentAdminView === "analytics") {
            return renderAnalyticsView(snapshot, store);
        }

        if (store.currentAdminView === "branches") {
            return renderBranchView(snapshot, store);
        }

        if (store.currentAdminView === "settings") {
            return renderSettingsView(snapshot, store);
        }

        return "" +
            '<section class="admin-stage">' +
                '<div class="admin-stage-header"><div><span class="panel-label">\uBA54\uC778 \uBCF4\uB4DC</span><h1>\uC0C1\uB2F4 CRM</h1></div><p class="detail-muted">\uBB38\uC758\uBD80\uD130 \uCCB4\uD5D8, \uB4F1\uB85D \uC804\uD658\uAE4C\uC9C0 \uD558\uB098\uC758 \uBCF4\uB4DC\uC5D0\uC11C \uAD00\uB9AC\uD569\uB2C8\uB2E4.</p></div>' +
                '<div class="admin-workspace">' +
                    renderCrmBoard(snapshot, store) +
                    renderLeadDetail(snapshot, store) +
                "</div>" +
                renderPendingStageOverlay(snapshot, store) +
            "</section>";
    }

    function renderAdminShell(snapshot, store) {
        root.__eduFlowActiveStore = store;
        return "" +
            '<div class="admin-shell">' +
                renderSidebar() +
                '<div class="admin-main-shell">' +
                    renderTopbar(snapshot, store) +
                    renderAdminBody(snapshot, store) +
                "</div>" +
            "</div>";
    }

    root.EduFlowAdminView = {
        renderAdminShell: renderAdminShell,
        renderCrmBoard: renderCrmBoard,
        renderLeadDetail: renderLeadDetail,
        renderOwnerDashboard: renderOwnerDashboard,
        renderStudentDetail: renderStudentDetail,
        renderPaymentCenter: renderPaymentCenter,
        renderReportEditor: renderReportEditor,
        renderTimetableView: renderTimetableView,
        renderAttendanceView: renderAttendanceView,
        renderMessageView: renderMessageView,
        renderAnalyticsView: renderAnalyticsView,
        renderBranchView: renderBranchView,
        renderSettingsView: renderSettingsView
    };
}(this));
