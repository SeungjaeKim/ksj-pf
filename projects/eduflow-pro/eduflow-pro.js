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

    function bindAdminEvents() {
        var leadButtons;
        var navButtons;
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

    root.innerHTML = [
        '<section class="shell-placeholder">',
        "<h1>" + (titles[surface] || "EduFlow Pro") + "</h1>",
        "<p>" + (descriptions[surface] || "\uD654\uBA74 \uBAA9\uC5C5\uC774 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.") + "</p>",
        academy ? "<p><strong>" + academy.name + "</strong> \uB354\uBBF8 \uB370\uC774\uD130\uAC00 " + branches.length + "\uAC1C \uC9C0\uC810\uACFC \uC5F0\uACB0\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p>" : "",
        "</section>"
    ].join("");
}());
