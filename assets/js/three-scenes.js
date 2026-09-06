/* Zwei WebGL-Szenen (Three.js, lokal unter assets/vendor/):

   1. Hero — eine Urne aus einigen tausend goldenen Lichtpunkten. Sie dreht
      sich langsam, neigt sich zur Maus und löst sich beim Scrollen in einen
      Strom auf, der nach oben zieht. Dazu zwei Lichtbahnen und aufsteigende
      Funken.
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

  /* ------------------------------------------------------------ Hero: Urne */
  (function hero() {
    var canvas = document.querySelector('canvas.hero-3d');
    if (!canvas) return;
    var renderer = makeRenderer(canvas);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, .1, 13.5);

    /* Profil der Urne: [Radius, Höhe] von unten nach oben. */
    var profile = [
      [0, -2.0], [.55, -2.0], [.58, -1.9], [.42, -1.78], [.36, -1.55], [.42, -1.3],
      [.62, -1.0], [.8, -.55], [.88, -.05], [.86, .45], [.76, .85], [.6, 1.12],
      [.48, 1.28], [.54, 1.38], [.6, 1.44], [.56, 1.5], [.4, 1.62], [.22, 1.78], [.1, 1.92], [.08, 2.02], [0, 2.08]
    ];
    var curve = new THREE.CatmullRomCurve3(profile.map(function (p) { return new THREE.Vector3(p[0], p[1], 0); }));
    var pts = curve.getPoints(160).map(function (v) { return new THREE.Vector2(Math.max(0, v.x), v.y); });
    var lathe = new THREE.LatheGeometry(pts, 128);

    /* Punkte gleichmässig auf der Oberfläche verteilen (Dreiecke nach Fläche gewichtet). */
    var COUNT = mobile ? 4200 : 9000;
    var pos = lathe.attributes.position.array, idx = lathe.index.array;
    var tri = [], areas = [], total = 0, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
    for (var i = 0; i < idx.length; i += 3) {
      a.fromArray(pos, idx[i] * 3); b.fromArray(pos, idx[i + 1] * 3); c.fromArray(pos, idx[i + 2] * 3);
      var area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() / 2;
      tri.push(i); total += area; areas.push(total);
    }
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var base = new Float32Array(COUNT * 3), target = new Float32Array(COUNT * 3), rand = new Float32Array(COUNT * 2);
    for (var k = 0; k < COUNT; k++) {
      var r = rnd() * total, lo = 0, hi = areas.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (areas[mid] < r) lo = mid + 1; else hi = mid; }
      var t0 = tri[lo];
      a.fromArray(pos, idx[t0] * 3); b.fromArray(pos, idx[t0 + 1] * 3); c.fromArray(pos, idx[t0 + 2] * 3);
      var u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      var px = a.x + (b.x - a.x) * u + (c.x - a.x) * v;
      var py = a.y + (b.y - a.y) * u + (c.y - a.y) * v;
      var pz = a.z + (b.z - a.z) * u + (c.z - a.z) * v;
      base[k * 3] = px; base[k * 3 + 1] = py; base[k * 3 + 2] = pz;
      /* Ziel beim Auflösen: ein weiter Strom, der nach oben rechts zieht. */
      var ang = Math.atan2(pz, px) + (rnd() - .5) * 2.2, rad = 1.5 + rnd() * 4.5;
      target[k * 3] = Math.cos(ang) * rad + 1.5;
      target[k * 3 + 1] = py * .6 + 2.5 + rnd() * 5;
      target[k * 3 + 2] = Math.sin(ang) * rad;
      rand[k * 2] = rnd(); rand[k * 2 + 1] = rnd();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(base, 3));
    geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 2));

    var mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uSize: { value: (mobile ? 6 : 7.5) * DPR }, uTex: { value: DOT }, uColor: { value: GOLD }, uColor2: { value: GOLD_SOFT } },
      vertexShader: [
        'attribute vec3 aTarget; attribute vec2 aRand;',
        'uniform float uTime, uProgress, uSize; varying float vA;',
        'void main(){',
        '  float p = smoothstep(aRand.x * .6, aRand.x * .6 + .4, uProgress);',
        '  vec3 pos = mix(position, aTarget, p);',
        '  pos.x += sin(uTime * .9 + aRand.y * 6.283) * .018 * (1. + p * 6.);',
        '  pos.y += cos(uTime * .7 + aRand.x * 6.283) * .018 * (1. + p * 6.) + p * uTime * .15;',
        '  vec4 mv = modelViewMatrix * vec4(pos, 1.);',
        '  gl_Position = projectionMatrix * mv;',
        '  float tw = .55 + .45 * sin(uTime * (1.5 + aRand.y * 2.) + aRand.x * 40.);',
        '  gl_PointSize = uSize * (.5 + aRand.y * .9) * tw * (10. / -mv.z);',
        '  vA = (0.35 + .65 * tw) * (1. - p * .7);',
        '}'].join('\n'),
      fragmentShader: [
        'uniform sampler2D uTex; uniform vec3 uColor, uColor2; varying float vA;',
        'void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(mix(uColor, uColor2, t.a), t.a * vA); }'].join('\n'),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    var urn = new THREE.Points(geo, mat);
    var group = new THREE.Group(); group.add(urn);
    scene.add(group);

    /* Zwei feine Lichtbahnen um die Urne. */
    function ring(radius, tilt, count) {
      var arr = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) { var an = i / count * Math.PI * 2; arr[i * 3] = Math.cos(an) * radius; arr[i * 3 + 2] = Math.sin(an) * radius; }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      var m = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .28, blending: THREE.AdditiveBlending });
      var l = new THREE.LineLoop(g, m); l.rotation.x = tilt; return l;
    }
    var ring1 = ring(1.45, Math.PI / 2.4, 180), ring2 = ring(1.85, Math.PI / 1.7, 220);
    ring2.rotation.z = .6;
    group.add(ring1); group.add(ring2);

    /* Aufsteigende Funken. */
    var SP = mobile ? 120 : 260, sp = new Float32Array(SP * 3), spr = new Float32Array(SP * 2);
    for (var s = 0; s < SP; s++) { sp[s * 3] = (rnd() - .5) * 9; sp[s * 3 + 1] = (rnd() - .5) * 8; sp[s * 3 + 2] = (rnd() - .5) * 5 - 1; spr[s * 2] = rnd(); spr[s * 2 + 1] = rnd(); }
    var sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('aRand', new THREE.BufferAttribute(spr, 2));
    var sm = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 4 * DPR }, uTex: { value: DOT }, uColor: { value: GOLD_SOFT } },
      vertexShader: [
        'attribute vec2 aRand; uniform float uTime, uSize; varying float vA;',
        'void main(){ vec3 p = position; p.y = mod(p.y + uTime * (.25 + aRand.x * .35) + 4., 8.) - 4.; p.x += sin(uTime * .6 + aRand.y * 6.28) * .3;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;',
        '  gl_PointSize = uSize * (.4 + aRand.y) * (10. / -mv.z); vA = .25 + .45 * sin(uTime * 2. + aRand.x * 30.) * .5 + .3; }'].join('\n'),
      fragmentShader: 'uniform sampler2D uTex; uniform vec3 uColor; varying float vA; void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor, t.a * vA); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(sg, sm));

    /* Lage: rechts neben dem Text auf breiten Schirmen, hinter dem Text auf schmalen. */
    function place() {
      if (!fit(renderer, camera, canvas)) return;
      var wide = canvas.clientWidth > 860;
      group.position.set(wide ? 2.7 : 0, wide ? .5 : 2.1, 0);
      group.scale.setScalar(wide ? 1 : .55);
      mat.uniforms.uSize.value = (wide ? 7.5 : 6) * DPR;
    }
    place();
    window.addEventListener('resize', place);

    var mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { tx = (e.clientX / window.innerWidth - .5); ty = (e.clientY / window.innerHeight - .5); }, { passive: true });

    var hero = canvas.closest('.hero');
    loop(canvas, function (t) {
      var sc = window.scrollY, h = hero ? hero.offsetHeight : window.innerHeight;
      var progress = Math.min(1, Math.max(0, (sc - h * .12) / (h * .75)));
      mat.uniforms.uTime.value = t; sm.uniforms.uTime.value = t;
      mat.uniforms.uProgress.value = reduce ? 0 : progress;
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      group.rotation.y = t * .18 + mx * .6;
      group.rotation.x = my * .25;
      group.position.y += ((canvas.clientWidth > 860 ? .5 : 2.1) + Math.sin(t * .5) * .08 - group.position.y) * .05;
      ring1.rotation.z = t * .12; ring2.rotation.y = -t * .09;
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
