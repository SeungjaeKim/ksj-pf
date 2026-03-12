const INTERVIEW_ENDPOINT = "/api/interview-coach";
const roleFocus = {
  backend: ["대규모 트래픽 대응 경험을 소개해 주세요.", "장애를 발견하고 복구한 사례를 설명해 주세요.", "Spring, DB 설계에서 가장 신경 쓰는 기준은 무엇인가요?"],
  frontend: ["복잡한 UI 상태를 정리했던 경험을 말해 주세요.", "성능 개선이나 접근성 개선 사례가 있나요?", "사용자 경험을 위해 어떤 기준으로 의사결정했나요?"],
  pm: ["여러 이해관계자 사이에서 우선순위를 조정한 경험이 있나요?", "데이터 없이도 가설을 세워 제품 방향을 정한 사례가 있나요?", "실패한 프로젝트에서 무엇을 배웠나요?"],
  data: ["모델이나 데이터 파이프라인 품질을 어떻게 검증했나요?", "데이터 기반으로 비즈니스 문제를 해결한 경험을 설명해 주세요.", "AI 결과를 제품에 연결할 때 중요하게 본 기준은 무엇인가요?"]
};
const sampleIntro = "안녕하세요. 6년 차 백엔드 개발자이며 Spring Boot와 PostgreSQL 기반 서비스 운영 경험이 있습니다. 최근에는 장애 대응 체계와 테스트 자동화를 정비하면서 안정적인 배포 문화를 만들었고, 여러 팀과 협업해 복잡한 요구사항을 구조적으로 정리하는 역할을 맡았습니다.";
const questionList = document.getElementById("questionList");
const introInput = document.getElementById("introInput");
const answerInput = document.getElementById("answerInput");
const roleSelect = document.getElementById("roleSelect");
const voiceBtn = document.getElementById("voiceBtn");
const sampleBtn = document.getElementById("sampleBtn");
const generateBtn = document.getElementById("generateBtn");
const reviewBtn = document.getElementById("reviewBtn");
const smartDraftBtn = document.getElementById("smartDraftBtn");
const voiceStatus = document.getElementById("voiceStatus");
const activeQuestionLabel = document.getElementById("activeQuestionLabel");
const chatPrompt = document.getElementById("chatPrompt");
const chatFeedback = document.getElementById("chatFeedback");
const metricGrid = document.getElementById("metricGrid");
const reportNotes = document.getElementById("reportNotes");
const heroScore = document.getElementById("heroScore");
const coachStatusNote = document.getElementById("coachStatusNote");
let activeQuestion = "";
let recognition = null;
let coachOpening = "자기소개를 바탕으로 예상 질문을 만들고, 질문 카드를 클릭하면 답변 피드백이 시작됩니다.";
let lastStarDraft = "";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setCoachStatus(message, tone = "neutral") {
  coachStatusNote.textContent = message;
  coachStatusNote.dataset.tone = tone;
}

function setButtonLoading(button, isLoading, idleText, loadingText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
}

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.textContent = "음성 미지원";
    voiceBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.interimResults = true;
  recognition.onstart = () => { voiceStatus.textContent = "듣는 중..."; };
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
    introInput.value = transcript;
  };
  recognition.onerror = () => { voiceStatus.textContent = "음성 오류"; };
  recognition.onend = () => { voiceStatus.textContent = "음성 준비 완료"; };
}

function generateFallbackQuestions(text, role) {
  const base = [
    "자기소개에서 가장 강조하고 싶은 강점은 무엇인가요?",
    "최근 프로젝트 중 가장 임팩트 있었던 경험을 구체적으로 설명해 주세요.",
    "협업 과정에서 갈등이나 조율이 필요했던 순간이 있었나요?",
    "이 포지션에 지원한 이유와 앞으로의 성장 방향을 말씀해 주세요."
  ];
  const extras = [];
  if (/테스트|자동화|qa|품질/i.test(text)) extras.push("품질이나 테스트 자동화를 위해 직접 만든 변화가 있나요?");
  if (/장애|운영|배포|infra|클라우드/i.test(text)) extras.push("운영 이슈를 빠르게 진단했던 경험을 설명해 주세요.");
  if (/협업|팀|커뮤니케이션|조율/i.test(text)) extras.push("다른 직군과 협업할 때 신뢰를 만드는 본인만의 방식이 있나요?");
  return [...base, ...roleFocus[role], ...extras].slice(0, 7);
}

function updateActiveQuestion(question) {
  activeQuestion = question || "";
  activeQuestionLabel.textContent = activeQuestion || "질문을 선택하세요";
  chatPrompt.textContent = activeQuestion ? `면접관: ${activeQuestion}` : coachOpening;
}

function renderQuestionCards(questions) {
  questionList.innerHTML = questions.map((question, index) => `
    <button class="question-card${index === 0 ? " active" : ""}" data-question="${escapeHtml(question)}">
      <strong>Q${index + 1}</strong>
      <span>${escapeHtml(question)}</span>
    </button>
  `).join("");

  const firstQuestion = questions[0] || "";
  updateActiveQuestion(firstQuestion);

  questionList.querySelectorAll(".question-card").forEach((button) => {
    button.addEventListener("click", () => {
      questionList.querySelectorAll(".question-card").forEach((card) => card.classList.remove("active"));
      button.classList.add("active");
      updateActiveQuestion(button.dataset.question);
    });
  });
}

function evaluateFallbackAnswer(answer) {
  const lengthScore = Math.min(100, Math.round(answer.length / 2.6));
  const numberScore = /\d|퍼센트|개월|년|건/.test(answer) ? 88 : 62;
  const structureScore = /(문제|상황|과제).*(행동|해결|진행).*(결과|성과)/s.test(answer) ? 92 : 68;
  const confidenceScore = /(주도|개선|해결|리드|성과|최적화)/.test(answer) ? 86 : 64;
  const total = Math.round((lengthScore + numberScore + structureScore + confidenceScore) / 4);
  return {
    total,
    summary: `질문의 의도에는 맞지만, 결과 수치와 본인의 행동을 조금 더 선명하게 말하면 훨씬 강한 답변이 됩니다. 현재 점수는 ${total}점입니다.`,
    metrics: [
      { label: "명확성", score: lengthScore, description: "답변 밀도와 전달력" },
      { label: "구체성", score: numberScore, description: "수치·사례 구체성" },
      { label: "구조", score: structureScore, description: "STAR 흐름 여부" },
      { label: "자신감", score: confidenceScore, description: "주도성 표현 강도" }
    ],
    notes: [
      lengthScore < 70 ? "답변 길이가 짧아서 강점이 충분히 드러나지 않습니다." : "핵심 내용이 비교적 선명하게 전달됩니다.",
      numberScore < 70 ? "성과를 보여주는 수치나 전후 비교를 한 줄 추가해 보세요." : "숫자나 구체 사례가 포함되어 설득력이 좋아집니다.",
      structureScore < 75 ? "상황-행동-결과 순서로 다시 정리하면 훨씬 면접 답변 같아집니다." : "답변 구조가 비교적 안정적입니다.",
      confidenceScore < 70 ? "본인이 직접 한 행동을 더 적극적인 동사로 표현해 보세요." : "주도적으로 문제를 해결한 인상이 잘 살아 있습니다."
    ],
    starDraft: `상황: ${activeQuestion}와 관련된 프로젝트에서 핵심 이슈가 있었습니다.\n과제: 문제를 빠르게 정리하고 해결 방향을 제시해야 했습니다.\n행동: 우선순위를 정하고 팀과 협업하며 직접 실행했습니다.\n결과: 일정과 품질 모두에서 개선된 결과를 만들었습니다.`
  };
}

function normalizeReport(report) {
  return {
    total: Number.isFinite(Number(report.total)) ? Math.min(99, Math.max(40, Math.round(Number(report.total)))) : 84,
    summary: String(report.summary || "답변의 큰 방향은 좋습니다. 행동과 결과를 조금 더 선명하게 정리해 보세요.").trim(),
    metrics: (Array.isArray(report.metrics) ? report.metrics : []).map((metric) => ({
      label: String(metric.label || "지표").trim(),
      score: Number.isFinite(Number(metric.score)) ? Math.min(99, Math.max(40, Math.round(Number(metric.score)))) : 80,
      description: String(metric.description || "설명").trim()
    })),
    notes: Array.isArray(report.notes) ? report.notes.map((note) => String(note).trim()).filter(Boolean) : [],
    starDraft: String(report.starDraft || "").trim()
  };
}

function renderReport(report) {
  const normalized = normalizeReport(report);
  heroScore.textContent = normalized.total;
  metricGrid.innerHTML = normalized.metrics.map((metric) => `
    <div class="metric-card">
      <strong>${metric.score}</strong>
      <span>${escapeHtml(metric.label)}</span>
      <small>${escapeHtml(metric.description)}</small>
    </div>
  `).join("");
  reportNotes.innerHTML = normalized.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
  lastStarDraft = normalized.starDraft || lastStarDraft;
}

async function requestInterviewCoach(mode, payload) {
  const response = await fetch(INTERVIEW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mode, ...payload })
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

function applyQuestionSet(questions, opening, readinessScore) {
  coachOpening = opening || coachOpening;
  heroScore.textContent = readinessScore || heroScore.textContent;
  renderQuestionCards(questions);
}

function renderFallbackQuestions() {
  const questions = generateFallbackQuestions(introInput.value.trim(), roleSelect.value);
  applyQuestionSet(questions, "자기소개를 기준으로 자주 나오는 면접 질문을 데모 형태로 보여주고 있습니다.", 84);
}

sampleBtn.addEventListener("click", () => {
  introInput.value = sampleIntro;
  renderFallbackQuestions();
  setCoachStatus("샘플 자기소개를 넣고 데모 질문을 다시 구성했습니다. 버튼을 누르면 Gemini 질문으로 갱신됩니다.", "neutral");
});

generateBtn.addEventListener("click", async () => {
  const intro = introInput.value.trim();
  if (!intro) {
    setCoachStatus("먼저 자기소개를 입력해 주세요.", "warn");
    return;
  }

  setButtonLoading(generateBtn, true, "예상 질문 만들기", "AI 질문 생성 중...");
  try {
    const data = await requestInterviewCoach("questions", {
      role: roleSelect.value,
      intro
    });
    applyQuestionSet(data.questions, data.opening, data.readinessScore);
    setCoachStatus("Gemini가 자기소개와 직무를 바탕으로 예상 질문을 생성했습니다.", "success");
  } catch (error) {
    renderFallbackQuestions();
    setCoachStatus("Gemini 연결이 없어 데모 질문으로 표시했습니다. 실제 AI 테스트는 wrangler pages dev 또는 Cloudflare Pages 배포 주소에서 가능합니다.", "warn");
    console.error(error);
  } finally {
    setButtonLoading(generateBtn, false, "예상 질문 만들기", "AI 질문 생성 중...");
  }
});

voiceBtn.addEventListener("click", () => {
  if (!recognition) {
    return;
  }

  try {
    recognition.start();
  } catch (error) {
    voiceStatus.textContent = "음성 사용 중";
  }
});

reviewBtn.addEventListener("click", async () => {
  if (!activeQuestion) {
    chatFeedback.textContent = "먼저 예상 질문을 생성해 주세요.";
    return;
  }

  const answer = answerInput.value.trim();
  if (!answer) {
    chatFeedback.textContent = "답변을 입력한 뒤 평가해 주세요.";
    return;
  }

  setButtonLoading(reviewBtn, true, "답변 평가하기", "AI 피드백 생성 중...");
  try {
    const data = await requestInterviewCoach("review", {
      role: roleSelect.value,
      intro: introInput.value.trim(),
      question: activeQuestion,
      answer
    });
    chatFeedback.textContent = `코치 피드백: ${data.summary}`;
    renderReport(data);
    setCoachStatus("Gemini가 질문 의도와 답변 흐름을 바탕으로 피드백 리포트를 생성했습니다.", "success");
  } catch (error) {
    const report = evaluateFallbackAnswer(answer);
    chatFeedback.textContent = `코치 피드백: ${report.summary}`;
    renderReport(report);
    setCoachStatus("Gemini 연결이 없어 데모 평가 로직으로 리포트를 보여주고 있습니다.", "warn");
    console.error(error);
  } finally {
    setButtonLoading(reviewBtn, false, "답변 평가하기", "AI 피드백 생성 중...");
  }
});

smartDraftBtn.addEventListener("click", async () => {
  if (!activeQuestion) {
    chatFeedback.textContent = "먼저 질문을 선택해 주세요.";
    return;
  }

  setButtonLoading(smartDraftBtn, true, "STAR 초안 보기", "STAR 초안 생성 중...");
  try {
    const data = await requestInterviewCoach("draft", {
      role: roleSelect.value,
      intro: introInput.value.trim() || sampleIntro,
      question: activeQuestion
    });
    answerInput.value = data.starDraft;
    lastStarDraft = data.starDraft;
    setCoachStatus("Gemini가 선택한 질문에 맞는 STAR 초안을 생성했습니다.", "success");
  } catch (error) {
    answerInput.value = lastStarDraft || `상황: ${activeQuestion}와 관련된 프로젝트에서 중요한 이슈가 있었습니다.\n과제: 문제를 빠르게 정리하고 해결 방향을 제시해야 했습니다.\n행동: 우선순위를 정하고 팀과 협업하며 직접 실행했습니다.\n결과: 일정과 품질 모두에서 개선된 결과를 만들었습니다.`;
    setCoachStatus("Gemini 연결이 없어 데모 STAR 초안을 보여주고 있습니다.", "warn");
    console.error(error);
  } finally {
    setButtonLoading(smartDraftBtn, false, "STAR 초안 보기", "STAR 초안 생성 중...");
  }
});

setupVoice();
renderReport(evaluateFallbackAnswer("저는 운영 경험이 있는 개발자로 장애를 줄이기 위해 테스트 자동화와 배포 프로세스를 개선했습니다. 그 결과 배포 오류가 줄고 팀의 대응 속도가 빨라졌습니다."));
renderFallbackQuestions();
setCoachStatus(window.location.protocol === "file:" ? "현재는 정적 파일로 열려 있어 데모 질문과 피드백이 표시됩니다. 실제 Gemini 테스트는 wrangler pages dev 또는 Cloudflare Pages 배포 주소에서 가능합니다." : "자기소개를 넣고 버튼을 누르면 Gemini가 예상 질문과 답변 피드백을 생성합니다.", "neutral");
