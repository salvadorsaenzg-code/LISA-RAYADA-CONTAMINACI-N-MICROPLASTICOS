// Juego 2: "Pesca una muestra".
// Supuesto del simulador: la proporción verdadera de lisas con microplásticos es 10/46 (21,7 %),
// el valor que encontraron Calderón et al. (2019) en su muestra. Es un supuesto, no un dato de la ciénaga.
(function () {
  "use strict";

  var root = document.getElementById("muestreo");
  if (!root) return;

  var P = 10 / 46;
  var NS = "http://www.w3.org/2000/svg";
  var grid = document.getElementById("m-fish");
  var bar = document.getElementById("m-bar");
  var readout = document.getElementById("m-readout");
  var summary = document.getElementById("m-summary");
  var plot = document.getElementById("m-plot");
  var chips = root.querySelectorAll(".chip");

  var n = 46;
  var history = [];
  var MAX_HISTORY = 400;

  function fmt(x) { return (x * 100).toFixed(1).replace(".", ",") + " %"; }

  function wilson(k, size) {
    var z = 1.96, p = k / size;
    var denom = 1 + (z * z) / size;
    var center = (p + (z * z) / (2 * size)) / denom;
    var half = (z * Math.sqrt((p * (1 - p)) / size + (z * z) / (4 * size * size))) / denom;
    return [Math.max(0, center - half), Math.min(1, center + half)];
  }

  function takeSample() {
    var flags = [], k = 0;
    for (var i = 0; i < n; i++) {
      var yes = Math.random() < P;
      flags.push(yes);
      if (yes) k++;
    }
    var ci = wilson(k, n);
    var s = { k: k, p: k / n, lo: ci[0], hi: ci[1], flags: flags };
    history.push(s);
    if (history.length > MAX_HISTORY) history.shift();
    return s;
  }

  function makeFish(positive, order) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "-1 -1 54 21.9");
    svg.setAttribute("class", "fish" + (positive ? " has-fiber" : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#fish");
    svg.appendChild(use);
    if (positive) {
      var f = document.createElementNS(NS, "path");
      f.setAttribute("class", "fiber");
      f.setAttribute("d", "M14 9.8q2.7-3.4 5.4 0t5.4 0t5.4 0");
      f.setAttribute("pathLength", "1");
      f.style.setProperty("--n", Math.min(order, 12) * 0.35);
      svg.appendChild(f);
    }
    return svg;
  }

  function renderFish(s) {
    grid.innerHTML = "";
    if (n > 100) { grid.hidden = true; return; }
    grid.hidden = false;
    grid.classList.remove("is-drawn");
    var order = 0;
    for (var i = 0; i < s.flags.length; i++) {
      grid.appendChild(makeFish(s.flags[i], s.flags[i] ? order++ : 0));
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { grid.classList.add("is-drawn"); });
    });
  }

  function percentile(sorted, q) {
    var idx = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
    return sorted[idx];
  }

  function renderText(s) {
    bar.firstElementChild.style.width = (s.p * 100).toFixed(1) + "%";
    readout.textContent =
      "Última muestra: " + s.k + " de " + n + " lisas con microplásticos (" + fmt(s.p) + "). " +
      "Intervalo de confianza del 95 %: de " + fmt(s.lo) + " a " + fmt(s.hi) + ".";

    if (history.length >= 20) {
      var ps = history.map(function (h) { return h.p; }).sort(function (a, b) { return a - b; });
      var inside = history.filter(function (h) { return h.lo <= P && P <= h.hi; }).length;
      summary.textContent =
        "Con " + history.length + " muestras de " + n + " lisas, el 90 % central quedó entre " +
        fmt(percentile(ps, 0.05)) + " y " + fmt(percentile(ps, 0.95)) + ". " +
        inside + " de " + history.length + " intervalos incluyeron el 21,7 %.";
    } else {
      summary.textContent = "Pesca al menos 20 muestras para ver cuánto cambian los resultados.";
    }
  }

  function drawPlot() {
    var w = Math.max(280, plot.clientWidth || 600), h = 230;
    plot.setAttribute("viewBox", "0 0 " + w + " " + h);
    var x0 = 16, x1 = w - 16, base = h - 46, top = 28, range = 0.6, bins = 60;
    var px = function (p) { return x0 + (Math.min(p, range) / range) * (x1 - x0); };
    var out = "";

    // Eje y marcas de porcentaje
    out += '<line x1="' + x0 + '" y1="' + base + '" x2="' + x1 + '" y2="' + base + '" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>';
    for (var t = 0; t <= 60; t += 10) {
      var tx = px(t / 100);
      out += '<line x1="' + tx + '" y1="' + base + '" x2="' + tx + '" y2="' + (base + 6) + '" stroke="rgba(255,255,255,.55)"/>';
      out += '<text x="' + tx + '" y="' + (base + 22) + '" fill="#dff0fc" font-size="13" text-anchor="middle">' + t + ' %</text>';
    }
    out += '<text x="' + (w / 2) + '" y="' + (h - 4) + '" fill="#bfe3ff" font-size="13" text-anchor="middle">Porcentaje de lisas con microplásticos en cada muestra</text>';

    // Puntos apilados por intervalos de 1 %
    var counts = new Array(bins).fill(0);
    var stacks = history.map(function (s) {
      var b = Math.min(bins - 1, Math.floor(s.p / 0.01));
      return { b: b, i: counts[b]++ };
    });
    var maxStack = Math.max.apply(null, counts.concat([1]));
    var binW = (x1 - x0) / bins;
    var d = Math.min(binW * 0.92, (base - top - 6) / maxStack, 12);
    for (var j = 0; j < history.length; j++) {
      var cx = x0 + (stacks[j].b + 0.5) * binW;
      var cy = base - 2 - d * (stacks[j].i + 0.5);
      var isLast = j === history.length - 1;
      out += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (d / 2).toFixed(1) +
             '" fill="' + (isLast ? "#ff6a45" : "#dff0fc") + '" fill-opacity="' + (isLast ? 1 : 0.85) + '"/>';
    }

    // Línea del supuesto (21,7 %)
    var rx = px(P);
    out += '<line x1="' + rx + '" y1="' + (top - 6) + '" x2="' + rx + '" y2="' + base + '" stroke="#6cc9ee" stroke-width="2" stroke-dasharray="5 4"/>';
    out += '<text x="' + rx + '" y="' + (top - 12) + '" fill="#6cc9ee" font-size="13" font-weight="700" text-anchor="middle">21,7 % supuesto</text>';

    plot.innerHTML = out;
    plot.setAttribute("aria-label", history.length
      ? "Gráfico de puntos con " + history.length + " muestras simuladas de " + n + " lisas."
      : "Gráfico de puntos vacío. Pesca una muestra para empezar.");
  }

  function sample(times) {
    var s;
    for (var i = 0; i < times; i++) s = takeSample();
    renderFish(s);
    renderText(s);
    drawPlot();
  }

  function reset() {
    history = [];
    grid.innerHTML = "";
    bar.firstElementChild.style.width = "0%";
    readout.textContent = "Pulsa «Pescar una muestra» para empezar.";
    summary.textContent = "";
    drawPlot();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      n = parseInt(chip.getAttribute("data-n"), 10);
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      reset();
    });
  });
  document.getElementById("m-one").addEventListener("click", function () { sample(1); });
  document.getElementById("m-many").addEventListener("click", function () { sample(20); });
  document.getElementById("m-reset").addEventListener("click", reset);

  if (window.ResizeObserver) new ResizeObserver(drawPlot).observe(plot);
  else window.addEventListener("resize", drawPlot);
  reset();
})();
