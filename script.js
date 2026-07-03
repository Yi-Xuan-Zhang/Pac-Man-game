const pac = document.getElementById('pacman');
const ghost = document.getElementById('ghost');
const foods = document.querySelectorAll('.food');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const msg = document.getElementById('message');

let x = 20, y = 100, gx = 700, gy = 350;
let score = 0, time = 60;
let game = false;
let timer, ghostTimer;

function beep(f, d) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = f;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
    o.stop(ctx.currentTime + d);
}

function render() {
    pac.style.left = x + 'px';
    pac.style.top = y + 'px';
    ghost.style.left = gx + 'px';
    ghost.style.top = gy + 'px';
}

function move(dx, dy, deg) {
    if (!game) return;
    x = Math.max(0, Math.min(x + dx, 720));
    y = Math.max(0, Math.min(y + dy, 420));
    pac.style.transform = `rotate(${deg}deg)`;
    render();
    checkFood();
}

document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') move(0, -20, 270);
    if (k === 'arrowdown' || k === 's') move(0, 20, 90);
    if (k === 'arrowleft' || k === 'a') move(-20, 0, 180);
    if (k === 'arrowright' || k === 'd') move(20, 0, 0);
});

document.querySelectorAll('.touch button').forEach(btn => {
    btn.addEventListener('click', () => {
        const d = btn.dataset.dir;
        if (d === 'up') move(0, -20, 270);
        if (d === 'down') move(0, 20, 90);
        if (d === 'left') move(-20, 0, 180);
        if (d === 'right') move(20, 0, 0);
    });
});

document.querySelector('.game-bg').addEventListener('click', e => {
    if (!game) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x = e.clientX - rect.left - 40;
    y = e.clientY - rect.top - 40;
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
    if (gx < x) gx += 10;
    if (gx > x) gx -= 10;
    if (gy < y) gy += 10;
    if (gy > y) gy -= 10;
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
    x = 20; y = 100; gx = 700; gy = 350;
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
