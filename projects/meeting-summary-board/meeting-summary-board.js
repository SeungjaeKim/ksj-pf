const SAMPLE_TEXT = {
    planning: `김민지: 오늘은 회의 요약 보드 MVP 범위를 정리하겠습니다.
박준호: 첫 화면에서는 회의록 붙여넣기와 샘플 불러오기 두 가지만 제공하면 충분해요.
이서연: 요약 결과는 핵심 요약, 결정 사항, 액션 아이템, 담당자별 보드로 나누는 게 좋겠습니다.
김민지: 디자인 시안은 이번 주 금요일까지 제가 먼저 공유할게요.
박준호: 액션 아이템에는 담당자와 마감일이 꼭 보여야 합니다.
이서연: 일정이 빠듯해서 파일 업로드와 Slack 연동은 2차로 미루는 걸로 하죠.
김민지: 좋습니다. 1차 릴리즈에서는 텍스트 입력 기반 MVP로 결정하겠습니다.
박준호: 저는 다음 주 수요일까지 액션 추출 로직 초안 정리하겠습니다.
이서연: 사용자 테스트용 소개 문구와 케이스는 내일까지 제가 작성해둘게요.
김민지: 리스크는 화자명이 없는 녹취 텍스트에서 담당자 추출 정확도가 떨어질 수 있다는 점입니다.`,
    transcript: `사회자: 이번 주 운영 회의 시작하겠습니다.
민지: 고객사 데모는 3월 18일 화요일 오전으로 확정됐고 데모 자료는 오늘 안에 업데이트가 필요합니다.
준호: 결제 페이지 오류는 재현이 됐고 제가 내일 오전까지 원인 정리해서 공유하겠습니다.
서연: FAQ 문서는 현재 비어 있어서 고객 문의 대응에 우려가 있어요. 이번 주 안에 초안 작성하겠습니다.
민지: 데모 전까지 메인 화면 카피는 더 명확하게 바꾸기로 했습니다.
준호: 로그 수집은 아직 안 붙어 있어서 장애 대응이 늦어질 수 있습니다.
사회자: 그럼 민지는 데모 자료 업데이트, 준호는 결제 오류 정리, 서연은 FAQ 초안 작성 담당으로 진행할게요.
민지: 네, 저는 오늘 5시까지 업데이트본 링크 전달하겠습니다.
서연: FAQ는 금요일 오후에 검토 요청드릴게요.`
};

const sampleButtons = Array.from(document.querySelectorAll('.sample-btn'));
const transcriptInput = document.getElementById('transcriptInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const statusText = document.getElementById('statusText');
const resultsSection = document.getElementById('resultsSection');
const resultSummaryLine = document.getElementById('resultSummaryLine');
const statsGrid = document.getElementById('statsGrid');
const summaryHighlights = document.getElementById('summaryHighlights');
const decisionList = document.getElementById('decisionList');
const riskList = document.getElementById('riskList');
const actionBoard = document.getElementById('actionBoard');
const ownerBoard = document.getElementById('ownerBoard');
const actionCountBadge = document.getElementById('actionCountBadge');
const ownerCountBadge = document.getElementById('ownerCountBadge');

const STOP_WORDS = [
    '오늘', '이번', '다음', '회의', '정리', '공유', '진행', '검토', '작성', '업데이트', '초안',
    '담당', '필요', '예정', '관련', '기준', '현재', '고객', '화면', '기능', '자료', '문구',
    '까지', '에서', '으로', '해서', '그리고', '입니다', '합니다', '있습니다'
];

sampleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const sample = button.dataset.sample;
        transcriptInput.value = SAMPLE_TEXT[sample] || '';
        statusText.textContent = '샘플 데이터를 불러왔습니다. 보드 생성을 눌러 결과를 확인해 보세요.';
    });
});

clearInputBtn.addEventListener('click', () => {
    transcriptInput.value = '';
    statusText.textContent = '입력창을 비웠습니다.';
});

analyzeBtn.addEventListener('click', async () => {
    const rawText = transcriptInput.value.trim();
    if (!rawText) {
        statusText.textContent = '먼저 회의록이나 녹취 텍스트를 입력해 주세요.';
        transcriptInput.focus();
        return;
    }

    analyzeBtn.disabled = true;
    statusText.textContent = '회의 내용을 정리해서 보드를 생성하는 중입니다...';
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    const parsed = analyzeMeetingText(rawText);
    renderBoard(parsed);

    analyzeBtn.disabled = false;
    statusText.textContent = '분석이 완료되었습니다. 아래 결과를 확인해 보세요.';
});

function analyzeMeetingText(rawText) {
    const entries = parseEntries(rawText);
    const participants = extractParticipants(entries);
    const actions = extractActions(entries, participants);
    const decisions = extractSentencesByKeywords(entries, ['결정', '확정', '합의', '가기로', '미루는 걸로', '채택']);
    const risks = extractSentencesByKeywords(entries, ['리스크', '우려', '문제', '오류', '지연', '늦어질', '정확도']);
    const keywords = extractKeywords(rawText);
    const summary = buildHighlights(entries, actions, decisions, risks, keywords, participants);
    const owners = groupByOwner(actions);

    return {
        participants,
        actions,
        decisions: decisions.length ? decisions : ['명시적인 결정 문장은 적었지만, 액션 아이템 구조는 잘 잡혀 있습니다.'],
        risks: risks.length ? risks : ['즉시 보이는 큰 리스크는 없지만, 미정 담당자와 마감일은 후속 확인이 필요합니다.'],
        summary,
        owners,
        keywords
    };
}

function parseEntries(rawText) {
    const lines = rawText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    const entries = [];

    lines.forEach((line) => {
        const speakerMatch = line.match(/^([가-힣A-Za-z]{2,12})\s*[:：-]\s*(.+)$/);
        if (speakerMatch) {
            entries.push({ speaker: speakerMatch[1], text: speakerMatch[2].trim() });
            return;
        }

        line
            .split(/(?<=[.!?])\s+|(?<=다)\s+(?=[가-힣A-Za-z])/)
            .map((sentence) => sentence.trim())
            .filter(Boolean)
            .forEach((sentence) => entries.push({ speaker: '', text: sentence }));
    });

    return entries;
}

function extractParticipants(entries) {
    const names = new Set();

    entries.forEach((entry) => {
        if (entry.speaker) {
            names.add(entry.speaker);
        }

        const matches = entry.text.match(/([가-힣]{2,4})(?:님|은|는|이|가|를|을)/g) || [];
        matches.forEach((item) => {
            const name = item.replace(/(님|은|는|이|가|를|을)$/g, '');
            if (name.length >= 2 && name.length <= 4) {
                names.add(name);
            }
        });
    });

    return Array.from(names);
}

function extractSentencesByKeywords(entries, keywords) {
    return entries
        .filter((entry) => keywords.some((keyword) => entry.text.includes(keyword)))
        .map((entry) => cleanSentence(entry.text))
        .filter((text, index, array) => text && array.indexOf(text) === index)
        .slice(0, 5);
}

function extractActions(entries, participants) {
    const actionKeywords = [
        '하겠습니다', '할게요', '하기로', '공유', '업데이트', '정리', '작성', '검토',
        '전달', '요청', '반영', '구현', '미루는 걸로', '수정', '준비', '확인', '진행할게요'
    ];

    const actions = [];

    entries.forEach((entry) => {
        const text = entry.text;
        if (!actionKeywords.some((keyword) => text.includes(keyword)) && !hasDeadline(text)) {
            return;
        }

        const owner = inferOwner(entry, participants);
        const due = extractDeadline(text);
        const priority = inferPriority(text, due);
        const lane = inferLane(priority, due);
        const title = inferActionTitle(text);

        if (!title) {
            return;
        }

        actions.push({
            title,
            owner,
            due: due || '일정 미정',
            priority,
            lane,
            source: cleanSentence(text)
        });
    });

    return dedupeActions(actions).slice(0, 9);
}

function inferOwner(entry, participants) {
    if (entry.speaker && entry.speaker !== '사회자') {
        return entry.speaker;
    }

    for (const participant of participants) {
        if (entry.text.includes(participant)) {
            return participant;
        }
    }

    return '담당자 미정';
}

function extractDeadline(text) {
    const patterns = [
        /\d{1,2}월\s*\d{1,2}일(?:\s*[가-힣]+요일)?/,
        /\d{1,2}\/\d{1,2}/,
        /이번 주\s*[가-힣]+요일/,
        /다음 주\s*[가-힣]+요일/,
        /오늘\s*안에/,
        /오늘\s*\d{1,2}시까지/,
        /내일\s*(?:오전|오후)?\s*\d{0,2}시?까지?/,
        /이번 주 안에/,
        /내일까지/,
        /금요일\s*오후/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[0].replace(/\s+/g, ' ').trim();
        }
    }

    return '';
}

function hasDeadline(text) {
    return Boolean(extractDeadline(text));
}

function inferPriority(text, due) {
    if (/오늘|내일|오류|리스크|데모|확정/.test(text) || /오늘|내일/.test(due)) {
        return 'high';
    }
    if (due || /이번 주|다음 주|검토 요청/.test(text)) {
        return 'medium';
    }
    return 'low';
}

function inferLane(priority, due) {
    if (priority === 'high') {
        return 'immediate';
    }
    if (priority === 'medium' || due) {
        return 'thisWeek';
    }
    return 'followUp';
}

function inferActionTitle(text) {
    const cleaned = text
        .replace(/^[가-힣A-Za-z]{2,12}\s*[:：-]\s*/, '')
        .replace(/(제가|저는|저|우리|그럼|좋습니다|네,?|담당으로 진행할게요)/g, '')
        .replace(/(까지|안에).*/, '')
        .replace(/(하겠습니다|할게요|하기로 했습니다|하기로|작성하겠습니다|정리하겠습니다|공유하겠습니다|전달하겠습니다|진행할게요)/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleaned) {
        return '';
    }

    return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned;
}

function dedupeActions(actions) {
    const seen = new Set();
    return actions.filter((action) => {
        const key = `${action.title}|${action.owner}|${action.due}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function extractKeywords(rawText) {
    const tokens = rawText.match(/[가-힣A-Za-z]{2,}/g) || [];
    const scores = new Map();

    tokens.forEach((token) => {
        if (STOP_WORDS.includes(token)) {
            return;
        }
        scores.set(token, (scores.get(token) || 0) + 1);
    });

    return Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
}

function buildHighlights(entries, actions, decisions, risks, keywords, participants) {
    const topic = keywords.length ? keywords.slice(0, 3).join(', ') : '핵심 안건';
    const firstEntry = entries[0] ? cleanSentence(entries[0].text) : '회의 주요 내용을 정리했습니다.';
    const unassignedCount = actions.filter((action) => action.owner === '담당자 미정').length;
    const urgentCount = actions.filter((action) => action.priority === 'high').length;

    return [
        `${participants.length || 1}명의 참여자가 ${topic} 중심으로 논의했고, 첫 문맥상 핵심 안건은 "${firstEntry}" 입니다.`,
        `${actions.length}개의 액션 아이템 중 ${urgentCount}건이 빠른 대응이 필요한 항목으로 분류되었습니다.`,
        unassignedCount > 0
            ? `${unassignedCount}개의 작업은 담당자 지정이 불명확해 후속 정리가 필요합니다.`
            : '담당자 단위로 할 일이 비교적 명확하게 나뉘어 있어 바로 공유 가능한 상태입니다.'
    ];
}

function groupByOwner(actions) {
    const grouped = new Map();

    actions.forEach((action) => {
        if (!grouped.has(action.owner)) {
            grouped.set(action.owner, []);
        }
        grouped.get(action.owner).push(action);
    });

    return Array.from(grouped.entries()).map(([owner, tasks]) => ({ owner, tasks }));
}

function renderBoard(data) {
    resultsSection.hidden = false;
    resultSummaryLine.textContent = `${data.participants.length || 1}명 참여 · ${data.actions.length}개 액션 · 주요 키워드 ${data.keywords.slice(0, 3).join(', ') || '정리 완료'}`;

    renderStats(data);
    renderSummaryPoints(data.summary);
    renderBulletList(decisionList, data.decisions);
    renderBulletList(riskList, data.risks);
    renderActionBoard(data.actions);
    renderOwnerBoard(data.owners);

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStats(data) {
    const stats = [
        { label: 'Participants', value: data.participants.length || 1 },
        { label: 'Action Items', value: data.actions.length },
        { label: 'Decisions', value: data.decisions.length },
        { label: 'Urgent', value: data.actions.filter((action) => action.priority === 'high').length }
    ];

    statsGrid.innerHTML = stats
        .map((stat) => `<article class="stat-card"><span>${stat.label}</span><strong>${stat.value}</strong></article>`)
        .join('');
}

function renderSummaryPoints(points) {
    summaryHighlights.innerHTML = points
        .map((point) => `<div class="summary-point">${escapeHtml(point)}</div>`)
        .join('');
}

function renderBulletList(target, items) {
    target.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderActionBoard(actions) {
    const laneMeta = [
        { key: 'immediate', title: '지금 처리', caption: '오늘 ~ 내일 대응이 필요한 항목' },
        { key: 'thisWeek', title: '이번 주', caption: '마감 또는 검토 일정이 잡힌 항목' },
        { key: 'followUp', title: '후속 관리', caption: '아이디어, 개선, 2차 범위 항목' }
    ];

    actionCountBadge.textContent = `${actions.length} items`;

    actionBoard.innerHTML = laneMeta.map((lane) => {
        const laneItems = actions.filter((action) => action.lane === lane.key);
        const cards = laneItems.length
            ? laneItems.map(renderActionCard).join('')
            : '<div class="empty-state">이 레인에 분류된 항목이 없습니다.</div>';

        return `
            <section class="lane">
                <h4>${lane.title}</h4>
                <span class="lane-caption">${lane.caption}</span>
                <div class="lane-items">${cards}</div>
            </section>
        `;
    }).join('');
}

function renderActionCard(action) {
    const priorityLabel = { high: 'High', medium: 'Medium', low: 'Low' }[action.priority];

    return `
        <article class="action-card">
            <div class="action-card-header">
                <h5>${escapeHtml(action.title)}</h5>
                <span class="priority-pill priority-${action.priority}">${priorityLabel}</span>
            </div>
            <div class="action-meta">
                <span class="meta-chip">${escapeHtml(action.owner)}</span>
                <span class="meta-chip">${escapeHtml(action.due)}</span>
            </div>
            <div class="source-text">${escapeHtml(action.source)}</div>
        </article>
    `;
}

function renderOwnerBoard(owners) {
    ownerCountBadge.textContent = `${owners.length} owners`;

    ownerBoard.innerHTML = owners.map(({ owner, tasks }) => `
        <article class="owner-card">
            <div class="owner-card-header">
                <strong>${escapeHtml(owner)}</strong>
                <span class="count-badge">${tasks.length} tasks</span>
            </div>
            <div class="owner-task-list">
                ${tasks.map((task) => `
                    <div class="owner-task">
                        ${escapeHtml(task.title)}
                        <br>
                        <small>${escapeHtml(task.due)} · ${escapeHtml(task.priority.toUpperCase())}</small>
                    </div>
                `).join('')}
            </div>
        </article>
    `).join('');
}

function cleanSentence(text) {
    return text.replace(/\s+/g, ' ').replace(/[.]+$/g, '').trim();
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

