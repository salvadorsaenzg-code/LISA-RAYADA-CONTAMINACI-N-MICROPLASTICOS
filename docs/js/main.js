// Cuadrícula de 46 peces: uno por cada Mugil incilis analizada (Calderón et al., 2019).
// 10 tienen microplásticos en el tracto digestivo. La posición es ilustrativa.
(function () {
  var TOTAL = 46;
  var POSITIVES = [3, 8, 14, 19, 22, 27, 31, 36, 40, 44];
  var NS = "http://www.w3.org/2000/svg";

  var grid = document.getElementById("school");
  if (!grid) return;

  var noscript = grid.querySelector("noscript");
  if (noscript) noscript.remove();

  var order = 0;
  for (var i = 0; i < TOTAL; i++) {
    var positive = POSITIVES.indexOf(i) !== -1;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "-1 -1 54 21.9");
    svg.setAttribute("class", "fish" + (positive ? " has-fiber" : ""));
    svg.setAttribute("aria-hidden", "true");

    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#fish");
    svg.appendChild(use);

    if (positive) {
      var fiber = document.createElementNS(NS, "path");
      fiber.setAttribute("class", "fiber");
      fiber.setAttribute("d", "M14 9.8q2.7-3.4 5.4 0t5.4 0t5.4 0");
      fiber.setAttribute("pathLength", "1");
      fiber.style.setProperty("--n", order++);
      svg.appendChild(fiber);
    }
    grid.appendChild(svg);
  }

  // Un solo momento animado: las fibras se dibujan una vez al cargar.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var container = grid.closest(".school");
  if (reduce) {
    container.classList.add("no-motion");
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { container.classList.add("is-drawn"); });
    });
  }
})();
