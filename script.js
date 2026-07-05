const board = document.getElementById('board');
const pac = document.getElementById('pacman');
const ghost = document.getElementById('ghost');
const foods = document.querySelectorAll('.food');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const msg = document.getElementById('message');

// All positions/sizes are stored as percentages of the board (0-100),
// matching the % values used in style.css. This keeps movement and
// collisions correct no matter how large or small the board renders.
const PAC_W = 10, PAC_H = 16;
const GHOST_W = 7.5, GHOST_H = 12;

const MOVE_DX = 2.5, MOVE_DY = 4;   // player step per key/tap press
const GHOST_DX = 1.25, GHOST_DY = 2; // ghost step per tick

let x = 2.5, y = 20;
let gx = 87.5, gy = 70;
let score = 0, time = 60;
let game = false;
let timer, ghostTimer;
let audioCtx;

function beep(f, d) {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = f;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + d);
    o.stop(audioCtx.currentTime + d);
}

function render() {
    pac.style.left = x + '%';
    pac.style.top = y + '%';
    ghost.style.left = gx + '%';
    ghost.style.top = gy + '%';
}

function move(dx, dy, deg) {
    if (!game) return;
    x = Math.max(0, Math.min(x + dx, 100 - PAC_W));
    y = Math.max(0, Math.min(y + dy, 100 - PAC_H));
    pac.style.transform = `rotate(${deg}deg)`;
    render();
    checkFood();
}

document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    const isMoveKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k);
    if (isMoveKey) e.preventDefault(); // stop page from scrolling with arrow keys
    if (k === 'arrowup' || k === 'w') move(0, -MOVE_DY, 270);
    if (k === 'arrowdown' || k === 's') move(0, MOVE_DY, 90);
    if (k === 'arrowleft' || k === 'a') move(-MOVE_DX, 0, 180);
    if (k === 'arrowright' || k === 'd') move(MOVE_DX, 0, 0);
});

document.querySelectorAll('.touch button').forEach(btn => {
    const handler = (e) => {
        e.preventDefault();
        const d = btn.dataset.dir;
        if (d === 'up') move(0, -MOVE_DY, 270);
        if (d === 'down') move(0, MOVE_DY, 90);
        if (d === 'left') move(-MOVE_DX, 0, 180);
        if (d === 'right') move(MOVE_DX, 0, 0);
    };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchstart', handler, { passive: false });
});

function pointToBoardPercent(clientX, clientY) {
    const rect = board.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    return { px, py };
}

board.addEventListener('click', e => {
    if (!game) return;
    const { px, py } = pointToBoardPercent(e.clientX, e.clientY);
    x = Math.max(0, Math.min(px - PAC_W / 2, 100 - PAC_W));
    y = Math.max(0, Math.min(py - PAC_H / 2, 100 - PAC_H));
    render();
    checkFood();
});

function collide(a, b) {
    return a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
}

function checkFood() {
    const p = pac.getBoundingClientRect();
    foods.forEach(f => {
        if (f.dataset.eaten) return;
        if (collide(p, f.getBoundingClientRect())) {
            f.dataset.eaten = 1;
            f.style.display = 'none';
            score++;
            scoreEl.textContent = score;
            beep(600, 0.15);

            if (score === foods.length) {
                win();
            }
        }
    });
}

function moveGhost() {
    if (!game) return;
    if (gx < x) gx = Math.min(gx + GHOST_DX, 100 - GHOST_W);
    if (gx > x) gx = Math.max(gx - GHOST_DX, 0);
    if (gy < y) gy = Math.min(gy + GHOST_DY, 100 - GHOST_H);
    if (gy > y) gy = Math.max(gy - GHOST_DY, 0);
    render();

    if (collide(
        pac.getBoundingClientRect(),
        ghost.getBoundingClientRect()
    )) {
        lose('👻 被鬼魂抓到了！');
    }
}

function win() {
    game = false;
    clearInterval(timer);
    clearInterval(ghostTimer);
    beep(900, 0.3);
    setTimeout(() => beep(1200, 0.3), 200);
    msg.classList.remove('hidden');
    msg.innerHTML = '<h1>🥖YOU WIN🥨</h1><p>烘焙界吃貨是你！</p><button onclick="restartGame()">重新開始</button>';
}

function lose(text) {
    game = false;
    clearInterval(timer);
    clearInterval(ghostTimer);
    msg.classList.remove('hidden');
    msg.innerHTML = `<h1>${text}</h1><button onclick="restartGame()">再玩一次</button>`;
}

function restartGame() {
    score = 0;
    time = 60;
    x = 2.5; y = 20; gx = 87.5; gy = 70;
    scoreEl.textContent = 0;
    timeEl.textContent = 60;

    foods.forEach(f => {
        f.dataset.eaten = '';
        f.style.display = 'block';
    });

    msg.classList.add('hidden');
    game = true;
    render();

    clearInterval(timer);
    clearInterval(ghostTimer);

    timer = setInterval(() => {
        time--;
        timeEl.textContent = time;
        if (time <= 0) {
            lose('⏰ 時間到！');
        }
    }, 1000);

    ghostTimer = setInterval(moveGhost, 250);
}

render();