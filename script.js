/* =========================================================
   LAWRENCE PORTFOLIO - MASTER SCRIPT
   =========================================================
   QUICK FIND GUIDE
   ---------------------------------------------------------
   1. MOBILE MENU
   2. REVEAL ON SCROLL
   3. ACTIVE NAV LINK
   4. SLIDER / CAROUSEL
   5. CONTACT MODAL
   6. LIVE DEMO SIMULATION
   7. COUNTRY + PHONE FIELD LOGIC
   8. SCROLL PROGRESS + HEADER SHRINK
   9. 3D TILT ON CARDS
   10. MAGNETIC BUTTONS
   11. PARALLAX BACKGROUND ORBS
   12. SKILLS MARQUEE
   13. GET TO KNOW ME — FLIP CARDS
   14. LEAD RUSH MINIGAME
   15. CONTACT FORM SUBMIT (Formspree AJAX)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. MOBILE MENU
     - Opens/closes the mobile nav
     - Closes when a link is clicked
     - Closes when clicking outside
  ========================================================= */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuLinks = mobileMenu?.querySelectorAll("a") || [];

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.display = "flex";
    menuToggle?.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.display = "none";
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    if (!mobileMenu) return;
    const isOpen = getComputedStyle(mobileMenu).display === "flex";
    isOpen ? closeMobileMenu() : openMobileMenu();
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", toggleMobileMenu);

    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = mobileMenu.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        closeMobileMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) {
        closeMobileMenu();
      }
    });
  }

  /* =========================================================
     2. REVEAL ON SCROLL
     - Adds .show once elements enter viewport
  ========================================================= */
  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* =========================================================
     3. ACTIVE NAV LINK
     - Highlights current section in nav
  ========================================================= */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav a, .mobile-menu a");

  function setActiveLink() {
    let currentSectionId = "";

    sections.forEach((section) => {
      const scrollTop = window.scrollY;
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active-link");

      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active-link");
      }
    });
  }

  if (sections.length && navLinks.length) {
    window.addEventListener("scroll", setActiveLink);
    setActiveLink();
  }

  /* =========================================================
     4. SLIDER / CAROUSEL
     - Buttons
     - Dots
     - Touch swipe
     - Optional autoplay
  ========================================================= */
  const sliders = document.querySelectorAll("[data-slider]");

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-track]");
    if (!track) return;

    const slides = Array.from(track.children);
    const prevBtn = slider.querySelector("[data-prev]");
    const nextBtn = slider.querySelector("[data-next]");
    const dotsWrap = slider.querySelector("[data-dots]");

    if (!slides.length) return;

    let index = 0;
    let timer = null;
    let startX = 0;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = `slider-dot${i === 0 ? " active" : ""}`;
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap?.appendChild(dot);
      return dot;
    });

    function updateSlider() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      updateSlider();
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function startAutoplay() {
      const autoplay = slider.getAttribute("data-autoplay") === "true";
      const interval = parseInt(slider.getAttribute("data-interval") || "3500", 10);

      if (!autoplay) return;

      stopAutoplay();
      timer = setInterval(() => goTo(index + 1), interval);
    }

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    slider.addEventListener(
      "touchstart",
      (event) => {
        startX = event.touches[0].clientX;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      (event) => {
        const endX = event.changedTouches[0].clientX;
        const dx = endX - startX;

        if (Math.abs(dx) > 40) {
          dx > 0 ? goTo(index - 1) : goTo(index + 1);
        }
      },
      { passive: true }
    );

    updateSlider();
    startAutoplay();
  });

  /* =========================================================
     5. CONTACT MODAL
     - Opens popup
     - Locks body scroll
     - Closes on overlay / close button / ESC
  ========================================================= */
  const openBtn = document.getElementById("openForm");
  const modal = document.getElementById("formModal");
  const closeOverlay = document.getElementById("closeForm");
  const closeBtn = document.getElementById("closeFormBtn");

  function openModal() {
    if (!modal) return;
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    resetDemo();
  }

  if (openBtn && modal && closeOverlay && closeBtn) {
    openBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });

    closeOverlay.addEventListener("click", closeModal);
    closeBtn.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
    });
  }

  /* =========================================================
     6. LIVE DEMO SIMULATION
     - Fake CRM automation sequence
     - Resets when modal closes
  ========================================================= */
  const demoForm = document.getElementById("demoLeadForm");
  const demoFlow = document.getElementById("demoFlow");
  const demoSteps = demoFlow ? Array.from(demoFlow.querySelectorAll(".demo-step")) : [];
  const demoStatus = document.getElementById("demoStatus");

  let demoTimers = [];

  function clearDemoTimers() {
    demoTimers.forEach((timer) => clearTimeout(timer));
    demoTimers = [];
  }

  function resetDemo() {
    clearDemoTimers();

    if (demoFlow) {
      demoFlow.classList.remove("active");
    }

    if (demoStatus) {
      demoStatus.classList.remove("active");
      demoStatus.textContent = "";
    }

    demoSteps.forEach((step) => {
      step.classList.remove("show");
    });

    demoForm?.reset();
  }

  function setDemoStatus(text) {
    if (!demoStatus) return;
    demoStatus.textContent = text;
    demoStatus.classList.add("active");
  }

  function runDemoSequence() {
    if (!demoFlow || !demoSteps.length) return;

    clearDemoTimers();
    demoFlow.classList.add("active");

    demoSteps.forEach((step) => {
      step.classList.remove("show");
    });

    const statuses = [
      "Capturing lead in CRM...",
      "Sending instant SMS response...",
      "Triggering nurture email workflow...",
      "Applying smart lead tags...",
      "Updating pipeline stage...",
      "Launching AI follow-up logic..."
    ];

    statuses.forEach((status, i) => {
      const timer = setTimeout(() => {
        setDemoStatus(status);
      }, i * 850);

      demoTimers.push(timer);
    });

    demoSteps.forEach((step, index) => {
      const timer = setTimeout(() => {
        step.classList.add("show");
      }, 900 * (index + 1));

      demoTimers.push(timer);
    });

    const finishTimer = setTimeout(() => {
      setDemoStatus("Demo complete — this is the kind of automated flow I build for clients.");
    }, 900 * (demoSteps.length + 1));

    demoTimers.push(finishTimer);
  }

  if (demoForm && demoFlow) {
    demoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      runDemoSequence();
    });
  }

  /* =========================================================
     7. COUNTRY + PHONE FIELD LOGIC
     ---------------------------------------------------------
     WHAT THIS DOES:
     - Country dropdown stays as country name
     - Phone input stays LOCAL ONLY
     - Dial code goes into hidden field
     - Non-number characters are removed from phone input
     ---------------------------------------------------------
     REQUIRED HTML IDS:
     - #countrySelect
     - #phoneInput
     - #dialCodeInput
  ========================================================= */
  const countrySelect = document.getElementById("countrySelect");
  const phoneInput = document.getElementById("phoneInput");
  const dialCodeInput = document.getElementById("dialCodeInput");

  const countryPhoneMap = {
    "Philippines": {
      placeholder: "09123456789",
      pattern: "[0-9]{10,13}"
    },
    "United States": {
      placeholder: "2015550123",
      pattern: "[0-9]{10,15}"
    },
    "Canada": {
      placeholder: "4165550123",
      pattern: "[0-9]{10,15}"
    },
    "United Kingdom": {
      placeholder: "07123456789",
      pattern: "[0-9]{10,15}"
    },
    "Australia": {
      placeholder: "0412345678",
      pattern: "[0-9]{9,15}"
    },
    "New Zealand": {
      placeholder: "0212345678",
      pattern: "[0-9]{8,15}"
    },
    "Singapore": {
      placeholder: "91234567",
      pattern: "[0-9]{8,15}"
    },
    "United Arab Emirates": {
      placeholder: "0501234567",
      pattern: "[0-9]{8,15}"
    },
    "Saudi Arabia": {
      placeholder: "0501234567",
      pattern: "[0-9]{8,15}"
    },
    "Germany": {
      placeholder: "015123456789",
      pattern: "[0-9]{8,15}"
    },
    "France": {
      placeholder: "0612345678",
      pattern: "[0-9]{8,15}"
    },
    "Netherlands": {
      placeholder: "0612345678",
      pattern: "[0-9]{8,15}"
    },
    "Spain": {
      placeholder: "612345678",
      pattern: "[0-9]{8,15}"
    },
    "Italy": {
      placeholder: "3123456789",
      pattern: "[0-9]{8,15}"
    },
    "India": {
      placeholder: "09876543210",
      pattern: "[0-9]{10,15}"
    },
    "South Africa": {
      placeholder: "0821234567",
      pattern: "[0-9]{9,15}"
    },
    "Other": {
      placeholder: "Enter your phone / WhatsApp number",
      pattern: "[0-9]{6,20}"
    }
  };

  function sanitizePhoneInput() {
    if (!phoneInput) return;
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
  }

  function updatePhoneFieldByCountry() {
    if (!countrySelect || !phoneInput || !dialCodeInput) return;

    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const countryName = selectedOption?.value || "Other";
    const dialCode = selectedOption?.dataset.code || "";

    const config = countryPhoneMap[countryName] || countryPhoneMap["Other"];

    dialCodeInput.value = dialCode;
    phoneInput.placeholder = config.placeholder;
    phoneInput.setAttribute("pattern", config.pattern);

    sanitizePhoneInput();
  }

  if (countrySelect && phoneInput && dialCodeInput) {
    countrySelect.addEventListener("change", updatePhoneFieldByCountry);
    phoneInput.addEventListener("input", sanitizePhoneInput);

    updatePhoneFieldByCountry();
  }

  /* =========================================================
     8. SCROLL PROGRESS + HEADER SHRINK
     - Fills the top progress bar as the page scrolls
     - Shrinks the sticky header once scrolled past the hero
  ========================================================= */
  const scrollProgress = document.getElementById("scrollProgress");
  const siteHeader = document.querySelector(".site-header");

  function handleScrollMotion() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle("scrolled", scrollTop > 40);
    }
  }

  let scrollMotionTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollMotionTicking) {
      requestAnimationFrame(() => {
        handleScrollMotion();
        scrollMotionTicking = false;
      });
      scrollMotionTicking = true;
    }
  });

  handleScrollMotion();

  /* =========================================================
     9. 3D TILT ON CARDS
     - Cursor-reactive tilt for project / experience / contact cards
     - Skipped on touch-only devices
  ========================================================= */
  const tiltEls = document.querySelectorAll(".project-card, .experience-card, .contact-card");

  if (tiltEls.length && window.matchMedia("(pointer: fine)").matches) {
    tiltEls.forEach((card) => {
      card.classList.add("spotlight");

      const maxTilt = card.classList.contains("experience-card") ? 3 : 6;
      const lift = card.classList.contains("project-card")
        ? -8
        : card.classList.contains("contact-card")
        ? -6
        : -3;

      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = (x / rect.width - 0.5) * maxTilt * 2;
        const rotateX = (y / rect.height - 0.5) * -maxTilt * 2;

        card.style.transition = "transform 0.08s linear, border-color 0.3s ease, background 0.3s ease";
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${lift}px)`;

        card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
        card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.5s cubic-bezier(.2,.8,.2,1), border-color 0.3s ease, background 0.3s ease";
        card.style.transform = "";
      });
    });
  }

  /* =========================================================
     10. MAGNETIC BUTTONS
     - Primary CTAs subtly follow the cursor on hover
  ========================================================= */
  const magneticEls = document.querySelectorAll(".btn-primary, .nav-cta");

  if (magneticEls.length && window.matchMedia("(pointer: fine)").matches) {
    magneticEls.forEach((btn) => {
      btn.addEventListener("mousemove", (event) => {
        const rect = btn.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        btn.style.transition = "transform 0.1s ease";
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform 0.4s cubic-bezier(.2,.8,.2,1)";
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* =========================================================
     11. PARALLAX BACKGROUND ORBS
     - Whole background layer drifts slightly with the cursor
  ========================================================= */
  const pageBg = document.querySelector(".page-bg");

  if (pageBg && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (event) => {
      const px = (event.clientX / window.innerWidth - 0.5) * 30;
      const py = (event.clientY / window.innerHeight - 0.5) * 30;
      pageBg.style.transform = `translate(${px}px, ${py}px)`;
    });
  }

  /* =========================================================
     12. SKILLS MARQUEE
     - Duplicates the skill pills so the CSS marquee loop is seamless
  ========================================================= */
  const skillsTrack = document.getElementById("skillsTrack");

  if (skillsTrack) {
    const originalPills = Array.from(skillsTrack.children);
    originalPills.forEach((pill) => {
      const clone = pill.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      skillsTrack.appendChild(clone);
    });
  }

  /* =========================================================
     13. GET TO KNOW ME — FLIP CARDS
     - Hover flips on desktop (pure CSS)
     - Tap / Enter / Space flips on touch + keyboard
  ========================================================= */
  const flipCards = document.querySelectorAll(".flip-card");

  flipCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      // Let links (IMDb / Steam) open normally instead of flipping the card.
      if (event.target.closest("a")) return;
      card.classList.toggle("flipped");
    });

    card.addEventListener("keydown", (event) => {
      if (event.target.closest("a")) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  });

  /* =========================================================
     15. CONTACT FORM SUBMIT (Formspree AJAX)
     ---------------------------------------------------------
     Submits in-page instead of redirecting to Formspree.
     Requesting JSON back means Formspree returns a real error
     message, which we surface instead of failing silently.
  ========================================================= */
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");
  const contactSubmit = document.getElementById("contactSubmit");

  function setContactStatus(type, html) {
    if (!contactStatus) return;
    contactStatus.className = `form-status active ${type}`;
    contactStatus.innerHTML = html;
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = new FormData(contactForm);
      const originalLabel = contactSubmit ? contactSubmit.textContent : "";

      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Sending...";
      }
      setContactStatus("pending", '<i class="fas fa-circle-notch fa-spin"></i> Sending your message...');

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        });

        if (response.ok) {
          contactForm.reset();
          setContactStatus(
            "success",
            '<i class="fas fa-circle-check"></i> Message sent. I\'ll get back to you shortly.'
          );
        } else {
          // Formspree returns JSON explaining exactly what went wrong.
          let reason = `Server responded ${response.status}.`;
          try {
            const payload = await response.json();
            if (Array.isArray(payload.errors) && payload.errors.length) {
              reason = payload.errors.map((e) => e.message).join(" ");
            } else if (payload.error) {
              reason = payload.error;
            }
          } catch (parseErr) {
            /* non-JSON response — keep the status-code message */
          }

          setContactStatus(
            "error",
            `<i class="fas fa-triangle-exclamation"></i> Couldn't send: ${reason}
             <br>You can email me directly at
             <a href="mailto:lawrencevaldenebro@gmail.com">lawrencevaldenebro@gmail.com</a>.`
          );
        }
      } catch (networkErr) {
        setContactStatus(
          "error",
          `<i class="fas fa-triangle-exclamation"></i> Network error — the message didn't send.
           <br>Please email me directly at
           <a href="mailto:lawrencevaldenebro@gmail.com">lawrencevaldenebro@gmail.com</a>.`
        );
      } finally {
        if (contactSubmit) {
          contactSubmit.disabled = false;
          contactSubmit.textContent = originalLabel || "Send Message";
        }
      }
    });
  }

  /* =========================================================
     14. LEAD RUSH MINIGAME
     ---------------------------------------------------------
     Catch falling "leads" in the funnel, avoid "spam".
     - Mouse / touch / arrow-key controls
     - 3 lives, rising difficulty, streak multiplier
     - Best score persisted in localStorage (guarded)
  ========================================================= */
  const canvas = document.getElementById("gameCanvas");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const scoreEl = document.getElementById("gameScore");
    const bestEl = document.getElementById("gameBest");
    const streakEl = document.getElementById("gameStreak");
    const livesEl = document.getElementById("gameLives");
    const overlay = document.getElementById("gameOverlay");
    const overlayTitle = document.getElementById("gameOverlayTitle");
    const overlayText = document.getElementById("gameOverlayText");
    const startBtn = document.getElementById("gameStart");

    const FUNNEL_W = 108;
    const FUNNEL_H = 62;
    const FUNNEL_Y = H - FUNNEL_H - 16;

    let running = false;
    let paused = false;
    let rafId = null;
    let lastTime = 0;
    let spawnTimer = 0;
    let elapsed = 0;

    let score = 0;
    let streak = 0;
    let lives = 3;
    let best = 0;

    try {
      best = parseInt(localStorage.getItem("leadRushBest") || "0", 10) || 0;
    } catch (err) {
      best = 0;
    }

    let funnelX = W / 2;
    let targetX = W / 2;
    let keyLeft = false;
    let keyRight = false;

    let items = [];
    let particles = [];
    let floatTexts = [];

    function saveBest() {
      try {
        localStorage.setItem("leadRushBest", String(best));
      } catch (err) {
        /* storage unavailable — best simply won't persist */
      }
    }

    function updateHud() {
      if (scoreEl) scoreEl.textContent = score;
      if (bestEl) bestEl.textContent = best;
      if (streakEl) streakEl.textContent = streak;
      if (livesEl) livesEl.textContent = lives > 0 ? "♥".repeat(lives) : "—";
    }

    function showOverlay(title, text, btnLabel) {
      if (!overlay) return;
      if (overlayTitle) overlayTitle.textContent = title;
      if (overlayText) overlayText.textContent = text;
      if (startBtn) startBtn.innerHTML = `<i class="fas fa-play"></i> ${btnLabel}`;
      overlay.classList.add("active");
    }

    function hideOverlay() {
      overlay?.classList.remove("active");
    }

    function spawnItem() {
      // Spam ratio grows slowly with time, capped so it stays fair.
      const spamChance = Math.min(0.16 + elapsed / 90000, 0.34);
      const isSpam = Math.random() < spamChance;
      const isBonus = !isSpam && Math.random() < 0.09;

      items.push({
        x: 30 + Math.random() * (W - 60),
        y: -24,
        r: isBonus ? 15 : 12,
        vy: 110 + Math.random() * 60 + elapsed / 900,
        drift: (Math.random() - 0.5) * 40,
        type: isSpam ? "spam" : isBonus ? "bonus" : "lead"
      });
    }

    function burst(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 140;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 40,
          life: 1,
          color
        });
      }
    }

    function addFloatText(x, y, text, color) {
      floatTexts.push({ x, y, text, color, life: 1 });
    }

    function resetGame() {
      score = 0;
      streak = 0;
      lives = 3;
      elapsed = 0;
      spawnTimer = 0;
      items = [];
      particles = [];
      floatTexts = [];
      funnelX = W / 2;
      targetX = W / 2;
      updateHud();
    }

    function endGame() {
      running = false;
      paused = false;

      if (score > best) {
        best = score;
        saveBest();
        updateHud();
        showOverlay(
          "New personal best!",
          `You captured ${score} points worth of leads. That's your best run yet.`,
          "Play Again"
        );
      } else {
        showOverlay(
          "Campaign over",
          `Final score: ${score}. Best: ${best}. Tighten the funnel and try again.`,
          "Play Again"
        );
      }
    }

    function loseLife(x, y) {
      lives--;
      streak = 0;
      burst(x, y, "255,110,140", 16);
      addFloatText(x, y, "−1 ♥", "#ff7a92");
      updateHud();

      if (lives <= 0) {
        endGame();
      }
    }

    /* ---------- drawing ---------- */
    function drawFunnel() {
      const x = funnelX;
      const y = FUNNEL_Y;
      const halfTop = FUNNEL_W / 2;
      const halfBottom = 22;

      const grad = ctx.createLinearGradient(x - halfTop, y, x + halfTop, y + FUNNEL_H);
      grad.addColorStop(0, "rgba(76,201,240,0.9)");
      grad.addColorStop(1, "rgba(123,97,255,0.85)");

      ctx.save();
      ctx.shadowColor = "rgba(90,160,255,0.55)";
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(x - halfTop, y);
      ctx.lineTo(x + halfTop, y);
      ctx.lineTo(x + halfBottom, y + FUNNEL_H * 0.62);
      ctx.lineTo(x + halfBottom, y + FUNNEL_H);
      ctx.lineTo(x - halfBottom, y + FUNNEL_H);
      ctx.lineTo(x - halfBottom, y + FUNNEL_H * 0.62);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "rgba(220,240,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // catch-zone shimmer along the funnel mouth
      ctx.beginPath();
      ctx.moveTo(x - halfTop, y);
      ctx.lineTo(x + halfTop, y);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    function drawItem(item) {
      ctx.save();

      if (item.type === "spam") {
        ctx.shadowColor = "rgba(255,90,120,0.7)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#ff5f7e";
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(item.x - 5, item.y - 5);
        ctx.lineTo(item.x + 5, item.y + 5);
        ctx.moveTo(item.x + 5, item.y - 5);
        ctx.lineTo(item.x - 5, item.y + 5);
        ctx.stroke();
      } else if (item.type === "bonus") {
        ctx.shadowColor = "rgba(0,201,167,0.8)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#26e0bb";
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#06304a";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", item.x, item.y + 1);
      } else {
        ctx.shadowColor = "rgba(90,180,255,0.75)";
        ctx.shadowBlur = 14;
        const g = ctx.createLinearGradient(item.x, item.y - item.r, item.x, item.y + item.r);
        g.addColorStop(0, "#8fe6ff");
        g.addColorStop(1, "#3a86ff");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(item.x, item.y - 3, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(item.x, item.y + 7, 5.6, Math.PI, 0);
        ctx.fill();
      }

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // subtle moving grid for depth
      ctx.save();
      ctx.strokeStyle = "rgba(130,180,255,0.05)";
      ctx.lineWidth = 1;
      const offset = (elapsed / 26) % 44;
      for (let gx = 0; gx <= W; gx += 44) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = -44 + offset; gy <= H; gy += 44) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }
      ctx.restore();

      items.forEach(drawItem);

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(${p.color},${Math.max(p.life, 0)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life + 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      floatTexts.forEach((f) => {
        ctx.save();
        ctx.globalAlpha = Math.max(f.life, 0);
        ctx.fillStyle = f.color;
        ctx.font = "bold 17px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });

      drawFunnel();

      if (paused) {
        ctx.fillStyle = "rgba(5,14,26,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#dceaff";
        ctx.font = "bold 26px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Paused — press P to resume", W / 2, H / 2);
      }
    }

    /* ---------- simulation ---------- */
    function update(dt) {
      elapsed += dt * 1000;

      if (keyLeft) targetX -= 520 * dt;
      if (keyRight) targetX += 520 * dt;
      targetX = Math.max(FUNNEL_W / 2, Math.min(W - FUNNEL_W / 2, targetX));
      funnelX += (targetX - funnelX) * Math.min(1, dt * 14);

      spawnTimer -= dt * 1000;
      const spawnEvery = Math.max(340, 900 - elapsed / 60);
      if (spawnTimer <= 0) {
        spawnItem();
        spawnTimer = spawnEvery;
      }

      const mouthLeft = funnelX - FUNNEL_W / 2;
      const mouthRight = funnelX + FUNNEL_W / 2;

      items = items.filter((item) => {
        item.y += item.vy * dt;
        item.x += item.drift * dt;

        if (item.x < item.r) {
          item.x = item.r;
          item.drift *= -1;
        }
        if (item.x > W - item.r) {
          item.x = W - item.r;
          item.drift *= -1;
        }

        const inMouth =
          item.y + item.r >= FUNNEL_Y &&
          item.y - item.r <= FUNNEL_Y + 22 &&
          item.x >= mouthLeft &&
          item.x <= mouthRight;

        if (inMouth) {
          if (item.type === "spam") {
            loseLife(item.x, FUNNEL_Y);
          } else {
            streak++;
            const mult = 1 + Math.floor(streak / 5);
            const base = item.type === "bonus" ? 50 : 10;
            const gained = base * mult;
            score += gained;

            burst(
              item.x,
              FUNNEL_Y,
              item.type === "bonus" ? "38,224,187" : "140,220,255",
              item.type === "bonus" ? 22 : 12
            );
            addFloatText(
              item.x,
              FUNNEL_Y - 10,
              `+${gained}${mult > 1 ? ` ×${mult}` : ""}`,
              item.type === "bonus" ? "#26e0bb" : "#8fe6ff"
            );

            if (score > best) {
              best = score;
              saveBest();
            }
            updateHud();
          }
          return false;
        }

        // Missing a good lead costs a life; letting spam fall through is fine.
        if (item.y - item.r > H) {
          if (item.type !== "spam") {
            loseLife(item.x, H - 20);
          }
          return false;
        }

        return true;
      });

      particles = particles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 340 * dt;
        p.life -= dt * 1.6;
        return p.life > 0;
      });

      floatTexts = floatTexts.filter((f) => {
        f.y -= 34 * dt;
        f.life -= dt * 1.1;
        return f.life > 0;
      });
    }

    function loop(timestamp) {
      if (!running) return;

      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      if (!paused) update(dt);
      draw();

      rafId = requestAnimationFrame(loop);
    }

    function startGame() {
      resetGame();
      hideOverlay();
      running = true;
      paused = false;
      lastTime = performance.now();
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }

    /* ---------- controls ---------- */
    function pointerToCanvasX(clientX) {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    }

    canvas.addEventListener("mousemove", (event) => {
      targetX = pointerToCanvasX(event.clientX);
    });

    canvas.addEventListener(
      "touchmove",
      (event) => {
        if (!event.touches.length) return;
        event.preventDefault();
        targetX = pointerToCanvasX(event.touches[0].clientX);
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchstart",
      (event) => {
        if (!event.touches.length) return;
        targetX = pointerToCanvasX(event.touches[0].clientX);
      },
      { passive: true }
    );

    document.addEventListener("keydown", (event) => {
      if (!running) return;

      if (event.key === "ArrowLeft") {
        keyLeft = true;
        event.preventDefault();
      }
      if (event.key === "ArrowRight") {
        keyRight = true;
        event.preventDefault();
      }
      if (event.key === "p" || event.key === "P") {
        paused = !paused;
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.key === "ArrowLeft") keyLeft = false;
      if (event.key === "ArrowRight") keyRight = false;
    });

    startBtn?.addEventListener("click", startGame);

    // Pause automatically when the section scrolls out of view.
    const gameSection = document.getElementById("game");
    if (gameSection && "IntersectionObserver" in window) {
      const gameObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting && running) paused = true;
          });
        },
        { threshold: 0.25 }
      );
      gameObserver.observe(gameSection);
    }

    updateHud();
    draw();
  }
});
