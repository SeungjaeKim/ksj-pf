const words = ["Scalable Systems.", "Stunning UI/UX.", "Innovative Solutions.", "Future Web Apps."];
let i = 0;
let timer;

function typingEffect(typewriter) {
    const word = words[i].split("");

    const loopTyping = function() {
        if (word.length > 0) {
            typewriter.innerHTML += word.shift();
        } else {
            deletingEffect(typewriter);
            return false;
        }

        timer = setTimeout(loopTyping, 100);
    };

    loopTyping();
}

function deletingEffect(typewriter) {
    const word = words[i].split("");

    const loopDeleting = function() {
        if (word.length > 0) {
            word.pop();
            typewriter.innerHTML = word.join("");
        } else {
            i = words.length > i + 1 ? i + 1 : 0;
            typingEffect(typewriter);
            return false;
        }

        timer = setTimeout(loopDeleting, 50);
    };

    setTimeout(loopDeleting, 2000);
}

function setupCanvasBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    let particlesArray = [];

    const mouse = {
        x: null,
        y: null,
        radius: 0
    };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        mouse.radius = (canvas.height / 80) * (canvas.width / 80);
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        initCanvas();
    });

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 10;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 10;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 10;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 10;
                }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initCanvas() {
        particlesArray = [];
        const numberOfParticles = Math.min(120, (canvas.height * canvas.width) / 14000);

        for (let index = 0; index < numberOfParticles; index += 1) {
            const size = (Math.random() * 2) + 1;
            const x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
            const y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
            const directionX = (Math.random() * 1) - 0.5;
            const directionY = (Math.random() * 1) - 0.5;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, "rgba(255, 255, 255, 0.15)"));
        }
    }

    function connectParticles() {
        for (let a = 0; a < particlesArray.length; a += 1) {
            for (let b = a; b < particlesArray.length; b += 1) {
                const distance =
                    ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    const opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = "rgba(108, 92, 231, " + opacityValue / 3 + ")";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateCanvas() {
        requestAnimationFrame(animateCanvas);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let index = 0; index < particlesArray.length; index += 1) {
            particlesArray[index].update();
        }

        connectParticles();
    }

    resizeCanvas();
    initCanvas();
    animateCanvas();
}

document.addEventListener("DOMContentLoaded", () => {
    const typewriter = document.getElementById("typewriter");
    if (typewriter) {
        typingEffect(typewriter);
    }

    setupCanvasBackground();
});
