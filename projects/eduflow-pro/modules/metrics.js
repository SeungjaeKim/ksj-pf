(function (root) {
    function getCrmSnapshot(snapshot) {
        var stages = [];
        var index;
        var stage;

        for (index = 0; index < snapshot.crmStages.length; index += 1) {
            stage = snapshot.crmStages[index];
            stages.push({
                id: stage.id,
                label: stage.label,
                count: stage.leadIds.length
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
