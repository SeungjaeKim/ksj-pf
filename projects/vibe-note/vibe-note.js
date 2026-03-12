const VIBE_ENDPOINT = "/api/vibe-note";
const moodLabels = {
    calm: "차분함",
    joy: "설렘",
    focus: "집중",
    blue: "위로",
    fire: "에너지"
};
const defaultMoodPrompts = {
    calm: "조용히 하루를 정리하고 싶은 밤이에요.",
    joy: "기분 좋은 설렘을 조금 더 길게 가져가고 싶어요.",
    focus: "오늘은 산만함 없이 몰입하고 싶어요.",
    blue: "기분이 조금 가라앉아서 부드러운 위로가 필요해요.",
    fire: "몸과 마음을 빠르게 깨우고 싶어요."
};

const moodDatabase = {
    calm: {
        title: "고요한 밤의 정리",
        summary: "생각이 많아진 저녁에 과하게 끌어올리기보다, 호흡을 정리해 주는 부드러운 흐름으로 추천을 맞췄습니다.",
        quote: "천천히 가도 괜찮아요. 지금의 속도도 당신의 리듬이니까요.",
        musicTag: "차분함 / 부드러운 잔광",
        match: 94,
        songs: [
            { title: "달빛 책상", artist: "헤이즈 룸", note: "잔잔한 피아노와 얇은 신스로 머릿속 소음을 낮춰줍니다." },
            { title: "고요한 궤도", artist: "루노", note: "너무 무겁지 않게 감정을 붙들어 주는 로파이 무드입니다." },
            { title: "벨벳 창가", artist: "마레", note: "하루 끝의 피로를 느슨하게 풀어주는 부드러운 템포입니다." }
        ],
        media: [
            { title: "5분 야간 산책 브이로그", note: "정보 과잉 없이 풍경에만 집중할 수 있는 짧은 영상." },
            { title: "밤에 읽는 에세이 한 편", note: "생각을 더 키우기보다, 감정을 천천히 정리해 주는 글." }
        ],
        action: "창문을 조금 열고, 방 조명을 한 단계 낮춘 뒤 좋아하는 컵에 물이나 차를 따라보세요.",
        reason: "지금의 무드는 활력을 더 주기보다 정리의 리듬이 더 잘 맞는 상태라서, 자극보다 회복 중심의 추천으로 연결했습니다."
    },
    joy: {
        title: "설렘이 번지는 오후",
        summary: "기분이 이미 밝게 올라와 있어서, 그 흐름을 과하지 않게 이어줄 반짝이는 추천으로 묶었습니다.",
        quote: "좋은 순간은 더 커지지 않아도 충분히 빛나요.",
        musicTag: "설렘 / 햇살 팝",
        match: 97,
        songs: [
            { title: "시트러스 하트", artist: "솔레이", note: "밝은 기타와 경쾌한 보컬이 기분 좋은 탄력을 더합니다." },
            { title: "행운의 오후", artist: "노버", note: "창문을 연 듯한 개방감이 있는 가벼운 팝 무드입니다." },
            { title: "복숭아 템포", artist: "마일로", note: "웃음이 남아 있는 순간과 잘 맞는 말랑한 리듬입니다." }
        ],
        media: [
            { title: "컬러풀한 여행 릴스 모음", note: "가벼운 자극으로 설렘의 여운을 길게 이어줍니다." },
            { title: "짧은 코미디 클립", note: "기분의 결을 해치지 않고 산뜻하게 올려주는 선택." }
        ],
        action: "오늘 좋았던 장면을 딱 한 줄만 메모해두세요. 나중에 꺼내 보면 그날의 온도가 다시 살아납니다.",
        reason: "이미 충분히 밝은 에너지가 있어서, 강한 자극보다는 기분 좋은 반짝임을 오래 유지하는 조합이 더 잘 어울립니다."
    },
    focus: {
        title: "몰입을 위한 선명한 공기",
        summary: "산만함을 덜고 한 방향으로 생각을 모으기 위해, 리듬은 단정하고 감정선은 얇은 큐레이션으로 정리했습니다.",
        quote: "집중은 억지로 만드는 힘보다, 방해를 덜어내는 기술에 가까워요.",
        musicTag: "집중 / 선명한 리듬",
        match: 91,
        songs: [
            { title: "선명한 프레임", artist: "인덱스", note: "반복적인 패턴이 생각을 한 방향으로 정렬해 줍니다." },
            { title: "직선의 개화", artist: "아스터", note: "너무 감정적이지 않은 전개로 작업 흐름을 지켜줍니다." },
            { title: "하얀 신호", artist: "폴라", note: "백색 소음처럼 곁을 채우는 미니멀 전자 사운드입니다." }
        ],
        media: [
            { title: "25분 타이머 집중 세션", note: "작업과 휴식을 나눠 리듬을 만드는 데 도움이 됩니다." },
            { title: "정리형 생산성 아티클", note: "복잡한 마음을 실행 가능한 문장으로 바꿔줍니다." }
        ],
        action: "지금 해야 할 일을 단 하나의 문장으로 적고, 25분 타이머를 켜보세요.",
        reason: "집중이 필요한 상태에서는 감정보다 구조가 더 중요해지기 때문에, 선명하고 반복적인 자극으로 몰입 환경을 만들었습니다."
    },
    blue: {
        title: "조용한 위로의 파도",
        summary: "기분이 조금 가라앉은 날에는 억지로 끌어올리는 대신, 지금 감정을 부드럽게 통과하게 해주는 흐름이 더 잘 맞습니다.",
        quote: "괜찮아지는 속도는 모두 달라요. 오늘은 그저 지나가도 충분해요.",
        musicTag: "위로 / 따뜻한 안정",
        match: 95,
        songs: [
            { title: "부드러운 비의 편지", artist: "넬린", note: "잔잔하지만 지나치게 무겁지 않은 위로의 결을 가졌습니다." },
            { title: "여전히 여기", artist: "포마", note: "감정을 눌러 덮지 않고 곁에 머물러 주는 곡입니다." },
            { title: "잔광의 방", artist: "윤", note: "조용한 안정감을 주는 몽환적 앰비언트 사운드입니다." }
        ],
        media: [
            { title: "잔잔한 애니메이션 단편", note: "서사가 크지 않아도 마음을 부드럽게 흔들어 주는 영상." },
            { title: "위로 문장 아카이브", note: "짧은 문장 하나가 생각보다 오래 남는 날이 있습니다." }
        ],
        action: "휴대폰을 잠시 내려두고, 어깨 힘을 푼 뒤 깊게 세 번만 숨을 들이쉬고 내쉬어 보세요.",
        reason: "지금은 해결보다 안정이 먼저라서, 감정선을 존중하면서도 너무 깊게 끌려가지 않게 균형을 잡아주는 추천으로 구성했습니다."
    },
    fire: {
        title: "심장을 깨우는 점화",
        summary: "움직이고 싶은 마음이 올라온 상태라, 시작 버튼을 눌러줄 수 있는 선명한 비트와 추진력 있는 추천으로 맞췄습니다.",
        quote: "분위기가 바뀌면 속도도 바뀌어요. 오늘은 당신 차례예요.",
        musicTag: "에너지 / 강한 드라이브",
        match: 96,
        songs: [
            { title: "붉은 움직임", artist: "키로", note: "첫 박부터 앞으로 끌고 가는 에너지가 강합니다." },
            { title: "시동의 빛", artist: "노바 나인", note: "운동 전이나 집중 전환용으로 잘 어울리는 리듬입니다." },
            { title: "질주의 개화", artist: "탄", note: "지친 흐름을 끊고 다시 움직이게 만드는 전개가 돋보입니다." }
        ],
        media: [
            { title: "짧은 퍼포먼스 영상", note: "몸을 깨우는 리듬과 장면 전환이 동기부여를 올려줍니다." },
            { title: "동기부여 스피치 클립", note: "한 문장만으로도 행동 모드로 전환될 수 있습니다." }
        ],
        action: "좋아하는 신발을 신고 10분만 바깥 공기를 쐬어보세요. 몸이 먼저 움직이면 마음도 따라옵니다.",
        reason: "에너지가 올라온 상태에서는 생각보다 실행이 중요해서, 망설임을 줄이고 바로 움직일 수 있는 방향으로 추천을 묶었습니다."
    }
};

const chips = [...document.querySelectorAll(".chip")];
const moodInput = document.getElementById("moodInput");
const energyRange = document.getElementById("energyRange");
const energyValue = document.getElementById("energyValue");
const generateBtn = document.getElementById("generateBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const vibeStatus = document.getElementById("vibeStatus");

const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const quoteText = document.getElementById("quoteText");
const musicTag = document.getElementById("musicTag");
const matchValue = document.getElementById("matchValue");
const musicList = document.getElementById("musicList");
const mediaList = document.getElementById("mediaList");
const actionTip = document.getElementById("actionTip");
const reasonText = document.getElementById("reasonText");
const resultCard = document.getElementById("resultCard");

let activeMood = "calm";

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function setActiveMood(mood) {
    activeMood = moodDatabase[mood] ? mood : activeMood;
    chips.forEach((chip) => chip.classList.toggle("active", chip.dataset.mood === activeMood));
}

function setVibeStatus(message, tone = "neutral") {
    vibeStatus.textContent = message;
    vibeStatus.dataset.tone = tone;
}

function setLoadingState(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? "AI 추천 생성 중..." : "무드 추천 받기";
}

function renderMood(data) {
    resultTitle.textContent = data.title;
    resultSummary.textContent = data.summary;
    quoteText.textContent = data.quote;
    musicTag.textContent = data.musicTag;
    matchValue.textContent = `${data.match}%`;
    actionTip.textContent = data.action;
    reasonText.textContent = data.reason;

    musicList.innerHTML = data.songs.map((song, index) => `
        <article class="music-item">
            <span class="music-index">트랙 0${index + 1}</span>
            <div>
                <h4>${escapeHtml(song.title)}</h4>
                <p>${escapeHtml(song.note)}</p>
            </div>
            <span class="music-meta">${escapeHtml(song.artist)}</span>
        </article>
    `).join("");

    mediaList.innerHTML = data.media.map((item) => `
        <article class="stack-item">
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.note)}</p>
        </article>
    `).join("");
}

function inferMoodFromInput(text, energy) {
    const content = text.trim();
    if (!content) return activeMood;

    const rules = [
        { mood: "blue", words: ["우울", "지침", "외로", "힘들", "슬픔", "가라앉"] },
        { mood: "joy", words: ["설레", "행복", "좋아", "기쁘", "웃음", "들뜸"] },
        { mood: "focus", words: ["집중", "공부", "일", "정리", "몰입", "작업"] },
        { mood: "fire", words: ["운동", "달리", "시작", "에너지", "파이팅", "불태"] },
        { mood: "calm", words: ["차분", "밤", "조용", "쉬고", "휴식", "편안"] }
    ];

    const matched = rules.find((rule) => rule.words.some((word) => content.includes(word)));
    if (matched) return matched.mood;
    if (energy <= 25) return "blue";
    if (energy <= 45) return "calm";
    if (energy <= 68) return "focus";
    if (energy <= 82) return "joy";
    return "fire";
}

async function requestAiVibe() {
    const response = await fetch(VIBE_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            moodKey: activeMood,
            moodLabel: moodLabels[activeMood],
            note: moodInput.value.trim(),
            energy: Number(energyRange.value)
        })
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || `HTTP ${response.status}`);
    }

    return payload;
}

function normalizeAiMood(payload) {
    const fallbackMood = moodDatabase[activeMood];
    const songs = Array.isArray(payload.songs) ? payload.songs.slice(0, 3) : fallbackMood.songs;
    const media = Array.isArray(payload.media) ? payload.media.slice(0, 2) : fallbackMood.media;

    return {
        title: String(payload.title || fallbackMood.title).trim(),
        summary: String(payload.summary || fallbackMood.summary).trim(),
        quote: String(payload.quote || fallbackMood.quote).trim(),
        musicTag: String(payload.musicTag || fallbackMood.musicTag).trim(),
        match: Number.isFinite(Number(payload.match)) ? Math.min(99, Math.max(80, Math.round(Number(payload.match)))) : fallbackMood.match,
        songs: songs.length ? songs.map((song, index) => ({
            title: String(song.title || fallbackMood.songs[index]?.title || `트랙 ${index + 1}`).trim(),
            artist: String(song.artist || fallbackMood.songs[index]?.artist || "무드 큐레이터").trim(),
            note: String(song.note || fallbackMood.songs[index]?.note || "현재 감정과 잘 맞는 사운드입니다.").trim()
        })) : fallbackMood.songs,
        media: media.length ? media.map((item, index) => ({
            title: String(item.title || fallbackMood.media[index]?.title || `추천 ${index + 1}`).trim(),
            note: String(item.note || fallbackMood.media[index]?.note || "현재 무드와 잘 맞는 추천입니다.").trim()
        })) : fallbackMood.media,
        action: String(payload.action || fallbackMood.action).trim(),
        reason: String(payload.reason || fallbackMood.reason).trim()
    };
}

async function generateMoodRecommendation() {
    setLoadingState(true);
    try {
        const payload = await requestAiVibe();
        setActiveMood(payload.moodKey || activeMood);
        renderMood(normalizeAiMood(payload));
        setVibeStatus("Gemini가 현재 감정과 에너지 흐름을 바탕으로 새로운 무드 큐레이션을 생성했습니다.", "success");
    } catch (error) {
        const inferredMood = inferMoodFromInput(moodInput.value, Number(energyRange.value));
        setActiveMood(inferredMood);
        renderMood(moodDatabase[inferredMood]);
        setVibeStatus("Gemini 연결이 없어 데모 큐레이션으로 표시했습니다. 실제 AI 테스트는 wrangler pages dev 또는 Cloudflare Pages 배포 주소에서 가능합니다.", "warn");
        console.error(error);
    } finally {
        setLoadingState(false);
        resultCard.animate(
            [
                { transform: "translateY(12px)", opacity: 0.55 },
                { transform: "translateY(0)", opacity: 1 }
            ],
            { duration: 360, easing: "ease-out" }
        );
    }
}

chips.forEach((chip) => {
    chip.addEventListener("click", () => {
        setActiveMood(chip.dataset.mood);
        renderMood(moodDatabase[activeMood]);
        setVibeStatus("칩 선택 기준의 데모 무드를 미리 보고 있습니다. 버튼을 누르면 Gemini 추천으로 갱신됩니다.", "neutral");
    });
});

energyRange.addEventListener("input", () => {
    energyValue.textContent = energyRange.value;
});

generateBtn.addEventListener("click", generateMoodRecommendation);
shuffleBtn.addEventListener("click", () => {
    const moods = Object.keys(moodDatabase);
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setActiveMood(randomMood);
    if (!moodInput.value.trim()) {
        moodInput.value = defaultMoodPrompts[randomMood];
    }
    renderMood(moodDatabase[randomMood]);
    setVibeStatus("랜덤 무드 프리뷰를 보여주고 있습니다. 버튼을 다시 누르면 Gemini 추천으로 갱신됩니다.", "neutral");
});

setActiveMood(activeMood);
renderMood(moodDatabase[activeMood]);
setVibeStatus(window.location.protocol === "file:" ? "현재는 정적 파일로 열려 있어 데모 큐레이션이 표시됩니다. 실제 Gemini 테스트는 wrangler pages dev 또는 Cloudflare Pages 배포 주소에서 가능합니다." : "기분을 입력하고 무드 추천 받기를 누르면 Gemini가 새로운 큐레이션을 생성합니다.", "neutral");
