/* Samurai slash intro — drop-in for lawrencevaldenebro/Portfolio
   Usage in index.html:
     <link rel="stylesheet" href="./samurai-intro.css" />
     <script src="./samurai-intro.js" defer></script>
   Plays once per browser session; click / Esc / the Skip button ends it early.
   Replay manually with: SamuraiIntro.play({ force: true })            */
(function () {
  var DURATION = 3400;
  var KEY = 'si-intro-played';

  function samuraiSvg() {
    return (
      '<svg class="si-samurai" viewBox="0 0 220 330" aria-hidden="true">' +
      '<g fill="#030a14">' +
      '<g transform="translate(110,190)">' +
      '<g transform="rotate(-8)"><rect x="-12" y="-8" width="25" height="140" rx="12"/></g>' +
      '<g transform="rotate(7)"><rect x="-12" y="-8" width="25" height="140" rx="12"/></g>' +
      '<g transform="rotate(6)">' +
      '<path d="M-33,4 L-24,-98 L24,-98 L33,4 Z"/>' +
      '<path d="M-35,6 L-30,-40 L30,-40 L35,6 Z" fill="#0a1a2c"/>' +
      '<g transform="translate(0,-92)">' +
      '<g transform="rotate(24)"><rect x="-8" y="-7" width="15" height="74" rx="7"/></g>' +
      '<circle cx="0" cy="-28" r="17"/>' +
      '<ellipse cx="0" cy="-24" rx="49" ry="8"/>' +
      '<polygon points="-49,-26 0,-62 49,-26"/>' +
      '<g transform="rotate(34)">' +
      '<rect x="-8" y="-7" width="15" height="76" rx="7" fill="#0a1a2c"/>' +
      '<g class="si-blade" transform="translate(0,70)" style="transform-box:fill-box;transform-origin:0 50%">' +
      '<path d="M6,-4 Q95,-15 178,-8 L180,-2 Q95,-5 6,4 Z" fill="#a8bddb"/>' +
      '<path d="M6,-4 Q95,-15 178,-8 L179,-5 Q95,-11 6,-1 Z" fill="#eef4ff"/>' +
      '<rect x="-34" y="-5" width="40" height="10" rx="3" fill="#030a14"/>' +
      '<rect x="2" y="-9" width="7" height="18" rx="2" fill="#4cc9f0"/>' +
      '</g></g></g></g>' +
      '<g class="si-saya" transform="rotate(-24)">' +
      '<rect x="-6" y="-6" width="132" height="11" rx="5" fill="#0a1a2c"/>' +
      '<rect x="-6" y="-6" width="26" height="11" rx="5" fill="#4f8cff" opacity="0.5"/>' +
      '</g>' +
      '</g></g></svg>'
    );
  }

  function scene() {
    return (
      '<div class="si-scene">' +
      '<div class="si-sun"></div>' +
      '<div class="si-mist si-mist-1"></div>' +
      '<div class="si-mist si-mist-2"></div>' +
      '<div class="si-ground"></div>' +
      samuraiSvg() +
      '<div class="si-vignette"></div>' +
      '</div>'
    );
  }

  var overlay = null, timer = null;

  function end() {
    if (!overlay) return;
    var el = overlay;
    overlay = null;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
    el.classList.add('si-done');
    el.remove();
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') end();
  }

  function play(opts) {
    opts = opts || {};
    if (overlay) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced && !opts.force) return;
    try {
      if (!opts.force && sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, '1');
    } catch (err) { /* private mode — just play */ }

    overlay = document.createElement('div');
    overlay.className = opts.force ? 'si-overlay si-forced' : 'si-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML =
      '<div class="si-half si-half-top">' + scene() + '</div>' +
      '<div class="si-half si-half-bottom">' + scene() + '</div>' +
      '<div class="si-streak"></div>' +
      '<div class="si-cut"></div>' +
      '<div class="si-flash"></div>' +
      '<button class="si-skip" type="button">Skip</button>';

    overlay.addEventListener('click', end);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    timer = setTimeout(end, DURATION + 120);
  }

  window.SamuraiIntro = { play: play, end: end };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { play(); });
  } else {
    play();
  }
})();
