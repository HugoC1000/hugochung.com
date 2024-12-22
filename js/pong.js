const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const paddleWidth = 20;
const paddleHeight = 100;
const ballSize = 20;

const player = { x: 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };
const ai = { x: canvas.width - 30, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0, speed: 5 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 5, vy: 5, size: ballSize };

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color, size = '30px') {
    ctx.fillStyle = color;
    ctx.font = `${size} Arial`;
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = Math.random() > 0.5 ? 5 : -5;
    ball.vy = Math.random() > 0.5 ? 5 : -5;
}

function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.vy = -ball.vy;
    }

    // Ball collision with paddles
    if (
        ball.x <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.vx = -ball.vx;
        ball.vx *= 1.05;
        ball.vy *= 1.05;
    }

    if (
        ball.x + ball.size >= ai.x &&
        ball.y >= ai.y &&
        ball.y <= ai.y + ai.height
    ) {
        ball.vx = -ball.vx;
        ball.vx *= 1.05;
        ball.vy *= 1.05;
        ai.speed += 1;
    }

    // Ball out of bounds
    if (ball.x <= 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.size >= canvas.width) {
        player.score++;
        resetBall();
    }

    // AI movement
    if (ball.y > ai.y + ai.height / 2) {
        ai.y += ai.speed;
    } else if (ball.y < ai.y + ai.height / 2) {
        ai.y -= ai.speed;
    }

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    drawRect(player.x, player.y, player.width, player.height, 'white');
    drawRect(ai.x, ai.y, ai.width, ai.height, 'white');
    drawCircle(ball.x, ball.y, ball.size / 2, 'white');
    drawText(player.score, canvas.width / 4, 50, 'white');
    drawText(ai.score, (canvas.width * 3) / 4, 50, 'white');
}

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('mousemove', (e) => {
    player.y = e.clientY - player.height / 2;
});

gameLoop();
