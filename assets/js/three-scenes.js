/* Zwei WebGL-Szenen (Three.js, lokal unter assets/vendor/):

   1. Hero — zwei Varianten, gewählt über data-scene am Canvas oder ?scene=
      in der Adresse:
      «urne»  (Standard): eine Urne aus einigen tausend goldenen Lichtpunkten,
              die sich dreht, zur Maus neigt und beim Scrollen verweht.
      «geist»: ein leuchtender, halbtransparenter Mensch aus Lichtpunkten, der
              zu einer strahlenden Friedenstaube aufblickt; die Taube schlägt
              mit den Flügeln, Wolken ziehen, beim Scrollen steigt der Geist
              zur Taube auf.
   2. Ablauf — ein Drahtgitter-Gelände, darüber ein Lichtbogen zwischen
      Deutschland und Zug, auf dem ein Lichtpunkt hin- und zurückreist:
      in die Schweiz und zurück in die Heimat.

   Ohne WebGL, ohne Three.js oder mit Bewegungswunsch «reduziert» bleibt die
   gemalte 2D-Kulisse stehen — nichts fehlt, es leuchtet nur weniger. */
(function () {
  if (!window.THREE) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var test = document.createElement('canvas');
  if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return;

  var GOLD = new THREE.Color('#c9a86b');
  var GOLD_SOFT = new THREE.Color('#e2cb9d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var mobile = window.matchMedia('(max-width: 860px)').matches;

  /* Weicher runder Lichtpunkt als Textur — ergibt Glühen ohne Postprocessing. */
  function dotTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(.25, 'rgba(255,255,255,.8)');
    grd.addColorStop(.6, 'rgba(255,255,255,.18)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  var DOT = dotTexture();

  function makeRenderer(canvas) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    r.setPixelRatio(DPR); r.setClearColor(0x000000, 0);
    return r;
  }

  /* Rendert nur, wenn die Szene im Bild ist und der Tab sichtbar. */
  function loop(canvas, draw) {
    var visible = true, raf;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(canvas);
    }
    function frame(t) {
      raf = null;
      if (!visible || document.hidden) return;
      draw(t / 1000);
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    start();
  }

  function fit(renderer, camera, canvas) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    return true;
  }

  /* Punkte gleichmässig auf Dreiecksflächen verteilen (nach Fläche gewichtet).
     parts: [{geo, matrix}] — beliebige Geometrien mit Lage im Raum. */
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function sampleSurface(parts, count, tag) {
    var tris = [], areas = [], total = 0;
    var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
    parts.forEach(function (P) {
      var g = P.geo.index ? P.geo.toNonIndexed() : P.geo;
      if (P.matrix) g.applyMatrix4(P.matrix);
      var pos = g.attributes.position.array;
      for (var i = 0; i < pos.length; i += 9) {
        a.fromArray(pos, i); b.fromArray(pos, i + 3); c.fromArray(pos, i + 6);
        var area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() / 2;
        if (area <= 0) continue;
        tris.push([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, P.tag || 0]);
        total += area; areas.push(total);
      }
    });
    var out = new Float32Array(count * 3), tags = new Float32Array(count);
    for (var k = 0; k < count; k++) {
      var r = rnd() * total, lo = 0, hi = areas.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (areas[mid] < r) lo = mid + 1; else hi = mid; }
      var t = tris[lo], u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      out[k * 3]     = t[0] + (t[3] - t[0]) * u + (t[6] - t[0]) * v;
      out[k * 3 + 1] = t[1] + (t[4] - t[1]) * u + (t[7] - t[1]) * v;
      out[k * 3 + 2] = t[2] + (t[5] - t[2]) * u + (t[8] - t[2]) * v;
      tags[k] = t[9];
    }
    return { pos: out, tags: tags };
  }
  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1));
  }

  /* Gemeinsamer Partikel-Shader: Punkte, die beim Scrollen zu aTarget wandern. */
  function particleMaterial(color, color2, size, extra) {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uSize: { value: size }, uTex: { value: DOT }, uColor: { value: color }, uColor2: { value: color2 }, uFlap: { value: 0 } },
      vertexShader: [
        'attribute vec3 aTarget; attribute vec2 aRand; attribute float aWing;',
        'uniform float uTime, uProgress, uSize, uFlap; varying float vA;',
        'void main(){',
        '  vec3 p = position;',
        '  if (aWing != 0.) {',                      /* Flügelschlag: Drehung um die Körperachse (x) */
        '    float sg = sign(aWing); float zz = p.z * sg; float a = uFlap * (0.35 + 0.65 * min(1., zz / 1.1));',
        '    float y2 = p.y * cos(a) + zz * sin(a); zz = zz * cos(a) - p.y * sin(a); p.y = y2; p.z = zz * sg;',
        '  }',
        '  float pr = smoothstep(aRand.x * .6, aRand.x * .6 + .4, uProgress);',
        '  p = mix(p, aTarget, pr);',
        '  p.x += sin(uTime * .9 + aRand.y * 6.283) * .016 * (1. + pr * 6.);',
        '  p.y += cos(uTime * .7 + aRand.x * 6.283) * .016 * (1. + pr * 6.) + pr * uTime * .15;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.);',
        '  gl_Position = projectionMatrix * mv;',
        '  float tw = .55 + .45 * sin(uTime * (1.5 + aRand.y * 2.) + aRand.x * 40.);',
        '  gl_PointSize = uSize * (.5 + aRand.y * .9) * tw * (10. / -mv.z);',
        '  vA = (0.35 + .65 * tw) * (1. - pr * .7);',
        '}'].join('\n'),
      fragmentShader: [
        'uniform sampler2D uTex; uniform vec3 uColor, uColor2; varying float vA;',
        'void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(mix(uColor, uColor2, t.a), t.a * vA); }'].join('\n'),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
  }
  function pointsFrom(sample, targetFn) {
    var n = sample.pos.length / 3, target = new Float32Array(n * 3), rand = new Float32Array(n * 2);
    for (var k = 0; k < n; k++) {
      var x = sample.pos[k * 3], y = sample.pos[k * 3 + 1], z = sample.pos[k * 3 + 2];
      var tg = targetFn(x, y, z);
      target[k * 3] = tg[0]; target[k * 3 + 1] = tg[1]; target[k * 3 + 2] = tg[2];
      rand[k * 2] = rnd(); rand[k * 2 + 1] = rnd();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(sample.pos, 3));
    geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 2));
    geo.setAttribute('aWing', new THREE.BufferAttribute(sample.tags, 1));
    return geo;
  }
  function ring(radius, tilt, count, color, opacity) {
    var arr = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) { var an = i / count * Math.PI * 2; arr[i * 3] = Math.cos(an) * radius; arr[i * 3 + 2] = Math.sin(an) * radius; }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    var l = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending }));
    l.rotation.x = tilt; return l;
  }

  /* ---------------------------------------------------- Hero, Szene «Urne» */
  function buildUrn(scene) {
    var profile = [
      [0, -2.0], [.55, -2.0], [.58, -1.9], [.42, -1.78], [.36, -1.55], [.42, -1.3],
      [.62, -1.0], [.8, -.55], [.88, -.05], [.86, .45], [.76, .85], [.6, 1.12],
      [.48, 1.28], [.54, 1.38], [.6, 1.44], [.56, 1.5], [.4, 1.62], [.22, 1.78], [.1, 1.92], [.08, 2.02], [0, 2.08]
    ];
    var curve = new THREE.CatmullRomCurve3(profile.map(function (p) { return new THREE.Vector3(p[0], p[1], 0); }));
    var pts = curve.getPoints(160).map(function (v) { return new THREE.Vector2(Math.max(0, v.x), v.y); });
    var sample = sampleSurface([{ geo: new THREE.LatheGeometry(pts, 128) }], mobile ? 4200 : 9000);
    var geo = pointsFrom(sample, function (x, y, z) {
      var ang = Math.atan2(z, x) + (rnd() - .5) * 2.2, rad = 1.5 + rnd() * 4.5;
      return [Math.cos(ang) * rad + 1.5, y * .6 + 2.5 + rnd() * 5, Math.sin(ang) * rad];
    });
    var mat = particleMaterial(GOLD, GOLD_SOFT, 7.5 * DPR);
    var group = new THREE.Group();
    group.add(new THREE.Points(geo, mat));
    var r1 = ring(1.45, Math.PI / 2.4, 180, GOLD, .28), r2 = ring(1.85, Math.PI / 1.7, 220, GOLD, .28);
    r2.rotation.z = .6; group.add(r1); group.add(r2);
    scene.add(group);
    return {
      group: group, mats: [mat], halfW: 1.85, fullH: 4.3, sizeBase: [7.5, 6],
      update: function (t) { r1.rotation.z = t * .12; r2.rotation.y = -t * .09; group.rotation.y = t * .18; }
    };
  }

  /* ------------------------------------------ Hero, Szene «Freier Geist» */
  function buildSpirit(scene) {
    var SKY = new THREE.Color('#a4dbff'), SKY_SOFT = new THREE.Color('#f2fbff');
    var WHITE = new THREE.Color('#fff8e6'), WHITE_SOFT = new THREE.Color('#ffffff');

    /* Figur aus Grundkörpern: Kopf, Hals, Rumpf, Arme, Becken, Beine. Sie steht
       leicht abgewandt und hebt den Kopf zur Taube. */
    var parts = [];
    var sph = function (r) { return new THREE.SphereGeometry(r, 24, 18); };
    var cyl = function (r1, r2, h) { return new THREE.CylinderGeometry(r1, r2, h, 20, 6); };
    parts.push({ geo: sph(.34), matrix: M(.02, 1.9, .04, -.42, .5, 0, 1, 1.15, 1.05) });             /* Kopf, nach oben rechts gewandt */
    parts.push({ geo: cyl(.12, .16, .36), matrix: M(0, 1.48, .02, -.15, 0, 0) });                   /* Hals */
    var torso = [[0, -.55], [.5, -.5], [.56, -.3], [.46, .1], [.42, .45], [.5, .85], [.62, 1.2], [.58, 1.35], [0, 1.4]]
      .map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    parts.push({ geo: new THREE.LatheGeometry(torso, 40), matrix: M(0, 0, 0, 0, 0, 0, 1, 1, .62) });
    parts.push({ geo: sph(.5), matrix: M(0, -.5, 0, 0, 0, 0, 1, .55, .7) });                        /* Becken */
    [-1, 1].forEach(function (sd) {
      parts.push({ geo: sph(.19), matrix: M(sd * .68, 1.22, 0) });                                  /* Schulter */
      parts.push({ geo: cyl(.12, .1, .95), matrix: M(sd * .8, .72, .02, .06, 0, sd * -.22) });     /* Oberarm */
      parts.push({ geo: cyl(.1, .08, .9), matrix: M(sd * .9, -.15, .12, .18, 0, sd * -.08) });     /* Unterarm */
      parts.push({ geo: sph(.11), matrix: M(sd * .92, -.62, .2, 0, 0, 0, 1, 1.4, .8) });           /* Hand */
      parts.push({ geo: cyl(.21, .16, 1.15), matrix: M(sd * .26, -1.35, 0, 0, 0, sd * .05) });     /* Oberschenkel */
      parts.push({ geo: cyl(.15, .11, 1.1), matrix: M(sd * .3, -2.45, -.02, .04, 0, 0) });         /* Unterschenkel */
      parts.push({ geo: sph(.14), matrix: M(sd * .3, -3.0, .12, 0, 0, 0, .9, .5, 1.6) });          /* Fuss */
    });
    var figSample = sampleSurface(parts, mobile ? 4200 : 9000);
    var DOVE = new THREE.Vector3(1.35, 2.95, -.4);
    var figGeo = pointsFrom(figSample, function (x, y, z) {
      /* Beim Scrollen steigt der Geist zur Taube auf und verweht. */
      var k = .4 + rnd() * .8;
      return [x + (DOVE.x - x) * k + (rnd() - .5) * 1.5, y + (DOVE.y - y) * k + rnd() * 3, z + (DOVE.z - z) * k + (rnd() - .5) * 1.5];
    });
    var figMat = particleMaterial(SKY, SKY_SOFT, 6.5 * DPR);
    /* Aura: dieselben Punkte, gross und schwach — der Geist leuchtet von innen. */
    var auraMat = particleMaterial(SKY.clone().multiplyScalar(.22), SKY.clone().multiplyScalar(.3), 22 * DPR);
    var figure = new THREE.Group();
    figure.add(new THREE.Points(figGeo, figMat));
    figure.add(new THREE.Points(figGeo, auraMat));
    figure.position.set(-.9, -.15, 0);
    figure.rotation.y = -.55;

    /* Taube: Körper, Kopf, Schwanz und zwei Flügel; aWing ±1 markiert die Flügel für den Schlag. */
    var dp = [];
    dp.push({ geo: sph(.2), matrix: M(0, 0, 0, 0, 0, 0, 2.2, 1, 1.1) });                          /* Körper, längs x */
    dp.push({ geo: sph(.13), matrix: M(.5, .1, 0, 0, 0, 0, 1.2, 1, 1) });                          /* Kopf */
    dp.push({ geo: new THREE.ConeGeometry(.16, .7, 12, 1, true), matrix: M(-.75, 0, 0, 0, 0, Math.PI / 2, 1, 1, .45) }); /* Schwanz */
    [-1, 1].forEach(function (sd) {
      var wing = new THREE.PlaneGeometry(1, 1, 22, 8);
      var wp = wing.attributes.position;
      for (var i = 0; i < wp.count; i++) {
        var u = wp.getX(i) + .5, v = wp.getY(i) + .5;                       /* u: Wurzel→Spitze, v: Hinter-→Vorderkante */
        var chord = .62 * (1 - .55 * u * u), feather = .12 * Math.sin(v * Math.PI * 5) * u;
        wp.setXYZ(i, -.15 + (v - .5) * chord + .15 * u - feather * (1 - v), .18 * u * u, sd * u * 1.15);
      }
      dp.push({ geo: wing, tag: sd });
    });
    var doveSample = sampleSurface(dp, mobile ? 1300 : 2600);
    var doveGeo = pointsFrom(doveSample, function (x, y, z) { return [x + (rnd() - .5) * .6, y + 1.5 + rnd() * 2, z + (rnd() - .5) * .6]; });
    var doveMat = particleMaterial(WHITE, WHITE_SOFT, 6.5 * DPR);
    var dove = new THREE.Group();
    dove.add(new THREE.Points(doveGeo, doveMat));
    /* Strahlender Hof hinter der Taube. */
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: 0xfff1cc, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.set(3.2, 3.2, 1); halo.position.set(0, .1, -.5); halo.material.opacity = .55; dove.add(halo);
    var core = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: 0xffffff, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false }));
    core.scale.set(.9, .9, 1); core.position.set(.1, .05, -.35); core.material.opacity = .5; dove.add(core);
    dove.position.copy(DOVE);
    dove.rotation.set(.35, -.85, .3);
    dove.scale.setScalar(1.15);

    /* Wolkenschleier: grosse, sehr weiche Punkte, die langsam ziehen. */
    var CN = mobile ? 90 : 220, cp = new Float32Array(CN * 3), cr = new Float32Array(CN * 2);
    for (var q = 0; q < CN; q++) { cp[q * 3] = (rnd() - .5) * 12; cp[q * 3 + 1] = (rnd() - .35) * 8; cp[q * 3 + 2] = -2 - rnd() * 5; cr[q * 2] = rnd(); cr[q * 2 + 1] = rnd(); }
    var cg = new THREE.BufferGeometry();
    cg.setAttribute('position', new THREE.BufferAttribute(cp, 3));
    cg.setAttribute('aRand', new THREE.BufferAttribute(cr, 2));
    var cm = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 120 * DPR }, uTex: { value: DOT }, uColor: { value: new THREE.Color('#9fc4e8') } },
      vertexShader: [
        'attribute vec2 aRand; uniform float uTime, uSize; varying float vA;',
        'void main(){ vec3 p = position; p.x = mod(p.x + uTime * (.08 + aRand.x * .1) + 6., 12.) - 6.;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;',
        '  gl_PointSize = uSize * (.5 + aRand.y) * (10. / -mv.z); vA = .05 + .05 * aRand.y; }'].join('\n'),
      fragmentShader: 'uniform sampler2D uTex; uniform vec3 uColor; varying float vA; void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor, t.a * t.a * vA); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    var group = new THREE.Group();
    group.add(figure); group.add(dove); group.add(new THREE.Points(cg, cm));
    scene.add(group);
    return {
      group: group, mats: [figMat, doveMat], auras: [auraMat], halfW: 2.2, fullH: 6.4, sizeBase: [6.5, 5.5],
      update: function (t) {
        cm.uniforms.uTime.value = t;
        doveMat.uniforms.uFlap.value = Math.sin(t * 5.2) * .55;
        dove.position.set(DOVE.x + Math.sin(t * .6) * .18, DOVE.y + Math.sin(t * 1.1) * .12, DOVE.z);
        halo.material.opacity = .5 + Math.sin(t * 1.7) * .1;
        figure.rotation.y = -.55 + Math.sin(t * .25) * .06;
      }
    };
  }

  /* ------------------------------------------------------------- Hero */
  (function hero() {
    var canvas = document.querySelector('canvas.hero-3d');
    if (!canvas) return;
    var kind = (new URLSearchParams(location.search).get('scene') || canvas.dataset.scene || 'urne').toLowerCase();
    var renderer = makeRenderer(canvas);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, .1, 13.5);
    var S = kind === 'geist' ? buildSpirit(scene) : buildUrn(scene);
    var heroEl = canvas.closest('.hero');
    if (heroEl) heroEl.classList.add('scene-' + kind);
    var group = S.group;

    /* Aufsteigende Funken (beide Szenen). */
    var SP = mobile ? 120 : 260, sp = new Float32Array(SP * 3), spr = new Float32Array(SP * 2);
    for (var s = 0; s < SP; s++) { sp[s * 3] = (rnd() - .5) * 9; sp[s * 3 + 1] = (rnd() - .5) * 8; sp[s * 3 + 2] = (rnd() - .5) * 5 - 1; spr[s * 2] = rnd(); spr[s * 2 + 1] = rnd(); }
    var sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('aRand', new THREE.BufferAttribute(spr, 2));
    var sm = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 4 * DPR }, uTex: { value: DOT }, uColor: { value: kind === 'geist' ? new THREE.Color('#dff1ff') : GOLD_SOFT } },
      vertexShader: [
        'attribute vec2 aRand; uniform float uTime, uSize; varying float vA;',
        'void main(){ vec3 p = position; p.y = mod(p.y + uTime * (.25 + aRand.x * .35) + 4., 8.) - 4.; p.x += sin(uTime * .6 + aRand.y * 6.28) * .3;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;',
        '  gl_PointSize = uSize * (.4 + aRand.y) * (10. / -mv.z); vA = .25 + .45 * sin(uTime * 2. + aRand.x * 30.) * .5 + .3; }'].join('\n'),
      fragmentShader: 'uniform sampler2D uTex; uniform vec3 uColor; varying float vA; void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor, t.a * vA); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(sg, sm));

    /* Lage: Die Szene darf die Überschrift nie überdecken. Auf breiten Schirmen
       bekommt sie die Spalte rechts neben dem Textblock, auf schmalen den Raum
       zwischen Kopfzeile und Text. Beides wird aus der echten Textbox gerechnet
       und die Szene so skaliert, dass sie hineinpasst. */
    var baseX = 0, baseY = 0, baseScale = 1;
    function place() {
      if (!fit(renderer, camera, canvas)) return;
      var W = canvas.clientWidth, H = canvas.clientHeight;
      var vh = 2 * camera.position.z * Math.tan(camera.fov / 2 * Math.PI / 180);
      var vw = vh * camera.aspect, upp = vh / H;
      var hb = canvas.getBoundingClientRect();
      var text = document.querySelector('.hero-text');
      var tb = text ? text.getBoundingClientRect() : null;
      var wide = W > 860;
      var cx, cy, sc;
      if (wide) {
        var left = (tb ? tb.right - hb.left : W * .5) + 32;
        var colW = Math.max(0, W - left - W * .04);
        cx = left + colW / 2;
        cy = tb ? (tb.top + tb.bottom) / 2 - hb.top : H / 2;
        sc = Math.min(1, colW * .46 * upp / S.halfW, H * .8 * upp / S.fullH);
      } else {
        var top = hb.top < 0 ? -hb.top : 0;
        var headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) * 16 || 84;
        var start = top + headerH, end = tb ? tb.top - hb.top : H * .35;
        cx = W / 2;
        cy = (start + end) / 2;
        sc = Math.max(.25, Math.min(.6, (end - start) * .92 * upp / S.fullH, W * .44 * upp / S.halfW));
      }
      baseX = (cx / W - .5) * vw;
      baseY = camera.position.y - (cy / H - .5) * vh;
      baseScale = sc;
      var base = wide ? S.sizeBase[0] : S.sizeBase[1];
      S.mats.forEach(function (m) { m.uniforms.uSize.value = base * DPR * Math.max(.7, sc); });
      (S.auras || []).forEach(function (m) { m.uniforms.uSize.value = base * 3.4 * DPR * Math.max(.7, sc); });
    }
    place();
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener('load', place);

    var mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { tx = (e.clientX / window.innerWidth - .5); ty = (e.clientY / window.innerHeight - .5); }, { passive: true });

    loop(canvas, function (t) {
      var sc = window.scrollY, h = heroEl ? heroEl.offsetHeight : window.innerHeight;
      var progress = Math.min(1, Math.max(0, (sc - h * .12) / (h * .75)));
      S.mats.concat(S.auras || []).forEach(function (m) { m.uniforms.uTime.value = t; m.uniforms.uProgress.value = reduce ? 0 : progress; });
      sm.uniforms.uTime.value = t;
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      S.update(t);
      group.rotation.y = mx * .5;
      group.rotation.x = my * .2;
      group.position.x += (baseX - group.position.x) * .1;
      group.position.y += (baseY + Math.sin(t * .5) * .08 * baseScale - group.position.y) * .1;
      group.scale.setScalar(group.scale.x + (baseScale - group.scale.x) * .1);
      renderer.render(scene, camera);
    });
  })();

  /* --------------------------------------------------------- Ablauf: Route */
  (function route() {
    var canvas = document.querySelector('canvas.route-3d');
    if (!canvas) return;
    var renderer = makeRenderer(canvas);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x101922, 14, 34);
    var camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
    camera.position.set(0, 7.5, 16); camera.lookAt(0, 0, 0);

    /* Gelände: ruhig in der Mitte (der See), Grate an den Rändern. */
    var W = 48, D = 26, SX = mobile ? 60 : 110, SZ = mobile ? 32 : 60;
    var plane = new THREE.PlaneGeometry(W, D, SX, SZ);
    plane.rotateX(-Math.PI / 2);
    var p = plane.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i);
      var edge = Math.pow(Math.min(1, Math.abs(z) / (D / 2) + .1), 2.2);
      var h = (Math.sin(x * .55) * Math.cos(z * .8) + Math.sin(x * 1.7 + z * .9) * .35 + Math.sin(x * 3.1) * Math.cos(z * 2.3) * .18) * 1.4 * edge;
      p.setY(i, h - .8);
    }
    plane.computeVertexNormals();
    var terrain = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: 0x3f5a78, wireframe: true, transparent: true, opacity: .3 }));
    scene.add(terrain);

    /* Lichtbogen von links (Deutschland) nach rechts (Zug). */
    var A = new THREE.Vector3(-8.5, -.2, 1.5), B = new THREE.Vector3(8, -.1, -1);
    var arc = new THREE.QuadraticBezierCurve3(A, new THREE.Vector3(-.5, 5, 0), B);
    var arcPts = arc.getPoints(160);
    var arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
    scene.add(new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .85, blending: THREE.AdditiveBlending })));
    var shadowPts = arcPts.map(function (v) { return new THREE.Vector3(v.x, -.75, v.z); });
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(shadowPts), new THREE.LineDashedMaterial({ color: GOLD, transparent: true, opacity: .25, dashSize: .4, gapSize: .3 })).computeLineDistances());

    function marker(v) {
      var g = new THREE.RingGeometry(.35, .42, 48); g.rotateX(-Math.PI / 2);
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .8, side: THREE.DoubleSide }));
      m.position.copy(v); m.position.y = -.7; scene.add(m);
      var g2 = new THREE.RingGeometry(.9, .93, 64); g2.rotateX(-Math.PI / 2);
      var m2 = new THREE.Mesh(g2, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .25, side: THREE.DoubleSide }));
      m2.position.copy(m.position); scene.add(m2);
      return m2;
    }
    var mA = marker(A), mB = marker(B);

    /* Reisender Lichtpunkt mit Schweif. */
    var TAIL = 40, tail = new Float32Array(TAIL * 3), tailA = new Float32Array(TAIL);
    for (var q = 0; q < TAIL; q++) tailA[q] = 1 - q / TAIL;
    var tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(tail, 3));
    tg.setAttribute('aA', new THREE.BufferAttribute(tailA, 1));
    var tm = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: DOT }, uColor: { value: GOLD_SOFT }, uSize: { value: 22 * DPR } },
      vertexShader: 'attribute float aA; uniform float uSize; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * (.25 + aA * .75) * (16. / -mv.z); vA = aA * aA; }',
      fragmentShader: 'uniform sampler2D uTex; uniform vec3 uColor; varying float vA; void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor, t.a * vA); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(tg, tm));

    function place() { fit(renderer, camera, canvas); }
    place(); window.addEventListener('resize', place);

    /* Hin und zurück: Deutschland → Schweiz → zurück in die Heimat. */
    loop(canvas, function (t) {
      var ph = (t * .07) % 1, u = reduce ? .45 : (ph < .5 ? ph * 2 : 2 - ph * 2);
      for (var q = 0; q < TAIL; q++) {
        var v = arc.getPoint(Math.max(0, u - q * .004));
        tail[q * 3] = v.x; tail[q * 3 + 1] = v.y; tail[q * 3 + 2] = v.z;
      }
      tg.attributes.position.needsUpdate = true;
      var pulse = 1 + Math.sin(t * 2) * .08;
      mA.scale.setScalar(pulse); mB.scale.setScalar(2 - pulse);
      camera.position.x = Math.sin(t * .08) * 1.2;
      camera.position.y = 7.5 + Math.sin(t * .11) * .4;
      camera.lookAt(0, .5, 0);
      renderer.render(scene, camera);
    });
  })();
})();
