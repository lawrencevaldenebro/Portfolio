/* =========================================================
   CURSOR FOLLOWER
   ---------------------------------------------------------
   A dot that tracks the pointer and a ring that trails it.
   The ring grows over links/buttons and shows a label over
   anything with data-cursor ("Drag", "Throw", "View", ...).
   The native cursor stays visible. Mouse/trackpad only;
   skipped for touch and reduced motion.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reduceMotion) return;

  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  ring.innerHTML = '<span class="cursor-label"></span>';
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.append(dot, ring);

  const label = ring.firstElementChild;
  const pos = { x: -100, y: -100 };
  const trail = { x: -100, y: -100 };
  let raf = null;

  function tick() {
    trail.x += (pos.x - trail.x) * 0.2;
    trail.y += (pos.y - trail.y) * 0.2;
    ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
    // Stop when the ring has caught up; the next move restarts it
    raf = Math.abs(pos.x - trail.x) + Math.abs(pos.y - trail.y) > 0.3 ? requestAnimationFrame(tick) : null;
  }

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    pos.x = e.clientX;
    pos.y = e.clientY;
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    document.documentElement.classList.add("has-cursor");
    if (!raf) raf = requestAnimationFrame(tick);

    // Label zones win over plain hover targets
    const zone = e.target.closest?.("[data-cursor]");
    const text = zone ? zone.dataset.cursor : "";
    if (label.textContent !== text) label.textContent = text;
    ring.classList.toggle("is-label", !!text);
    ring.classList.toggle("is-hover", !text && !!e.target.closest?.("a, button, input, textarea, select, label, [data-tilt]"));
  }, { passive: true });

  document.addEventListener("pointerdown", () => ring.classList.add("is-down"));
  document.addEventListener("pointerup", () => ring.classList.remove("is-down"));
  document.documentElement.addEventListener("pointerleave", () => {
    document.documentElement.classList.remove("has-cursor");
  });
});
