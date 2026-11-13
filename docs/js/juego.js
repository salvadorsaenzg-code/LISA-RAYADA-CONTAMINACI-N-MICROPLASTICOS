// Juego 1: "Nada con la lisa".
// Es un juego ilustrativo: no es un modelo científico ni mide efectos en los peces.
(function () {
  "use strict";

  var stage = document.getElementById("juego-stage");
  if (!stage) return;

  var canvas = document.getElementById("juego-canvas");
  var ctx = canvas.getContext("2d");
  var overlay = document.getElementById("juego-overlay");
  var msg = document.getElementById("juego-msg");
  var btn = document.getElementById("juego-start");
  var hudTime = document.getElementById("hud-time");
  var hudFood = document.getElementById("hud-food");
  var hudFiber = document.getElementById("hud-fiber");

  // La silueta se toma del símbolo que ya usa la cuadrícula de peces.
  var pathEl = document.querySelector("#fish path");
  var FISH = pathEl && window.Path2D ? new Path2D(pathEl.getAttribute("d")) : null;
  var FIBER_IN_FISH = window.Path2D ? new Path2D("M14 9.8q2.7-3.4 5.4 0t5.4 0t5.4 0") : null;

  var DURATION = 45;
  var W = 640, H = 360, dpr = 1;
  var state = "idle"; // idle | playing | over
  var fish = { x: 0, y: 0, face: 1, tilt: 0 };
  var target = { x: 0, y: 0 };
  var items = [];
  var food = 0, fibers = 0, timeLeft = DURATION, elapsed = 0;
  var spawnP = 0, spawnF = 0, flash = 0, last = 0, raf = 0, shownSecond = DURATION;
  var startTs = 0, pausedMs = 0;
  var keys = {};

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fishWidth() { return clamp(W * 0.15, 72, 130); }

  function setSize() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(280, r.width);
    H = Math.max(200, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state !== "playing") {
      fish.x = W * 0.3; fish.y = H / 2;
      target.x = fish.x; target.y = fish.y;
      render();
    }
  }

  function updateHud() {
    hudTime.textContent = Math.max(0, Math.ceil(timeLeft));
    hudFood.textContent = food;
    hudFiber.textContent = fibers;
  }

  function spawn(type) {
    var base = W / 9;
    items.push({
      type: type,
      x: W + 24,
      y: rand(24, H - 24),
      vx: -base * rand(0.6, 1.5),
      vy: rand(-14, 14),
      ph: rand(0, 6.28),
      rot: rand(0, 6.28),
      spin: rand(-0.8, 0.8),
      r: type === "f" ? 10 : 4.5
    });
  }

  function mouth() {
    var s = fishWidth() / 52;
    var ux = fish.face * s * -25.5, uy = s * -0.2;
    var c = Math.cos(fish.tilt), sn = Math.sin(fish.tilt);
    return { x: fish.x + ux * c - uy * sn, y: fish.y + ux * sn + uy * c };
  }

  function step(dt, ts) {
    elapsed += dt;
    // El tiempo del juego sigue el reloj real, aunque el equipo dibuje despacio.
    timeLeft = DURATION - (ts - startTs - pausedMs) / 1000;

    // Teclado: mueve el punto al que nada la lisa.
    var kx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
    var ky = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    if (kx || ky) {
      target.x = clamp(target.x + kx * 340 * dt, 20, W - 20);
      target.y = clamp(target.y + ky * 340 * dt, 20, H - 20);
    }

    var dx = target.x - fish.x, dy = target.y - fish.y;
    var k = Math.min(1, dt * 6);
    fish.x += dx * k;
    fish.y += dy * k;
    if (Math.abs(dx) > 8) fish.face = dx > 0 ? -1 : 1;
    fish.tilt = -clamp(dy * 0.004, -0.4, 0.4) * fish.face + Math.sin(elapsed * 10) * 0.025;
    if (flash > 0) flash -= dt;

    // La corriente trae plancton y fibras desde la derecha.
    spawnP -= dt; spawnF -= dt;
    if (spawnP <= 0) { spawn("p"); spawnP = rand(0.3, 0.6); }
    if (spawnF <= 0) { spawn("f"); spawnF = rand(0.7, 1.1) - 0.35 * (elapsed / DURATION); }

    var m = mouth();
    var mr = fishWidth() * 0.09;
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      it.x += it.vx * dt;
      it.y += it.vy * dt + Math.sin(it.ph + elapsed * 2) * 10 * dt;
      it.rot += it.spin * dt;
      if (it.x < -40) { items.splice(i, 1); continue; }
      var ddx = it.x - m.x, ddy = it.y - m.y;
      var hit = mr + it.r;
      if (ddx * ddx + ddy * ddy < hit * hit) {
        if (it.type === "p") food++; else { fibers++; flash = 0.3; }
        items.splice(i, 1);
        updateHud();
      }
    }

    if (Math.ceil(timeLeft) !== shownSecond) { shownSecond = Math.ceil(timeLeft); updateHud(); }
    if (timeLeft <= 0) end();
  }

  function drawItems() {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type === "p") {
        ctx.beginPath();
        ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
        ctx.fillStyle = "#9bf5d2";
        ctx.shadowColor = "rgba(155,245,210,.85)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.quadraticCurveTo(-9, -7, -4.5, 0);
        ctx.quadraticCurveTo(0, 7, 4.5, 0);
        ctx.quadraticCurveTo(9, -7, 14, 0);
        ctx.strokeStyle = "#ff6a45";
        ctx.lineWidth = 2.8;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawFish() {
    var s = fishWidth() / 52;
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.tilt);
    ctx.scale(fish.face * s, s);
    ctx.translate(-26, -10);
    if (FISH) {
      ctx.fillStyle = flash > 0 ? "#ffd2c6" : "rgba(255,255,255,.95)";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.7;
      ctx.lineJoin = "round";
      ctx.fill(FISH);
      ctx.stroke(FISH);
    } else {
      ctx.beginPath(); ctx.ellipse(26, 10, 24, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(5.6, 8.4, 0.75, 0, Math.PI * 2);
    ctx.fillStyle = "#0a2e5c";
    ctx.fill();
    // Si ya tragó fibras, se ve una dentro del cuerpo, como en la cuadrícula.
    if (fibers > 0 && FIBER_IN_FISH) {
      ctx.strokeStyle = "#ff6a45";
      ctx.lineWidth = 1.3;
      ctx.lineCap = "round";
      ctx.stroke(FIBER_IN_FISH);
    }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawItems();
    drawFish();
  }

  function frame(ts) {
    if (state !== "playing") return;
    var gap = ts - last;
    if (gap > 500) pausedMs += gap; // pestaña oculta: el tiempo se detiene
    var dt = Math.min(0.05, gap / 1000);
    last = ts;
    step(dt, ts);
    if (state === "playing") {
      render();
      raf = requestAnimationFrame(frame);
    }
  }

  function start() {
    items = []; food = 0; fibers = 0; elapsed = 0; flash = 0;
    timeLeft = DURATION; shownSecond = DURATION; spawnP = 0.2; spawnF = 0.9;
    fish.x = W * 0.3; fish.y = H / 2; fish.face = 1; fish.tilt = 0;
    target.x = fish.x; target.y = fish.y;
    updateHud();
    state = "playing";
    overlay.hidden = true;
    last = performance.now();
    startTs = last; pausedMs = 0;
    raf = requestAnimationFrame(frame);
  }

  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  function end() {
    state = "over";
    cancelAnimationFrame(raf);
    keys = {};
    timeLeft = 0;
    updateHud();
    render();
    var text = "Comiste " + food + " de plancton y tragaste " + plural(fibers, "fibra", "fibras") + ". ";
    if (fibers === 0) text += "Esquivaste todas las fibras. ";
    text += "En el estudio de Calderón et al. (2019), 10 de 46 lisas rayadas tenían microplásticos en el tracto digestivo. ";
    text += "Este juego es ilustrativo: no es un modelo científico.";
    msg.textContent = text;
    btn.textContent = "Jugar otra vez";
    overlay.hidden = false;
    btn.focus({ preventScroll: true });
  }

  // Controles
  function point(e) {
    var r = canvas.getBoundingClientRect();
    target.x = clamp(e.clientX - r.left, 20, W - 20);
    target.y = clamp(e.clientY - r.top, 20, H - 20);
  }
  canvas.addEventListener("pointermove", function (e) { if (state === "playing") point(e); });
  canvas.addEventListener("pointerdown", function (e) { if (state === "playing") point(e); });

  var MOVE_KEYS = { ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, w: 1, a: 1, s: 1, d: 1 };
  document.addEventListener("keydown", function (e) {
    if (state !== "playing" || !MOVE_KEYS[e.key]) return;
    keys[e.key] = true;
    e.preventDefault();
  });
  document.addEventListener("keyup", function (e) { delete keys[e.key]; });
  window.addEventListener("blur", function () { keys = {}; });

  btn.addEventListener("click", start);

  if (window.ResizeObserver) new ResizeObserver(setSize).observe(stage);
  else window.addEventListener("resize", setSize);
  setSize();
  updateHud();
})();
