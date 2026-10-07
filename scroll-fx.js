/* =========================================================
   SCROLL FX — Webflow-style scroll interactions
   ---------------------------------------------------------
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
     1. SPLIT HEADINGS
     - Wraps each word in a mask so it can slide up into view
     - Plays when the parent .reveal gets .show
  ========================================================= */
  const splitTargets = document.querySelectorAll(".section-heading h2, .skills-left h2, .contact-intro h2");

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

  // Lazy images and web fonts change heights after load.
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
