// script.js

// Experience sliders (with dots + arrows)
(function () {
  const sliders = document.querySelectorAll("[data-slider]");

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-track]");
    const slides = Array.from(track.children);
    const prevBtn = slider.querySelector("[data-prev]");
    const nextBtn = slider.querySelector("[data-next]");
    const dotsWrap = slider.parentElement.querySelector("[data-dots]");

    let index = 0;

    const dots = slides.map((_, i) => {
      const d = document.createElement("button");
      d.className = "slider-dot" + (i === 0 ? " active" : "");
      d.type = "button";
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(d);
      return d;
    });

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    const autoplay = slider.getAttribute("data-autoplay") === "true";
    const interval = parseInt(slider.getAttribute("data-interval") || "3500", 10);
    let timer = null;

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
    slider.addEventListener("touchstart", (e) => startX = e.touches[0].clientX, { passive: true });
    slider.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 40) {
        if (dx > 0) goTo(index - 1);
        else goTo(index + 1);
      }
    }, { passive: true });

    update();
    start();
  });
})();

// Mini image sliders (games / tv)
document.querySelectorAll('[data-mini-slider]').forEach(slider => {
  const track = slider.querySelector('.mini-track');
  const slides = track.children;
  let index = 0;

  setInterval(() => {
    index = (index + 1) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  }, 3000);
});

// Spotify slider
document.querySelectorAll('[data-spotify-slider]').forEach(slider => {
  const track = slider.querySelector('.spotify-track');
  const slides = track.children;
  let index = 0;

  setInterval(() => {
    index = (index + 1) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  }, 5000);
});
