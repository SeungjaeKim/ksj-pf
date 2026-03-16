(function (root) {
    function buildDefaultLeadStages() {
        var snapshot = root.EduFlowData ? root.EduFlowData.snapshot() : null;
        var stages = {};
        var stageIndex;
        var leadIndex;
        var stage;

        if (!snapshot) {
            return stages;
        }

        for (stageIndex = 0; stageIndex < snapshot.crmStages.length; stageIndex += 1) {
            stage = snapshot.crmStages[stageIndex];
            for (leadIndex = 0; leadIndex < stage.leadIds.length; leadIndex += 1) {
                stages[stage.leadIds[leadIndex]] = stage.id;
            }
        }

        return stages;
    }

    root.EduFlowState = {
        createStore: function () {
            return {
                currentBranchId: "gangnam",
                currentAdminView: "crm",
                selectedLeadId: "lead-minseo",
                selectedStudentId: "student-donghyun",
                leadStages: buildDefaultLeadStages(),
                convertedLeadIds: {},
                createdInvoices: {},
                draftReports: {},
                publishedReports: {},
                portalBookings: {}
            };
        },
        getLeadStage: function (store, leadId) {
            return store.leadStages[leadId] || "inquiry";
        },
        getLinkedStudentId: function (store, leadId) {
            return store.convertedLeadIds[leadId] || "";
        },
        getDraftInvoice: function (store, studentId) {
            return store.createdInvoices[studentId] || { status: "missing", amount: 0 };
        },
        convertLead: function (store, leadId) {
            var studentId = leadId === "lead-minseo" ? "student-minseo" : leadId.replace("lead-", "student-");

            store.convertedLeadIds[leadId] = studentId;
            store.createdInvoices[studentId] = {
                status: "pending",
                amount: 890000
            };
            store.draftReports[studentId] = {
                status: "draft"
            };
            store.leadStages[leadId] = "enrolled";
            store.selectedStudentId = studentId;
        },
        selectLead: function (store, leadId) {
            store.selectedLeadId = leadId;
        },
        setAdminView: function (store, viewId) {
            store.currentAdminView = viewId;
        },
        publishReport: function (store, studentId) {
            store.publishedReports[studentId] = true;
        },
        bookConsultation: function (store, studentId, slotId) {
            store.portalBookings[studentId] = slotId;
        }
    };
}(this));
