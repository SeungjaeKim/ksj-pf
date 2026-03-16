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
                { id: "new-inquiries", label: "New Inquiries Today", value: 12 },
                { id: "today-consults", label: "Today's Consultations", value: 8 },
                { id: "conversion-rate", label: "Conversion Rate", value: "31%" },
                { id: "overdue", label: "Overdue Payments", value: 16 },
                { id: "students", label: "Active Students", value: totalStudents }
            ]
        };
    }

    root.EduFlowMetrics = {
        getCrmSnapshot: getCrmSnapshot,
        getOwnerKpis: getOwnerKpis
    };
}(this));
