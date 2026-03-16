(function (root) {
    function getCrmSnapshot(snapshot, store) {
        var stages = [];
        var index;
        var stage;
        var leadIndex;
        var leadId;
        var count;

        for (index = 0; index < snapshot.crmStages.length; index += 1) {
            stage = snapshot.crmStages[index];
            count = 0;

            for (leadIndex = 0; leadIndex < stage.leadIds.length; leadIndex += 1) {
                leadId = stage.leadIds[leadIndex];
                if (!store || !store.leadStages || store.leadStages[leadId] === stage.id) {
                    count += 1;
                }
            }

            stages.push({
                id: stage.id,
                label: stage.label,
                count: count
            });
        }

        return {
            stages: stages
        };
    }

    function getOwnerKpis(snapshot) {
        var totalStudents = 0;
        var index;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            totalStudents += snapshot.branches[index].studentCount;
        }

        return {
            cards: [
                { id: "new-inquiries", label: "\uC624\uB298 \uC2E0\uADDC \uBB38\uC758", value: 12 },
                { id: "today-consults", label: "\uC624\uB298 \uC0C1\uB2F4 \uC77C\uC815", value: 8 },
                { id: "conversion-rate", label: "\uB4F1\uB85D \uC804\uD658\uC728", value: "31%" },
                { id: "overdue", label: "\uBBF8\uB0A9 \uAD00\uB9AC", value: 16 },
                { id: "students", label: "\uC7AC\uC6D0 \uD559\uC0DD \uC218", value: totalStudents }
            ]
        };
    }

    root.EduFlowMetrics = {
        getCrmSnapshot: getCrmSnapshot,
        getOwnerKpis: getOwnerKpis
    };
}(this));
