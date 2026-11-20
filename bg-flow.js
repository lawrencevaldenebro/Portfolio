/* Animated flowing-lines + traveling-flash background
   Sits inside .page-bg, behind all content.

   Kept deliberately light:
   - drawn at 1x resolution (it is a soft, faint backdrop; CSS scales it)
   - capped at 30 fps
   - glows are pre-rendered sprites, not new gradients every frame
   - holds still while the page is scrolling, so scrolling stays smooth
   - phones and reduced-motion visitors get one static frame
   - stops when the tab is hidden */
(function () {
  var canvas = document.getElementById('bg-flow-canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLORS = ['#4cc9f0', '#3a86ff', '#6a5cff', '#7b61ff', '#00c9a7', '#4f8cff'];
  var FRAME_MS = 1000 / 30;
  var GLOW_R = 16;

  var W = 0, H = 0;
  var lines = [];
  var running = false;
  var last = 0;
  var lastDraw = 0;
  var scrolling = false;
  var scrollTimer = null;
  var sprites = {};

  function rand(min, max) { return min + Math.random() * (max - min); }

  function isStatic() {
    return reduceMotion || window.innerWidth < 700;
  }

  // One small pre-rendered glow per colour, stamped with drawImage.
  function sprite(color) {
    if (sprites[color]) return sprites[color];
    var size = GLOW_R * 2;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var grad = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(GLOW_R, GLOW_R, 2, 0, Math.PI * 2);
    g.fill();
    sprites[color] = c;
    return c;
  }

  function makePulse(delay) {
    return { t: -0.15 - (delay || 0), speed: rand(0.06, 0.16) };
  }

  function buildLines() {
    var count = W < 700 ? 6 : (W < 1100 ? 9 : 12);
    lines = [];
    for (var i = 0; i < count; i++) {
      var color = COLORS[(i + Math.floor(rand(0, COLORS.length))) % COLORS.length];
      lines.push({
        baseY: rand(0.04, 0.96) * H,
        amp: rand(24, 90),
        freq: rand(0.5, 1.8),
        speed: rand(0.06, 0.22),
        phase: rand(0, Math.PI * 2),
        width: rand(1, 1.8),
        alpha: rand(0.08, 0.2),
        color: color,
        glow: sprite(color),
        pulses: [makePulse(0)]
      });
    }
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildLines();
    if (!running) drawFrame(0);
  }

  function yAt(line, x) {
    return line.baseY + Math.sin((x / W) * Math.PI * 2 * line.freq + line.phase) * line.amp;
  }

  function drawLine(line) {
    ctx.beginPath();
    var steps = 32;
    for (var s = 0; s <= steps; s++) {
      var x = (s / steps) * W;
      var y = yAt(line, x);
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = line.color;
    ctx.globalAlpha = line.alpha;
    ctx.lineWidth = line.width;
    ctx.stroke();
  }

  function drawPulse(line, p) {
    if (p.t < 0 || p.t > 1) return;
    var x = p.t * W;
    var y = yAt(line, x);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(line.glow, x - GLOW_R, y - GLOW_R);
  }

  function drawFrame(dt) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      line.phase += dt * line.speed;
      drawLine(line);
      for (var j = 0; j < line.pulses.length; j++) {
        var p = line.pulses[j];
        p.t += dt * p.speed;
        if (p.t > 1.1) p.t = -0.15;
        if (dt) drawPulse(line, p);
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);

    // Hold still while scrolling, and never draw faster than 30 fps.
    if (scrolling || now - lastDraw < FRAME_MS) {
      last = now;
      return;
    }
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    lastDraw = now;
    drawFrame(dt);
  }

  function start() {
    if (running || isStatic()) return;
    running = true;
    last = lastDraw = performance.now();
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (isStatic()) stop(); else if (!document.hidden) start();
    }, 150);
  });

  window.addEventListener('scroll', function () {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { scrolling = false; }, 160);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();
