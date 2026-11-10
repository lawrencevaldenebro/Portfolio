/* =========================================================
   SCROLL FX — Webflow-style scroll interactions
   ---------------------------------------------------------
   0. HERO ENTRANCE
   1. SPLIT HEADINGS (word-by-word rise, CSS driven)
   2. STAGGERED SERVICE CARDS
   3. LENIS SMOOTH SCROLL
   4. GSAP SCROLL SCENES (hero scroll-out, scrubbed text)
   ---------------------------------------------------------
   Everything degrades gracefully: if the CDN libraries fail
   to load, or the visitor prefers reduced motion, content is
   still fully visible and the page scrolls natively.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* =========================================================
     0. HERO ENTRANCE
     - Waits for the samurai intro, then staggers the hero in
       (CSS) and tells hero-3d.js to fly its scene in
  ========================================================= */
  function enterHero() {
    if (window.__heroEntered) return;
    window.__heroEntered = true;
    document.documentElement.classList.add("hero-in");
    document.dispatchEvent(new CustomEvent("hero:enter"));
  }

  if (window.SamuraiIntro && window.SamuraiIntro.isPlaying()) {
    document.addEventListener("intro:done", () => setTimeout(enterHero, 150), { once: true });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(enterHero));
  }

  /* =========================================================
     1. SPLIT HEADINGS
     - Wraps each word in a mask so it can slide up into view
     - Plays when the parent .reveal gets .show
  ========================================================= */
  const splitTargets = document.querySelectorAll(".section-heading h2:not(.gtk-title), .skills-left h2, .contact-intro h2");

  splitTargets.forEach((heading) => {
    const text = heading.textContent.trim().replace(/\s+/g, " ");
    if (!text) return;

    heading.setAttribute("aria-label", text);
    heading.classList.add("split-line");
    heading.innerHTML = text
      .split(" ")
      .map((word, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${word}</span></span>`)
      .join(" ");

    const wrap = heading.closest(".section-heading");
    if (wrap && wrap.classList.contains("reveal")) wrap.classList.add("has-split");
  });

  /* =========================================================
     2. STAGGERED SERVICE CARDS
     - Cards in the same row cascade in left to right
  ========================================================= */
  const servicesGrid = document.getElementById("servicesGrid");

  function restagger() {
    if (!servicesGrid) return;
    const cols = window.innerWidth > 1180 ? 4 : 2;

    servicesGrid.querySelectorAll(".service-card").forEach((card, i) => {
      card.style.setProperty("--stagger", i % cols);
    });
  }

  restagger();
  window.addEventListener("resize", restagger);

  /* =========================================================
     2b. KINETIC WORDS (hero headline, Get to Know heading)
     - Cycles data-words; letters flip out, the next word's
       letters flip in one after another
  ========================================================= */
  if (!reduceMotion) {
    document.querySelectorAll(".kinetic-word[data-words]").forEach((el) => {
      const words = (el.dataset.words || "").split("|").filter(Boolean);
      let wordIndex = 0;

      function setWord(word, state) {
        el.innerHTML = Array.from(word)
          .map((ch, i) => `<span class="kc ${state}" style="--c:${i}">${ch === " " ? "&nbsp;" : ch}</span>`)
          .join("");
      }

      setWord(words[0], "in");

      setInterval(() => {
        // Flip current letters out
        el.querySelectorAll(".kc").forEach((c) => c.classList.replace("in", "out"));

        setTimeout(() => {
          wordIndex = (wordIndex + 1) % words.length;
          setWord(words[wordIndex], "pre");
          void el.offsetWidth; // let "pre" paint before animating in
          el.querySelectorAll(".kc").forEach((c) => c.classList.replace("pre", "in"));
        }, 520);
      }, 2800);
    });
  }

  /* =========================================================
     3. LENIS SMOOTH SCROLL
     - Desktop only (touch devices keep native momentum)
     - Pauses while the intro or contact modal is open
  ========================================================= */
  let lenis = null;

  if (typeof window.Lenis !== "undefined" && finePointer && !reduceMotion) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    document.documentElement.classList.add("has-lenis");

    let lenisStopped = false;

    function syncLenisLock() {
      const locked =
        document.body.classList.contains("modal-open") ||
        document.documentElement.style.overflow === "hidden";

      if (locked && !lenisStopped) {
        lenis.stop();
        lenisStopped = true;
      } else if (!locked && lenisStopped) {
        lenis.start();
        lenisStopped = false;
      }
    }

    if (hasGsap) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        syncLenisLock();
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        syncLenisLock();
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // Smooth in-page anchor links, offset for the sticky header.
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href");
      if (id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: id === "#home" ? 0 : -90 });
    });
  }

  /* =========================================================
     3b. POINTER TILT ([data-tilt]: portrait, skill cards, work)
     - Element leans toward the pointer; CSS reads --rx/--ry
       for the rotation and --gx/--gy for the glare
  ========================================================= */
  // Delegated, so cards that work.js renders later are covered too
  if (finePointer && !reduceMotion) {
    let tiltEl = null;

    const resetTilt = (el) => {
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };

    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.("[data-tilt]") || null;
      if (tiltEl && tiltEl !== el) resetTilt(tiltEl);
      tiltEl = el;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${x * 12}deg`);
      el.style.setProperty("--rx", `${-y * 10}deg`);
      el.style.setProperty("--px", x.toFixed(3)); // -0.5 → 0.5, for image parallax
      el.style.setProperty("--py", y.toFixed(3));
      el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => {
      if (tiltEl) resetTilt(tiltEl);
      tiltEl = null;
    });
  }

  /* =========================================================
     3c. SKILLS ICON SPHERE
     - Icons sit on a Fibonacci sphere that slowly turns;
       the pointer steers it, depth sets size and fade
  ========================================================= */
  const sphere = document.getElementById("skillsSphere");

  if (sphere) {
    const icons = Array.from(sphere.querySelectorAll(".sphere-icon"));
    const n = icons.length;
    const points = icons.map((_, i) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    });
    let rotX = -0.3;
    let rotY = 0;
    let velX = 0.0012;
    let velY = 0.004;
    let raf = null;

    function place() {
      const radius = sphere.clientWidth * 0.42;
      const cx = Math.cos(rotX), sx = Math.sin(rotX), cy = Math.cos(rotY), sy = Math.sin(rotY);

      points.forEach(([x, y, z], i) => {
        // Rotate around Y, then X
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back → 1 front
        const icon = icons[i];
        icon.style.transform = `translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${0.6 + depth * 0.55})`;
        icon.style.opacity = (0.25 + depth * 0.75).toFixed(2);
        icon.style.zIndex = Math.round(depth * 100);
      });
    }

    function tick() {
      rotX += velX;
      rotY += velY;
      place();
      raf = requestAnimationFrame(tick);
    }

    place();

    if (!reduceMotion) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !raf) raf = requestAnimationFrame(tick);
        if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }).observe(sphere);

      if (finePointer) {
        const skills = sphere.closest("#skills");
        skills.addEventListener("pointermove", (e) => {
          const r = sphere.getBoundingClientRect();
          velY = ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 0.03;
          velX = (-(e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 0.02;
        });
        skills.addEventListener("pointerleave", () => {
          velX = 0.0012;
          velY = 0.004;
        });
      }
    }
  }

  /* =========================================================
     4. GSAP SCROLL SCENES
  ========================================================= */
  if (!hasGsap || reduceMotion) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Hero: shrinks and fades as you scroll away ---------- */
  const heroShell = document.querySelector(".hero-shell");

  if (heroShell) {
    gsap.to(heroShell, {
      scale: 0.93,
      opacity: 0.25,
      y: 80,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* ---------- About: photo drifts inside its frame, diagram floats up ---------- */
  const aboutPhoto = document.querySelector("#about .about-photo");

  if (aboutPhoto) {
    gsap.fromTo(
      aboutPhoto,
      { yPercent: -10 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  }

  const aboutDiagram = document.querySelector("#about .about-visual img");

  if (aboutDiagram) {
    gsap.fromTo(
      aboutDiagram,
      { y: 40, scale: 0.94 },
      {
        y: -20,
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: "#about .about-visual", start: "top bottom", end: "bottom 30%", scrub: true }
      }
    );
  }

  /* ---------- About: words light up as you read down ---------- */
  const scrubText = document.querySelector("#about .section-heading p");

  if (scrubText) {
    scrubText.innerHTML = scrubText.textContent
      .trim()
      .split(/\s+/)
      .map((word) => `<span class="scrub-word">${word}</span>`)
      .join(" ");

    gsap.fromTo(
      scrubText.querySelectorAll(".scrub-word"),
      { opacity: 0.18 },
      {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: scrubText,
          start: "top 85%",
          end: "bottom 45%",
          scrub: true
        }
      }
    );
  }

  /* ---------- How it works: line draws + nodes pop, tied to scroll ---------- */
  const infographic = document.querySelector(".infographic");

  if (infographic) {
    // Hands control from the one-shot CSS reveal to the scrubbed timeline.
    infographic.classList.add("is-scrubbed");

    const flow = gsap.timeline({
      scrollTrigger: {
        trigger: infographic,
        start: "top 85%",
        end: "bottom 50%",
        scrub: 0.6
      }
    });

    flow.fromTo(infographic, { "--line": 0 }, { "--line": 1, ease: "none", duration: 1 }, 0);

    infographic.querySelectorAll(".info-node").forEach((node, i) => {
      flow.fromTo(
        node,
        { opacity: 0, y: 40, scale: 0.7 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.7)" },
        i * 0.19
      );
    });
  }

  // Lazy images and web fonts change heights after load.
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
