(function (root) {
    function getTotalStudents(snapshot) {
        var total = 0;
        var index;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            total += snapshot.branches[index].studentCount;
        }

        return total;
    }

    function buildBranchSummary(snapshot) {
        var markup = [];
        var index;
        var branch;

        for (index = 0; index < snapshot.branches.length; index += 1) {
            branch = snapshot.branches[index];
            markup.push("<li><strong>" + branch.name + "</strong><span>" + branch.studentCount + " students</span></li>");
        }

        return markup.join("");
    }

    function renderPreviewStats(snapshot) {
        var stats = [
            { label: "Inquiry to Enrollment", value: "31%", note: "monthly conversion snapshot" },
            { label: "Active Students", value: String(getTotalStudents(snapshot)), note: "across 3 active branches" },
            { label: "Overdue Watch", value: "16", note: "accounts needing follow-up" }
        ];
        var cards = [];
        var index;
        var stat;

        for (index = 0; index < stats.length; index += 1) {
            stat = stats[index];
            cards.push([
                '<article class="landing-stat-card">',
                '<span class="landing-stat-label">', stat.label, "</span>",
                '<strong class="landing-stat-value">', stat.value, "</strong>",
                '<p class="landing-stat-note">', stat.note, "</p>",
                "</article>"
            ].join(""));
        }

        return [
            '<section class="landing-preview-stats">',
            '<div class="landing-preview-grid">',
            cards.join(""),
            "</div>",
            "</section>"
        ].join("");
    }

    function renderLanding(snapshot) {
        return [
            '<div class="landing-shell">',
            '<section id="landingHero" class="landing-hero">',
            '<div class="landing-copy">',
            '<p class="landing-eyebrow">Admissions CRM + Operations + Parent Trust</p>',
            '<h1>Turn every academy inquiry into one measurable operating flow.</h1>',
            '<p class="landing-lead">EduFlow Pro is a connected admissions academy platform mockup. It starts with consultation CRM, then carries that same student story through enrollment, payments, reports, parent trust, and mobile owner visibility.</p>',
            '<div class="landing-actions">',
            '<a class="landing-btn primary" href="./admin.html" data-cta-target="admin">Open Admin Demo</a>',
            '<a class="landing-btn secondary" href="./portal.html" data-cta-target="portal">Open Parent Portal</a>',
            '<a class="landing-btn secondary" href="./mobile.html" data-cta-target="mobile">Open Mobile Mode</a>',
            "</div>",
            "</div>",
            '<aside class="landing-side-panel">',
            '<span class="panel-label">Flagship Flow</span>',
            '<ol class="hero-flow-list"><li>Inquiry Received</li><li>Consultation Scheduled</li><li>Trial Completed</li><li>Enrollment Converted</li><li>Report Published</li></ol>',
            "</aside>",
            "</section>",
            renderPreviewStats(snapshot),
            '<section class="landing-section feature-band">',
            '<article class="feature-card"><h2>CRM that leads the product story</h2><p>The counseling team works from one board where inquiry intake, trial lessons, and enrollment handoffs stay visible.</p></article>',
            '<article class="feature-card"><h2>Operations that feel measurable</h2><p>Director dashboards, attendance, tuition, and anomaly cards all read from the same operating data model.</p></article>',
            '<article class="feature-card"><h2>Parent trust built into the platform</h2><p>Reports, payment history, comments, and consultation booking live in the same product family instead of separate tools.</p></article>',
            "</section>",
            '<section class="landing-section split-showcase">',
            '<div class="showcase-panel">',
            '<span class="panel-label">Branch Snapshot</span>',
            '<h2>Apex Admissions Lab</h2>',
            '<ul class="branch-list">', buildBranchSummary(snapshot), "</ul>",
            "</div>",
            '<div class="showcase-panel">',
            '<span class="panel-label">Portfolio Scope</span>',
            '<ul class="scope-list"><li>Landing + pricing + FAQ</li><li>Admin CRM and director dashboard</li><li>Parent portal report and payment views</li><li>Mobile owner mode</li></ul>',
            "</div>",
            "</section>",
            '<section class="landing-section pricing-band">',
            '<article class="pricing-card"><h3>Starter</h3><p>Core operations for a growing academy.</p></article>',
            '<article class="pricing-card featured"><h3>Growth</h3><p>CRM, tuition, reporting, and parent trust in one connected plan.</p></article>',
            '<article class="pricing-card"><h3>Pro</h3><p>Multi-branch oversight and executive comparison views.</p></article>',
            "</section>",
            '<section class="landing-section faq-band">',
            '<div class="faq-item"><h3>Is this backed by a real database?</h3><p>This portfolio release is a semi-product mockup driven by shared demo state and connected UI transitions.</p></div>',
            '<div class="faq-item"><h3>Who benefits most from the platform?</h3><p>Counseling managers and directors get the strongest value first, while teachers and parents benefit from the connected reporting flow.</p></div>',
            "</section>",
            "</div>"
        ].join("");
    }

    root.EduFlowLandingView = {
        renderLanding: renderLanding,
        renderPreviewStats: renderPreviewStats
    };
}(this));
