const TRAVEL_PLAN_ENDPOINT = "/api/travel-plan";
const styleLabels = {
  balanced: "밸런스",
  food: "맛집 중심",
  culture: "문화 탐방",
  nature: "자연 휴식"
};
const budgetLabels = {
  smart: "가성비",
  comfort: "여유롭게",
  premium: "프리미엄"
};

const tripData = {
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    stay: "fast-paced city trip",
    budgetBase: { smart: 120, comfort: 175, premium: 260 },
    checklist: [
      ["Suica or transit pass", "공항에서 바로 이동 동선을 정리해 두세요."],
      ["TeamLab / museum booking", "인기 전시는 사전 예약이 안전합니다."],
      ["Pocket Wi-Fi or eSIM", "지도와 번역 앱 사용 대비를 해두세요."]
    ],
    points: [
      { name: "Asakusa", x: 18, y: 42, styles: ["culture", "balanced"] },
      { name: "Shibuya", x: 58, y: 62, styles: ["food", "balanced"] },
      { name: "Shinjuku", x: 50, y: 34, styles: ["food", "balanced"] },
      { name: "Ueno", x: 28, y: 18, styles: ["culture", "balanced"] },
      { name: "Odaiba", x: 78, y: 78, styles: ["nature", "premium"] },
      { name: "Kichijoji", x: 12, y: 72, styles: ["nature", "smart"] }
    ]
  },
  paris: {
    name: "Paris",
    country: "France",
    stay: "museum and cafe rhythm",
    budgetBase: { smart: 145, comfort: 210, premium: 320 },
    checklist: [
      ["Museum pass", "루브르와 오르세 동선을 미리 압축해 두세요."],
      ["Cafe reservation", "인기 브런치 시간대는 예약이 편합니다."],
      ["Metro carnet", "중심 구역 이동 비용을 아끼기 좋습니다."]
    ],
    points: [
      { name: "Louvre", x: 48, y: 46, styles: ["culture", "premium"] },
      { name: "Le Marais", x: 62, y: 32, styles: ["food", "balanced"] },
      { name: "Montmartre", x: 34, y: 18, styles: ["culture", "smart"] },
      { name: "Seine Walk", x: 54, y: 60, styles: ["balanced", "nature"] },
      { name: "Saint-Germain", x: 40, y: 70, styles: ["food", "premium"] },
      { name: "Eiffel Area", x: 20, y: 54, styles: ["balanced", "premium"] }
    ]
  },
  bali: {
    name: "Bali",
    country: "Indonesia",
    stay: "slow reset with views",
    budgetBase: { smart: 90, comfort: 145, premium: 230 },
    checklist: [
      ["Scooter or driver", "이동 거리가 길어서 하루 동선을 미리 묶는 것이 중요합니다."],
      ["Sunset dining booking", "인기 비치 클럽은 예약 여부를 확인하세요."],
      ["Temple dress code", "사원 방문용 가벼운 겉옷을 챙기면 좋습니다."]
    ],
    points: [
      { name: "Ubud", x: 48, y: 30, styles: ["culture", "nature"] },
      { name: "Canggu", x: 28, y: 70, styles: ["food", "balanced"] },
      { name: "Seminyak", x: 40, y: 78, styles: ["food", "premium"] },
      { name: "Uluwatu", x: 76, y: 82, styles: ["nature", "premium"] },
      { name: "Tegalalang", x: 60, y: 20, styles: ["nature", "smart"] },
      { name: "Sanur", x: 72, y: 56, styles: ["balanced", "comfort"] }
    ]
  }
};

const citySelect = document.getElementById("citySelect");
const durationSelect = document.getElementById("durationSelect");
const startDateInput = document.getElementById("startDate");
const styleSelect = document.getElementById("styleSelect");
const budgetSelect = document.getElementById("budgetSelect");
const travelersSelect = document.getElementById("travelersSelect");
const travelPromptInput = document.getElementById("travelPrompt");
const generateBtn = document.getElementById("generateBtn");
const plannerFeedback = document.getElementById("plannerFeedback");
const summaryTitle = document.getElementById("summaryTitle");
const summaryDates = document.getElementById("summaryDates");
const summaryStats = document.getElementById("summaryStats");
const tripNarrative = document.getElementById("tripNarrative");
const mapCaption = document.getElementById("mapCaption");
const mapStage = document.getElementById("mapStage");
const timelineList = document.getElementById("timelineList");
const budgetTotal = document.getElementById("budgetTotal");
const budgetBreakdown = document.getElementById("budgetBreakdown");
const checklist = document.getElementById("checklist");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initInputs() {
  Object.entries(tripData).forEach(([key, city]) => {
    citySelect.insertAdjacentHTML("beforeend", `<option value="${key}">${city.name}, ${city.country}</option>`);
  });

  for (let day = 2; day <= 7; day += 1) {
    durationSelect.insertAdjacentHTML("beforeend", `<option value="${day}" ${day === 4 ? "selected" : ""}>${day}일</option>`);
  }

  const today = new Date();
  startDateInput.value = today.toISOString().split("T")[0];
}

function setPlannerFeedback(message, tone = "neutral") {
  plannerFeedback.textContent = message;
  plannerFeedback.dataset.tone = tone;
}

function setLoadingState(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.textContent = isLoading ? "AI 일정 생성 중..." : "AI 일정 생성하기";
}

function formatDate(startDate, index) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + index);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function pickSpots(city, style, duration) {
  const score = (point) => point.styles.includes(style) ? 3 : point.styles.includes("balanced") ? 2 : 1;
  return [...city.points]
    .sort((a, b) => score(b) - score(a))
    .slice(0, Math.min(city.points.length, duration + 2));
}

function createDemoPlan(payload) {
  const city = tripData[payload.cityKey];
  const duration = Number(payload.duration);
  const travelers = Number(payload.travelers);
  const spots = pickSpots(city, payload.style, duration);
  const totalBudget = city.budgetBase[payload.budgetTone] * duration * travelers;

  const dayPlans = Array.from({ length: duration }, (_, index) => {
    const primary = spots[index % spots.length];
    const secondary = spots[(index + 1) % spots.length];
    const evening = spots[(index + 2) % spots.length];

    return {
      day: index + 1,
      date: formatDate(payload.startDate, index),
      headline: `${primary.name} 중심 데모 코스`,
      focus: `${primary.name}에서 시작해 ${evening.name}까지 자연스럽게 이어지는 하루 흐름입니다.`,
      slots: [
        { tag: "Morning", spot: primary.name, title: `${primary.name} 아침 산책`, description: `${primary.name}에서 하루를 시작하며 핵심 포인트를 여유롭게 둘러봅니다.` },
        { tag: "Afternoon", spot: secondary.name, title: `${secondary.name} 점심 & 이동`, description: `${secondary.name} 주변에서 점심과 실내외 일정을 묶어 효율적으로 움직입니다.` },
        { tag: "Evening", spot: evening.name, title: `${evening.name} 저녁 마무리`, description: `${evening.name}에서 야경, 디너, 산책까지 하루를 부드럽게 마무리합니다.` }
      ]
    };
  });

  return {
    city,
    tripTitle: `${city.name} ${duration}일 플랜`,
    tripNarrative: `${styleLabels[payload.style]} 취향과 ${budgetLabels[payload.budgetTone]} 예산 톤을 기준으로, ${travelers}명이 무리 없이 즐길 수 있는 데모 일정을 구성했습니다.`,
    styleLabel: styleLabels[payload.style],
    duration,
    travelers,
    budgetTone: payload.budgetTone,
    dateRangeLabel: `${duration} Days`,
    mapPoints: spots,
    dayPlans,
    budgetBreakdown: [
      { label: "항공/이동", amount: Math.round(totalBudget * 0.34), note: "공항 이동과 주요 교통 패스를 포함한 예산입니다." },
      { label: "숙소", amount: Math.round(totalBudget * 0.3), note: "동선이 좋은 지역 기준으로 숙박비를 반영했습니다." },
      { label: "식비", amount: Math.round(totalBudget * 0.2), note: "카페와 메인 식사, 간단한 간식을 포함했습니다." },
      { label: "입장권/기타", amount: Math.round(totalBudget * 0.16), note: "전시, 투어, 소소한 현지 지출을 포함합니다." }
    ],
    budgetTotal: totalBudget,
    checklist: city.checklist.map(([title, note], index) => ({
      title,
      note,
      priority: index === 0 ? "우선" : "준비"
    }))
  };
}

function normalizeSpotName(city, value) {
  const candidate = String(value || "").trim().toLowerCase();
  if (!candidate) {
    return null;
  }

  return city.points.find((point) => {
    const pointName = point.name.toLowerCase();
    return pointName === candidate || pointName.includes(candidate) || candidate.includes(pointName);
  }) || null;
}

function normalizeAiPlan(aiPlan, payload) {
  const city = tripData[payload.cityKey];
  const fallback = createDemoPlan(payload);
  const rawMapPoints = Array.isArray(aiPlan.mapSpots) ? aiPlan.mapSpots.map((name) => normalizeSpotName(city, name)).filter(Boolean) : [];
  const mapPoints = rawMapPoints.length ? rawMapPoints : fallback.mapPoints;
  const dayPlans = Array.from({ length: Number(payload.duration) }, (_, index) => {
    const candidate = Array.isArray(aiPlan.dayPlans) ? aiPlan.dayPlans[index] || {} : {};
    const fallbackDay = fallback.dayPlans[index];
    const slots = fallbackDay.slots.map((fallbackSlot, slotIndex) => {
      const slotCandidateList = Array.isArray(candidate.slots) ? candidate.slots : [];
      const slotCandidate = slotCandidateList.find((item) => String(item?.tag || "").toLowerCase() === fallbackSlot.tag.toLowerCase()) || slotCandidateList[slotIndex] || {};
      const matchedSpot = normalizeSpotName(city, slotCandidate.spot);

      return {
        tag: fallbackSlot.tag,
        spot: matchedSpot ? matchedSpot.name : fallbackSlot.spot,
        title: String(slotCandidate.title || fallbackSlot.title).trim(),
        description: String(slotCandidate.description || fallbackSlot.description).trim()
      };
    });

    return {
      day: index + 1,
      date: formatDate(payload.startDate, index),
      headline: String(candidate.headline || fallbackDay.headline).trim(),
      focus: String(candidate.focus || fallbackDay.focus).trim(),
      slots
    };
  });

  const budgetBreakdown = fallback.budgetBreakdown.map((item, index) => {
    const candidate = Array.isArray(aiPlan.budgetBreakdown) ? aiPlan.budgetBreakdown[index] || {} : {};
    const amount = Number(candidate.amount);
    return {
      label: item.label,
      amount: Number.isFinite(amount) && amount > 0 ? Math.round(amount) : item.amount,
      note: String(candidate.note || item.note).trim()
    };
  });

  const checklistItems = Array.isArray(aiPlan.checklist) ? aiPlan.checklist : [];
  const checklistData = fallback.checklist.map((item, index) => ({
    title: String(checklistItems[index]?.title || item.title).trim(),
    note: String(checklistItems[index]?.note || item.note).trim(),
    priority: String(checklistItems[index]?.priority || item.priority).trim()
  }));

  return {
    city,
    tripTitle: String(aiPlan.tripTitle || fallback.tripTitle).trim(),
    tripNarrative: String(aiPlan.tripNarrative || fallback.tripNarrative).trim(),
    styleLabel: String(aiPlan.styleLabel || fallback.styleLabel).trim(),
    duration: Number(payload.duration),
    travelers: Number(payload.travelers),
    budgetTone: payload.budgetTone,
    dateRangeLabel: `${payload.duration} Days`,
    mapPoints,
    dayPlans,
    budgetBreakdown,
    budgetTotal: budgetBreakdown.reduce((sum, item) => sum + item.amount, 0),
    checklist: checklistData
  };
}

async function requestAiPlan(payload) {
  const response = await fetch(TRAVEL_PLAN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || `HTTP ${response.status}`);
  }

  return data;
}

function buildRequestPayload() {
  const cityKey = citySelect.value;
  const city = tripData[cityKey];

  return {
    cityKey,
    cityName: city.name,
    country: city.country,
    duration: Number(durationSelect.value),
    startDate: startDateInput.value,
    style: styleSelect.value,
    styleLabel: styleLabels[styleSelect.value],
    budgetTone: budgetSelect.value,
    travelers: Number(travelersSelect.value),
    additionalRequest: travelPromptInput.value.trim(),
    points: city.points.map((point) => ({ name: point.name })),
    checklistSeeds: city.checklist.map(([title, note]) => ({ title, note }))
  };
}

function renderSummary(plan) {
  summaryTitle.textContent = `${plan.city.name} 여행 요약`;
  summaryDates.textContent = plan.dateRangeLabel;
  summaryStats.innerHTML = `
    <div class="stat-card"><strong>${escapeHtml(plan.city.country)}</strong><span>Destination</span></div>
    <div class="stat-card"><strong>${escapeHtml(plan.styleLabel)}</strong><span>Travel mood</span></div>
    <div class="stat-card"><strong>${plan.travelers}명</strong><span>Travelers</span></div>
  `;
  tripNarrative.textContent = plan.tripNarrative;
  mapCaption.textContent = `주요 동선 ${plan.mapPoints.length}곳`;
}

function renderMap(plan) {
  mapStage.innerHTML = "";
  plan.mapPoints.forEach((spot) => {
    mapStage.insertAdjacentHTML("beforeend", `<div class="map-pin" style="left:${spot.x}%; top:${spot.y}%;"></div><div class="map-pin-label" style="left:${spot.x}%; top:${spot.y}%">${escapeHtml(spot.name)}</div>`);
  });
}

function renderTimeline(plan) {
  timelineList.innerHTML = plan.dayPlans.map((day) => `
    <article class="day-card">
      <header>
        <div>
          <h3>Day ${day.day}</h3>
          <div class="day-date">${escapeHtml(day.date)}</div>
        </div>
        <span>${escapeHtml(day.headline)}</span>
      </header>
      <p class="day-focus">${escapeHtml(day.focus)}</p>
      <div class="slot-list">
        ${day.slots.map((slot) => `
          <div class="slot-item">
            <div class="slot-tag">${escapeHtml(slot.tag)}</div>
            <div class="slot-card">
              <strong>${escapeHtml(slot.title)}</strong>
              <small>${escapeHtml(slot.spot)}</small>
              <p>${escapeHtml(slot.description)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function renderBudget(plan) {
  budgetTotal.innerHTML = `<span>예상 총 예산</span><strong>$${plan.budgetTotal.toLocaleString()}</strong><small>${escapeHtml(budgetLabels[plan.budgetTone])} 톤 기준 · ${plan.duration}일 · ${plan.travelers}명</small>`;
  budgetBreakdown.innerHTML = plan.budgetBreakdown.map((item) => `
    <div class="budget-chip">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.note)}</small>
      </div>
      <span>$${item.amount.toLocaleString()}</span>
    </div>
  `).join("");
  checklist.innerHTML = plan.checklist.map((item) => `
    <div class="check-item">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.note)}</small>
      </div>
      <div class="check-status">${escapeHtml(item.priority)}</div>
    </div>
  `).join("");
}

function renderPlanner(plan) {
  renderSummary(plan);
  renderMap(plan);
  renderTimeline(plan);
  renderBudget(plan);
}

async function generatePlanner() {
  const payload = buildRequestPayload();
  const fallbackPlan = createDemoPlan(payload);

  setLoadingState(true);
  try {
    const aiPlan = await requestAiPlan(payload);
    renderPlanner(normalizeAiPlan(aiPlan, payload));
    setPlannerFeedback("Gemini가 입력 조건을 반영해 실제 여행 일정을 새로 구성했습니다.", "success");
  } catch (error) {
    renderPlanner(fallbackPlan);
    setPlannerFeedback("Gemini 연결이 없어 데모 일정으로 표시했습니다. 로컬 AI 테스트는 wrangler pages dev 환경에서 가능합니다.", "warn");
    console.error(error);
  } finally {
    setLoadingState(false);
  }
}

initInputs();
const initialPayload = buildRequestPayload();
renderPlanner(createDemoPlan(initialPayload));
setPlannerFeedback(window.location.protocol === "file:" ? "현재는 정적 파일로 열려 있어 데모 플랜이 보입니다. 실제 Gemini 테스트는 wrangler pages dev 또는 Cloudflare Pages 배포 주소에서 가능합니다." : "조건을 바꾼 뒤 AI 일정 생성하기를 누르면 Gemini 기반 플랜을 받아옵니다.", "neutral");
generateBtn.addEventListener("click", generatePlanner);
