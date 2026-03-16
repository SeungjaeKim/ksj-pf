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
            markup.push("<li><strong>" + branch.name + "</strong><span>" + branch.studentCount + " \uBA85 \uC6B4\uC601</span></li>");
        }

        return markup.join("");
    }

    function renderPreviewStats(snapshot) {
        var stats = [
            { label: "\uBB38\uC758 \uB300\uBE44 \uB4F1\uB85D \uC804\uD658\uC728", value: "31%", note: "\uC774\uBC88 \uB2EC \uAE30\uC900 \uC804\uD658 \uC2A4\uB0C5\uC0F7" },
            { label: "\uC7AC\uC6D0 \uD559\uC0DD \uC218", value: String(getTotalStudents(snapshot)), note: "3\uAC1C \uC9C0\uC810 \uD1B5\uD569 \uC6B4\uC601" },
            { label: "\uBBF8\uB0A9 \uAD00\uB9AC", value: "16", note: "\uD6C4\uC18D \uC548\uB0B4\uAC00 \uD544\uC694\uD55C \uACC4\uC815" }
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
            '<p class="landing-eyebrow">\uC0C1\uB2F4 CRM + \uC6B4\uC601 \uAD00\uB9AC + \uD559\uBD80\uBAA8 \uC2E0\uB8B0</p>',
            '<h1>\uD559\uC6D0 \uBB38\uC758\uBD80\uD130 \uB4F1\uB85D \uC774\uD6C4 \uC6B4\uC601\uAE4C\uC9C0, \uD558\uB098\uC758 \uD750\uB984\uC73C\uB85C \uC5F0\uACB0\uD558\uC138\uC694.</h1>',
            '<p class="landing-lead">EduFlow Pro\uB294 \uC785\uC2DC\u00B7\uCEE8\uC124\uD305 \uACB0\uD569\uD615 \uD559\uC6D0\uC744 \uC704\uD55C \uD1B5\uD569 \uC6B4\uC601 \uBAA9\uC5C5\uC785\uB2C8\uB2E4. \uC0C1\uB2F4 CRM\uC5D0\uC11C \uC2DC\uC791\uD574 \uB4F1\uB85D, \uC218\uB0A9, \uD559\uC2B5 \uB9AC\uD3EC\uD2B8, \uD559\uBD80\uBAA8 \uD3EC\uD138, \uBAA8\uBC14\uC77C \uC6D0\uC7A5 \uBAA8\uB4DC\uAE4C\uC9C0 \uAC19\uC740 \uD559\uC0DD \uD750\uB984\uC73C\uB85C \uC774\uC5B4\uC9D1\uB2C8\uB2E4.</p>',
            '<div class="landing-actions">',
            '<a class="landing-btn primary" href="./admin.html" data-cta-target="admin">\uAD00\uB9AC\uC790 \uB370\uBAA8 \uC5F4\uAE30</a>',
            '<a class="landing-btn secondary" href="./portal.html" data-cta-target="portal">\uD559\uBD80\uBAA8 \uD3EC\uD138 \uC5F4\uAE30</a>',
            '<a class="landing-btn secondary" href="./mobile.html" data-cta-target="mobile">\uBAA8\uBC14\uC77C \uC6D0\uC7A5 \uBAA8\uB4DC</a>',
            "</div>",
            "</div>",
            '<aside class="landing-side-panel">',
            '<span class="panel-label">\uB300\uD45C \uD750\uB984</span>',
            '<ol class="hero-flow-list"><li>\uBB38\uC758 \uC811\uC218</li><li>\uC0C1\uB2F4 \uC608\uC815</li><li>\uCCB4\uD5D8 \uC644\uB8CC</li><li>\uB4F1\uB85D \uC804\uD658</li><li>\uB9AC\uD3EC\uD2B8 \uBC1C\uD589</li></ol>',
            "</aside>",
            "</section>",
            renderPreviewStats(snapshot),
            '<section class="landing-section feature-band">',
            '<article class="feature-card"><h2>\uC81C\uD488 \uC2DC\uC791\uC810\uC774 \uB418\uB294 \uC0C1\uB2F4 CRM</h2><p>\uBB38\uC758 \uC811\uC218, \uCCB4\uD5D8\uC218\uC5C5, \uB4F1\uB85D \uC804\uD658\uC744 \uD558\uB098\uC758 \uBCF4\uB4DC\uC5D0\uC11C \uC774\uC5B4\uC11C \uAD00\uB9AC\uD569\uB2C8\uB2E4.</p></article>',
            '<article class="feature-card"><h2>\uC22B\uC790\uB85C \uBCF4\uC774\uB294 \uC6B4\uC601 \uAD00\uB9AC</h2><p>\uC6D0\uC7A5 \uB300\uC2DC\uBCF4\uB4DC, \uCD9C\uACB0, \uC218\uB0A9, \uC774\uC0C1 \uC9D5\uD6C4 \uCE74\uB4DC\uAC00 \uAC19\uC740 \uC6B4\uC601 \uB370\uC774\uD130\uC5D0\uC11C \uC5F0\uACB0\uB429\uB2C8\uB2E4.</p></article>',
            '<article class="feature-card"><h2>\uD559\uBD80\uBAA8 \uC2E0\uB8B0\uAE4C\uC9C0 \uD55C \uC81C\uD488 \uC548\uC5D0\uC11C</h2><p>\uB9AC\uD3EC\uD2B8, \uACB0\uC81C \uB0B4\uC5ED, \uC0C1\uB2F4 \uC608\uC57D, \uCF54\uBA58\uD2B8\uAC00 \uB530\uB85C \uB180\uC9C0 \uC54A\uACE0 \uAC19\uC740 \uD750\uB984\uC73C\uB85C \uC774\uC5B4\uC9D1\uB2C8\uB2E4.</p></article>',
            "</section>",
            '<section class="landing-section split-showcase">',
            '<div class="showcase-panel">',
            '<span class="panel-label">\uC9C0\uC810 \uD604\uD669</span>',
            '<h2>' + snapshot.academy.name + '</h2>',
            '<ul class="branch-list">', buildBranchSummary(snapshot), "</ul>",
            "</div>",
            '<div class="showcase-panel">',
            '<span class="panel-label">\uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uBC94\uC704</span>',
            '<ul class="scope-list"><li>\uB79C\uB529 + \uC694\uAE08\uC81C + FAQ</li><li>\uAD00\uB9AC\uC790 CRM + \uC6D0\uC7A5 \uB300\uC2DC\uBCF4\uB4DC</li><li>\uD559\uBD80\uBAA8 \uD3EC\uD138 \uB9AC\uD3EC\uD2B8 + \uACB0\uC81C</li><li>\uBAA8\uBC14\uC77C \uC6D0\uC7A5 \uBAA8\uB4DC</li></ul>',
            "</div>",
            "</section>",
            '<section class="landing-section pricing-band">',
            '<article class="pricing-card"><h3>\uC2A4\uD0C0\uD130</h3><p>\uC131\uC7A5 \uD559\uC6D0\uC744 \uC704\uD55C \uD575\uC2EC \uC6B4\uC601 \uAE30\uB2A5.</p></article>',
            '<article class="pricing-card featured"><h3>\uADF8\uB85C\uC2A4</h3><p>CRM, \uC218\uB0A9, \uB9AC\uD3EC\uD2B8, \uD559\uBD80\uBAA8 \uC2E0\uB8B0 \uD750\uB984\uC744 \uD558\uB098\uB85C \uBB36\uC740 \uD50C\uB79C.</p></article>',
            '<article class="pricing-card"><h3>\uD504\uB85C</h3><p>\uB2E4\uC9C0\uC810 \uBE44\uAD50\uC640 \uBCF8\uC0AC \uAD00\uC810 \uBCF4\uACE0\uC11C \uAE30\uB2A5.</p></article>',
            "</section>",
            '<section class="landing-section faq-band">',
            '<div class="faq-item"><h3>\uC2E4\uC81C \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uAC00 \uC5F0\uACB0\uB418\uC5B4 \uC788\uB098\uC694?</h3><p>\uC774\uBC88 \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uB294 \uACF5\uC720 \uB354\uBBF8 \uC0C1\uD0DC\uC640 \uC5F0\uACB0\uD615 UI \uC804\uD658\uC73C\uB85C \uAD6C\uC131\uB41C \uC900\uC81C\uD488\uD615 \uBAA9\uC5C5\uC785\uB2C8\uB2E4.</p></div>',
            '<div class="faq-item"><h3>\uC5B4\uB5A4 \uD559\uC6D0\uC5D0 \uAC00\uC7A5 \uC798 \uB9DE\uB098\uC694?</h3><p>\uC0C1\uB2F4\uC2E4\uC7A5\uACFC \uC6D0\uC7A5\uC774 \uBA3C\uC800 \uAC00\uCE58\uB97C \uB290\uB07C\uACE0, \uADF8 \uB2E4\uC74C \uAC15\uC0AC\uC640 \uD559\uBD80\uBAA8 \uACBD\uD5D8\uC73C\uB85C \uD655\uC7A5\uB418\uB294 \uC785\uC2DC\u00B7\uCEE8\uC124\uD305 \uACB0\uD569\uD615 \uD559\uC6D0\uC5D0 \uC801\uD569\uD569\uB2C8\uB2E4.</p></div>',
            "</section>",
            "</div>"
        ].join("");
    }

    root.EduFlowLandingView = {
        renderLanding: renderLanding,
        renderPreviewStats: renderPreviewStats
    };
}(this));
