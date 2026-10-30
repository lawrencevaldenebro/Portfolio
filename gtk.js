/* =========================================================
   GET TO KNOW ME — reel, 3D prism, morph
   ---------------------------------------------------------
   1. REEL: plays only while on screen, tilts toward the pointer
   2. PRISM: auto-spins, drag/swipe to spin with inertia
   3. MORPH: frozen for reduced motion
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* =========================================================
     1. REEL
  ========================================================= */
  const reel = document.getElementById("gtkReel");

  if (reel) {
    const video = reel.querySelector("video");
    const toggle = reel.querySelector(".gtk-reel-toggle");
    const frame = reel.querySelector(".gtk-reel-frame");
    let userPaused = reduceMotion; // reduced motion: start paused, visitor presses play
    let inView = false;

    function sync() {
      const shouldPlay = inView && !userPaused && !document.hidden;
      if (shouldPlay && video.paused) video.play().catch(() => {});
      if (!shouldPlay && !video.paused) video.pause();
      toggle.innerHTML = shouldPlay ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
      toggle.setAttribute("aria-label", shouldPlay ? "Pause video" : "Play video");
      reel.classList.toggle("is-paused", !shouldPlay);
    }

    new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.35 }
    ).observe(reel);

    document.addEventListener("visibilitychange", sync);

    function togglePlay() {
      userPaused = !userPaused;
      sync();
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    });
    video.addEventListener("click", togglePlay);

    // 3D tilt toward the pointer
    if (finePointer && !reduceMotion) {
      reel.addEventListener("pointermove", (e) => {
        const r = reel.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.setProperty("--ry", `${x * 14}deg`);
        frame.style.setProperty("--rx", `${-y * 10}deg`);
        frame.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
        frame.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
      });

      reel.addEventListener("pointerleave", () => {
        frame.style.setProperty("--ry", "0deg");
        frame.style.setProperty("--rx", "0deg");
      });
    }
  }

  /* =========================================================
     2. PRISM
  ========================================================= */
  const scene = document.getElementById("gtkPrism");

  if (scene) {
    const prism = scene.querySelector(".gtk-prism");
    const autoSpeed = reduceMotion ? 0 : 0.18; // deg per 60fps frame
    let angle = -20;
    let tilt = -8;
    let velocity = autoSpeed;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let inView = false;
    let raf = null;
    let last = 0;

    function render() {
      prism.style.transform = `rotateX(${tilt}deg) rotateY(${angle}deg)`;
    }

    function tick(now) {
      // Scale by elapsed frames so 60Hz and 120Hz screens spin at the same speed
      const dt = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      if (!dragging) {
        // Ease any fling back toward the idle spin
        velocity += (autoSpeed - velocity) * 0.04 * dt;
        angle += velocity * dt;
        tilt += (-8 - tilt) * 0.05 * dt;
      }
      render();
      raf = inView ? requestAnimationFrame(tick) : null;
    }

    function start() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    }

    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
    }).observe(scene);

    scene.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocity = 0;
      scene.setPointerCapture(e.pointerId);
      scene.classList.add("is-dragging");
    });

    scene.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velocity = dx * 0.35;
      angle += velocity;
      tilt = Math.max(-30, Math.min(20, tilt - dy * 0.2));
      render();
    });

    function release() {
      dragging = false;
      scene.classList.remove("is-dragging");
      start();
    }

    scene.addEventListener("pointerup", release);
    scene.addEventListener("pointercancel", release);

    // Keyboard: arrows nudge the prism one face
    scene.tabIndex = 0;
    scene.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      angle += e.key === "ArrowLeft" ? -60 : 60;
      render();
      start();
    });

    render();
  }

  /* =========================================================
     3. MORPH
  ========================================================= */
  if (reduceMotion) {
    document.querySelectorAll("svg.gtk-morph").forEach((svg) => svg.pauseAnimations?.());
  }
});
