/* =========================================================
   SCROLL FX — scroll-driven motion
   ---------------------------------------------------------
   1. SPLIT HEADINGS (word-by-word rise, CSS driven)
   2. LIVE COUNTS
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
  const splitTargets = document.querySelectorAll(".section-heading h2");

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
     2. LIVE COUNTS
     - The About numbers are counted from the page itself, so they
       can't drift from what is actually listed
  ========================================================= */
  document.querySelectorAll("[data-count-from]").forEach((el) => {
    const total = document.querySelectorAll(el.dataset.countFrom).length;
    if (total) el.textContent = String(total);
  });

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

    // Marquees lean into the scroll: they speed up while the page is moving.
    const loopTracks = Array.from(document.querySelectorAll(".ticker-track.is-looped, .stack-track.is-looped"));

    if (loopTracks.length && typeof loopTracks[0].getAnimations === "function") {
      let rate = 1;
      let targetRate = 1;
      let loopAnimations = null;

      lenis.on("scroll", (instance) => {
        const velocity = Math.abs(instance.velocity || 0);
        targetRate = 1 + Math.min(6, velocity * 0.18);
      });

      const easeRate = () => {
        if (!loopAnimations) {
          loopAnimations = loopTracks.map((track) => track.getAnimations()[0]).filter(Boolean);
        }

        targetRate += (1 - targetRate) * 0.06;
        rate += (targetRate - rate) * 0.12;

        loopAnimations.forEach((animation) => {
          if (Math.abs(animation.playbackRate - rate) > 0.01) animation.playbackRate = rate;
        });

        requestAnimationFrame(easeRate);
      };
      requestAnimationFrame(easeRate);
    }
  }

  /* =========================================================
     5. GSAP SCROLL SCENES
     One signature moment per section:
     - Hero          layers part ways at different depths
     - About         the statement lights up word by word
     - Services      a spotlight follows the row being read
     - How it works  pinned story: photo wipes, odometer, chips
     - Experience    a comet rides the rail and lights each node
     - Work          outline letters assemble, tiles settle at depth
     - Skills        rows slide against each other, lean into speed
     - Contact       the closing line rises word by word
     - Footer        the wordmark rises letter by letter
  ========================================================= */
  if (!hasGsap || reduceMotion) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // Phone address bars resize the viewport constantly; don't re-measure for that.
  ScrollTrigger.config({ ignoreMobileResize: true });

  const media = gsap.matchMedia();
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- Hero: copy, photo, frames and chips leave at different depths ----------
     --sp (0 to 1) is read by the stage's layers in CSS, so it stacks with
     the pointer depth instead of fighting it. */
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
      .to(".kinetic-h1 .h-line:first-child", { xPercent: -7, duration: 1 }, 0)
      .to(".kinetic-h1 .h-line:last-child", { xPercent: 7, duration: 1 }, 0)
      .to(".hero-visual", { y: 70, scale: 0.93, duration: 1 }, 0)
      .to(".hero-visual", { opacity: 0, duration: 0.5 }, 0.5)
      .to(".hero-ticker", { opacity: 0, duration: 0.6 }, 0.1);

    if (heroStage) heroOut.fromTo(heroStage, { "--sp": 0 }, { "--sp": 1, duration: 1 }, 0);
  });

  /* ---------- About: words light up as you read down ---------- */
  const scrubText = document.getElementById("aboutLead");

  if (scrubText) {
    scrubText.innerHTML = scrubText.textContent
      .trim()
      .split(/\s+/)
      .map((word) => `<span class="scrub-word">${escapeHtml(word)}</span>`)
      .join(" ");

    gsap.fromTo(
      scrubText.querySelectorAll(".scrub-word"),
      { opacity: 0.16 },
      {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: scrubText,
          start: "top 84%",
          end: "bottom 52%",
          scrub: true
        }
      }
    );
  }

  /* ---------- About: numbers count up once, when first seen ---------- */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        const end = parseInt(el.textContent, 10);
        if (!end) return;

        const counter = { value: 0 };
        gsap.to(counter, {
          value: end,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = String(Math.round(counter.value));
          }
        });
      }
    });
  });

  /* ---------- Services: the row crossing the reading line lights up ---------- */
  gsap.utils.toArray(".svc-row").forEach((row) => {
    ScrollTrigger.create({
      trigger: row,
      start: "top 56%",
      end: "bottom 56%",
      toggleClass: "is-lit"
    });
  });

  /* ---------- How it works ----------
     Wide, tall screens: the frame swings in, then the stage pins and the
     five steps play as one story (photos wipe over each other, the counter
     rolls like an odometer, each step's chip pops, the rail fills).
     Everything else: a vertical timeline whose rail fills as you pass. */
  const flow = document.getElementById("system");
  const flowStage = document.getElementById("flowStage");

  if (flow && flowStage) {
    const flowSteps = gsap.utils.toArray(".flow-step", flow);
    const flowLayers = gsap.utils.toArray(".flow-layer", flow);
    const flowList = flow.querySelector(".flow-steps");
    const flowFrame = flow.querySelector(".flow-frame");
    const flowCount = document.getElementById("flowCount");
    const lastStep = flowSteps.length - 1;
    const clearSteps = () => flowSteps.forEach((step) => step.classList.remove("is-active"));

    media.add("(min-width: 961px) and (min-height: 620px)", () => {
      flow.classList.add("is-pinned");

      // Counter becomes a strip of numbers that rolls inside a one-line window.
      let digits = null;
      if (flowCount) {
        digits = document.createElement("span");
        digits.className = "flow-digits";
        digits.innerHTML = flowSteps.map((_, i) => `<span>${pad2(i + 1)}</span>`).join("");
        flowCount.textContent = "";
        flowCount.appendChild(digits);
        flowCount.classList.add("is-roll");
      }

      let current = -1;
      const show = (index) => {
        if (index === current) return;
        current = index;
        flowSteps.forEach((step, i) => step.classList.toggle("is-active", i === index));
      };
      show(0);

      // On the way in: the frame settles upright and the steps file in.
      const arrive = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: flowStage, start: "top 92%", end: "center center", scrub: 0.6 }
      });

      if (flowFrame) {
        arrive.fromTo(
          flowFrame,
          { yPercent: 18, scale: 0.84, rotation: 5 },
          { yPercent: 0, scale: 1, rotation: 0, duration: 1 },
          0
        );
      }
      arrive.fromTo(flowSteps, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.11 }, 0.1);

      // Pinned: one scroll-length per step, plus a short hold on the last one.
      const hold = 0.4;
      const story = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate() {
          show(Math.max(0, Math.min(lastStep, Math.round(this.time()))));
        },
        scrollTrigger: {
          trigger: flowStage,
          start: "center center",
          end: () => `+=${Math.round(window.innerHeight * 0.6 * (lastStep + hold))}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      story.fromTo(flowList, { "--flow": 0 }, { "--flow": 1, duration: lastStep }, 0);

      flowLayers.forEach((layer, i) => {
        if (!i) return;
        const at = i - 0.85;
        const before = flowLayers[i - 1].querySelector("img");
        const chip = layer.querySelector(".flow-chip");

        // The next photo wipes up from the bottom while it settles...
        story.fromTo(
          layer,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7 },
          at
        );
        story.fromTo(layer.querySelector("img"), { scale: 1.3 }, { scale: 1, duration: 0.7 }, at);

        // ...the one underneath is pushed up and out of its way...
        if (before) story.to(before, { yPercent: -9, duration: 0.7 }, at);

        // ...the counter rolls to the new number and the step's chip pops in.
        if (digits) {
          story.to(
            digits,
            { yPercent: (-100 / flowSteps.length) * i, duration: 0.7, ease: "power2.inOut" },
            at
          );
        }
        if (chip) {
          story.fromTo(
            chip,
            { scale: 0, rotation: -80 },
            { scale: 1, rotation: 0, duration: 0.34, ease: "back.out(2)" },
            i - 0.42
          );
        }
      });

      story.to({}, { duration: hold });

      return () => {
        flow.classList.remove("is-pinned");
        clearSteps();
        if (flowCount) {
          flowCount.classList.remove("is-roll");
          flowCount.textContent = pad2(1);
        }
      };
    });

    media.add("(max-width: 960px), (max-height: 619px)", () => {
      gsap.fromTo(
        flowList,
        { "--flow": 0 },
        {
          "--flow": 1,
          ease: "none",
          scrollTrigger: { trigger: flowList, start: "top 72%", end: "bottom 60%", scrub: 0.4 }
        }
      );

      flowSteps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 70%",
          onEnter: () => step.classList.add("is-active"),
          onLeaveBack: () => step.classList.remove("is-active")
        });
      });

      return clearSteps;
    });
  }

  /* ---------- Experience: the rail fills and nodes light as you pass ---------- */
  const xpList = document.getElementById("xpList");

  if (xpList) {
    gsap.fromTo(
      xpList,
      { "--xp": 0 },
      {
        "--xp": 1,
        ease: "none",
        scrollTrigger: { trigger: xpList, start: "top 72%", end: "bottom 62%", scrub: 0.4 }
      }
    );

    gsap.utils.toArray(".xp-item", xpList).forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top 70%",
        onEnter: () => item.classList.add("is-passed"),
        onLeaveBack: () => item.classList.remove("is-passed")
      });
    });
  }

  /* ---------- Work: the carousel tips up into place, the outline word drifts ---------- */
  const cfTilt = document.querySelector(".cf-tilt");
  const workGhost = document.querySelector(".work-ghost");

  if (cfTilt) {
    gsap.fromTo(
      cfTilt,
      { rotateX: 24, scale: 0.82, y: 80, opacity: 0.35 },
      {
        rotateX: 0,
        scale: 1,
        y: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: cfTilt, start: "top 96%", end: "top 36%", scrub: 0.5 }
      }
    );
  }

  if (workGhost) {
    gsap.fromTo(
      workGhost,
      { xPercent: 7 },
      {
        xPercent: -7,
        ease: "none",
        scrollTrigger: { trigger: ".work-showcase", start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  }

  /* ---------- Footer: the wordmark rises into its slot ---------- */
  const footerWord = document.querySelector(".footer-word span");

  if (footerWord) {
    gsap.fromTo(
      footerWord,
      { yPercent: 46 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: ".footer-word", start: "top bottom", end: "bottom bottom", scrub: 0.4 }
      }
    );
  }

  // Lazy images and web fonts change heights after load.
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
