const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - document.querySelector('nav').offsetHeight;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 20;

const player1 = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0, dy: 0 };
const player2 = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0, dy: 0 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 5, vy: 5, size: ballSize };

let isSinglePlayer = true;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawRoundedRect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
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

function drawButton(text, x, y, width, height, color) {
    drawRoundedRect(x, y, width, height, 10, color);
    drawText(text, x + width / 2 - ctx.measureText(text).width / 2 + 65, y + height / 2 + 5, 'DodgerBlue', '15px');
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = Math.random() > 0.5 ? 5 : -5;
    ball.vy = Math.random() > 0.5 ? 5 : -5;
}

function update() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.querySelector('nav').offsetHeight;
    player2.x = canvas.width - paddleWidth;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.vy = -ball.vy;
    }

    // Ball collision with paddles
    if (
        ball.x <= player1.x + player1.width &&
        ball.y >= player1.y &&
        ball.y <= player1.y + player1.height
    ) {
        ball.vx = -ball.vx;
        ball.vx *= 1.05;
        ball.vy *= 1.05;
    }

    if (
        ball.x + ball.size >= player2.x &&
        ball.y >= player2.y &&
        ball.y <= player2.y + player2.height
    ) {
        ball.vx = -ball.vx;
        ball.vx *= 1.05;
        ball.vy *= 1.05;
    }

    // Ball out of bounds
    if (ball.x <= 0) {
        player2.score++;
        resetBall();
    } else if (ball.x + ball.size >= canvas.width) {
        player1.score++;
        resetBall();
    }

    // Player movement
    player1.y += player1.dy;
    player2.y += player2.dy;

    // Prevent paddles from going out of bounds
    player1.y = Math.max(Math.min(player1.y, canvas.height - player1.height), 0);
    player2.y = Math.max(Math.min(player2.y, canvas.height - player2.height), 0);

    // AI movement for single player mode
    if (isSinglePlayer) {
        if (ball.y > player2.y + player2.height / 2) {
            player2.y += 5;
        } else if (ball.y < player2.y + player2.height / 2) {
            player2.y -= 5;
        }
    }

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoundedRect(0, 0, canvas.width, canvas.height, 0, 'black');
    drawRoundedRect(player1.x, player1.y, player1.width, player1.height, 5, 'white');
    drawRoundedRect(player2.x, player2.y, player2.width, player2.height, 5, 'white');
    drawCircle(ball.x, ball.y, ball.size / 2, 'white');
    drawText(player1.score, canvas.width / 4, 50, 'white');
    drawText(player2.score, (canvas.width * 3) / 4, 50, 'white');

    drawButton(isSinglePlayer ? 'Switch to Multiplayer' : 'Switch to Single Player', canvas.width/2 - 90, 15, 180, 35, 'white');
}

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            player1.dy = -5;
            break;
        case 's':
            player1.dy = 5;
            break;
        case 'ArrowUp':
            if (!isSinglePlayer) player2.dy = -5;
            break;
        case 'ArrowDown':
            if (!isSinglePlayer) player2.dy = 5;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
        case 's':
            player1.dy = 0;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            if (!isSinglePlayer) player2.dy = 0;
            break;
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if the button is clicked
    if (x >= canvas.width/2 - 90 && canvas.width/2 + 90 && y >= 10 && y <= 50) {
        isSinglePlayer = !isSinglePlayer;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    gameLoop();
});