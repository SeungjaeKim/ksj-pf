(function (root) {
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

        return "Inquiry Received";
    }

    function renderLeadCard(lead, store) {
        var selectedClass = lead.id === store.selectedLeadId ? " is-selected" : "";

        return "" +
            '<button type="button" class="crm-lead-card' + selectedClass + '" data-lead-id="' + lead.id + '">' +
                '<span class="crm-lead-grade">' + lead.grade + "</span>" +
                '<strong class="crm-lead-name">' + lead.name + "</strong>" +
                '<span class="crm-lead-source">' + lead.source + "</span>" +
            "</button>";
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
                '<section class="crm-column">' +
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

        if (studentId) {
            linkedStudentMarkup = '<p class="detail-muted">Linked student: ' + studentId + "</p>";
        }

        return "" +
            '<aside class="admin-detail-panel">' +
                '<span class="panel-label">Selected Lead</span>' +
                "<h2>" + lead.name + "</h2>" +
                '<p class="detail-muted">' + lead.grade + " | " + lead.source + "</p>" +
                '<div class="detail-stack">' +
                    "<article><strong>Current Stage</strong><p>" + findStageLabel(snapshot, currentStage) + "</p></article>" +
                    "<article><strong>Target Track</strong><p>" + (lead.targetTrack || "Admissions consulting") + "</p></article>" +
                    "<article><strong>Parent Contact</strong><p>010-1234-5678 | prefers evening calls</p></article>" +
                    "<article><strong>Trial Session</strong><p>" + (lead.trialDate || "Schedule pending") + "</p></article>" +
                    "<article><strong>Next Action</strong><p>" + (studentId ? "Enrollment is created and tuition draft is ready." : "Confirm trial feedback and prepare enrollment offer.") + "</p></article>" +
                "</div>" +
                '<div class="detail-actions">' +
                    '<button type="button" class="landing-btn primary" data-action="convert-lead">Convert To Enrollment</button>' +
                    linkedStudentMarkup +
                "</div>" +
            "</aside>";
    }

    function renderSidebar() {
        return "" +
            '<nav class="admin-sidebar">' +
                '<a href="#" class="admin-brand">EduFlow Pro</a>' +
                '<button type="button" class="admin-nav-item is-active" data-admin-view="crm">Consultation CRM</button>' +
                '<button type="button" class="admin-nav-item" data-admin-view="dashboard">Owner Dashboard</button>' +
                '<button type="button" class="admin-nav-item" data-admin-view="students">Students</button>' +
                '<button type="button" class="admin-nav-item" data-admin-view="payments">Payments</button>' +
            "</nav>";
    }

    function renderTopbar(snapshot, store) {
        return "" +
            '<header class="admin-topbar">' +
                '<div><span class="panel-label">Current Branch</span><strong>' + store.currentBranchId + "</strong></div>" +
                '<div><span class="panel-label">Academy</span><strong>' + snapshot.academy.name + "</strong></div>" +
            "</header>";
    }

    function renderAdminShell(snapshot, store) {
        return "" +
            '<div class="admin-shell">' +
                renderSidebar() +
                '<div class="admin-main-shell">' +
                    renderTopbar(snapshot, store) +
                    '<section class="admin-stage">' +
                        '<div class="admin-stage-header"><div><span class="panel-label">Default View</span><h1>Consultation CRM</h1></div><p class="detail-muted">Track leads from inquiry through trial and enrollment.</p></div>' +
                        '<div class="admin-workspace">' +
                            renderCrmBoard(snapshot, store) +
                            renderLeadDetail(snapshot, store) +
                        "</div>" +
                    "</section>" +
                "</div>" +
            "</div>";
    }

    root.EduFlowAdminView = {
        renderAdminShell: renderAdminShell,
        renderCrmBoard: renderCrmBoard,
        renderLeadDetail: renderLeadDetail
    };
}(this));
