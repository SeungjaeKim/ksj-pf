(function (root) {
    var DEMO_DATA = {
        academy: {
            id: "apex-admissions-lab",
            name: "Apex Admissions Lab",
            displayNameKo: "에이펙스 입시전략 학원"
        },
        branches: [
            { id: "gangnam", name: "Gangnam Main", studentCount: 184, conversionRate: 34, overdueCount: 7 },
            { id: "daechi", name: "Daechi Campus", studentCount: 142, conversionRate: 28, overdueCount: 5 },
            { id: "mokdong", name: "Mokdong Campus", studentCount: 116, conversionRate: 25, overdueCount: 4 }
        ],
        crmStages: [
            { id: "inquiry", label: "Inquiry Received", leadIds: ["lead-minseo", "lead-hyeonwu"] },
            { id: "scheduled", label: "Consultation Scheduled", leadIds: ["lead-sua"] },
            { id: "trialBooked", label: "Trial Booked", leadIds: ["lead-jiho"] },
            { id: "trialCompleted", label: "Trial Completed", leadIds: ["lead-yeji"] },
            { id: "enrolled", label: "Enrolled", leadIds: ["lead-donghyun"] },
            { id: "lost", label: "Lost / Deferred", leadIds: ["lead-areum"] }
        ],
        leads: [
            { id: "lead-minseo", name: "Choi Min-seo", grade: "Grade 11", source: "Instagram" },
            { id: "lead-hyeonwu", name: "Kim Hyeon-woo", grade: "Grade 10", source: "Blog" },
            { id: "lead-sua", name: "Park Su-a", grade: "Grade 12", source: "Referral" }
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
