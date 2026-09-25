/* Animated flowing-lines + traveling-flash background
   Drop-in for lawrencevaldenebro/Portfolio — sits inside .page-bg,
   behind all content (z-index inherited from .page-bg: -2).
   Respects prefers-reduced-motion and pauses when the tab is hidden. */
(function () {
  var canvas = document.getElementById('bg-flow-canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLORS = ['#4cc9f0', '#3a86ff', '#6a5cff', '#7b61ff', '#00c9a7', '#4f8cff'];

  var W = 0, H = 0, DPR = 1;
  var lines = [];
  var running = false;
  var last = 0;

  function rand(min, max) { return min + Math.random() * (max - min); }

  function makePulse(delay) {
    return { t: -0.15 - (delay || 0), speed: rand(0.06, 0.16) };
  }

  function buildLines() {
    var count = W < 640 ? 7 : (W < 1100 ? 12 : 17);
    lines = [];
    for (var i = 0; i < count; i++) {
      var pulseCount = Math.random() < 0.6 ? 1 : 2;
      var pulses = [];
      for (var p = 0; p < pulseCount; p++) pulses.push(makePulse(p * rand(0.2, 0.6)));
      lines.push({
        baseY: rand(0.04, 0.96) * H,
        amp: rand(24, 90) * DPR,
        freq: rand(0.5, 1.8),
        speed: rand(0.06, 0.22),
        phase: rand(0, Math.PI * 2),
        width: rand(1, 1.8) * DPR,
        alpha: rand(0.08, 0.2),
        color: COLORS[(i + Math.floor(rand(0, COLORS.length))) % COLORS.length],
        pulses: pulses
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    buildLines();
  }

  function yAt(line, x) {
    return line.baseY + Math.sin((x / W) * Math.PI * 2 * line.freq + line.phase) * line.amp;
  }

  function drawLine(line) {
    ctx.beginPath();
    var steps = 48;
    for (var s = 0; s <= steps; s++) {
      var x = (s / steps) * W;
      var y = yAt(line, x);
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = line.color;
    ctx.globalAlpha = line.alpha;
    ctx.lineWidth = line.width;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawPulse(line, p) {
    if (p.t < 0 || p.t > 1) return;
    var x = p.t * W;
    var y = yAt(line, x);
    var r = 16 * DPR;
    var glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, line.color);
    glow.addColorStop(0.35, line.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 2 * DPR, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      line.phase += dt * line.speed;
      drawLine(line);
      for (var j = 0; j < line.pulses.length; j++) {
        var p = line.pulses[j];
        p.t += dt * p.speed;
        if (p.t > 1.1) p.t = -0.15;
        drawPulse(line, p);
      }
    }

    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (!reduceMotion) start();
  });

  resize();

  if (reduceMotion) {
    // Draw one static frame so the lines are still visible, no motion.
    ctx.clearRect(0, 0, W, H);
    lines.forEach(function (line) { drawLine(line); });
  } else {
    start();
  }
})();
