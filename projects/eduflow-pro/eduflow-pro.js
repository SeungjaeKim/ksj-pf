(function () {
    var surface = document.body.getAttribute("data-surface");
    var root = document.getElementById("appRoot");
    var titles = {
        landing: "EduFlow Pro Landing Shell",
        admin: "EduFlow Pro Admin Shell",
        portal: "EduFlow Pro Portal Shell",
        mobile: "EduFlow Pro Mobile Shell"
    };
    var descriptions = {
        landing: "CRM-first academy SaaS mockup landing page will render here.",
        admin: "Admin workspace shell is ready for the CRM-first operating dashboard.",
        portal: "Parent and student portal shell is ready for trust-focused views.",
        mobile: "Mobile owner mode shell is ready for the executive daily summary."
    };

    if (!root) {
        return;
    }

    root.innerHTML = [
        '<section class="shell-placeholder">',
        "<h1>" + (titles[surface] || "EduFlow Pro Shell") + "</h1>",
        "<p>" + (descriptions[surface] || "Surface shell is ready.") + "</p>",
        "</section>"
    ].join("");
}());
