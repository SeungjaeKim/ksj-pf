(function () {
    var surface = document.body.getAttribute("data-surface");
    var root = document.getElementById("appRoot");
    var storageKey = "eduflow-pro-store-v1";
    var snapshot = window.EduFlowData ? window.EduFlowData.snapshot() : null;
    var store = window.EduFlowState ? hydrateStore(window.EduFlowState.createStore()) : null;
    var academy = window.EduFlowData ? window.EduFlowData.getAcademy() : null;
    var branches = window.EduFlowData ? window.EduFlowData.getBranches() : [];
    var portalView = "home";
    var portalStudentId = "student-minseo";
    var mobileView = "today";
    var draggedLeadId = "";
    var titles = {
        landing: "EduFlow Pro \uB79C\uB529",
        admin: "EduFlow Pro \uAD00\uB9AC\uC790",
        portal: "EduFlow Pro \uD559\uBD80\uBAA8 \uD3EC\uD138",
        mobile: "EduFlow Pro \uBAA8\uBC14\uC77C \uC6D0\uC7A5 \uBAA8\uB4DC"
    };
    var descriptions = {
        landing: "CRM \uC911\uC2EC \uD559\uC6D0 SaaS \uB79C\uB529 \uBAA9\uC5C5 \uD654\uBA74\uC785\uB2C8\uB2E4.",
        admin: "\uC0C1\uB2F4 CRM \uAE30\uBC18 \uC6B4\uC601 \uB300\uC2DC\uBCF4\uB4DC\uB97C \uC704\uD55C \uAD00\uB9AC\uC790 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC785\uB2C8\uB2E4.",
        portal: "\uD559\uBD80\uBAA8\uC640 \uD559\uC0DD\uC774 \uCD9C\uACB0, \uC219\uC81C, \uB9AC\uD3EC\uD2B8, \uC218\uB0A9 \uD604\uD669\uC744 \uD655\uC778\uD558\uB294 \uD3EC\uD138 \uBAA9\uC5C5\uC785\uB2C8\uB2E4.",
        mobile: "\uC6D0\uC7A5\uC774 \uC624\uB298\uC758 \uD575\uC2EC \uC6B4\uC601 \uC9C0\uD45C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD558\uB294 \uBAA8\uBC14\uC77C \uBAA8\uB4DC \uBAA9\uC5C5\uC785\uB2C8\uB2E4."
    };

    function canUseStorage() {
        try {
            return !!window.localStorage;
        } catch (error) {
            return false;
        }
    }

    function hydrateStore(baseStore) {
        var saved;
        var parsed;
        var key;

        if (!canUseStorage()) {
            return baseStore;
        }

        saved = window.localStorage.getItem(storageKey);
        if (!saved) {
            return baseStore;
        }

        try {
            parsed = JSON.parse(saved);
            for (key in parsed) {
                if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                    baseStore[key] = parsed[key];
                }
            }
        } catch (error) {
            return baseStore;
        }

        return baseStore;
    }

    function persistStore() {
        if (!store || !canUseStorage()) {
            return;
        }

        try {
            window.localStorage.setItem(storageKey, JSON.stringify(store));
        } catch (error) {
            return;
        }
    }

    function clearCrmDragState() {
        var activeDropTargets;
        var draggingCards;
        var index;

        activeDropTargets = root.querySelectorAll(".crm-column.is-drop-target");
        for (index = 0; index < activeDropTargets.length; index += 1) {
            activeDropTargets[index].classList.remove("is-drop-target");
        }

        draggingCards = root.querySelectorAll(".crm-lead-card.is-dragging");
        for (index = 0; index < draggingCards.length; index += 1) {
            draggingCards[index].classList.remove("is-dragging");
        }

        draggedLeadId = "";
    }

    function applyLeadStageChange(leadId, stageId) {
        if (!leadId || !stageId) {
            return;
        }

        window.EduFlowState.selectLead(store, leadId);

        if (window.EduFlowState.getLeadStage(store, leadId) === stageId) {
            return;
        }

        if (stageId === "enrolled") {
            window.EduFlowState.convertLead(store, leadId);
            return;
        }

        window.EduFlowState.moveLeadToStage(store, leadId, stageId);
    }

    function requestLeadStageChange(leadId, stageId) {
        if (!leadId || !stageId) {
            return;
        }

        window.EduFlowState.selectLead(store, leadId);

        if (window.EduFlowState.getLeadStage(store, leadId) === stageId) {
            persistStore();
            renderAdmin();
            return;
        }

        if (window.EduFlowState.requiresLeadStageConfirmation(stageId)) {
            window.EduFlowState.startPendingStageChange(store, leadId, stageId);
        } else {
            window.EduFlowState.clearPendingStageChange(store);
            applyLeadStageChange(leadId, stageId);
        }

        persistStore();
        renderAdmin();
    }

    function bindAdminEvents() {
        var leadButtons;
        var navButtons;
        var stageColumns;
        var stageActionButtons;
        var confirmButtons;
        var convertButton;
        var publishButton;
        var index;

        navButtons = root.querySelectorAll("[data-admin-view]");
        for (index = 0; index < navButtons.length; index += 1) {
            navButtons[index].addEventListener("click", function () {
                window.EduFlowState.setAdminView(store, this.getAttribute("data-admin-view"));
                persistStore();
                renderAdmin();
            });
        }

        leadButtons = root.querySelectorAll("[data-lead-id]");
        for (index = 0; index < leadButtons.length; index += 1) {
            leadButtons[index].addEventListener("click", function () {
                window.EduFlowState.selectLead(store, this.getAttribute("data-lead-id"));
                persistStore();
                renderAdmin();
            });

            leadButtons[index].addEventListener("dragstart", function (event) {
                draggedLeadId = this.getAttribute("data-lead-id");
                this.classList.add("is-dragging");
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", draggedLeadId);
                }
            });

            leadButtons[index].addEventListener("dragend", function () {
                clearCrmDragState();
            });
        }

        stageColumns = root.querySelectorAll(".crm-column[data-stage-id]");
        for (index = 0; index < stageColumns.length; index += 1) {
            stageColumns[index].addEventListener("dragover", function (event) {
                event.preventDefault();
                this.classList.add("is-drop-target");
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = "move";
                }
            });

            stageColumns[index].addEventListener("dragenter", function (event) {
                event.preventDefault();
                this.classList.add("is-drop-target");
            });

            stageColumns[index].addEventListener("dragleave", function () {
                this.classList.remove("is-drop-target");
            });

            stageColumns[index].addEventListener("drop", function (event) {
                var leadId = draggedLeadId;

                event.preventDefault();
                clearCrmDragState();

                if (!leadId && event.dataTransfer) {
                    leadId = event.dataTransfer.getData("text/plain");
                }

                requestLeadStageChange(leadId, this.getAttribute("data-stage-id"));
            });
        }

        stageActionButtons = root.querySelectorAll("[data-stage-action]");
        for (index = 0; index < stageActionButtons.length; index += 1) {
            stageActionButtons[index].addEventListener("click", function () {
                requestLeadStageChange(store.selectedLeadId, this.getAttribute("data-stage-action"));
            });
        }

        confirmButtons = root.querySelectorAll("[data-confirm-stage-change]");
        for (index = 0; index < confirmButtons.length; index += 1) {
            confirmButtons[index].addEventListener("click", function () {
                var pending = store.pendingStageChange;

                if (this.getAttribute("data-confirm-stage-change") === "cancel") {
                    window.EduFlowState.clearPendingStageChange(store);
                    persistStore();
                    renderAdmin();
                    return;
                }

                if (!pending) {
                    return;
                }

                applyLeadStageChange(pending.leadId, pending.stageId);
                window.EduFlowState.clearPendingStageChange(store);
                persistStore();
                renderAdmin();
            });
        }

        convertButton = root.querySelector('[data-action="convert-lead"]');
        if (convertButton) {
            convertButton.addEventListener("click", function () {
                window.EduFlowState.convertLead(store, store.selectedLeadId);
                persistStore();
                renderAdmin();
            });
        }

        publishButton = root.querySelector('[data-action="publish-report"]');
        if (publishButton) {
            publishButton.addEventListener("click", function () {
                window.EduFlowState.publishReport(store, store.selectedStudentId);
                persistStore();
                renderAdmin();
            });
        }
    }

    function renderAdmin() {
        root.innerHTML = window.EduFlowAdminView.renderAdminShell(snapshot, store);
        bindAdminEvents();
    }

    function bindPortalEvents() {
        var bookingButtons;
        var tabButtons;
        var index;

        tabButtons = root.querySelectorAll("[data-portal-view]");
        for (index = 0; index < tabButtons.length; index += 1) {
            tabButtons[index].addEventListener("click", function () {
                portalView = this.getAttribute("data-portal-view");
                renderPortal();
            });
        }

        bookingButtons = root.querySelectorAll("[data-booking-slot]");
        for (index = 0; index < bookingButtons.length; index += 1) {
            bookingButtons[index].addEventListener("click", function () {
                window.EduFlowState.bookConsultation(store, portalStudentId, this.getAttribute("data-booking-slot"));
                persistStore();
                portalView = "home";
                renderPortal();
            });
        }
    }

    function renderPortal() {
        root.innerHTML = window.EduFlowPortalView.renderPortalShell(snapshot, store, portalStudentId, portalView);
        bindPortalEvents();
    }

    function bindMobileEvents() {
        var tabButtons;
        var index;

        tabButtons = root.querySelectorAll("[data-mobile-view]");
        for (index = 0; index < tabButtons.length; index += 1) {
            tabButtons[index].addEventListener("click", function () {
                mobileView = this.getAttribute("data-mobile-view");
                renderMobile();
            });
        }
    }

    function renderMobile() {
        root.innerHTML = window.EduFlowMobileView.renderMobileShell(snapshot, store, mobileView);
        bindMobileEvents();
    }

    if (!root) {
        return;
    }

    if (surface === "landing" && window.EduFlowLandingView && snapshot) {
        root.innerHTML = window.EduFlowLandingView.renderLanding(snapshot);
        return;
    }

    if (surface === "admin" && window.EduFlowAdminView && snapshot && window.EduFlowState) {
        renderAdmin();
        return;
    }

    if (surface === "portal" && window.EduFlowPortalView && snapshot && window.EduFlowState) {
        renderPortal();
        return;
    }

    if (surface === "mobile" && window.EduFlowMobileView && snapshot && window.EduFlowState) {
        renderMobile();
        return;
    }

    root.innerHTML = [
        '<section class="shell-placeholder">',
        "<h1>" + (titles[surface] || "EduFlow Pro") + "</h1>",
        "<p>" + (descriptions[surface] || "\uD654\uBA74 \uBAA9\uC5C5\uC774 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.") + "</p>",
        academy ? "<p><strong>" + academy.name + "</strong> \uB354\uBBF8 \uB370\uC774\uD130\uAC00 " + branches.length + "\uAC1C \uC9C0\uC810\uACFC \uC5F0\uACB0\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p>" : "",
        "</section>"
    ].join("");
}());
