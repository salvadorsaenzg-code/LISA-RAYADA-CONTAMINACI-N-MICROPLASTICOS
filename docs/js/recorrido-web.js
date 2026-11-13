// Conecta el esquema «Recorrido de una fibra» con el scroll y con el control deslizante.
(function () {
  "use strict";
  var section = document.getElementById("recorrido");
  if (!section || !window.Recorrido) return;

  var canvas = document.getElementById("j-canvas");
  var ctx = canvas.getContext("2d");
  var range = document.getElementById("j-range");
  var title = document.getElementById("j-title");
  var text = document.getElementById("j-text");
  var pathEl = document.querySelector("#fish path");
  var fish = pathEl && window.Path2D ? new Path2D(pathEl.getAttribute("d")) : null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var t = 0, shown = -1, visible = false, raf = 0;

  function resize() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.width * dpr * 9 / 16);
    draw();
  }

  function draw(clock) {
    var k = canvas.width / Recorrido.W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    Recorrido.draw(ctx, t, clock || 0, { fish: fish });
    var i = Recorrido.stepAt(t);
    if (i !== shown) {
      shown = i;
      title.textContent = Recorrido.STEPS[i].title;
      text.textContent = Recorrido.STEPS[i].text;
    }
  }

  function setT(v, fromScroll) {
    t = Math.max(0, Math.min(1, v));
    if (fromScroll || document.activeElement !== range) range.value = Math.round(t * 1000);
    if (reduce) draw(0);
  }

  function fromScroll() {
    var r = section.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    if (span <= 0) return;
    setT(-r.top / span, true);
  }

  function loop(ms) {
    if (!visible) { raf = 0; return; }
    draw(ms / 1000);
    raf = requestAnimationFrame(loop);
  }

  range.addEventListener("input", function () { setT(range.value / 1000); });

  if (reduce) {
    section.classList.add("is-static");
  } else {
    window.addEventListener("scroll", fromScroll, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      }).observe(section);
    } else {
      visible = true; raf = requestAnimationFrame(loop);
    }
  }

  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  resize();
  if (!reduce) fromScroll();
})();
