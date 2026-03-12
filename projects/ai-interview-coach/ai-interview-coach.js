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
let activeQuestion = "";
let recognition = null;

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { voiceStatus.textContent = "Voice Unsupported"; voiceBtn.disabled = true; return; }
  recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.interimResults = true;
  recognition.onstart = () => voiceStatus.textContent = "Listening...";
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
    introInput.value = transcript;
  };
  recognition.onerror = () => voiceStatus.textContent = "Voice Error";
  recognition.onend = () => voiceStatus.textContent = "Voice Ready";
}

function generateQuestions(text, role) {
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

function renderQuestions() {
  const questions = generateQuestions(introInput.value.trim(), roleSelect.value);
  questionList.innerHTML = questions.map((question, index) => `<button class="question-card${index === 0 ? " active" : ""}" data-question="${question.replace(/"/g, "&quot;")}"><strong>Q${index + 1}</strong><span>${question}</span></button>`).join("");
  activeQuestion = questions[0] || "";
  updateActiveQuestion(activeQuestion);
  questionList.querySelectorAll(".question-card").forEach((button) => {
    button.addEventListener("click", () => {
      questionList.querySelectorAll(".question-card").forEach((card) => card.classList.remove("active"));
      button.classList.add("active");
      activeQuestion = button.dataset.question;
      updateActiveQuestion(activeQuestion);
    });
  });
}

function updateActiveQuestion(question) {
  activeQuestionLabel.textContent = question || "질문을 선택하세요";
  chatPrompt.textContent = question ? `면접관: ${question}` : "먼저 질문을 생성해 주세요.";
}

function evaluateAnswer(answer) {
  const lengthScore = Math.min(100, Math.round(answer.length / 2.6));
  const numberScore = /\d|퍼센트|개월|년|건/.test(answer) ? 88 : 62;
  const structureScore = /(문제|상황|과제).*(행동|해결|진행).*(결과|성과)/s.test(answer) ? 92 : 68;
  const confidenceScore = /(주도|개선|해결|리드|성과|최적화)/.test(answer) ? 86 : 64;
  const total = Math.round((lengthScore + numberScore + structureScore + confidenceScore) / 4);
  return {
    total,
    metrics: [
      ["Clarity", lengthScore, "답변 밀도와 전달력"],
      ["Specificity", numberScore, "수치·사례 구체성"],
      ["Structure", structureScore, "STAR 흐름 여부"],
      ["Confidence", confidenceScore, "주도성 표현 강도"]
    ],
    notes: [
      lengthScore < 70 ? "답변 길이가 짧아서 강점이 충분히 드러나지 않습니다." : "핵심 내용이 비교적 선명하게 전달됩니다.",
      numberScore < 70 ? "성과를 보여주는 수치나 전후 비교를 한 줄 추가해 보세요." : "숫자나 구체 사례가 포함되어 설득력이 좋아집니다.",
      structureScore < 75 ? "상황-행동-결과 순서로 다시 정리하면 훨씬 면접 답변 같아집니다." : "답변 구조가 비교적 안정적입니다.",
      confidenceScore < 70 ? "본인이 직접 한 행동을 더 적극적인 동사로 표현해 보세요." : "주도적으로 문제를 해결한 인상이 잘 살아 있습니다."
    ]
  };
}

function renderReport(report) {
  heroScore.textContent = report.total;
  metricGrid.innerHTML = report.metrics.map(([label, score, description]) => `<div class="metric-card"><strong>${score}</strong><span>${label}</span><small>${description}</small></div>`).join("");
  reportNotes.innerHTML = report.notes.map((note) => `<li>${note}</li>`).join("");
}

sampleBtn.addEventListener("click", () => { introInput.value = sampleIntro; renderQuestions(); });
generateBtn.addEventListener("click", () => renderQuestions());
voiceBtn.addEventListener("click", () => { if (!recognition) return; recognition.start(); });
reviewBtn.addEventListener("click", () => {
  if (!activeQuestion) { chatFeedback.textContent = "먼저 예상 질문을 생성해 주세요."; return; }
  const answer = answerInput.value.trim();
  if (!answer) { chatFeedback.textContent = "답변을 입력한 뒤 평가해 주세요."; return; }
  const report = evaluateAnswer(answer);
  chatFeedback.textContent = `코치 피드백: ${report.total}점입니다. 질문 의도에는 맞지만, 결과 수치와 본인의 행동을 조금 더 선명하게 말하면 훨씬 강한 답변이 됩니다.`;
  renderReport(report);
});
smartDraftBtn.addEventListener("click", () => {
  if (!activeQuestion) { chatFeedback.textContent = "먼저 질문을 선택해 주세요."; return; }
  answerInput.value = `상황: ${activeQuestion}와 관련된 프로젝트에서 핵심 이슈가 있었습니다.\n행동: 문제를 구조화하고 우선순위를 정한 뒤 팀과 협업하며 직접 실행했습니다.\n결과: 일정 지연을 줄이고 사용자/팀 모두 체감할 수 있는 개선 결과를 만들었습니다.`;
});
setupVoice();
renderReport(evaluateAnswer("저는 운영 경험이 있는 개발자로 장애를 줄이기 위해 테스트 자동화와 배포 프로세스를 개선했습니다. 그 결과 배포 오류가 줄고 팀의 대응 속도가 빨라졌습니다."));
renderQuestions();
