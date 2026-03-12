const tripData = {
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    stay: "fast-paced city trip",
    budgetBase: { smart: 120, comfort: 175, premium: 260 },
    checklist: [
      ["Suica or transit pass", "공항에서 바로 이동 동선 정리"],
      ["TeamLab / museum booking", "인기 전시는 사전 예약 권장"],
      ["Pocket Wi-Fi or eSIM", "지도와 번역 앱 사용 대비"]
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
      ["Museum pass", "루브르/오르세 동선 압축"],
      ["Cafe reservation", "인기 브런치 타임 대비"],
      ["Metro carnet", "중심 구역 이동 비용 절감"]
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
      ["Scooter or driver", "이동 거리가 길어 하루 동선 묶기 중요"],
      ["Sunset dining booking", "인기 비치 클럽 사전 예약"],
      ["Temple dress code", "사원 방문용 가벼운 겉옷 준비"]
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
const generateBtn = document.getElementById("generateBtn");
const summaryTitle = document.getElementById("summaryTitle");
const summaryDates = document.getElementById("summaryDates");
const summaryStats = document.getElementById("summaryStats");
const mapCaption = document.getElementById("mapCaption");
const mapStage = document.getElementById("mapStage");
const timelineList = document.getElementById("timelineList");
const budgetTotal = document.getElementById("budgetTotal");
const budgetBreakdown = document.getElementById("budgetBreakdown");
const checklist = document.getElementById("checklist");

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

function pickSpots(city, style, duration) {
  const score = (point) => point.styles.includes(style) ? 3 : point.styles.includes("balanced") ? 2 : 1;
  return [...city.points].sort((a, b) => score(b) - score(a)).slice(0, Math.min(city.points.length, duration + 2));
}

function createPlan(cityKey, duration, style, budgetTone, travelers, startDate) {
  const city = tripData[cityKey];
  const spots = pickSpots(city, style, duration);
  const start = new Date(startDate);
  const tripTitle = `${city.name} ${duration}일 플랜`;
  const totalBudget = city.budgetBase[budgetTone] * duration * travelers;
  const dayPlans = Array.from({ length: duration }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const primary = spots[index % spots.length];
    const secondary = spots[(index + 1) % spots.length];
    const evening = spots[(index + 2) % spots.length];
    return {
      day: index + 1,
      date: `${date.getMonth() + 1}.${date.getDate()}`,
      slots: [
        [`Morning`, `${primary.name}에서 하루를 시작하며 핵심 스팟을 여유 있게 둘러봅니다.`],
        [`Afternoon`, `${secondary.name} 주변에서 점심과 이동 동선을 묶어 효율적으로 여행합니다.`],
        [`Evening`, `${evening.name} 중심으로 야경, 디너, 산책까지 하루를 마무리합니다.`]
      ]
    };
  });
  return {
    city,
    tripTitle,
    totalBudget,
    budgetBreakdown: [
      ["항공/이동", Math.round(totalBudget * 0.34)],
      ["숙소", Math.round(totalBudget * 0.3)],
      ["식비", Math.round(totalBudget * 0.2)],
      ["입장권/기타", Math.round(totalBudget * 0.16)]
    ],
    dayPlans,
    spots,
    style,
    duration,
    travelers,
    budgetTone
  };
}

function renderSummary(plan) {
  summaryTitle.textContent = `${plan.city.name} 여행 요약`;
  summaryDates.textContent = `${plan.duration} Days`;
  summaryStats.innerHTML = `
    <div class="stat-card"><strong>${plan.city.country}</strong><span>Destination</span></div>
    <div class="stat-card"><strong>${plan.style}</strong><span>Travel mood</span></div>
    <div class="stat-card"><strong>${plan.travelers}명</strong><span>Travelers</span></div>
  `;
  mapCaption.textContent = `주요 동선 ${plan.spots.length}곳`;
}

function renderMap(plan) {
  mapStage.innerHTML = "";
  plan.spots.forEach((spot) => {
    mapStage.insertAdjacentHTML("beforeend", `<div class="map-pin" style="left:${spot.x}%; top:${spot.y}%;"></div><div class="map-pin-label" style="left:${spot.x}%; top:${spot.y}%;">${spot.name}</div>`);
  });
}

function renderTimeline(plan) {
  timelineList.innerHTML = plan.dayPlans.map((day) => `
    <article class="day-card">
      <header><div><h3>Day ${day.day}</h3><div class="day-date">${day.date}</div></div><span>${plan.city.stay}</span></header>
      <div class="slot-list">
        ${day.slots.map(([tag, desc]) => `<div class="slot-item"><div class="slot-tag">${tag}</div><div class="slot-card"><strong>${desc.split("에서")[0]}</strong><p>${desc}</p></div></div>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderBudget(plan) {
  budgetTotal.innerHTML = `<span>예상 총 예산</span><strong>$${plan.totalBudget.toLocaleString()}</strong><small>${plan.budgetTone} 톤 기준 · ${plan.duration}일 · ${plan.travelers}명</small>`;
  budgetBreakdown.innerHTML = plan.budgetBreakdown.map(([label, amount]) => `<div class="budget-chip"><strong>${label}</strong><span>$${amount.toLocaleString()}</span></div>`).join("");
  checklist.innerHTML = plan.city.checklist.map(([title, note], index) => `<div class="check-item"><div><strong>${title}</strong><small>${note}</small></div><div class="check-status">${index === 0 ? "우선" : "준비"}</div></div>`).join("");
}

function renderPlanner() {
  const plan = createPlan(
    citySelect.value,
    Number(durationSelect.value),
    styleSelect.value,
    budgetSelect.value,
    Number(travelersSelect.value),
    startDateInput.value
  );
  renderSummary(plan);
  renderMap(plan);
  renderTimeline(plan);
  renderBudget(plan);
}

initInputs();
renderPlanner();
generateBtn.addEventListener("click", renderPlanner);
