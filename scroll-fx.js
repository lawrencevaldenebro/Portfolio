/* =========================================================
   SCROLL FX — Webflow-style scroll interactions
   ---------------------------------------------------------
   1. SPLIT HEADINGS (word-by-word rise, CSS driven)
   2. STAGGERED SERVICE CARDS
   3. SERVICE FILTER
   4. STAT COUNTERS
   5. CLIENTS MARQUEE
   6. LENIS SMOOTH SCROLL
   7. GSAP SCROLL SCENES (hero scroll-out, scrubbed text,
      pinned horizontal "How it works" section)
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
    const cols = window.innerWidth > 1180 ? 3 : window.innerWidth > 860 ? 2 : 1;
    let visibleIndex = 0;

    servicesGrid.querySelectorAll(".service-card").forEach((card) => {
      if (card.classList.contains("is-hidden")) return;
      const col = card.classList.contains("service-featured") ? 0 : visibleIndex % cols;
      card.style.setProperty("--stagger", col);
      if (!card.classList.contains("service-featured")) visibleIndex++;
    });
  }

  restagger();
  window.addEventListener("resize", restagger);

  /* =========================================================
     3. SERVICE FILTER
     - Hides cards outside the chosen category
     - Replays the reveal animation on the cards that remain
  ========================================================= */
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });

      const cards = servicesGrid ? servicesGrid.querySelectorAll(".service-card") : [];

      cards.forEach((card) => {
        const cats = (card.dataset.cat || "").split(" ");
        const match = filter === "all" || cats.includes(filter);
        card.classList.toggle("is-hidden", !match);
        if (match) card.classList.remove("show");
      });

      restagger();

      // Force a reflow so the reveal transition replays.
      void servicesGrid?.offsetHeight;
      cards.forEach((card) => {
        if (!card.classList.contains("is-hidden")) card.classList.add("show");
      });

      // Section height changed, so pinned sections below need new positions.
      if (hasGsap) window.ScrollTrigger.refresh();
    });
  });

  /* =========================================================
     4. STAT COUNTERS
     - Counts from 0 to data-count when scrolled into view
  ========================================================= */
  const counters = document.querySelectorAll("[data-count]");

  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const suffix = el.dataset.suffix || "";
          const duration = 1400;
          const start = performance.now();

          function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (t < 1) requestAnimationFrame(tick);
          }

          el.textContent = `0${suffix}`;
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  }

  /* =========================================================
     5. CLIENTS MARQUEE
     - Duplicates the names so the CSS loop is seamless
  ========================================================= */
  const clientsTrack = document.getElementById("clientsTrack");

  if (clientsTrack) {
    Array.from(clientsTrack.children).forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clientsTrack.appendChild(clone);
    });
  }

  /* =========================================================
     6. LENIS SMOOTH SCROLL
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
     7. GSAP SCROLL SCENES
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

  const heroCard = document.querySelector(".hero-image-card");

  if (heroCard) {
    gsap.to(heroCard, {
      y: -50,
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

  /* ---------- Stats band: numbers drift at different speeds ---------- */
  // Animates the inner number so it doesn't fight the card's CSS reveal transform.
  gsap.utils.toArray(".stat strong").forEach((stat, i) => {
    gsap.fromTo(
      stat,
      { y: 30 + i * 12 },
      {
        y: -10,
        ease: "none",
        scrollTrigger: {
          trigger: ".stats-band",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  /* ---------- How it works: pinned horizontal scroll (desktop) ---------- */
  const systemSection = document.getElementById("system");
  const systemTrack = document.getElementById("systemTrack");
  const systemProgress = document.getElementById("systemProgress");

  if (systemSection && systemTrack) {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px)", () => {
      systemSection.classList.add("is-horizontal");

      const distance = () => Math.max(0, systemTrack.scrollWidth - window.innerWidth);

      const slide = gsap.to(systemTrack, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: systemSection,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (systemProgress) systemProgress.style.transform = `scaleX(${self.progress})`;
          }
        }
      });

      // Each panel's photo drifts inside its frame as it travels across.
      systemTrack.querySelectorAll(".system-media img").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -6 },
          {
            xPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".system-panel"),
              containerAnimation: slide,
              start: "left right",
              end: "right left",
              scrub: true
            }
          }
        );
      });

      return () => {
        systemSection.classList.remove("is-horizontal");
        if (systemProgress) systemProgress.style.transform = "";
      };
    });
  }

  // Lazy images and web fonts change heights after load.
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
