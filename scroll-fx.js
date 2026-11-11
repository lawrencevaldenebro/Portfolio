/* =========================================================
   SCROLL FX — scroll-driven motion
   ---------------------------------------------------------
   1. SPLIT HEADINGS (word-by-word rise, CSS driven)
   2. STAGGERED SERVICE CARDS
   3. HERO (headline fit, kinetic word, pointer depth, ticker)
   4. LENIS SMOOTH SCROLL
   5. GSAP SCROLL SCENES
   ---------------------------------------------------------
   Everything degrades gracefully: if the CDN libraries fail
   to load, or the visitor prefers reduced motion, content is
   still fully visible and the page scrolls natively.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Runs cb once <html> carries the given class (set by the inline head script).
  function onRootClass(name, cb) {
    if (root.classList.contains(name)) {
      cb();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!root.classList.contains(name)) return;
      observer.disconnect();
      cb();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  /* =========================================================
     1. SPLIT HEADINGS
     - Wraps each word in a mask so it can slide up into view
     - Keeps <em> highlights (gradient words)
     - Plays when the parent .reveal gets .show
  ========================================================= */
  const splitTargets = document.querySelectorAll(".section-heading h2, .skills-left h2, .contact-intro h2");

  splitTargets.forEach((heading) => {
    const label = heading.textContent.trim().replace(/\s+/g, " ");
    if (!label) return;

    let index = 0;
    const parts = [];

    heading.childNodes.forEach((node) => {
      const isEm = node.nodeType === 1 && node.tagName === "EM";
      node.textContent
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => {
          parts.push(
            `<span class="w" aria-hidden="true"><span${isEm ? ' class="is-em"' : ""} style="--i:${index}">${escapeHtml(word)}</span></span>`
          );
          index += 1;
        });
    });

    heading.setAttribute("aria-label", label);
    heading.classList.add("split-line");
    heading.innerHTML = parts.join(" ");

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
     3. HERO
  ========================================================= */
  const hero = document.getElementById("home");
  const headline = document.querySelector(".kinetic-h1");
  const kinetic = document.getElementById("kineticWord");
  const kineticWords = kinetic ? (kinetic.dataset.words || "").split("|").filter(Boolean) : [];

  /* ---------- Headline fit ----------
     The rotating word must never be wider than its column, so the
     whole headline scales down a touch when the longest word needs it. */
  function fitHeadline() {
    if (!headline || !kineticWords.length) return;

    headline.style.setProperty("--fit", "1");

    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;pointer-events:none";
    headline.appendChild(probe);

    let widest = 0;
    kineticWords.forEach((word) => {
      probe.textContent = word;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    });
    probe.remove();

    const room = headline.clientWidth;
    if (widest > 0 && room > 0 && widest > room) {
      headline.style.setProperty("--fit", (Math.floor((room / widest) * 1000) / 1000).toFixed(3));
    }
  }

  fitHeadline();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeadline);

  let fitTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitHeadline, 120);
  });

  /* ---------- Kinetic word ----------
     Cycles data-words; letters flip out, the next word's letters
     flip in one after another. Starts once the entrance has played. */
  if (kinetic && kineticWords.length > 1 && !reduceMotion) {
    let wordIndex = 0;

    const setWord = (word, state) => {
      kinetic.innerHTML = Array.from(word)
        .map((ch, i) => `<span class="kc ${state}" style="--c:${i}">${ch === " " ? "&nbsp;" : escapeHtml(ch)}</span>`)
        .join("");
    };

    setWord(kineticWords[0], "in");

    onRootClass("hero-ready", () => {
      setInterval(() => {
        if (document.hidden) return;

        // Flip current letters out
        kinetic.querySelectorAll(".kc").forEach((c) => c.classList.replace("in", "out"));

        setTimeout(() => {
          wordIndex = (wordIndex + 1) % kineticWords.length;
          setWord(kineticWords[wordIndex], "pre");
          void kinetic.offsetWidth; // let "pre" paint before animating in
          kinetic.querySelectorAll(".kc").forEach((c) => c.classList.replace("pre", "in"));
        }, 520);
      }, 2800);
    });
  }

  /* ---------- Pointer depth ----------
     The photo stage leans toward the cursor; chips, frames and the
     seal drift at different depths (driven by --px / --py). */
  const heroStage = document.getElementById("heroStage");

  if (hero && heroStage && finePointer && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let depthRaf = null;

    const stepDepth = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      heroStage.style.setProperty("--px", currentX.toFixed(4));
      heroStage.style.setProperty("--py", currentY.toFixed(4));

      const settled = Math.abs(targetX - currentX) < 0.002 && Math.abs(targetY - currentY) < 0.002;
      depthRaf = settled ? null : requestAnimationFrame(stepDepth);
    };

    const aim = (x, y) => {
      targetX = x;
      targetY = y;
      if (!depthRaf) depthRaf = requestAnimationFrame(stepDepth);
    };

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      aim(
        Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)),
        Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2))
      );
    });

    hero.addEventListener("pointerleave", () => aim(0, 0));
  }

  /* ---------- Services ticker ----------
     Items are doubled so the CSS loop is seamless. */
  const ticker = document.getElementById("heroTicker");

  if (ticker) {
    ticker.innerHTML += ticker.innerHTML;
    if (!reduceMotion) ticker.classList.add("is-looped");
  }

  /* =========================================================
     4. LENIS SMOOTH SCROLL
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

    // Smooth in-page anchor links, offset for the floating header.
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href");
      if (id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: id === "#home" ? 0 : -84 });
    });

    // The ticker leans into the scroll: it speeds up while the page is moving.
    if (ticker && typeof ticker.getAnimations === "function") {
      let rate = 1;
      let targetRate = 1;
      let tickerAnimation = null;

      lenis.on("scroll", (instance) => {
        const velocity = Math.abs(instance.velocity || 0);
        targetRate = 1 + Math.min(6, velocity * 0.18);
      });

      const easeRate = () => {
        if (!tickerAnimation) tickerAnimation = ticker.getAnimations()[0] || null;
        targetRate += (1 - targetRate) * 0.06;
        rate += (targetRate - rate) * 0.12;
        if (tickerAnimation && Math.abs(tickerAnimation.playbackRate - rate) > 0.01) {
          tickerAnimation.playbackRate = rate;
        }
        requestAnimationFrame(easeRate);
      };
      requestAnimationFrame(easeRate);
    }
  }

  /* =========================================================
     5. GSAP SCROLL SCENES
  ========================================================= */
  if (!hasGsap || reduceMotion) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const media = gsap.matchMedia();

  /* ---------- Hero: copy and photo part ways as you scroll off ---------- */
  media.add("(min-width: 861px)", () => {
    if (!hero) return;

    const heroOut = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    heroOut
      .to(".hero-copy", { y: -110, opacity: 0, duration: 1 }, 0)
      .to(".hero-visual", { y: 70, scale: 0.93, duration: 1 }, 0)
      .to(".hero-visual", { opacity: 0, duration: 0.5 }, 0.5)
      .to(".hero-ticker", { opacity: 0, duration: 0.6 }, 0.1);
  });

  /* ---------- About: words light up as you read down ---------- */
  const scrubText = document.querySelector("#about .section-heading p");

  if (scrubText) {
    scrubText.innerHTML = scrubText.textContent
      .trim()
      .split(/\s+/)
      .map((word) => `<span class="scrub-word">${escapeHtml(word)}</span>`)
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
