// «Recorrido de una fibra»: esquema simplificado de cómo una fibra de plástico puede llegar a una lisa rayada.
// Es una ilustración, no el seguimiento real de una fibra. Los datos citados vienen de
// Calderón et al. (2019) y Garcés-Ordóñez et al. (2022).
// El mismo dibujo se usa en la página (ligado al scroll) y para filmar el video.
(function (root) {
  "use strict";

  var W = 1280, H = 720;
  var FIBER_IN_FISH_D = "M14 9.8q2.7-3.4 5.4 0t5.4 0t5.4 0";

  // Pasos: t va de 0 a 1. Los textos usan solo lo que dicen las fuentes; lo demás está marcado como posible.
  var STEPS = [
    { a: 0, b: 0.22, title: "1. Una fibra se suelta",
      text: "Una fibra de plástico se desprende. Puede venir de textiles sintéticos o de plásticos que se rompen en trozos pequeños." },
    { a: 0.22, b: 0.46, title: "2. Llega al agua",
      text: "Garcés-Ordóñez et al. (2022) hallaron más microplásticos cerca de las desembocaduras de los ríos y de zonas urbanas con mucha pesca y acuicultura." },
    { a: 0.46, b: 0.70, title: "3. Se queda en la ciénaga",
      text: "En la Ciénaga Grande hay microplásticos en el agua, en los sedimentos y en los peces (Garcés-Ordóñez et al., 2022)." },
    { a: 0.70, b: 0.88, title: "4. La lisa la ingiere",
      text: "Calderón et al. (2019): 10 de 46 lisas rayadas (21,7 %) tenían microplásticos en el tracto digestivo. El 89,5 % de las partículas eran fibras." },
    { a: 0.88, b: 1.0001, title: "Lo que sabemos y lo que falta",
      text: "Está demostrado que la lisa ingiere microplásticos. Si le hacen daño todavía no se sabe: faltan estudios en esta especie." }
  ];

  // Puntos del recorrido de la fibra (espacio 1280 × 720)
  var PTS = [[120, 262], [249, 199], [455, 322], [620, 430], [770, 500], [915, 440]];
  var STATIONS = [
    { i: 0, label: "Origen", dx: 0, dy: -74 },
    { i: 2, label: "Desembocadura", dx: -10, dy: -40 },
    { i: 3, label: "Ciénaga", dx: 0, dy: -30 },
    { i: 5, label: "Lisa rayada", dx: 95, dy: -118 }
  ];

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  function catmull(p0, p1, p2, p3, u) {
    var u2 = u * u, u3 = u2 * u;
    return [0, 1].map(function (k) {
      return 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3);
    });
  }
  function at(u) {
    var n = PTS.length - 1, s = clamp(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(s)), f = s - i;
    var g = function (j) { return PTS[clamp(j, 0, n)]; };
    return catmull(g(i - 1), g(i), g(i + 1), g(i + 2), f);
  }

  // Partículas de fondo (sembradas para que no cambien entre cuadros)
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var BITS = [];
  (function () {
    var i, r;
    for (i = 0; i < 110; i++) {
      r = rnd();
      BITS.push({ x: 480 + 740 * Math.pow(r, 1.7), y: 350 + rnd() * 280, a: rnd() * 6.28, l: 6 + rnd() * 6, ph: rnd() * 6.28 });
    }
    for (i = 0; i < 46; i++) BITS.push({ x: 450 + rnd() * 790, y: 668 + rnd() * 40, a: rnd() * 6.28, l: 6 + rnd() * 6, ph: rnd() * 6.28, bed: true });
  })();
  var BUBBLES = [];
  for (var b = 0; b < 16; b++) BUBBLES.push({ x: 500 + rnd() * 740, s: 0.03 + rnd() * 0.05, ph: rnd(), r: 2 + rnd() * 3 });

  function wave(ctx, cx, cy, ang, len, amp, phase, lw, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    var N = 24;
    for (var i = 0; i <= N; i++) {
      var s = (i / N - 0.5) * len;
      var y = Math.sin((i / N) * 6.2832 * 1.5 + phase) * amp;
      if (i === 0) ctx.moveTo(s, y); else ctx.lineTo(s, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  function drawScene(ctx, t, clock, opts) {
    opts = opts || {};
    t = clamp(t, 0, 1);

    // Agua
    if (opts.bg) {
      var iw = opts.bg.width, ih = opts.bg.height, sc = Math.max(W / iw, H / ih);
      ctx.drawImage(opts.bg, (W - iw * sc) / 2, (H - ih * sc) / 2, iw * sc, ih * sc);
    }
    var g = ctx.createLinearGradient(0, 0, 0, H);
    var alpha = opts.bg ? 0.84 : 1;
    g.addColorStop(0, "rgba(20,112,196," + alpha + ")");
    g.addColorStop(0.55, "rgba(11,74,145," + alpha + ")");
    g.addColorStop(1, "rgba(8,47,99," + alpha + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Tierra
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(640, 0); ctx.lineTo(600, 110); ctx.lineTo(520, 200); ctx.lineTo(470, 290);
    ctx.lineTo(430, 350); ctx.lineTo(330, 380); ctx.lineTo(200, 420); ctx.lineTo(0, 470); ctx.closePath();
    ctx.fillStyle = "#1f6f7a";
    ctx.fill();
    ctx.strokeStyle = "rgba(190,235,250,.45)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Río
    ctx.beginPath();
    ctx.moveTo(40, 130);
    ctx.bezierCurveTo(200, 130, 300, 250, 455, 322);
    ctx.strokeStyle = "#3aa6dc";
    ctx.lineWidth = 34;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.setLineDash([10, 26]);
    ctx.lineDashOffset = -clock * 26;
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);

    // Lecho
    ctx.beginPath();
    ctx.moveTo(430, H);
    for (var x = 430; x <= W; x += 20) ctx.lineTo(x, 662 + Math.sin(x / 90) * 8);
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = "rgba(10,46,92,.75)";
    ctx.fill();

    // Burbujas
    var i, bu;
    for (i = 0; i < BUBBLES.length; i++) {
      bu = BUBBLES[i];
      var by = H - ((clock * bu.s + bu.ph) % 1) * (H - 360) - 20;
      ctx.beginPath();
      ctx.arc(bu.x + Math.sin(clock + bu.ph * 9) * 6, by, bu.r, 0, 6.2832);
      ctx.strokeStyle = "rgba(220,240,255,.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Microplásticos del agua y el sedimento
    for (i = 0; i < BITS.length; i++) {
      var q = BITS[i];
      var dx = q.bed ? 0 : Math.sin(clock * 0.6 + q.ph) * 7;
      var dy = q.bed ? 0 : Math.cos(clock * 0.5 + q.ph) * 5;
      var appear = q.bed ? smooth((t - 0.44) / 0.1) : smooth((t - 0.16) / 0.12);
      if (appear <= 0) continue;
      wave(ctx, q.x + dx, q.y + dy, q.a, q.l, 1.6, q.ph + clock, 1.6, "rgba(207,234,252," + (0.6 * appear).toFixed(2) + ")");
    }

    // Tela con hilos sueltos
    ctx.save();
    ctx.translate(112, 268);
    ctx.rotate(-0.14);
    ctx.fillStyle = "#e9f2fb";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-46, -30, 92, 60, 8); else ctx.rect(-46, -30, 92, 60);
    ctx.fill();
    ctx.strokeStyle = "rgba(28,127,214,.5)";
    ctx.lineWidth = 3;
    for (i = -34; i <= 34; i += 17) {
      ctx.beginPath(); ctx.moveTo(i, -30); ctx.lineTo(i, 30); ctx.stroke();
    }
    ctx.restore();
    for (i = 0; i < 3; i++) wave(ctx, 168 + i * 4, 252 + i * 14, -0.3 + i * 0.3, 18, 2, clock * 3 + i, 2.2, "#ff6a45");

    // Recorrido hecho
    var u = smooth((t - 0.03) / 0.77);
    ctx.save();
    ctx.setLineDash([2, 9]);
    ctx.lineCap = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "rgba(255,106,69,.55)";
    ctx.beginPath();
    var steps = 70;
    for (i = 0; i <= steps; i++) {
      var pp = at((i / steps) * u);
      if (i === 0) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]);
    }
    ctx.stroke();
    ctx.restore();

    // Lisa rayada
    var approach = smooth((t - 0.45) / 0.35);
    var fx = 1075 - 65 * approach, fy = 440 + Math.sin(clock * 1.3) * 7;
    var s = 200 / 52;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(Math.sin(clock * 1.3 + 1) * 0.03);
    ctx.scale(s, s);
    ctx.translate(-26, -10);
    if (opts.fish) {
      ctx.fillStyle = "rgba(255,255,255,.96)";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 0.7;
      ctx.lineJoin = "round";
      ctx.fill(opts.fish);
      ctx.stroke(opts.fish);
    } else {
      ctx.beginPath(); ctx.ellipse(26, 10, 24, 7, 0, 0, 6.2832); ctx.fillStyle = "#fff"; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(5.6, 8.4, 0.75, 0, 6.2832); ctx.fillStyle = "#0a2e5c"; ctx.fill();
    var inside = smooth((t - 0.8) / 0.08);
    if (inside > 0 && root.Path2D) {
      ctx.globalAlpha = inside;
      ctx.strokeStyle = "#ff6a45";
      ctx.lineWidth = 1.3;
      ctx.lineCap = "round";
      ctx.stroke(new Path2D(FIBER_IN_FISH_D));
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // La fibra
    var mouth = [fx - 25.5 * s, fy - 0.2 * s];
    var travelEnd = 0.8;
    if (t < travelEnd + 0.02) {
      var p = at(u), p2 = at(Math.min(1, u + 0.01)), p1 = at(Math.max(0, u - 0.01));
      var ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      if (u >= 0.999) p = [mouth[0], mouth[1]];
      var fade = 1 - smooth((t - 0.78) / 0.04);
      ctx.save();
      ctx.shadowColor = "rgba(255,106,69,.9)";
      ctx.shadowBlur = 14;
      ctx.globalAlpha = fade;
      wave(ctx, p[0], p[1], ang, 38, 5, clock * 4, 4, "#ff6a45");
      ctx.restore();
    }

    // Estaciones
    ctx.font = "600 22px 'Bricolage Grotesque', 'Liberation Sans', 'DejaVu Sans', sans-serif";
    ctx.textAlign = "center";
    for (i = 0; i < STATIONS.length; i++) {
      var st = STATIONS[i];
      var sp = st.i === 5 ? [fx - 25 * s, fy] : PTS[st.i];
      var reached = u >= st.i / (PTS.length - 1) - 0.001;
      ctx.beginPath();
      ctx.arc(sp[0], sp[1], 8, 0, 6.2832);
      ctx.fillStyle = reached ? "#ff6a45" : "rgba(255,255,255,.25)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      var lx = sp[0] + st.dx, ly = sp[1] + st.dy;
      ctx.fillStyle = "rgba(5,34,80,.62)";
      var tw = ctx.measureText(st.label).width + 24;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx - tw / 2, ly - 22, tw, 34, 17); else ctx.rect(lx - tw / 2, ly - 22, tw, 34);
      ctx.fill();
      ctx.fillStyle = "#eaf6ff";
      ctx.fillText(st.label, lx, ly + 2);
    }
    ctx.textAlign = "left";
  }

  function stepAt(t) {
    for (var i = 0; i < STEPS.length; i++) if (t < STEPS[i].b) return i;
    return STEPS.length - 1;
  }

  root.Recorrido = { W: W, H: H, STEPS: STEPS, draw: drawScene, stepAt: stepAt };
})(window);
