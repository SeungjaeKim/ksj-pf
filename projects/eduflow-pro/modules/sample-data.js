(function (root) {
    var DEMO_DATA = {
        academy: {
            id: "apex-admissions-lab",
            name: "\uC5D0\uC774\uD399\uC2A4 \uC785\uC2DC\uC804\uB7B5 \uD559\uC6D0",
            displayNameKo: "\uC5D0\uC774\uD399\uC2A4 \uC785\uC2DC\uC804\uB7B5 \uD559\uC6D0"
        },
        branches: [
            { id: "gangnam", name: "\uAC15\uB0A8 \uBCF8\uC6D0", studentCount: 184, conversionRate: 34, overdueCount: 7 },
            { id: "daechi", name: "\uB300\uCE58 \uCEA0\uD37C\uC2A4", studentCount: 142, conversionRate: 28, overdueCount: 5 },
            { id: "mokdong", name: "\uBAA9\uB3D9 \uCEA0\uD37C\uC2A4", studentCount: 116, conversionRate: 25, overdueCount: 4 }
        ],
        crmStages: [
            { id: "inquiry", label: "\uBB38\uC758 \uC811\uC218", leadIds: ["lead-minseo", "lead-hyeonwu"] },
            { id: "scheduled", label: "\uC0C1\uB2F4 \uC608\uC815", leadIds: ["lead-sua"] },
            { id: "trialBooked", label: "\uCCB4\uD5D8 \uC608\uC57D", leadIds: ["lead-jiho"] },
            { id: "trialCompleted", label: "\uCCB4\uD5D8 \uC644\uB8CC", leadIds: ["lead-yeji"] },
            { id: "enrolled", label: "\uB4F1\uB85D \uC644\uB8CC", leadIds: ["lead-donghyun"] },
            { id: "lost", label: "\uBCF4\uB958 / \uC774\uD0C8", leadIds: ["lead-areum"] }
        ],
        leads: [
            { id: "lead-minseo", name: "\uCD5C\uBBFC\uC11C", grade: "\uACE02", source: "\uC778\uC2A4\uD0C0\uADF8\uB7A8", targetTrack: "\uC0AC\uD68C\uD0D0\uAD6C \uD504\uB9AC\uBBF8\uC5C4", trialDate: "2026-03-19 19:00" },
            { id: "lead-hyeonwu", name: "\uAE40\uD604\uC6B0", grade: "\uACE01", source: "\uBE14\uB85C\uADF8", targetTrack: "\uC218\uD559 \uAE30\uCD08 \uBCF4\uAC15", trialDate: "2026-03-18 18:00" },
            { id: "lead-sua", name: "\uBC15\uC218\uC544", grade: "\uACE03", source: "\uC18C\uAC1C", targetTrack: "\uD30C\uC774\uB110 \uC9D1\uC911", trialDate: "2026-03-17 20:00" },
            { id: "lead-jiho", name: "\uC774\uC9C0\uD638", grade: "\uACE02", source: "\uB9D8\uCE74\uD398", targetTrack: "\uC601\uC5B4 \uC9D1\uC911\uBC18", trialDate: "2026-03-20 19:30" },
            { id: "lead-yeji", name: "\uD55C\uC608\uC9C0", grade: "\uACE03", source: "\uC124\uBA85\uD68C", targetTrack: "\uCEE8\uC124\uD305 \uC9D1\uC911", trialDate: "2026-03-16 17:30" },
            { id: "lead-donghyun", name: "\uC11C\uB3D9\uD604", grade: "\uACE01", source: "\uC778\uC2A4\uD0C0\uADF8\uB7A8", targetTrack: "\uD559\uC0DD\uBD80 \uC131\uC7A5", trialDate: "2026-03-14 17:00" },
            { id: "lead-areum", name: "\uC815\uC544\uB984", grade: "\uACE02", source: "\uBE14\uB85C\uADF8", targetTrack: "\uC804\uD559 \uC0C1\uB2F4", trialDate: "2026-03-12 19:00" }
        ],
        students: [
            { id: "student-minseo", name: "\uCD5C\uBBFC\uC11C", goalSchool: "\uC0C1\uC704 \uC0AC\uD68C\uD0D0\uAD6C \uB300\uD559 \uD2B8\uB799", currentClass: "\uC785\uC2DC \uCEE8\uC124\uD305 \uC54C\uD30C" },
            { id: "student-donghyun", name: "\uC11C\uB3D9\uD604", goalSchool: "\uD559\uC0DD\uBD80 \uC0C1\uC704\uAD8C \uC131\uC7A5", currentClass: "\uACE01 \uC131\uC7A5 \uC218\uD559" }
        ]
    };

    function isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }

    function clone(value) {
        var copied;
        var key;
        var index;

        if (value === null || typeof value !== "object") {
            return value;
        }

        if (isArray(value)) {
            copied = [];
            for (index = 0; index < value.length; index += 1) {
                copied.push(clone(value[index]));
            }
            return copied;
        }

        copied = {};
        for (key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                copied[key] = clone(value[key]);
            }
        }
        return copied;
    }

    root.EduFlowData = {
        snapshot: function () {
            return clone(DEMO_DATA);
        },
        getAcademy: function () {
            return clone(DEMO_DATA.academy);
        },
        getBranches: function () {
            return clone(DEMO_DATA.branches);
        }
    };
}(this));
