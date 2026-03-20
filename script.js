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
});