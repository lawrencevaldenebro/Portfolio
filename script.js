// mobile menu
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.style.display === "flex";
    mobileMenu.style.display = isOpen ? "none" : "flex";
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.style.display = "none";
    });
  });
}

// reveal on scroll
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.14
});

revealEls.forEach(el => revealObserver.observe(el));

// active nav link on scroll
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".desktop-nav a, .mobile-menu a");

function setActiveLink() {
  let current = "";

  sections.forEach(section => {
    const top = window.scrollY;
    const offset = section.offsetTop - 140;
    const height = section.offsetHeight;

    if (top >= offset && top < offset + height) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active-link");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active-link");
    }
  });
}

window.addEventListener("scroll", setActiveLink);
setActiveLink();

// main slider
(function () {
  const sliders = document.querySelectorAll("[data-slider]");

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-track]");
    const slides = Array.from(track.children);
    const prevBtn = slider.querySelector("[data-prev]");
    const nextBtn = slider.querySelector("[data-next]");
    const dotsWrap = slider.querySelector("[data-dots]");

    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap?.appendChild(dot);
      return dot;
    });

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    const autoplay = slider.getAttribute("data-autoplay") === "true";
    const interval = parseInt(slider.getAttribute("data-interval") || "3500", 10);

    function start() {
      if (!autoplay) return;
      stop();
      timer = setInterval(() => goTo(index + 1), interval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    let startX = 0;

    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;

      if (Math.abs(dx) > 40) {
        if (dx > 0) {
          goTo(index - 1);
        } else {
          goTo(index + 1);
        }
      }
    }, { passive: true });

    update();
    start();
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openForm");
  const modal = document.getElementById("formModal");
  const closeOverlay = document.getElementById("closeForm");
  const closeBtn = document.getElementById("closeFormBtn");

  if (!openBtn || !modal || !closeOverlay || !closeBtn) {
    console.log("Modal elements missing");
    return;
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
  });

  closeOverlay.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.classList.remove("active");
    }
  });
});