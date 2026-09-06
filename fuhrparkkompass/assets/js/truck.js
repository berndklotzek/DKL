/* =========================================================
   Fuhrparkkompass — 3D-Lkw im Hero (Three.js r128, selbst gehostet)
   Ein europäischer Frontlenker mit Auflieger, prozedural gebaut:
   keine Modelldatei, keine Texturen von außen. Der Zug fährt beim
   Laden ins Bild, die Räder drehen, die Fahrbahnmarkierung läuft,
   die Maus neigt die Kamera, das Scrollen dreht den Zug.
   ========================================================= */
(function () {
  "use strict";
  const stage = document.querySelector(".hero-stage");
  if (!stage) return;
  const canvas = stage.querySelector("canvas");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fail = () => stage.classList.add("no-webgl");
  if (!window.THREE) return fail();
  try {
    const test = document.createElement("canvas");
    if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return fail();
  } catch (e) { return fail(); }

  /* ---------- Farben & Materialien ---------- */
  const C = {
    bg: 0x0a1224, ground: 0x0b1530, road: 0x0e1a36, lane: 0xffb224,
    paint: 0xf7a20f, paintDark: 0xd98c12, trailer: 0xe9eef7, stripe: 0x0f1a33,
    chassis: 0x14181f, glass: 0x0b1224, tyre: 0x15171c, rim: 0x9aa4b5, chrome: 0xcfd6e2, light: 0xfff1c8
  };
  const M = {
    paint: new THREE.MeshPhysicalMaterial({ color: C.paint, metalness: .08, roughness: .4, clearcoat: 1, clearcoatRoughness: .2 }),
    paintDark: new THREE.MeshStandardMaterial({ color: C.paintDark, metalness: .3, roughness: .5 }),
    trailer: new THREE.MeshStandardMaterial({ color: C.trailer, metalness: .05, roughness: .55 }),
    stripe: new THREE.MeshStandardMaterial({ color: C.stripe, metalness: .2, roughness: .5 }),
    chassis: new THREE.MeshStandardMaterial({ color: C.chassis, metalness: .5, roughness: .7 }),
    glass: new THREE.MeshPhysicalMaterial({ color: C.glass, metalness: .9, roughness: .08, clearcoat: 1 }),
    tyre: new THREE.MeshStandardMaterial({ color: C.tyre, roughness: .95 }),
    rim: new THREE.MeshStandardMaterial({ color: C.rim, metalness: .85, roughness: .3 }),
    chrome: new THREE.MeshStandardMaterial({ color: C.chrome, metalness: 1, roughness: .18 }),
    light: new THREE.MeshStandardMaterial({ color: C.light, emissive: C.light, emissiveIntensity: 2.2 }),
    marker: new THREE.MeshStandardMaterial({ color: 0xffb224, emissive: 0xffb224, emissiveIntensity: 1.4 }),
    tail: new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0xff2222, emissiveIntensity: 1.2 }),
    ground: new THREE.MeshStandardMaterial({ color: C.ground, roughness: 1 }),
    road: new THREE.MeshStandardMaterial({ color: C.road, roughness: .9 }),
    lane: new THREE.MeshStandardMaterial({ color: C.lane, emissive: C.lane, emissiveIntensity: .5 })
  };

  /* ---------- Szene ---------- */
  Object.values(M).forEach((m) => { m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear(); });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(C.bg, .022);

  const camera = new THREE.PerspectiveCamera(28, 1, .1, 200);
  const camBase = new THREE.Vector3(14.5, 5.8, 19);
  const camTarget = new THREE.Vector3(0, 1.8, -.5);
  camera.position.copy(camBase);

  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x0a1224, .5));
  const key = new THREE.DirectionalLight(0xfff3e0, 1.9);
  key.position.set(12, 18, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 70;
  key.shadow.camera.left = key.shadow.camera.bottom = -20;
  key.shadow.camera.right = key.shadow.camera.top = 20;
  key.shadow.bias = -.0006;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb224, .9);
  rim.position.set(-14, 6, -12);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x61c6ff, .45);
  fill.position.set(-6, 4, 16);
  scene.add(fill);

  /* Boden: unsichtbar, fängt nur den Schatten. Straße: Canvas-Textur mit weich auslaufendem Rand. */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 48), new THREE.ShadowMaterial({ color: 0x02050c, opacity: .55 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const ROAD_L = 72, ROAD_W = 10;
  const roadTex = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 2048;
    const g = c.getContext("2d");
    g.fillStyle = "#121f3d"; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "rgba(255,255,255,.55)";
    const ex = c.width * 3.6 / ROAD_W;      /* Randlinien bei ±3.6 m */
    g.fillRect(c.width / 2 - ex - 2, 0, 3, c.height); g.fillRect(c.width / 2 + ex - 1, 0, 3, c.height);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  })();
  const roadAlpha = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 2048;
    const g = c.getContext("2d");
    g.save(); g.translate(c.width / 2, c.height / 2); g.scale(c.width / 2, c.height / 2);
    const r = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.38, "rgba(255,255,255,1)"); r.addColorStop(.8, "rgba(255,255,255,0)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
    return new THREE.CanvasTexture(c);
  })();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, ROAD_L), new THREE.MeshStandardMaterial({ map: roadTex, alphaMap: roadAlpha, transparent: true, roughness: .95, depthWrite: false }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, .005, -12); road.receiveShadow = true;
  scene.add(road);
  const dashes = [], dashGeo = new THREE.BoxGeometry(.14, .012, 1.8);
  const dashFade = (z) => Math.max(0, Math.min(1, (1 - Math.abs(z) / (ROAD_L / 2)) / .55));
  for (let i = 0; i < 18; i++) {
    const m = M.lane.clone(); m.transparent = true;
    const d = new THREE.Mesh(dashGeo, m); d.position.set(0, .02, -ROAD_L / 2 - 12 + i * 4); scene.add(d); dashes.push(d);
  }

  /* ---------- Bauhilfen ---------- */
  const box = (w, h, d, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    (parent || scene).add(m); return m;
  };
  const wheels = [];
  const wheel = (x, y, z, r, w, parent) => {
    const g = new THREE.Group(); g.position.set(x, y, z);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 32), M.tyre);
    t.rotation.z = Math.PI / 2; t.castShadow = true; g.add(t);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(r * .58, r * .58, w + .02, 24), M.rim);
    h.rotation.z = Math.PI / 2; g.add(h);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * .2, r * .2, w + .06, 16), M.chassis);
    cap.rotation.z = Math.PI / 2; g.add(cap);
    for (let i = 0; i < 6; i++) { /* Radschrauben */
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, w + .07, 8), M.chassis);
      b.rotation.z = Math.PI / 2; const a = (i / 6) * Math.PI * 2;
      b.position.set(0, Math.cos(a) * r * .36, Math.sin(a) * r * .36); g.add(b);
    }
    parent.add(g); wheels.push(g); return g;
  };
  const axle = (z, y, r, w, parent, dual) => {
    if (dual) [.86, 1.2].forEach((x) => { wheel(-x, y, z, r, w, parent); wheel(x, y, z, r, w, parent); });
    else { wheel(-1.05, y, z, r, w, parent); wheel(1.05, y, z, r, w, parent); }
    const a = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 2.2, 10), M.chassis);
    a.rotation.z = Math.PI / 2; a.position.set(0, y, z); parent.add(a);
  };

  /* ---------- Zugmaschine ---------- */
  const truck = new THREE.Group();
  scene.add(truck);
  const tractor = new THREE.Group();
  truck.add(tractor);
  const R = .53;                                   /* Radradius */
  box(1.0, .3, 6.2, M.chassis, 0, .9, .1, tractor); /* Rahmen */
  box(2.6, .1, 3.2, M.chassis, 0, 1.28, -1.6, tractor); /* Deckplatte hinten */
  box(1.1, .12, 1.1, M.chassis, 0, 1.36, -1.55, tractor); /* Sattelkupplung */
  const cab = new THREE.Group(); tractor.add(cab); cab.position.y = 0;
  box(2.5, 2.5, 2.3, M.paint, 0, 2.45, 1.95, cab);       /* Fahrerhaus */
  const roof = box(2.4, .55, 1.7, M.paintDark, 0, 3.92, 1.55, cab); roof.rotation.x = -.42; /* Dachspoiler */
  box(2.3, 1.05, .06, M.glass, 0, 2.98, 3.11, cab);      /* Frontscheibe */
  box(.06, .85, 1.05, M.glass, -1.26, 2.9, 2.05, cab);   /* Seitenscheiben */
  box(.06, .85, 1.05, M.glass, 1.26, 2.9, 2.05, cab);
  box(2.2, .95, .06, M.stripe, 0, 1.78, 3.12, cab);      /* Kühlergrill */
  [1.55, 1.78, 2.0].forEach((y) => box(2.0, .05, .07, M.chrome, 0, y, 3.13, cab)); /* Grill-Lamellen */
  box(2.55, .45, .35, M.chassis, 0, 1.02, 3.0, cab);     /* Stoßfänger */
  box(.5, .2, .08, M.light, -.85, 1.35, 3.14, cab);      /* Scheinwerfer */
  box(.5, .2, .08, M.light, .85, 1.35, 3.14, cab);
  box(.3, .08, .06, M.marker, -1.05, 3.72, 3.12, cab);   /* Positionsleuchten Dach */
  box(.3, .08, .06, M.marker, 1.05, 3.72, 3.12, cab);
  [-1, 1].forEach((s) => {
    box(.1, .6, .28, M.chassis, s * 1.48, 2.75, 2.65, cab); /* Spiegel */
    box(.5, .05, .05, M.chassis, s * 1.3, 3.05, 2.65, cab);
    box(.9, .06, .4, M.chassis, s * .95, 1.45, 2.2, cab);  /* Trittstufen */
    box(.9, .06, .4, M.chassis, s * .95, 1.05, 2.2, cab);
  });
  [-1, 1].forEach((s) => { /* Tanks */
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, 1.4, 20), M.chrome);
    t.rotation.x = Math.PI / 2; t.position.set(s * 1.05, .95, .0); t.castShadow = true; tractor.add(t);
  });
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.5, 12), M.chrome);
  exhaust.position.set(1.15, 3.1, .7); tractor.add(exhaust);
  axle(2.2, R, R, .34, tractor, false);
  axle(-1.05, R, R, .3, tractor, true);
  axle(-2.35, R, R, .3, tractor, true);

  /* ---------- Auflieger ---------- */
  const trailer = new THREE.Group();
  trailer.position.set(0, 0, -1.55);               /* Drehpunkt: Sattelkupplung */
  truck.add(trailer);
  const TL = 13.6, TZ = -TL / 2 + .1;              /* Länge, Mitte relativ zum Drehpunkt */
  box(2.55, 2.75, TL, M.trailer, 0, 2.66, TZ, trailer);  /* Koffer */
  box(2.57, .5, TL - .2, M.stripe, 0, 1.55, TZ, trailer);/* Bauchbinde */
  box(2.58, .08, TL - .2, M.paint, 0, 1.86, TZ, trailer);/* Zierlinie */
  box(2.56, .1, TL, M.stripe, 0, 4.04, TZ, trailer);     /* Dachkante */
  box(1.0, .28, 5.5, M.chassis, 0, 1.12, TZ - 3.6, trailer); /* Fahrgestell */
  box(2.4, .14, .1, M.chassis, 0, .68, TZ - TL / 2 - .02, trailer); /* Unterfahrschutz */
  box(2.54, 2.55, .02, M.trailer, 0, 2.62, TZ - TL / 2 - .01, trailer); /* Türen */
  box(.03, 2.5, .04, M.stripe, 0, 2.62, TZ - TL / 2 - .02, trailer);   /* Türfuge */
  box(.4, .14, .06, M.tail, -1.0, 1.22, TZ - TL / 2 - .04, trailer);   /* Rückleuchten */
  box(.4, .14, .06, M.tail, 1.0, 1.22, TZ - TL / 2 - .04, trailer);
  [-1, 1].forEach((s) => {
    box(.05, .9, 6.5, M.stripe, s * 1.26, .95, TZ + .6, trailer);      /* Seitenschürze */
    box(.12, .75, .12, M.chassis, s * .8, .9, -2.2, trailer);          /* Stützen */
    for (let z = -1.2; z > -TL + 1; z -= 2.2) box(.06, .08, .3, M.marker, s * 1.29, 3.95, z, trailer); /* Umrissleuchten */
  });
  [-11.2, -12.5, -13.8].forEach((z) => axle(z, R, R, .3, trailer, true));

  /* Schriftzug auf beiden Seiten des Aufliegers (aus einem Canvas gezeichnet) */
  const makeLogoTexture = () => {
    const c = document.createElement("canvas"); c.width = 2048; c.height = 400;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    /* Kompass-Signet */
    g.save(); g.translate(230, 200);
    g.strokeStyle = "#0f1a33"; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 120, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#ffb224"; g.beginPath(); g.moveTo(0, -105); g.lineTo(30, 0); g.lineTo(0, 22); g.lineTo(-30, 0); g.closePath(); g.fill();
    g.fillStyle = "#0f1a33"; g.beginPath(); g.moveTo(0, 105); g.lineTo(30, 0); g.lineTo(0, -22); g.lineTo(-30, 0); g.closePath(); g.fill();
    g.restore();
    g.fillStyle = "#0f1a33"; g.textBaseline = "middle";
    g.font = "800 190px Sora, 'Segoe UI', system-ui, sans-serif";
    g.fillText("FUHRPARK", 420, 165);
    g.fillStyle = "#e0961a"; g.font = "500 190px Sora, 'Segoe UI', system-ui, sans-serif";
    g.fillText("KOMPASS", 1290, 165);
    g.fillStyle = "#33405c"; g.font = "600 46px Manrope, 'Segoe UI', system-ui, sans-serif";
    g.fillText("F L O T T E N V E R S I C H E R U N G   ·   F U H R P A R K K O M P A S S . D E", 424, 318);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  };
  const addLogos = () => {
    const tex = makeLogoTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 });
    const w = 9.2, h = w * 400 / 2048;
    [1, -1].forEach((s) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      p.position.set(s * 1.283, 2.95, TZ + .4); p.rotation.y = s * Math.PI / 2; trailer.add(p);
    });
  };
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("800 190px Sora"), document.fonts.load("600 46px Manrope")]).then(addLogos, addLogos);
  } else addLogos();

  /* Fahrlicht */
  [-.85, .85].forEach((x) => {
    const s = new THREE.SpotLight(0xfff1c8, 1.6, 34, .55, .6, 1.2);
    s.position.set(x, 1.35, 3.1); s.target.position.set(x * 2, 0, 16);
    cab.add(s); cab.add(s.target);
  });

  /* Grundausrichtung: Front zeigt nach vorn rechts */
  truck.position.z = 4.6;
  const baseYaw = .32;

  /* ---------- Größe ---------- */
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    /* schmaler Schirm: Kamera weiter weg, damit der ganze Zug ins Bild passt */
    const k = w / h < 1 ? 1.35 : 1;
    camBase.set(14.5 * k, 5.8 * k, 19 * k);
  };
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage); else addEventListener("resize", resize);
  resize();

  /* ---------- Eingaben ---------- */
  const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    target.x = (e.clientX / innerWidth) * 2 - 1;
    target.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  let scrollP = 0;
  const onScroll = () => { scrollP = Math.min(1, scrollY / (innerHeight * .9)); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  let visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(stage);

  /* ---------- Animation ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clock = new THREE.Clock();
  const start = performance.now();
  let elapsed = 0;
  const ENTRY = 2.6;                                /* Sekunden für die Einfahrt */
  const frame = () => {
    const dt = Math.min(clock.getDelta(), .05);
    elapsed = (performance.now() - start) / 1000;
    const entry = reduced ? 1 : easeOut(Math.min(1, elapsed / ENTRY));
    const speed = reduced ? 0 : 6 * (1 - entry) + 2.2;  /* m/s: Einfahrt schnell, dann Rollen */

    truck.position.z = 4.6 - (1 - entry) * 34;
    truck.position.x = (1 - entry) * -4;
    truck.rotation.y = baseYaw + (1 - entry) * -.18 + scrollP * .75 + mouse.x * .06;

    /* Räder und Straße */
    wheels.forEach((w) => { w.rotation.x -= (speed * dt) / R; });
    dashes.forEach((d) => { d.position.z -= speed * dt * 2.2; if (d.position.z < -ROAD_L / 2 - 12) d.position.z += ROAD_L; d.material.opacity = dashFade(d.position.z + 12); });

    /* Federung und leichtes Pendeln des Aufliegers */
    if (!reduced) {
      cab.position.y = Math.sin(elapsed * 2.1) * .012 + Math.sin(elapsed * 5.3) * .006;
      cab.rotation.x = Math.sin(elapsed * 1.7) * .004;
      trailer.rotation.y = Math.sin(elapsed * .9) * .006 + (1 - entry) * .08;
    }

    /* Kamera folgt der Maus weich */
    mouse.x += (target.x - mouse.x) * .05; mouse.y += (target.y - mouse.y) * .05;
    camera.position.x = camBase.x + mouse.x * 2.2;
    camera.position.y = camBase.y - mouse.y * 1.4 + scrollP * 4;
    camera.position.z = camBase.z + scrollP * 3;
    camera.lookAt(camTarget.x, camTarget.y + scrollP * -.6, camTarget.z);

    renderer.render(scene, camera);
  };
  const loop = () => {
    if (visible && !document.hidden) frame();
    requestAnimationFrame(loop);
  };
  if (reduced) { frame(); addEventListener("resize", frame); }
  else loop();
})();
