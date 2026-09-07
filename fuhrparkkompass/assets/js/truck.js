/* =========================================================
   Fuhrparkkompass — 3D-Sattelzug im Hero (Three.js r128, selbst gehostet)

   Zwei Wege:
   1. FPK.truckModel zeigt auf eine .glb/.gltf-Datei → das Modell wird
      geladen, auf Straßenmaß gebracht und animiert (Räder werden an
      Objektnamen erkannt, die "wheel", "rad", "tire" oder "tyre" enthalten).
   2. Kein Modell → ein europäischer Frontlenker mit Auflieger wird aus
      gerundeten Profilen, Drehkörpern und Canvas-Texturen aufgebaut:
      Kabine mit Windschutzscheibe, Sonnenblende, Dachspoiler, Spiegel,
      Einstieg, Scheinwerfer, Kennzeichen, Reifen mit Profil, Alufelgen,
      Koffer mit Türen, Verschlussstangen, Schürzen und Leuchten.

   Beleuchtung: Studio-Environment (PMREM) für Reflexionen auf Lack, Chrom
   und Glas, dazu Schlüssellicht mit weichen Schatten.
   ========================================================= */
(function () {
  "use strict";
  const stage = document.querySelector(".hero-stage");
  if (!stage) return;
  const canvas = stage.querySelector("canvas");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cfg = window.FPK || {};

  const fail = () => stage.classList.add("no-webgl");
  if (!window.THREE) return fail();
  try {
    const test = document.createElement("canvas");
    if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return fail();
  } catch (e) { return fail(); }

  /* ---------- Renderer, Szene, Kamera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const BG = 0x0a1224;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, .02);

  const camera = new THREE.PerspectiveCamera(26, 1, .1, 200);

  /* Studio-Umgebung: dunkler Raum mit Lichtflächen → Reflexionen */
  const buildEnvironment = () => {
    const room = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(60, 30, 60), new THREE.MeshStandardMaterial({ color: 0x1a2440, side: THREE.BackSide, roughness: 1 }));
    box.position.y = 12; room.add(box);
    const panel = (w, h, x, y, z, c, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c }));
      m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.lookAt(0, 4, 0); room.add(m);
    };
    panel(30, 8, 0, 26, 0, 0xfff4e6, 4);          /* Deckenlicht, warm */
    panel(14, 10, -28, 12, 6, 0xcfe3ff, 2.2);     /* Seite links, kühl */
    panel(14, 10, 28, 12, -8, 0xffe3b0, 1.6);     /* Seite rechts, Amber */
    panel(24, 6, 0, 8, -29, 0x9fc0ff, 1.2);       /* hinten */
    room.add(new THREE.AmbientLight(0xffffff, .2));
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(room, .04).texture;
    pmrem.dispose();
    return tex;
  };
  scene.environment = buildEnvironment();

  /* Lichter */
  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x0a1224, .35));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.1);
  key.position.set(11, 17, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 70;
  key.shadow.camera.left = key.shadow.camera.bottom = -20;
  key.shadow.camera.right = key.shadow.camera.top = 20;
  key.shadow.bias = -.0005; key.shadow.normalBias = .02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb224, .7); rim.position.set(-14, 6, -12); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x61c6ff, .35); fill.position.set(-6, 4, 16); scene.add(fill);

  /* ---------- Materialien ---------- */
  const srgb = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const M = {
    paint: new THREE.MeshPhysicalMaterial({ color: srgb(0xf3f6fa), metalness: .1, roughness: .3, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.0 }),
    gloss: new THREE.MeshPhysicalMaterial({ color: srgb(0x0b0d11), metalness: .2, roughness: .25, clearcoat: 1, clearcoatRoughness: .15 }),
    paintDark: new THREE.MeshPhysicalMaterial({ color: srgb(0x0f1a33), metalness: .2, roughness: .35, clearcoat: .8, clearcoatRoughness: .2 }),
    plastic: new THREE.MeshStandardMaterial({ color: srgb(0x1b1e24), roughness: .72, metalness: .05 }),
    plasticLight: new THREE.MeshStandardMaterial({ color: srgb(0x3a3f48), roughness: .6, metalness: .05 }),
    chassis: new THREE.MeshStandardMaterial({ color: srgb(0x15181d), roughness: .8, metalness: .35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: srgb(0x0c1a2e), metalness: .45, roughness: .03, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 2 }),
    chrome: new THREE.MeshStandardMaterial({ color: srgb(0xe4e8ee), metalness: 1, roughness: .12 }),
    alu: new THREE.MeshStandardMaterial({ color: srgb(0xc9ced8), metalness: .9, roughness: .3 }),
    aluBrushed: new THREE.MeshStandardMaterial({ color: srgb(0xaeb4bf), metalness: .85, roughness: .45 }),
    trailer: new THREE.MeshPhysicalMaterial({ color: srgb(0xeef1f6), metalness: .05, roughness: .42, clearcoat: .3, clearcoatRoughness: .3 }),
    trailerRoof: new THREE.MeshStandardMaterial({ color: srgb(0xd7dce4), metalness: .3, roughness: .55 }),
    tyre: new THREE.MeshStandardMaterial({ color: srgb(0x17191d), roughness: .92, metalness: 0 }),
    headlamp: new THREE.MeshStandardMaterial({ color: srgb(0xf4f8ff), emissive: srgb(0xfff5dc), emissiveIntensity: 1.6, roughness: .2 }),
    led: new THREE.MeshStandardMaterial({ color: srgb(0xffffff), emissive: srgb(0xf0f6ff), emissiveIntensity: 3, roughness: .3 }),
    amber: new THREE.MeshStandardMaterial({ color: srgb(0xff9d1a), emissive: srgb(0xff9d1a), emissiveIntensity: 1.2, roughness: .3 }),
    red: new THREE.MeshStandardMaterial({ color: srgb(0xd42020), emissive: srgb(0xff2a2a), emissiveIntensity: 1.1, roughness: .3 }),
    reflector: new THREE.MeshStandardMaterial({ color: srgb(0xffb224), roughness: .25, metalness: .3 }),
    lane: new THREE.MeshStandardMaterial({ color: srgb(0xffb224), emissive: srgb(0xffb224), emissiveIntensity: .45, transparent: true })
  };

  /* ---------- Geometrie-Helfer ---------- */
  const add = (geo, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m;
  };
  const rrect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  };
  /* Quader mit gerundeten Kanten: Radius r an den Längskanten, Fase b an den Stirnflächen */
  const rbox = (w, h, d, r, b) => {
    b = Math.min(b === undefined ? .03 : b, d / 2 - .001, w / 2 - .001, h / 2 - .001);
    const g = new THREE.ExtrudeGeometry(rrect(w - 2 * b, h - 2 * b, Math.max(0, r - b)), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 8 });
    g.center(); return g;
  };
  const cyl = (r, h, seg) => new THREE.CylinderGeometry(r, r, h, seg || 24);
  const wheels = [];
  const R = .53;

  /* Reifen: Drehkörper mit gerundeter Schulter, Profil aus einer Canvas-Bumpmap */
  const treadTex = (() => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#808080"; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#2a2a2a";
    for (let x = 0; x < c.width; x += 16) { g.fillRect(x, 24, 7, 80); g.fillRect(x + 8, 18, 3, 92); }
    for (let y = 30; y < 100; y += 22) g.fillRect(0, y, c.width, 3);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); return t;
  })();
  const tyreMat = M.tyre.clone(); tyreMat.bumpMap = treadTex; tyreMat.bumpScale = .012;
  const makeWheel = (r, w, dual) => {
    const g = new THREE.Group();
    const one = (off) => {
      const ri = r * .66, hw = w / 2;
      const p = [new THREE.Vector2(ri, -hw), new THREE.Vector2(r * .93, -hw), new THREE.Vector2(r * .985, -hw + .035), new THREE.Vector2(r, -hw + .08),
        new THREE.Vector2(r, hw - .08), new THREE.Vector2(r * .985, hw - .035), new THREE.Vector2(r * .93, hw), new THREE.Vector2(ri, hw)];
      const t = new THREE.Mesh(new THREE.LatheGeometry(p, 48), tyreMat);
      t.rotation.z = Math.PI / 2; t.position.x = off; t.castShadow = true; g.add(t);
      /* Felge: Schüssel mit Nabe */
      const rp = [new THREE.Vector2(0, hw * .55), new THREE.Vector2(r * .18, hw * .55), new THREE.Vector2(r * .26, hw * .3), new THREE.Vector2(r * .5, hw * .2), new THREE.Vector2(r * .62, hw * .5), new THREE.Vector2(r * .67, hw * .92), new THREE.Vector2(r * .67, -hw), new THREE.Vector2(0, -hw)];
      const rim = new THREE.Mesh(new THREE.LatheGeometry(rp, 40), M.alu);
      rim.rotation.z = Math.PI / 2; rim.position.x = off; rim.castShadow = true; g.add(rim);
      /* Radmuttern und Lüftungslöcher */
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const n = new THREE.Mesh(cyl(r * .028, .04, 8), M.chrome);
        n.rotation.z = Math.PI / 2; n.position.set(off + hw * .57, Math.cos(a) * r * .2, Math.sin(a) * r * .2); g.add(n);
        const hole = new THREE.Mesh(cyl(r * .045, .02, 10), M.plastic);
        hole.rotation.z = Math.PI / 2; hole.position.set(off + hw * .36, Math.cos(a + .3) * r * .4, Math.sin(a + .3) * r * .4); g.add(hole);
      }
    };
    if (dual) { one(-w * .52); one(w * .52); } else one(0);
    return g;
  };
  const axle = (z, r, w, parent, dual, track) => {
    track = track || 1.03;
    [-1, 1].forEach((s) => {
      const wh = makeWheel(r, w, dual); wh.position.set(s * (dual ? track - w * .5 : track), r, z);
      if (s < 0) wh.rotation.y = Math.PI; parent.add(wh); wheels.push(wh);
    });
    const a = new THREE.Mesh(cyl(.09, 2.1, 12), M.chassis); a.rotation.z = Math.PI / 2; a.position.set(0, r, z); parent.add(a);
    /* Kotflügel */
    [-1, 1].forEach((s) => {
      const f = new THREE.Mesh(new THREE.TorusGeometry(r + .1, .05, 8, 24, Math.PI * 1.05), M.plastic);
      f.rotation.y = Math.PI / 2; f.rotation.z = -.08; f.position.set(s * (dual ? track + w * .2 : track), r, z); f.scale.set(1, 1, dual ? w * 3.4 : w * 2.2); parent.add(f);
    });
  };

  /* Canvas-Texturen */
  const tex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), c); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
  const plateTex = tex(520, 110, (g) => {
    g.fillStyle = "#f5f7fa"; g.fillRect(0, 0, 520, 110);
    g.fillStyle = "#1d4ed8"; g.fillRect(0, 0, 58, 110);
    g.fillStyle = "#fff"; g.font = "bold 22px sans-serif"; g.textAlign = "center"; g.fillText("D", 29, 96);
    g.fillStyle = "#ffcf3f"; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.arc(29 + Math.cos(a) * 18, 42 + Math.sin(a) * 18, 2.2, 0, 7); g.fill(); }
    g.fillStyle = "#111"; g.font = "bold 74px 'Arial Narrow', Arial, sans-serif"; g.textAlign = "left"; g.fillText("FK  KO 2026", 80, 82);
  });
  const emblemTex = tex(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256); g.translate(128, 128);
    g.strokeStyle = "#e6e9ef"; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.stroke();
    g.fillStyle = "#ffb224"; g.beginPath(); g.moveTo(0, -84); g.lineTo(24, 0); g.lineTo(0, 16); g.lineTo(-24, 0); g.closePath(); g.fill();
    g.fillStyle = "#e6e9ef"; g.beginPath(); g.moveTo(0, 84); g.lineTo(24, 0); g.lineTo(0, -16); g.lineTo(-24, 0); g.closePath(); g.fill();
  });
  const meshTex = tex(256, 64, (g, c) => {
    g.fillStyle = "#0a0c10"; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#4a5160";
    for (let y = 4; y < c.height; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < c.width; x += 8) { g.beginPath(); g.arc(x + 2, y, 2.2, 0, 7); g.fill(); }
  });
  meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping; meshTex.repeat.set(6, 1);
  const wordTex = (fg, bg) => tex(1024, 140, (g, c) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); } else g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = fg; g.textBaseline = "middle"; g.textAlign = "center";
    g.font = "800 96px Sora, 'Segoe UI', system-ui, sans-serif"; g.fillText("FUHRPARKKOMPASS", 512, 70);
  });
  const skirtTex = tex(2048, 280, (g, c) => {
    g.clearRect(0, 0, c.width, c.height); g.textBaseline = "middle";
    g.fillStyle = "#0f1a33"; g.font = "800 120px Sora, 'Segoe UI', system-ui, sans-serif"; g.fillText("FUHRPARK", 60, 120);
    const w = g.measureText("FUHRPARK").width;
    g.fillStyle = "#e0961a"; g.font = "500 120px Sora, 'Segoe UI', system-ui, sans-serif"; g.fillText("KOMPASS", 60 + w + 6, 120);
    g.fillStyle = "#66748f"; g.font = "600 44px Manrope, 'Segoe UI', system-ui, sans-serif"; g.fillText("FLOTTENVERSICHERUNG · FUHRPARKKOMPASS.DE", 66, 222);
  });
  const liveryTex = tex(4096, 860, (g, c) => {
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = "#0f1a33"; g.fillRect(0, 680, c.width, 180);          /* Bauchbinde */
    g.fillStyle = "#ffb224"; g.fillRect(0, 662, c.width, 14);           /* Zierlinie */
    g.save(); g.translate(560, 330);                                     /* Kompass-Signet */
    g.strokeStyle = "#0f1a33"; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, 170, 0, 7); g.stroke();
    g.strokeStyle = "rgba(15,26,51,.35)"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 118, 0, 7); g.stroke();
    g.fillStyle = "#ffb224"; g.beginPath(); g.moveTo(0, -150); g.lineTo(42, 0); g.lineTo(0, 30); g.lineTo(-42, 0); g.closePath(); g.fill();
    g.fillStyle = "#0f1a33"; g.beginPath(); g.moveTo(0, 150); g.lineTo(42, 0); g.lineTo(0, -30); g.lineTo(-42, 0); g.closePath(); g.fill();
    g.fillStyle = "rgba(15,26,51,.45)"; g.beginPath(); g.moveTo(-150, 0); g.lineTo(0, -30); g.lineTo(30, 0); g.lineTo(0, 30); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(150, 0); g.lineTo(0, -30); g.lineTo(-30, 0); g.lineTo(0, 30); g.closePath(); g.fill();
    g.restore();
    g.textBaseline = "middle"; g.fillStyle = "#0f1a33";
    g.font = "800 250px Sora, 'Segoe UI', system-ui, sans-serif"; g.fillText("FUHRPARK", 830, 300);
    const w1 = g.measureText("FUHRPARK").width;
    g.fillStyle = "#e0961a"; g.font = "500 250px Sora, 'Segoe UI', system-ui, sans-serif"; g.fillText("KOMPASS", 830 + w1 + 10, 300);
    g.fillStyle = "#33405c"; g.font = "600 54px Manrope, 'Segoe UI', system-ui, sans-serif";
    g.fillText("F L O T T E N V E R S I C H E R U N G   F Ü R   S P E D I T I O N E N   &   F U H R P A R K S", 838, 500);
    g.fillStyle = "#eef1f6"; g.font = "700 64px Manrope, 'Segoe UI', system-ui, sans-serif"; g.fillText("www.fuhrparkkompass.de", 3050, 770);
  });
  const liveryMat = new THREE.MeshPhysicalMaterial({ map: liveryTex, transparent: true, roughness: .42, metalness: .05, clearcoat: .3, polygonOffset: true, polygonOffsetFactor: -2 });

  /* ---------- Straße ---------- */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 48), new THREE.ShadowMaterial({ color: 0x02050c, opacity: .6 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const ROAD_L = 80, ROAD_W = 10, ROAD_Z = 0;
  const roadTex = tex(512, 2048, (g, c) => {
    const img = g.createImageData(c.width, c.height), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = 26 + Math.random() * 22; d[i] = v; d[i + 1] = v + 6; d[i + 2] = v + 18; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    g.fillStyle = "rgba(0,0,0,.12)"; [150, 195, 318, 362].forEach((x) => g.fillRect(x, 0, 14, c.height));   /* Fahrspuren */
    g.fillStyle = "rgba(255,255,255,.62)"; const ex = c.width * 3.6 / ROAD_W;
    g.fillRect(c.width / 2 - ex - 3, 0, 5, c.height); g.fillRect(c.width / 2 + ex - 2, 0, 5, c.height);
  });
  const roadAlpha = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 2048; const g = c.getContext("2d");
    g.save(); g.translate(128, 1024); g.scale(128, 1024);
    const r = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    r.addColorStop(0, "#fff"); r.addColorStop(.3, "#fff"); r.addColorStop(.55, "rgba(255,255,255,0)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore();
    return new THREE.CanvasTexture(c);
  })();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, ROAD_L), new THREE.MeshStandardMaterial({ map: roadTex, alphaMap: roadAlpha, transparent: true, roughness: .96, metalness: 0, depthWrite: false }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, .004, ROAD_Z); road.receiveShadow = true; scene.add(road);
  const dashFade = (z) => Math.max(0, Math.min(1, (22 - Math.abs(z)) / 10));
  /* Alles, was am Fahrzeug vorbeizieht: Objekte laufen nach -z, springen am Ende zurück und blenden an den Rändern aus */
  const movers = [];
  const mover = (obj, z, mats) => { obj.position.z = z; obj.userData.mats = mats; scene.add(obj); movers.push(obj); return obj; };
  const laneMat = new THREE.MeshStandardMaterial({ color: srgb(0xf2f4f8), emissive: srgb(0xffffff), emissiveIntensity: .25, transparent: true, roughness: .8 });
  const dashGeo = new THREE.BoxGeometry(.14, .01, 2.0);
  for (let i = 0; i < 18; i++) { const m = laneMat.clone(); const d = new THREE.Mesh(dashGeo, m); d.position.set(0, .012, 0); mover(d, ROAD_Z - ROAD_L / 2 + i * 4, [m]); }
  /* Leitpfosten (weiß, schwarzer Ring, Reflektor) im Abstand von 8 m */
  const postWhite = new THREE.MeshStandardMaterial({ color: srgb(0xf4f6fa), roughness: .6, transparent: true });
  const postBlack = new THREE.MeshStandardMaterial({ color: srgb(0x15181d), roughness: .7, transparent: true });
  const postRefl = new THREE.MeshStandardMaterial({ color: srgb(0xffb224), emissive: srgb(0xffb224), emissiveIntensity: .9, transparent: true });
  const makePost = (side) => {
    const g = new THREE.Group(), mats = [postWhite.clone(), postBlack.clone(), postRefl.clone()];
    const p = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.0, .1), mats[0]); p.position.y = .5; p.castShadow = true; g.add(p);
    const b = new THREE.Mesh(new THREE.BoxGeometry(.125, .16, .105), mats[1]); b.position.y = .78; g.add(b);
    const r = new THREE.Mesh(new THREE.BoxGeometry(.05, .1, .02), mats[2]); r.position.set(0, .78, side < 0 ? .06 : -.06); g.add(r);
    g.position.x = side * 4.6; return [g, mats];
  };
  for (let i = 0; i < 10; i++) [-1, 1].forEach((side) => { const [g, mats] = makePost(side); mover(g, ROAD_Z - ROAD_L / 2 + i * 8 + (side > 0 ? 4 : 0), mats); });
  /* Leitplanke auf der abgewandten Seite: Holm mit Pfosten, Segmente von 4 m */
  const railMat = new THREE.MeshStandardMaterial({ color: srgb(0xb9c0cc), metalness: .8, roughness: .4, transparent: true });
  for (let i = 0; i < 20; i++) {
    const g = new THREE.Group(), m = railMat.clone();
    const beam = new THREE.Mesh(new THREE.BoxGeometry(.06, .31, 4.02), m); beam.position.y = .62; beam.castShadow = true; g.add(beam);
    const post = new THREE.Mesh(new THREE.BoxGeometry(.1, .75, .1), m); post.position.y = .37; g.add(post);
    g.position.x = -5.3; mover(g, ROAD_Z - ROAD_L / 2 + i * 4, [m]);
  }

  /* ---------- Sattelzug ---------- */
  const truck = new THREE.Group(); scene.add(truck);
  const rig = new THREE.Group(); rig.position.z = 7.2; truck.add(rig);   /* Drehpunkt = Zugmitte */
  const tractor = new THREE.Group(); rig.add(tractor);
  const cab = new THREE.Group(); tractor.add(cab);
  const trailer = new THREE.Group(); rig.add(trailer);

  const buildProcedural = () => {
    /* Rahmen und Anbauteile */
    add(new THREE.BoxGeometry(.95, .28, 5.4), M.chassis, 0, .95, -1.4, tractor);
    add(rbox(2.45, .08, 2.4, .02), M.aluBrushed, 0, 1.15, -2.9, tractor);            /* Riffelblech-Deck */
    add(rbox(1.1, .12, 1.0, .05), M.chassis, 0, 1.24, -2.8, tractor);                /* Sattelkupplung */
    [-1, 1].forEach((s) => {
      add(cyl(.34, 1.5, 28), M.alu, s * .84, .78, -1.2, tractor).rotation.x = Math.PI / 2;   /* Tank */
      [-.5, .5].forEach((o) => add(new THREE.TorusGeometry(.36, .018, 6, 32), M.chassis, s * .84, .78, -1.2 + o, tractor));
      add(rbox(.5, .5, .9, .04), M.plastic, s * .9, .7, -2.35, tractor);            /* Batteriekasten */
      add(rbox(.06, 1.0, 2.75, .05), M.paint, s * 1.25, .7, -1.5, tractor);            /* Seitenverkleidung */
      const st = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2 * 280 / 2048), new THREE.MeshStandardMaterial({ map: skirtTex, transparent: true, roughness: .45, polygonOffset: true, polygonOffsetFactor: -2 }));
      st.position.set(s * 1.284, .78, -1.5); st.rotation.y = s * Math.PI / 2; tractor.add(st);
    });
    add(rbox(2.3, .12, .12, .04), M.chassis, 0, .55, -4.15, tractor);                 /* Heckquerträger */
    [-1, 1].forEach((s) => add(rbox(.34, .1, .05, .02), M.red, s * .9, .62, -4.2, tractor));

    /* Fahrerhaus: Seitenprofil (z,y) extrudiert über die Breite */
    const prof = new THREE.Shape();                     /* um die Fase (.08) eingezogen */
    prof.moveTo(1.17, 1.63); prof.lineTo(1.20, 1.95);
    prof.lineTo(.96, 3.4);
    prof.quadraticCurveTo(.87, 3.84, .5, 3.87);
    prof.lineTo(-1.1, 3.9); prof.quadraticCurveTo(-1.24, 3.9, -1.24, 3.7);
    prof.lineTo(-1.24, 1.78); prof.quadraticCurveTo(-1.24, 1.63, -1.1, 1.63); prof.lineTo(1.17, 1.63);
    const cabGeo = new THREE.ExtrudeGeometry(prof, { depth: 2.34, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 4, curveSegments: 10 });
    cabGeo.rotateY(-Math.PI / 2); cabGeo.translate(1.17, 0, 0);
    const cabBody = new THREE.Mesh(cabGeo, M.paint); cabBody.castShadow = true; cabBody.receiveShadow = true; cab.add(cabBody);

    /* Windschutzscheibe (geneigt), Seitenscheiben, Türfugen */
    const tilt = -Math.atan2(.24, 1.45);
    const wsFrame = new THREE.Mesh(new THREE.ShapeGeometry(rrect(2.4, 1.54, .14), 8), M.plastic);
    wsFrame.position.set(0, 2.68, 1.18); wsFrame.rotation.x = tilt; cab.add(wsFrame);
    const ws = new THREE.Mesh(new THREE.ShapeGeometry(rrect(2.28, 1.42, .1), 8), M.glass);
    ws.position.set(0, 2.68, 1.195); ws.rotation.x = tilt; cab.add(ws);
    [-1, 1].forEach((s) => {
      const sf = new THREE.Mesh(new THREE.ShapeGeometry(rrect(1.15, .92, .1), 8), M.plastic);
      sf.position.set(s * 1.252, 2.95, .3); sf.rotation.y = s * Math.PI / 2; cab.add(sf);
      const sw = new THREE.Mesh(new THREE.ShapeGeometry(rrect(1.05, .82, .08), 8), M.glass);
      sw.position.set(s * 1.256, 2.95, .3); sw.rotation.y = s * Math.PI / 2; cab.add(sw);
      add(new THREE.BoxGeometry(.012, 2.0, .014), M.plastic, s * 1.252, 2.55, .9, cab);
      add(new THREE.BoxGeometry(.012, 2.0, .014), M.plastic, s * 1.252, 2.55, -.35, cab);
      add(new THREE.BoxGeometry(.012, .014, 1.25), M.plastic, s * 1.252, 1.62, .275, cab);
      add(rbox(.05, .04, .22, .02, .01), M.chrome, s * 1.265, 2.35, .7, cab);           /* Türgriff */
      /* Einstieg: Aussparung mit drei Stufen */
      add(rbox(.5, .95, .95, .03), M.plastic, s * 1.03, 1.05, -.85, cab);
      [.72, 1.0, 1.28].forEach((y) => add(rbox(.52, .04, .8, .01, .01), M.aluBrushed, s * 1.06, y, -.85, cab));
      /* Spiegelarm mit Haupt- und Weitwinkelspiegel */
      add(new THREE.BoxGeometry(.28, .05, .05), M.plastic, s * 1.45, 3.15, 1.0, cab);
      add(new THREE.BoxGeometry(.05, .75, .05), M.plastic, s * 1.58, 2.85, 1.0, cab);
      add(rbox(.1, .5, .24, .04), M.plastic, s * 1.6, 2.72, 1.0, cab);
      add(rbox(.1, .22, .22, .04), M.plastic, s * 1.6, 3.15, 1.0, cab);
      add(new THREE.BoxGeometry(.01, .44, .2), M.chrome, s * 1.66, 2.72, 1.0, cab);
      add(rbox(.06, 2.3, .55, .03), M.paint, s * 1.22, 2.75, -1.55, cab);             /* Windleitflügel */
      add(rbox(.5, .5, .6, .06), M.plastic, s * 1.03, 1.3, .95, cab);                 /* Schürze vor dem Rad */
      add(rbox(.32, .16, .1, .04, .01), M.chrome, s * .92, 3.86, 1.04, cab);            /* LED-Dachleuchte */
      add(rbox(.24, .1, .04, .03, .005), M.led, s * .92, 3.86, 1.1, cab);
      add(rbox(.2, .06, .1, .03), M.amber, s * .98, 4.02, .5, cab);                    /* Positionsleuchte */
    });
    /* Sonnenblende und Dachspoiler mit Seitenteilen */
    add(rbox(2.36, .1, .34, .03), M.paint, 0, 3.52, 1.06, cab);
    add(rbox(1.7, .02, .02, .005, .005), M.led, 0, 3.46, 1.22, cab);                    /* LED-Leiste unter der Blende */
    const sp = new THREE.Shape(); sp.moveTo(.45, 3.98); sp.quadraticCurveTo(.1, 4.62, -.45, 4.66); sp.lineTo(-1.25, 4.66); sp.lineTo(-1.25, 3.98); sp.lineTo(.45, 3.98);
    const spGeo = new THREE.ExtrudeGeometry(sp, { depth: 2.2, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3, curveSegments: 10 });
    spGeo.rotateY(-Math.PI / 2); spGeo.translate(1.15, 0, 0);
    const spoiler = new THREE.Mesh(spGeo, M.paint); spoiler.castShadow = true; cab.add(spoiler);
    [-1, 1].forEach((s) => add(rbox(.05, .6, .4, .02), M.paint, s * 1.2, 4.33, -1.1, cab));
    [-.6, 0, .6].forEach((x) => add(rbox(.14, .05, .1, .02), M.amber, x, 3.66, 1.16, cab));   /* Dachmarkierungsleuchten */
    /* Front: schwarzes Panel mit Wabengrill und Wortmarke, Chrom-Scheinwerfer, weißer Stoßfänger */
    const grille = new THREE.MeshStandardMaterial({ map: meshTex, roughness: .55, metalness: .4 });
    add(rbox(1.95, 1.12, .06, .1, .01), M.gloss, 0, 1.44, 1.30, cab);
    [1.66, 1.42, 1.18].forEach((y) => { add(rbox(1.62, .17, .03, .03, .005), grille, 0, y, 1.335, cab); add(rbox(1.66, .018, .03, .005, .003), M.chrome, 0, y - .1, 1.34, cab); });
    const word = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15 * 140 / 1024), new THREE.MeshStandardMaterial({ map: wordTex("#ffffff"), transparent: true, roughness: .4, metalness: .3 }));
    word.position.set(0, 1.88, 1.336); cab.add(word);
    const emblem = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshStandardMaterial({ map: emblemTex, transparent: true, metalness: .8, roughness: .25 }));
    emblem.position.set(.72, 1.66, 1.355); cab.add(emblem);
    add(rbox(2.5, .48, .5, .12, .05), M.paint, 0, 1.28, 1.02, cab);                    /* Stoßfänger oben */
    add(rbox(2.55, .62, .55, .12, .05), M.paint, 0, .72, 1.0, cab);                    /* Stoßfänger unten */
    add(rbox(1.5, .26, .06, .04, .01), grille, 0, .6, 1.28, cab);                      /* Lufteinlass */
    [-1, 1].forEach((s) => {
      add(rbox(.34, .34, .1, .07, .02), M.chrome, s * 1.08, 1.16, 1.27, cab);         /* Scheinwerfer-Bezel */
      add(rbox(.26, .26, .04, .05, .01), M.headlamp, s * 1.08, 1.16, 1.31, cab);
      add(rbox(.26, .03, .02, .01, .005), M.led, s * 1.08, 1.31, 1.335, cab);         /* LED-Winkel */
      add(rbox(.03, .26, .02, .01, .005), M.led, s * 1.2, 1.18, 1.335, cab);
      add(rbox(.12, .06, .03, .02, .005), M.amber, s * .95, 1.32, 1.33, cab);         /* Blinker */
      add(new THREE.CircleGeometry(.075, 20), M.chrome, s * 1.0, .62, 1.285, cab);    /* Nebel-Bezel */
      add(new THREE.CircleGeometry(.055, 16), M.headlamp, s * 1.0, .62, 1.29, cab);
      add(rbox(.5, .05, .4, .01, .005), M.aluBrushed, s * .92, .43, 1.0, cab);        /* Trittstufe vorn */
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(.52, .11), new THREE.MeshStandardMaterial({ map: plateTex, roughness: .5 }));
    plate.position.set(0, .93, 1.34); cab.add(plate);
    add(cyl(.06, 1.2, 12), M.chrome, 1.2, 2.6, -1.62, cab);                            /* Auspuff */
    [-.7, .7].forEach((x) => add(cyl(.05, .4, 10), M.chrome, x, 4.2, .9, cab).rotation.x = Math.PI / 2);   /* Hörner */

    /* Achsen Zugmaschine */
    axle(.35, R, .38, tractor, false, 1.0);
    axle(-3.35, .51, .3, tractor, true, 1.02);

    /* Auflieger */
    const TL = 13.6, TZ = -2.05 - TL / 2;
    add(rbox(2.55, 2.8, TL, .07, .03), M.trailer, 0, 2.6, TZ, trailer);
    add(new THREE.PlaneGeometry(2.5, TL - .1), M.trailerRoof, 0, 4.005, TZ, trailer).rotation.x = -Math.PI / 2;
    [1, -1].forEach((s) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(13.4, 13.4 * 860 / 4096), liveryMat);
      p.position.set(s * 1.278, 2.6, TZ); p.rotation.y = s * Math.PI / 2; trailer.add(p);
      add(rbox(.05, .75, 7.2, .02), M.trailer, s * 1.27, .85, TZ + .6, trailer);        /* Schürze */
      for (let z = TZ + TL / 2 - .6; z > TZ - TL / 2 + .5; z -= 2.2) { add(rbox(.05, .08, .26, .02), M.amber, s * 1.29, 3.95, z, trailer); add(rbox(.05, .05, .2, .01), M.reflector, s * 1.29, 1.3, z, trailer); }
    });
    add(rbox(2.3, .3, .05, .03, .01), M.plastic, 0, 1.6, TZ + TL / 2 + .03, trailer);
    add(new THREE.BoxGeometry(.95, .3, 6.5), M.chassis, 0, 1.05, TZ - 3.3, trailer);
    [-1, 1].forEach((s) => { add(new THREE.BoxGeometry(.12, .8, .12), M.chassis, s * .75, .8, TZ + 3.5, trailer); add(new THREE.BoxGeometry(.3, .06, .3), M.chassis, s * .75, .42, TZ + 3.5, trailer); });
    add(rbox(2.35, .14, .1, .04), M.aluBrushed, 0, .55, TZ - TL / 2 - .02, trailer);
    [-1, 1].forEach((s) => add(new THREE.BoxGeometry(.1, .5, .1), M.chassis, s * .7, .85, TZ - TL / 2 + .05, trailer));
    /* Hecktüren: Fuge, Verschlussstangen, Scharniere, Leuchten, Schmutzfänger */
    const back = TZ - TL / 2 - .005;
    add(new THREE.BoxGeometry(.03, 2.55, .02), M.plastic, 0, 2.6, back, trailer);
    [-.95, -.35, .35, .95].forEach((x) => {
      add(cyl(.02, 2.5, 10), M.chrome, x, 2.6, back - .04, trailer);
      [1.6, 3.6].forEach((y) => add(rbox(.1, .08, .06, .02, .01), M.plastic, x, y, back - .05, trailer));
      add(rbox(.04, .3, .05, .01, .005), M.plasticLight, x + .07, 1.75, back - .07, trailer);
    });
    [1.5, 2.6, 3.7].forEach((y) => [-1, 1].forEach((s) => add(rbox(.06, .18, .05, .02, .01), M.plasticLight, s * 1.27, y, back - .03, trailer)));
    [-1, 1].forEach((s) => {
      add(rbox(.4, .22, .06, .03, .01), M.plastic, s * 1.0, .95, back - .03, trailer);
      add(rbox(.12, .09, .03, .02, .005), M.red, s * .86, .95, back - .06, trailer);
      add(rbox(.12, .09, .03, .02, .005), M.amber, s * 1.0, .95, back - .06, trailer);
      add(rbox(.1, .09, .03, .02, .005), M.led, s * 1.13, .95, back - .06, trailer);
      add(rbox(.05, .18, .04, .01, .005), M.red, s * 1.25, 3.9, back - .02, trailer);
      add(new THREE.BoxGeometry(.45, .35, .02), M.plastic, s * 1.0, .38, TZ - TL / 2 + .55, trailer);
    });
    const plate2 = new THREE.Mesh(new THREE.PlaneGeometry(.52, .11), new THREE.MeshStandardMaterial({ map: plateTex, roughness: .5 }));
    plate2.position.set(0, .95, back - .07); plate2.rotation.y = Math.PI; trailer.add(plate2);
    [TZ - TL / 2 + 1.3, TZ - TL / 2 + 2.6, TZ - TL / 2 + 3.9].forEach((z) => axle(z, .53, .38, trailer, false, 1.0));

    /* Fahrlicht */
    [-.88, .88].forEach((x) => {
      const s = new THREE.SpotLight(0xfff1c8, 1.4, 34, .5, .6, 1.2);
      s.position.set(x, 1.22, 1.3); s.target.position.set(x * 2, 0, 16); cab.add(s); cab.add(s.target);
    });
  };

  /* Echtes Modell laden, falls konfiguriert */
  const loadGltf = (url) => new Promise((res, rej) => new THREE.GLTFLoader().load(url, (g) => res(g.scene), undefined, rej));
  const prepMesh = (o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) { o.material.envMapIntensity = .9; if (o.material.map) o.material.map.anisotropy = 8; } } };
  const loadModel = async (url) => {
    if (!THREE.GLTFLoader) throw new Error("GLTFLoader fehlt");
    const model = new THREE.Group();                       /* Modellkoordinaten */
    const body = await loadGltf(url); body.traverse(prepMesh);
    const off = cfg.truckBodyOffset || [0, 0, 0]; body.position.set(off[0], off[1], off[2]); model.add(body);
    const wheelDefs = cfg.truckWheels || [];
    const cache = {};
    for (const w of wheelDefs) {
      if (!cache[w.file]) cache[w.file] = await loadGltf(w.file);
      const g = new THREE.Group(); const m = cache[w.file].clone(); m.traverse(prepMesh);
      if (w.mirror) m.scale.x = -1;
      g.add(m); g.position.set(w.x, w.y, w.z); g.userData.r = w.r || .5; model.add(g); wheels.push(g);
    }
    /* Beschriftung auf beiden Seiten */
    const bb = new THREE.Box3().setFromObject(body), size = bb.getSize(new THREE.Vector3());
    const L = cfg.truckLivery;
    if (L) {
      const w = size.z * (L.z1 - L.z0), h = size.y * (L.y1 - L.y0), ratio = 860 / 4096;
      const pw = Math.min(w, h / ratio), ph = pw * ratio;
      const zc = bb.min.z + size.z * (L.z0 + L.z1) / 2, yc = bb.min.y + size.y * (L.y0 + L.y1) / 2;
      [1, -1].forEach((s) => {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), liveryMat);
        p.position.set(s > 0 ? bb.max.x + .012 : bb.min.x - .012, yc, zc); p.rotation.y = s * Math.PI / 2; model.add(p);
      });
    }
    /* Auf Straßenmaß bringen, Boden auf y = 0, Mitte auf den Drehpunkt */
    const full = new THREE.Box3().setFromObject(model), fs = full.getSize(new THREE.Vector3());
    const scale = (cfg.truckLength || 16.5) / Math.max(fs.x, fs.z);
    const holder = new THREE.Group(); holder.add(model); model.scale.setScalar(scale);
    const ground = cfg.truckGround !== undefined ? cfg.truckGround : full.min.y;
    const c = full.getCenter(new THREE.Vector3());
    model.position.set(-c.x * scale, -ground * scale, -c.z * scale);
    holder.rotation.y = cfg.truckRotationY || 0;
    holder.position.z = -7.2;                              /* hebt den Rig-Versatz auf: Mitte = Drehpunkt */
    tractor.add(holder);
    wheels.forEach((w) => { w.userData.r = (w.userData.r || .5) * scale; });
    return holder;
  };

  const ready = cfg.truckModel
    ? loadModel(cfg.truckModel).catch((e) => { console.warn("3D-Modell konnte nicht geladen werden, Ersatzmodell wird gezeigt.", e); buildProcedural(); })
    : Promise.resolve(buildProcedural());

  const HOME_Z = 0;
  truck.position.z = HOME_Z;
  const baseYaw = .22;

  /* ---------- Größe und Kamera: das ganze Fahrzeug bleibt in jedem Seitenverhältnis sichtbar ---------- */
  const viewDir = new THREE.Vector3(16.3, 5.0, 20.8).normalize();
  const fit = { r: 9, c: new THREE.Vector3(0, 1.8, 0) };
  const measure = () => {
    const bb = new THREE.Box3().setFromObject(truck);
    if (bb.isEmpty()) return;
    const sphere = bb.getBoundingSphere(new THREE.Sphere());
    fit.r = sphere.radius; fit.c.copy(sphere.center);
  };
  const placeCamera = () => {
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist = (fit.r * 1.12) / Math.sin(Math.min(vFov, hFov) / 2);
    camera.position.copy(fit.c).addScaledVector(viewDir, dist);
    camera.lookAt(fit.c.x, fit.c.y - fit.r * .08, fit.c.z);
  };
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    placeCamera();
  };
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage); else addEventListener("resize", resize);
  resize();

  let visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(stage);

  /* ---------- Animation: gleichmäßiges Rollen ---------- */
  const clock = new THREE.Clock();
  const start = performance.now();
  const SPEED = 6;                                        /* m/s */
  const frame = () => {
    const dt = Math.min(clock.getDelta(), .05);
    const elapsed = (performance.now() - start) / 1000;
    const speed = reduced ? 0 : SPEED;

    truck.position.set(0, 0, HOME_Z);
    truck.rotation.y = baseYaw;

    wheels.forEach((w) => { w.rotation.x -= (speed * dt) / (w.userData.r || R); });
    movers.forEach((o) => {
      o.position.z -= speed * dt; if (o.position.z < ROAD_Z - ROAD_L / 2) o.position.z += ROAD_L;
      const a = dashFade(o.position.z - ROAD_Z); o.userData.mats.forEach((m) => { m.opacity = a; });
    });
    if (!reduced) {
      cab.position.y = Math.sin(elapsed * 2.1) * .01 + Math.sin(elapsed * 5.3) * .005;
      cab.rotation.x = Math.sin(elapsed * 1.7) * .003;
      trailer.rotation.y = Math.sin(elapsed * .9) * .005;
      tractor.position.y = Math.sin(elapsed * 2.4) * .012 + Math.sin(elapsed * 7.1) * .004;
      tractor.rotation.x = Math.sin(elapsed * 1.9) * .004;
      tractor.rotation.z = Math.sin(elapsed * 1.3) * .004;
    }
    renderer.render(scene, camera);
  };
  const loop = () => { if (visible && !document.hidden) frame(); requestAnimationFrame(loop); };
  ready.then(() => {
    truck.position.set(0, 0, HOME_Z); truck.rotation.y = baseYaw; truck.updateMatrixWorld(true);
    measure(); placeCamera();
    if (reduced) { frame(); addEventListener("resize", frame); } else loop();
  });
})();
