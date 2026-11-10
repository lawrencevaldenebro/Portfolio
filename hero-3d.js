/* =========================================================
   HERO 3D — extruded LV mark with floating glass geometry
   ---------------------------------------------------------
   1. SETUP: WebGL check, lazy-load Three.js after first paint
   2. SCENE: lighting, logo mark, floating shapes, rings, dust
   3. MOTION: entrance fly-in, idle float, pointer follow,
      scroll-linked spin
   4. LIFECYCLE: pauses off screen / hidden tab, cleans up
   ---------------------------------------------------------
   No WebGL or a failed CDN load leaves the SVG fallback in
   place. Reduced motion renders one still frame. Phones get
   fewer shapes, lower resolution and no glass refraction.
========================================================= */

const stage = document.getElementById("heroStage");

if (stage && hasWebGL()) init();

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeOutCubic = (p) => 1 - (1 - p) ** 3;
const easeOutBack = (p, s = 1.6) => {
  const q = p - 1;
  return q * q * ((s + 1) * q + s) + 1;
};

async function init() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 860px)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* =========================================================
     1. SETUP
  ========================================================= */
  // Let the page paint first so 3D never delays the content
  await new Promise((r) =>
    "requestIdleCallback" in window ? requestIdleCallback(r, { timeout: 1200 }) : setTimeout(r, 300)
  );

  let THREE, RoomEnvironment;
  try {
    THREE = await import("three");
    ({ RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js"));
  } catch {
    return; // fallback SVG stays
  }

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !small, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  /* =========================================================
     2. SCENE
  ========================================================= */
  // Studio reflections + coloured rim lights in the site palette
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 4, 5);
  const cyan = new THREE.PointLight(0x4cc9f0, 40, 14);
  cyan.position.set(-3.5, 1.5, 3);
  const violet = new THREE.PointLight(0x7b61ff, 40, 14);
  violet.position.set(3.5, -1.5, 2.5);
  scene.add(key, cyan, violet);

  // Logo mark: the favicon polygons (64-unit SVG space) extruded into facets
  const LITE = 0x8cc6ff, MID = 0x3d84ee, DARK = 0x1c4aa8;
  const facets = [
    { pts: [[7, 16], [19, 16], [33, 49], [27, 49]], color: LITE, depth: 6 },
    { pts: [[19, 16], [22, 19], [34.5, 47], [33, 49]], color: DARK, depth: 4.5 },
    { pts: [[23, 16], [29, 16], [38, 36], [35, 41]], color: MID, depth: 5 },
    { pts: [[33, 49], [50, 17], [56, 17], [39, 49]], color: MID, depth: 6 },
    { pts: [[48, 14], [58, 14], [56, 17], [50, 17]], color: LITE, depth: 6.6 },
  ];

  const logo = new THREE.Group();
  const disposables = [];

  facets.forEach((f) => {
    const shape = new THREE.Shape(f.pts.map(([x, y]) => new THREE.Vector2(x - 32.5, -(y - 31.5))));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: f.depth,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.45,
      bevelSegments: 3,
    });
    geo.translate(0, 0, -f.depth / 2);
    const mat = new THREE.MeshPhysicalMaterial({
      color: f.color,
      metalness: 0.45,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 0.35,
      envMapIntensity: 1.2,
    });
    logo.add(new THREE.Mesh(geo, mat));
    disposables.push(geo, mat);
  });

  logo.scale.setScalar(0.055);
  const logoPivot = new THREE.Group(); // pivot holds float + pointer motion; logo keeps its scale
  logoPivot.add(logo);
  scene.add(logoPivot);

  // Floating geometry around the mark
  const glass = small
    ? new THREE.MeshPhysicalMaterial({ color: 0x9fd0ff, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.55, clearcoat: 1 })
    : new THREE.MeshPhysicalMaterial({ color: 0xcfe6ff, metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.6, ior: 1.45, clearcoat: 1 });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0x6aa8ff, metalness: 0.9, roughness: 0.2, clearcoat: 1 });
  const violetMat = new THREE.MeshPhysicalMaterial({ color: 0x7b61ff, metalness: 0.5, roughness: 0.25, clearcoat: 1, iridescence: 0.6 });
  disposables.push(glass, chrome, violetMat);

  const geos = {
    ico: new THREE.IcosahedronGeometry(0.32, 0),
    oct: new THREE.OctahedronGeometry(0.26, 0),
    torus: new THREE.TorusGeometry(0.24, 0.085, 20, 48),
    sphere: new THREE.SphereGeometry(0.17, 32, 16),
    knot: new THREE.TorusKnotGeometry(0.17, 0.05, 96, 12),
  };
  disposables.push(...Object.values(geos));

  const shapeSpecs = [
    { g: "ico", m: glass, p: [-1.95, 1.25, 0.4] },
    { g: "torus", m: chrome, p: [1.9, 1.35, -0.3] },
    { g: "sphere", m: violetMat, p: [2.1, -0.95, 0.6] },
    { g: "oct", m: glass, p: [-1.75, -1.3, 0.8] },
    { g: "knot", m: chrome, p: [0.2, 2.0, -0.8] },
    { g: "sphere", m: chrome, p: [-0.6, -1.95, 0.2] },
    { g: "oct", m: violetMat, p: [1.15, -1.9, -0.6] },
    { g: "ico", m: glass, p: [2.35, 0.25, -1.2] },
    { g: "torus", m: violetMat, p: [-2.3, 0.1, -1.0] },
    { g: "sphere", m: glass, p: [-1.0, 1.95, 0.9] },
    { g: "oct", m: chrome, p: [1.6, 0.55, 1.4] },
    { g: "knot", m: violetMat, p: [-1.45, -0.45, 1.5] },
  ].slice(0, small ? 7 : 12);

  const shapes = shapeSpecs.map((spec, i) => {
    const mesh = new THREE.Mesh(geos[spec.g], spec.m);
    mesh.userData = {
      base: new THREE.Vector3(...spec.p),
      phase: i * 1.7,
      speed: 0.7 + (i % 4) * 0.18,
      spin: new THREE.Vector3(0.3 + (i % 3) * 0.2, 0.4 + (i % 2) * 0.3, 0.1),
      scale: 0.85 + (i % 3) * 0.2,
    };
    scene.add(mesh);
    return mesh;
  });

  // Thin orbit rings
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.35 });
  const ringGeo = new THREE.TorusGeometry(2.25, 0.008, 8, 160);
  const ringA = new THREE.Mesh(ringGeo, ringMat);
  const ringB = new THREE.Mesh(ringGeo, ringMat);
  ringA.rotation.set(1.25, 0.2, 0);
  ringB.rotation.set(1.1, -0.6, 0.4);
  ringB.scale.setScalar(1.12);
  scene.add(ringA, ringB);
  disposables.push(ringMat, ringGeo);

  // Dust particles
  const dustCount = small ? 120 : 320;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2 + Math.random() * 3.5;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    dustPos.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.7, r * Math.sin(b) * Math.sin(a) - 1], i * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0x9fd0ff, size: 0.022, transparent: true, opacity: 0.55, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);
  disposables.push(dustGeo, dustMat);

  /* =========================================================
     3. MOTION
  ========================================================= */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollP = 0;
  let enterStart = window.__heroEntered ? 0 : null; // seconds; null until hero:enter
  const clock = new THREE.Clock();

  function onPointer(e) {
    const r = stage.getBoundingClientRect();
    pointer.tx = clamp(((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)), -1, 1);
    pointer.ty = clamp(((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)), -1, 1);
  }

  function onScroll() {
    const r = stage.closest(".hero-section").getBoundingClientRect();
    scrollP = clamp(-r.top / r.height);
  }

  function onEnter() {
    enterStart = clock.getElapsedTime();
  }

  if (finePointer && !reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("hero:enter", onEnter);

  function update(t) {
    // Entrance: 0 → 1 over ~1.6s once the hero is revealed
    const e = reduceMotion ? 1 : enterStart === null ? 0 : clamp((t - enterStart) / 1.6);
    const still = reduceMotion ? 0 : 1;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    // Logo: flies in spinning, then floats, turns toward the pointer and spins with scroll
    const le = easeOutBack(clamp(e / 0.75));
    logoPivot.scale.setScalar(Math.max(0.001, le));
    logoPivot.position.y = Math.sin(t * 1.1) * 0.08 * still;
    logoPivot.rotation.y =
      (1 - easeOutCubic(clamp(e / 0.75))) * -3 + Math.sin(t * 0.5) * 0.28 * still + pointer.x * 0.55 + scrollP * Math.PI;
    logoPivot.rotation.x = -0.12 + pointer.y * 0.3 + Math.sin(t * 0.7) * 0.05 * still;

    // Shapes: stream in from depth one after another, then bob and tumble
    shapes.forEach((m, i) => {
      const d = m.userData;
      const p = easeOutCubic(clamp((e - 0.15 - i * 0.04) / 0.6));
      m.position.set(
        d.base.x * (1 + (1 - p) * 1.4),
        d.base.y * (1 + (1 - p) * 1.4) + Math.sin(t * d.speed + d.phase) * 0.14 * still,
        d.base.z - (1 - p) * 6 + scrollP * (i % 2 ? 1.5 : -1.5)
      );
      m.rotation.set(t * d.spin.x * still + d.phase, t * d.spin.y * still, t * d.spin.z * still);
      m.scale.setScalar(Math.max(0.001, d.scale * p));
    });

    const re = easeOutCubic(clamp((e - 0.3) / 0.8));
    ringA.scale.setScalar(Math.max(0.001, re));
    ringB.scale.setScalar(Math.max(0.001, re * 1.12));
    ringA.rotation.z = t * 0.12 * still;
    ringB.rotation.z = -t * 0.09 * still;
    dustMat.opacity = 0.55 * e;
    dust.rotation.y = t * 0.025 * still;

    // Camera parallax
    camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.y * 0.3 - camera.position.y) * 0.05;
    camera.position.z = 8 + scrollP * 1.5;
    camera.lookAt(0, 0, 0);
  }

  /* =========================================================
     4. LIFECYCLE
  ========================================================= */
  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduceMotion) renderOnce();
  }

  function renderOnce() {
    update(0);
    renderer.render(scene, camera);
  }

  let inView = true;
  function frame() {
    update(clock.getElapsedTime());
    renderer.render(scene, camera);
  }

  function syncLoop() {
    const run = !reduceMotion && inView && !document.hidden;
    renderer.setAnimationLoop(run ? frame : null);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncLoop();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", syncLoop);

  onScroll();
  if (reduceMotion) renderOnce();
  else frame();
  stage.classList.add("is-ready");
  syncLoop();

  // Back/forward cache keeps the page alive: just pause, and resume on return
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) syncLoop();
  });

  window.addEventListener("pagehide", (e) => {
    renderer.setAnimationLoop(null);
    if (e.persisted) return;
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("hero:enter", onEnter);
    document.removeEventListener("visibilitychange", syncLoop);
    disposables.forEach((d) => d.dispose());
    scene.environment.dispose();
    pmrem.dispose();
    renderer.dispose();
  });
}
