const STORAGE_KEY = "earthbite-save";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const COLS = 24;
const ROWS = 16;
const CELL = 40;
const FOOD_TYPES = {
    berry: { color: "#ff9369", glow: "rgba(255,147,105,0.35)", score: 100, growth: 1, label: "기본 먹이" },
    gold: { color: "#ffd56a", glow: "rgba(255,213,106,0.45)", score: 240, growth: 2, label: "황금 먹이" },
    chill: { color: "#77c7ff", glow: "rgba(119,199,255,0.4)", score: 120, growth: 1, label: "안정 먹이" }
};

const ui = {
    score: document.getElementById("scoreValue"),
    length: document.getElementById("lengthValue"),
    combo: document.getElementById("comboValue"),
    bestScore: document.getElementById("bestScoreValue"),
    bestLength: document.getElementById("bestLengthValue"),
    runCount: document.getElementById("runCountValue"),
    biome: document.getElementById("biomeValue"),
    status: document.getElementById("statusValue"),
    feedLog: document.getElementById("feedLog"),
    menuOverlay: document.getElementById("menuOverlay"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    gameOverOverlay: document.getElementById("gameOverOverlay"),
    gameOverTitle: document.getElementById("gameOverTitle"),
    gameOverSummary: document.getElementById("gameOverSummary"),
    difficultyBtn: document.getElementById("difficultyBtn"),
    toggleSoundBtn: document.getElementById("toggleSoundBtn"),
    infoToggleBtn: document.getElementById("infoToggleBtn"),
    insightPopover: document.getElementById("insightPopover"),
    closeInfoBtn: document.getElementById("closeInfoBtn")
};

const difficulties = [
    { name: "Normal", moveMs: 150, obstacleRate: 6, speedRamp: 1.5 },
    { name: "Hard", moveMs: 125, obstacleRate: 4, speedRamp: 2.1 }
];

let difficultyIndex = 0;
let audioEnabled = true;
let audioContext;
let lastTime = 0;
let moveAccumulator = 0;
let gameState = "menu";
let particles = [];
let pulse = 0;
let shake = 0;
let best = loadBest();

const game = {
    worm: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: null,
    obstacles: [],
    score: 0,
    combo: 1,
    comboTimer: 0,
    runTime: 0,
    growQueue: 0,
    stableTimer: 0,
    runCount: best.runCount || 0,
    maxLength: 4
};

function loadBest() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { bestScore: 0, bestLength: 0, runCount: 0 };
    } catch {
        return { bestScore: 0, bestLength: 0, runCount: 0 };
    }
}

function saveBest() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
}

function ensureAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(type) {
    if (!audioEnabled) return;
    ensureAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    const now = audioContext.currentTime;
    const tones = {
        eat: [420, 660],
        gold: [360, 740],
        crash: [150, 90],
        pause: [280, 220]
    };
    const [start, end] = tones[type] || [300, 500];
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(end, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.18);
}

function pushLog(text) {
    const item = document.createElement("div");
    item.className = "log-item";
    item.textContent = text;
    ui.feedLog.prepend(item);
    while (ui.feedLog.children.length > 6) {
        ui.feedLog.removeChild(ui.feedLog.lastChild);
    }
}

function setOverlay(name) {
    ui.menuOverlay.classList.toggle("active", name === "menu");
    ui.pauseOverlay.classList.toggle("active", name === "pause");
    ui.gameOverOverlay.classList.toggle("active", name === "over");
}

function closeInfoPanel() {
    ui.insightPopover.classList.remove("active");
    ui.infoToggleBtn.textContent = "플레이 포인트";
    ui.infoToggleBtn.setAttribute("aria-expanded", "false");
    ui.insightPopover.setAttribute("aria-hidden", "true");
}

function openInfoPanel() {
    ui.insightPopover.classList.add("active");
    ui.infoToggleBtn.textContent = "플레이 포인트 닫기";
    ui.infoToggleBtn.setAttribute("aria-expanded", "true");
    ui.insightPopover.setAttribute("aria-hidden", "false");
}

function toggleInfoPanel() {
    if (ui.insightPopover.classList.contains("active")) {
        closeInfoPanel();
    } else {
        openInfoPanel();
    }
}

function resetRun() {
    game.worm = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 },
        { x: 5, y: 8 }
    ];
    game.direction = { x: 1, y: 0 };
    game.nextDirection = { x: 1, y: 0 };
    game.score = 0;
    game.combo = 1;
    game.comboTimer = 0;
    game.runTime = 0;
    game.growQueue = 0;
    game.stableTimer = 0;
    game.obstacles = [];
    game.food = spawnFood();
    game.maxLength = game.worm.length;
    particles = [];
    moveAccumulator = 0;
    pulse = 0;
    shake = 0;
    game.runCount += 1;
    best.runCount = game.runCount;
    saveBest();
    updateUi();
    pushLog("새 런이 시작되었습니다.");
}

function occupied(x, y) {
    return game.worm.some((part) => part.x === x && part.y === y) || game.obstacles.some((rock) => rock.x === x && rock.y === y);
}

function spawnFood() {
    let x = 0;
    let y = 0;
    do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
    } while (occupied(x, y));
    const roll = Math.random();
    const type = roll > 0.84 ? "gold" : roll > 0.64 ? "chill" : "berry";
    return { x, y, type, phase: Math.random() * Math.PI * 2 };
}

function spawnObstacle() {
    let x = 0;
    let y = 0;
    do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
    } while (occupied(x, y) || (game.food && game.food.x === x && game.food.y === y));
    game.obstacles.push({ x, y });
    pushLog("흙 속 돌기가 새로 생겨났습니다.");
}

function updateUi() {
    ui.score.textContent = game.score.toLocaleString("ko-KR");
    ui.length.textContent = String(game.worm.length);
    ui.combo.textContent = `x${game.combo}`;
    ui.bestScore.textContent = best.bestScore.toLocaleString("ko-KR");
    ui.bestLength.textContent = String(best.bestLength);
    ui.runCount.textContent = String(best.runCount || 0);
    ui.status.textContent = gameState === "playing" ? (game.stableTimer > 0 ? "Stabilized" : "Burrowing") : gameState === "paused" ? "Paused" : gameState === "over" ? "Run Over" : "Ready";
    ui.biome.textContent = game.obstacles.length < 3 ? "Loam Garden" : game.obstacles.length < 6 ? "Root Tunnel" : "Basalt Nest";
    ui.difficultyBtn.textContent = `난이도: ${difficulties[difficultyIndex].name}`;
    ui.toggleSoundBtn.textContent = `사운드 ${audioEnabled ? "ON" : "OFF"}`;
}

function addParticles(x, y, color, amount = 10) {
    for (let i = 0; i < amount; i += 1) {
        particles.push({
            x: x * CELL + CELL / 2,
            y: y * CELL + CELL / 2,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            life: 1,
            color
        });
    }
}

function startGame() {
    resetRun();
    gameState = "playing";
    setOverlay(null);
    closeInfoPanel();
    updateUi();
}

function pauseGame() {
    if (gameState === "playing") {
        gameState = "paused";
        setOverlay("pause");
        playTone("pause");
    } else if (gameState === "paused") {
        gameState = "playing";
        setOverlay(null);
        playTone("pause");
    }
    updateUi();
}

function endGame(reason) {
    gameState = "over";
    setOverlay("over");
    shake = 18;
    playTone("crash");
    best.bestScore = Math.max(best.bestScore, game.score);
    best.bestLength = Math.max(best.bestLength, game.maxLength);
    saveBest();
    ui.gameOverTitle.textContent = reason;
    ui.gameOverSummary.textContent = `점수 ${game.score.toLocaleString("ko-KR")}점 · 길이 ${game.worm.length}칸 · 콤보 x${game.combo}로 런이 종료되었습니다.`;
    updateUi();
}

function handleEat() {
    const food = FOOD_TYPES[game.food.type];
    game.growQueue += food.growth;
    game.comboTimer = 2.6;
    game.combo = Math.min(game.combo + 1, 9);
    game.score += food.score * game.combo;
    game.maxLength = Math.max(game.maxLength, game.worm.length + game.growQueue);
    if (game.food.type === "chill") game.stableTimer = 6;
    if (game.food.type === "gold") {
        playTone("gold");
        addParticles(game.food.x, game.food.y, food.glow, 18);
        pushLog(`황금 먹이 획득. 점수 배수가 x${game.combo}까지 상승했습니다.`);
    } else {
        playTone("eat");
        addParticles(game.food.x, game.food.y, food.glow, 12);
        pushLog(`${food.label} 섭취. 길이가 더 길어졌습니다.`);
    }
    if (game.worm.length % difficulties[difficultyIndex].obstacleRate === 0 && game.obstacles.length < 12) {
        spawnObstacle();
    }
    game.food = spawnFood();
    updateUi();
}

function stepGame(delta) {
    game.runTime += delta;
    pulse += delta * 1.7;
    if (game.comboTimer > 0) {
        game.comboTimer = Math.max(game.comboTimer - delta, 0);
        if (game.comboTimer === 0) game.combo = 1;
    }
    if (game.stableTimer > 0) {
        game.stableTimer = Math.max(game.stableTimer - delta, 0);
    }
    particles = particles.filter((particle) => particle.life > 0.02).map((particle) => ({
        ...particle,
        x: particle.x + particle.dx,
        y: particle.y + particle.dy,
        dy: particle.dy + 0.02,
        life: particle.life - 0.03
    }));

    const difficulty = difficulties[difficultyIndex];
    const dynamicSpeed = Math.max(difficulty.moveMs - game.worm.length * difficulty.speedRamp - (game.stableTimer > 0 ? -22 : 0), 72);
    moveAccumulator += delta * 1000;
    if (moveAccumulator < dynamicSpeed) return;
    moveAccumulator = 0;

    game.direction = game.nextDirection;
    const head = { x: game.worm[0].x + game.direction.x, y: game.worm[0].y + game.direction.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return endGame("벽과 충돌했습니다");
    if (game.obstacles.some((rock) => rock.x === head.x && rock.y === head.y)) return endGame("돌기 장애물에 걸렸습니다");
    if (game.worm.some((part) => part.x === head.x && part.y === head.y)) return endGame("자신의 몸통과 충돌했습니다");

    game.worm.unshift(head);
    if (game.food && head.x === game.food.x && head.y === game.food.y) {
        handleEat();
    } else if (game.growQueue > 0) {
        game.growQueue -= 1;
    } else {
        game.worm.pop();
    }
    updateUi();
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#132019");
    gradient.addColorStop(0.3, "#1b2319");
    gradient.addColorStop(1, "#22150f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.02)";
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
    }
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 7; i += 1) {
        ctx.beginPath();
        ctx.strokeStyle = i % 2 === 0 ? "#7cf0c6" : "#ff9369";
        ctx.lineWidth = 2;
        for (let x = 0; x <= canvas.width; x += 24) {
            const y = canvas.height * (0.16 + i * 0.11) + Math.sin(x * 0.01 + pulse + i) * 16;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawFood() {
    if (!game.food) return;
    const type = FOOD_TYPES[game.food.type];
    const cx = game.food.x * CELL + CELL / 2;
    const cy = game.food.y * CELL + CELL / 2;
    const radius = 10 + Math.sin(pulse * 4 + game.food.phase) * 2;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
    glow.addColorStop(0, type.glow);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 24, cy - 24, 48, 48);
    ctx.beginPath();
    ctx.fillStyle = type.color;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawObstacles() {
    game.obstacles.forEach((rock) => {
        const x = rock.x * CELL;
        const y = rock.y * CELL;
        ctx.fillStyle = "#6f4b36";
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 30);
        ctx.lineTo(x + 18, y + 8);
        ctx.lineTo(x + 31, y + 12);
        ctx.lineTo(x + 34, y + 28);
        ctx.lineTo(x + 20, y + 34);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.stroke();
    });
}

function drawWorm() {
    game.worm.forEach((part, index) => {
        const x = part.x * CELL + CELL / 2;
        const y = part.y * CELL + CELL / 2;
        const radius = index === 0 ? 15 : Math.max(9, 14 - index * 0.22);
        const color = index === 0 ? "#7cf0c6" : `rgba(124,240,198,${Math.max(0.18, 0.92 - index * 0.05)})`;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (index === 0) {
            ctx.fillStyle = "#0b100d";
            ctx.beginPath();
            ctx.arc(x + 4, y - 4, 2.6, 0, Math.PI * 2);
            ctx.arc(x + 4, y + 4, 2.6, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawParticles() {
    particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawGridFrame() {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    ctx.restore();
}

function render(delta) {
    if (shake > 0) shake *= 0.86;
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    drawBackground();
    drawFood();
    drawObstacles();
    drawWorm();
    drawParticles();
    drawGridFrame();
    ctx.restore();
    if (gameState === "playing") stepGame(delta);
}

function loop(timestamp) {
    const delta = Math.min((timestamp - lastTime) / 1000 || 0.016, 0.03);
    lastTime = timestamp;
    render(delta);
    requestAnimationFrame(loop);
}

function setDirection(x, y) {
    if (game.direction.x === -x && game.direction.y === -y) return;
    game.nextDirection = { x, y };
}

function handleKey(event) {
    const key = event.key.toLowerCase();
    if (["arrowup", "w"].includes(key)) setDirection(0, -1);
    if (["arrowdown", "s"].includes(key)) setDirection(0, 1);
    if (["arrowleft", "a"].includes(key)) setDirection(-1, 0);
    if (["arrowright", "d"].includes(key)) setDirection(1, 0);
    if (key === "i") toggleInfoPanel();
    if (key === "escape" && ui.insightPopover.classList.contains("active")) closeInfoPanel();
    if (key === "p") pauseGame();
    if (key === "r") startGame();
    if (key === "enter" && gameState === "menu") startGame();
}

document.getElementById("startRunBtn").addEventListener("click", startGame);
document.getElementById("overlayStartBtn").addEventListener("click", startGame);
document.getElementById("retryBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);
document.getElementById("backToMenuBtn").addEventListener("click", () => {
    gameState = "menu";
    setOverlay("menu");
    updateUi();
});
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
ui.difficultyBtn.addEventListener("click", () => {
    difficultyIndex = (difficultyIndex + 1) % difficulties.length;
    updateUi();
    pushLog(`난이도가 ${difficulties[difficultyIndex].name}(으)로 변경되었습니다.`);
});
ui.infoToggleBtn.addEventListener("click", toggleInfoPanel);
ui.closeInfoBtn.addEventListener("click", closeInfoPanel);
ui.toggleSoundBtn.addEventListener("click", () => {
    audioEnabled = !audioEnabled;
    updateUi();
});
document.addEventListener("click", (event) => {
    if (!ui.insightPopover.classList.contains("active")) return;
    if (ui.insightPopover.contains(event.target) || ui.infoToggleBtn.contains(event.target)) return;
    closeInfoPanel();
});
window.addEventListener("keydown", handleKey);

closeInfoPanel();
updateUi();
setOverlay("menu");
requestAnimationFrame(loop);
