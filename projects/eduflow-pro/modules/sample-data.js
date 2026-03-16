(function (root) {
    var DEMO_DATA = {
        academy: {
            id: "apex-admissions-lab",
            name: "Apex Admissions Lab",
            displayNameKo: "Apex Admissions Academy"
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
            { id: "lead-minseo", name: "Choi Min-seo", grade: "Grade 11", source: "Instagram", targetTrack: "Social sciences premium", trialDate: "2026-03-19 19:00" },
            { id: "lead-hyeonwu", name: "Kim Hyeon-woo", grade: "Grade 10", source: "Blog", targetTrack: "Math foundation", trialDate: "2026-03-18 18:00" },
            { id: "lead-sua", name: "Park Su-a", grade: "Grade 12", source: "Referral", targetTrack: "Final sprint", trialDate: "2026-03-17 20:00" },
            { id: "lead-jiho", name: "Lee Ji-ho", grade: "Grade 11", source: "Moms Cafe", targetTrack: "English intensive", trialDate: "2026-03-20 19:30" },
            { id: "lead-yeji", name: "Han Ye-ji", grade: "Grade 12", source: "Offline Briefing", targetTrack: "Consulting focus", trialDate: "2026-03-16 17:30" },
            { id: "lead-donghyun", name: "Seo Dong-hyeon", grade: "Grade 10", source: "Instagram", targetTrack: "School record growth", trialDate: "2026-03-14 17:00" },
            { id: "lead-areum", name: "Jeong A-reum", grade: "Grade 11", source: "Blog", targetTrack: "Transfer consult", trialDate: "2026-03-12 19:00" }
        ],
        students: [
            { id: "student-minseo", name: "Choi Min-seo", goalSchool: "Top social sciences track", currentClass: "Admissions Consulting Alpha" },
            { id: "student-donghyun", name: "Seo Dong-hyeon", goalSchool: "School record growth", currentClass: "Grade 10 Growth Math" }
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
