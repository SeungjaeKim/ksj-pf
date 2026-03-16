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

    function renderLeadCard(lead, store) {
        var selectedClass = lead.id === store.selectedLeadId ? " is-selected" : "";

        return [
            '<button type="button" class="crm-lead-card', selectedClass, '" data-lead-id="', lead.id, '">',
            '<span class="crm-lead-grade">', lead.grade, "</span>",
            '<strong class="crm-lead-name">', lead.name, "</strong>",
            '<span class="crm-lead-source">', lead.source, "</span>",
            "</button>"
        ].join("");
    }

    function renderCrmBoard(snapshot, store) {
        var columns = [];
        var columnIndex;
        var cardIndex;
        var stage;
        var lead;
        var cards;

        for (columnIndex = 0; columnIndex < snapshot.crmStages.length; columnIndex += 1) {
            stage = snapshot.crmStages[columnIndex];
            cards = [];

            for (cardIndex = 0; cardIndex < stage.leadIds.length; cardIndex += 1) {
                lead = findLead(snapshot, stage.leadIds[cardIndex]);
                if (lead) {
                    cards.push(renderLeadCard(lead, store));
                }
            }

            columns.push([
                '<section class="crm-column">',
                '<header class="crm-column-header"><h3>', stage.label, "</h3><span>", String(stage.leadIds.length), "</span></header>",
                '<div class="crm-column-body">', cards.join(""), "</div>",
                "</section>"
            ].join(""));
        }

        return [
            '<section class="crm-board">',
            columns.join(""),
            "</section>"
        ].join("");
    }

    function renderLeadDetail(snapshot, store) {
        var lead = findLead(snapshot, store.selectedLeadId) || snapshot.leads[0];

        return [
            '<aside class="admin-detail-panel">',
            '<span class="panel-label">Selected Lead</span>',
            '<h2>', lead.name, "</h2>",
            '<p class="detail-muted">', lead.grade, ' · ', lead.source, "</p>",
            '<div class="detail-stack">',
            '<article><strong>Target Track</strong><p>Social sciences premium track</p></article>',
            '<article><strong>Parent Contact</strong><p>010-1234-5678 · prefers evening calls</p></article>',
            '<article><strong>Next Action</strong><p>Confirm trial feedback and prepare enrollment offer.</p></article>',
            "</div>",
            "</aside>"
        ].join("");
    }

    function renderSidebar() {
        return [
            '<nav class="admin-sidebar">',
            '<a href="#" class="admin-brand">EduFlow Pro</a>',
            '<button type="button" class="admin-nav-item is-active" data-admin-view="crm">Consultation CRM</button>',
            '<button type="button" class="admin-nav-item" data-admin-view="dashboard">Owner Dashboard</button>',
            '<button type="button" class="admin-nav-item" data-admin-view="students">Students</button>',
            '<button type="button" class="admin-nav-item" data-admin-view="payments">Payments</button>',
            "</nav>"
        ].join("");
    }

    function renderTopbar(snapshot, store) {
        return [
            '<header class="admin-topbar">',
            '<div><span class="panel-label">Current Branch</span><strong>', store.currentBranchId, "</strong></div>",
            '<div><span class="panel-label">Academy</span><strong>', snapshot.academy.name, "</strong></div>",
            "</header>"
        ].join("");
    }

    function renderAdminShell(snapshot, store) {
        return [
            '<div class="admin-shell">',
            renderSidebar(),
            '<div class="admin-main-shell">',
            renderTopbar(snapshot, store),
            '<section class="admin-stage">',
            '<div class="admin-stage-header"><div><span class="panel-label">Default View</span><h1>Consultation CRM</h1></div><p class="detail-muted">Track leads from inquiry through trial and enrollment.</p></div>',
            '<div class="admin-workspace">',
            renderCrmBoard(snapshot, store),
            renderLeadDetail(snapshot, store),
            "</div>",
            "</section>",
            "</div>",
            "</div>"
        ].join("");
    }

    root.EduFlowAdminView = {
        renderAdminShell: renderAdminShell,
        renderCrmBoard: renderCrmBoard,
        renderLeadDetail: renderLeadDetail
    };
}(this));
