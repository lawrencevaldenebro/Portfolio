/* =========================================================
   WORK — 3D coverflow showcase, filterable gallery, lightbox
   ---------------------------------------------------------
   1. DATA
   2. COVERFLOW (3D carousel of highlights)
   3. GALLERY (filter tabs + masonry grid + "show more")
   4. LIGHTBOX (image / Drive video viewer with prev/next)
   ---------------------------------------------------------
   Images live in images/work/. Videos stream from Google
   Drive's preview player, so the repo stays light.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. DATA
     - type: "ghl" | "web" | "design" | "video"
     - w/h: image size, used to reserve space before load
     - drive: Drive file id (videos only)
  ========================================================= */
  const IMG = "./images/work/";

  const WORK = [
    { src: "web-trade-hero", type: "web", title: "Trade company website", w: 1600, h: 687 },
    { src: "ghl-ai-receptionist", type: "ghl", title: "AI receptionist offer page", w: 1143, h: 1089 },
    { src: "design-personal-banner", type: "design", title: "Personal brand banner", w: 1400, h: 789 },
    { src: "ghl-workflow-map", type: "ghl", title: "Multi-branch automation", w: 1400, h: 923 },
    { src: "video-5", type: "video", title: "Anime edit", w: 600, h: 1067, drive: "1inkRR-iHq9pLjl-pWnwamc1UIIVq3ZVh" },
    { src: "web-saas-pricing", type: "web", title: "SaaS pricing page", w: 1600, h: 721 },
    { src: "design-margarita-day", type: "design", title: "Holiday recipe post", w: 1000, h: 1000 },
    { src: "ghl-roi-calculator", type: "ghl", title: "Interactive ROI calculator", w: 1400, h: 848 },
    { src: "design-anime-poster", type: "design", title: "Illustrated poster", w: 900, h: 1600 },
    { src: "web-trade-gallery", type: "web", title: "Image gallery slider", w: 1600, h: 919 },
    { src: "video-2", type: "video", title: "Finance explainer reel", w: 600, h: 1067, drive: "1wzGJY93-g2oTNdlCjuELvPB4Y-6jLVW_" },
    { src: "ghl-nurture-builder", type: "ghl", title: "Nurture sequence builder", w: 1600, h: 821 },
    { src: "design-course-module-1", type: "design", title: "Course module tile", w: 1000, h: 1000 },
    { src: "design-collage-poster", type: "design", title: "Collage poster", w: 900, h: 1273 },
    { src: "web-trade-services", type: "web", title: "Services section", w: 1600, h: 754 },
    { src: "video-8", type: "video", title: "Motion graphic", w: 600, h: 1067, drive: "1ASriVQRzErqtbNnPShVPCPB3MxyZJyV5" },
    { src: "ghl-sms-stats", type: "ghl", title: "SMS reactivation results", w: 1600, h: 485 },
    { src: "design-bridal-tips", type: "design", title: "Wedding tips post", w: 1000, h: 1000 },
    { src: "design-neuropathy", type: "design", title: "E-book cover", w: 1000, h: 1414 },
    { src: "video-3", type: "video", title: "Hair care ad", w: 600, h: 1067, drive: "1Yn7aJue7HuNVX56HQvOB3bkjYTx4RjsS" },
    { src: "design-course-module-2", type: "design", title: "Course module tile", w: 1000, h: 1000 },
    { src: "web-trade-why", type: "web", title: "Why-us section", w: 1600, h: 868 },
    { src: "design-realestate-tips", type: "design", title: "Real estate tips post", w: 1000, h: 1000 },
    { src: "ghl-workflows", type: "ghl", title: "Workflow library", w: 1600, h: 575 },
    { src: "design-personal-banner-2", type: "design", title: "Personal brand banner", w: 1400, h: 789 },
    { src: "video-6", type: "video", title: "Skincare ad", w: 600, h: 1067, drive: "1YnEwIuG7fuJ2oC3uGM9QJtAZxkc_QKvT" },
    { src: "design-cooking-tips", type: "design", title: "Cooking tips post", w: 1000, h: 1000 },
    { src: "design-appraisal-tips", type: "design", title: "Home appraisal post", w: 1000, h: 1000 },
    { src: "video-1", type: "video", title: "Celebrity reel edit", w: 600, h: 1067, drive: "1GYYC-HfjrJBMNh_tctvgnGLsLMgKFxr-" },
    { src: "design-course-module-3", type: "design", title: "Course module tile", w: 1000, h: 1000 },
    { src: "design-timing-tips", type: "design", title: "Market timing post", w: 1000, h: 1000 },
    { src: "design-wellness-tips", type: "design", title: "Wellness tips post", w: 1000, h: 1000 },
    { src: "video-4", type: "video", title: "Talking-head reel", w: 600, h: 1067, drive: "1PMerA1luVtFRcF6VwTgxmjTY7Hb9XwKA" },
    { src: "design-therapy-cover", type: "design", title: "Brochure cover", w: 900, h: 1273 },
    { src: "video-7", type: "video", title: "Wellness ad", w: 600, h: 1067, drive: "1ZD7v-gvURyXORycz1LhnwCA5nSbSfgvE" },
    { src: "design-matcha-banner", type: "design", title: "Product banner", w: 1600, h: 320 }
  ];

  const TYPE_LABEL = { ghl: "GoHighLevel", web: "Website", design: "Design", video: "Video" };
  const TYPE_ICON = { ghl: "fa-diagram-project", web: "fa-code", design: "fa-pen-ruler", video: "fa-play" };

  // Highlights for the 3D showcase (indexes into WORK)
  const SHOWCASE = ["web-trade-hero", "ghl-ai-receptionist", "design-personal-banner", "ghl-workflow-map",
    "web-saas-pricing", "ghl-roi-calculator", "web-trade-gallery", "ghl-nurture-builder"]
    .map((src) => WORK.find((w) => w.src === src));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // SMIL morphs can't be stopped from CSS — pause them for reduced motion.
  if (reduceMotion) {
    document.querySelectorAll("svg.hero-blob, svg.work-morph").forEach((svg) => svg.pauseAnimations?.());
  }

  const imgUrl = (item) => `${IMG}${item.src}.jpg`;

  /* =========================================================
     4. LIGHTBOX (defined first — coverflow + gallery open it)
  ========================================================= */
  const lb = document.getElementById("lightbox");
  const lbStage = document.getElementById("lbStage");
  const lbTitle = document.getElementById("lbTitle");
  const lbType = document.getElementById("lbType");
  const lbCount = document.getElementById("lbCount");
  let lbList = [];
  let lbIndex = 0;
  let lbLastFocus = null;

  function renderLightbox() {
    const item = lbList[lbIndex];
    if (!item || !lbStage) return;

    lbStage.classList.remove("is-in");
    lbStage.innerHTML = item.drive
      ? `<div class="lb-video"><iframe src="https://drive.google.com/file/d/${item.drive}/preview" allow="autoplay; fullscreen" allowfullscreen title="${item.title}"></iframe></div>`
      : `<img src="${imgUrl(item)}" alt="${item.title}" width="${item.w}" height="${item.h}" />`;

    // Force reflow so the swap animation replays.
    void lbStage.offsetWidth;
    lbStage.classList.add("is-in");

    lbTitle.textContent = item.title;
    lbType.innerHTML = `<i class="fas ${TYPE_ICON[item.type]}"></i> ${TYPE_LABEL[item.type]}`;
    lbCount.textContent = `${lbIndex + 1} / ${lbList.length}`;
  }

  function openLightbox(list, index) {
    if (!lb) return;
    lbList = list;
    lbIndex = index;
    lbLastFocus = document.activeElement;
    renderLightbox();
    lb.classList.add("active");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    lb.querySelector(".lb-close")?.focus();
  }

  function closeLightbox() {
    if (!lb || !lb.classList.contains("active")) return;
    lb.classList.remove("active");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lbStage.innerHTML = ""; // stops any playing video
    lbLastFocus?.focus();
  }

  function stepLightbox(dir) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    renderLightbox();
  }

  if (lb) {
    lb.querySelector(".lb-close")?.addEventListener("click", closeLightbox);
    lb.querySelector(".lb-prev")?.addEventListener("click", () => stepLightbox(-1));
    lb.querySelector(".lb-next")?.addEventListener("click", () => stepLightbox(1));
    lb.addEventListener("click", (event) => {
      if (event.target === lb || event.target.classList.contains("lb-backdrop")) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lb.classList.contains("active")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") stepLightbox(-1);
      if (event.key === "ArrowRight") stepLightbox(1);
    });

    let touchX = 0;
    lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) stepLightbox(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  /* =========================================================
     2. COVERFLOW
     - Cards fan out in 3D around the active one
     - Autoplays, pauses on hover / when off-screen
     - Drag, arrows, dots, or click a side card to move
  ========================================================= */
  const cfStage = document.getElementById("cfStage");
  const cfDots = document.getElementById("cfDots");
  const cfCaption = document.getElementById("cfCaption");

  if (cfStage && SHOWCASE.length) {
    let active = 0;
    let timer = null;
    let inView = false;

    cfStage.innerHTML = SHOWCASE.map((item, i) => `
      <button type="button" class="cf-card" data-i="${i}" aria-label="${item.title}">
        <img src="${imgUrl(item)}" alt="" loading="lazy" decoding="async" />
        <span class="cf-shine" aria-hidden="true"></span>
      </button>`).join("");

    const cards = Array.from(cfStage.querySelectorAll(".cf-card"));

    if (cfDots) {
      cfDots.innerHTML = SHOWCASE.map((_, i) => `<button type="button" aria-label="Show item ${i + 1}" data-i="${i}"></button>`).join("");
    }

    function layout() {
      const n = cards.length;
      const mobile = window.innerWidth < 700;
      const spread = mobile ? 70 : 52;
      const maxSide = mobile ? 1 : 2; // fewer side cards on narrow screens

      cards.forEach((card, i) => {
        // Shortest signed distance around the loop
        let off = i - active;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        const abs = Math.abs(off);

        card.style.transform =
          `translate(-50%, -50%) translateX(${off * spread}%) translateZ(${-abs * 160}px) rotateY(${off * -38}deg)`;
        card.style.zIndex = String(100 - abs);
        card.style.opacity = abs > maxSide ? "0" : String(1 - abs * 0.22);
        card.style.pointerEvents = abs > maxSide ? "none" : "auto";
        card.classList.toggle("is-active", off === 0);
        card.tabIndex = abs > maxSide ? -1 : 0;
      });

      cfDots?.querySelectorAll("button").forEach((d, i) => d.classList.toggle("is-active", i === active));

      if (cfCaption) {
        const item = SHOWCASE[active];
        cfCaption.classList.remove("is-in");
        void cfCaption.offsetWidth;
        cfCaption.innerHTML = `<span><i class="fas ${TYPE_ICON[item.type]}"></i> ${TYPE_LABEL[item.type]}</span>${item.title}`;
        cfCaption.classList.add("is-in");
      }
    }

    function go(i) {
      active = (i + cards.length) % cards.length;
      layout();
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function play() {
      if (reduceMotion || !inView) return;
      stop();
      timer = setInterval(() => go(active + 1), 3800);
    }

    let dragged = false;

    cards.forEach((card, i) => {
      card.addEventListener("click", () => {
        // A drag ends with a click on the card under the pointer; ignore it.
        if (dragged) {
          dragged = false;
          return;
        }
        if (i === active) openLightbox(SHOWCASE, i);
        else go(i);
      });
    });

    cfDots?.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) go(Number(b.dataset.i));
    });

    document.getElementById("cfPrev")?.addEventListener("click", () => go(active - 1));
    document.getElementById("cfNext")?.addEventListener("click", () => go(active + 1));

    const showcase = cfStage.closest(".work-showcase");
    showcase?.addEventListener("mouseenter", stop);
    showcase?.addEventListener("mouseleave", play);
    showcase?.addEventListener("focusin", stop);

    // Drag / swipe to rotate
    let startX = null;
    cfStage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    window.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        dragged = true;
        go(active + (dx < 0 ? 1 : -1));
      }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        inView ? play() : stop();
      }, { threshold: 0.3 }).observe(cfStage);
    }

    window.addEventListener("resize", layout);
    layout();
  }

  /* =========================================================
     3. GALLERY
     - Masonry columns, filter tabs, "show more"
     - Tiles fade + rise in with a stagger on every filter
  ========================================================= */
  const grid = document.getElementById("workGrid");
  const tabs = document.querySelectorAll(".work-tab");
  const moreBtn = document.getElementById("workMore");
  const PAGE = 9;
  let filter = "all";
  let shown = PAGE;

  function currentList() {
    return filter === "all" ? WORK : WORK.filter((w) => w.type === filter);
  }

  function renderGrid() {
    if (!grid) return;
    const list = currentList();
    const visible = list.slice(0, shown);

    grid.innerHTML = visible.map((item, i) => `
      <button type="button" class="work-tile${item.drive ? " is-video" : ""}" data-i="${i}" style="--d:${(i % PAGE) * 55}ms">
        <img src="${imgUrl(item)}" alt="${item.title}" width="${item.w}" height="${item.h}" loading="lazy" decoding="async" />
        ${item.drive ? '<span class="tile-play" aria-hidden="true"><i class="fas fa-play"></i></span>' : ""}
        <span class="tile-info">
          <span class="tile-type"><i class="fas ${TYPE_ICON[item.type]}"></i> ${TYPE_LABEL[item.type]}</span>
          <span class="tile-title">${item.title}</span>
        </span>
      </button>`).join("");

    requestAnimationFrame(() => grid.classList.add("is-in"));

    grid.querySelectorAll(".work-tile").forEach((tile) => {
      tile.addEventListener("click", () => openLightbox(list, Number(tile.dataset.i)));
    });

    if (moreBtn) {
      const remaining = list.length - visible.length;
      moreBtn.hidden = remaining <= 0;
      moreBtn.querySelector("span").textContent = `Show ${remaining} more`;
    }

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filter = tab.dataset.filter;
      shown = PAGE;
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      grid?.classList.remove("is-in");
      setTimeout(renderGrid, 180);
    });
  });

  moreBtn?.addEventListener("click", () => {
    shown += PAGE;
    renderGrid();
  });

  // Count badges on tabs
  tabs.forEach((tab) => {
    const f = tab.dataset.filter;
    const n = f === "all" ? WORK.length : WORK.filter((w) => w.type === f).length;
    const badge = tab.querySelector("em");
    if (badge) badge.textContent = n;
  });

  renderGrid();
});
