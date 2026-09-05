/* Dämmerung über dem Zugersee, auf Canvas gezeichnet: Himmel, Sterne, Mond,
   vier Bergketten mit Luftperspektive, die Lichter der Stadt am Ufer und der
   See mit ihrer Spiegelung.

   Alles kommt aus einem festen Startwert — dieselbe Kulisse auf jedem Gerät
   und bei jedem Aufruf. Ein Markenbild darf nicht flackern. Gezeichnet wird
   einmal; bewegt werden nur Nebel und Fahne darüber (CSS / flag.js). */
(function () {
  var scenes = document.querySelectorAll('canvas.scene');
  if (!scenes.length) return;

  var SEED = 20260901;
  var WATER = .78;            // Uferlinie, Anteil der Höhe

  /* Kleiner, schneller PRNG (mulberry32) — reproduzierbar. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* Bergkamm über Mittelpunktverschiebung: rau an den Graten, ruhig im Tal. */
  function ridge(rand, points, roughness) {
    var h = [rand(), rand()], step = 1;
    while (h.length < points) {
      var next = [h[0]];
      for (var i = 1; i < h.length; i++) {
        next.push((h[i - 1] + h[i]) / 2 + (rand() - .5) * roughness / step);
        next.push(h[i]);
      }
      h = next; step *= 1.9;
    }
    return h;
  }

  function paintLand(ctx, W, H, rand, dpr) {
    var horizon = H * WATER;

    /* Himmel: Nachtblau oben, aufgehellter Horizont, warmer Schimmer. */
    var sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0,   '#080f18');
    sky.addColorStop(.45, '#182739');
    sky.addColorStop(.80, '#2f4560');
    sky.addColorStop(1,   '#3d5470');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);

    var glow = ctx.createRadialGradient(W * .5, horizon, 0, W * .5, horizon, W * .6);
    glow.addColorStop(0, 'rgba(201, 168, 107, .30)');
    glow.addColorStop(1, 'rgba(201, 168, 107, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, horizon);

    /* Sterne — nur oben, sehr zurückhaltend. */
    for (var s = 0; s < 110; s++) {
      var sx = rand() * W, sy = rand() * horizon * .55, sr = (rand() * .9 + .3) * dpr;
      ctx.globalAlpha = .10 + rand() * .38;
      ctx.fillStyle = '#dce6f2';
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* Ein schmaler Mond mit weichem Hof, links oben. Die Sichel entsteht,
       indem der Himmel in den Mond zurückgemalt wird — kein dunkler Fleck. */
    var mx = W * .2, my = horizon * .2, mr = Math.max(9, Math.min(W, H) * .022);
    var halo = ctx.createRadialGradient(mx, my, mr * .6, mx, my, mr * 7);
    halo.addColorStop(0, 'rgba(226, 203, 157, .22)');
    halo.addColorStop(1, 'rgba(226, 203, 157, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(mx - mr * 7, my - mr * 7, mr * 14, mr * 14);
    ctx.fillStyle = '#efe3c9';
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = sky;
    ctx.beginPath(); ctx.arc(mx + mr * .42, my - mr * .18, mr * .92, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* Bergketten von hinten nach vorn: je näher, desto dunkler und ruhiger. */
    var layers = [
      { base: .60, amp: .30, rough: 1.5, fill: '#44607e', haze: 'rgba(84, 116, 150, .55)' },
      { base: .74, amp: .26, rough: 1.3, fill: '#33485f', haze: 'rgba(56, 82, 110, .5)' },
      { base: .88, amp: .18, rough: 1.0, fill: '#1e2d3d', haze: 'rgba(30, 46, 64, .45)' },
      { base: .99, amp: .09, rough: .7, fill: '#0f1821', haze: 'rgba(14, 23, 33, .4)' }
    ];

    layers.forEach(function (L) {
      var pts = ridge(rand, 129, L.rough);
      var baseY = horizon * L.base;
      ctx.beginPath();
      ctx.moveTo(0, horizon + 2);
      for (var i = 0; i < pts.length; i++) {
        ctx.lineTo(i / (pts.length - 1) * W, baseY - pts[i] * horizon * L.amp);
      }
      ctx.lineTo(W, horizon + 2);
      ctx.closePath();
      ctx.fillStyle = L.fill;
      ctx.fill();

      /* Dunst am Fuss der Kette — das ist die Luftperspektive. */
      var hz = ctx.createLinearGradient(0, baseY - horizon * L.amp, 0, baseY + horizon * .1);
      hz.addColorStop(0, 'rgba(0,0,0,0)');
      hz.addColorStop(1, L.haze);
      ctx.fillStyle = hz;
      ctx.fillRect(0, baseY - horizon * L.amp, W, horizon * (L.amp + .1));
    });

    /* Stadt am Ufer: Silhouetten mit warmen Fenstern. */
    var groundY = horizon, x2 = 0, lights = [];
    while (x2 < W) {
      var bw = (6 + rand() * 22) * dpr;
      var bh = (8 + rand() * 40) * dpr;
      ctx.fillStyle = '#070b10';
      ctx.fillRect(x2, groundY - bh, bw, bh + 2);
      for (var f = 0; f < 3; f++) {
        if (rand() > .5) {
          var lx = x2 + (2 + rand() * (bw - 5)), ly = groundY - bh + rand() * (bh - 4);
          ctx.globalAlpha = .45 + rand() * .5;
          ctx.fillStyle = '#e0bb7a';
          ctx.fillRect(lx, ly, 1.6 * dpr, 1.6 * dpr);
          lights.push([lx, ctx.globalAlpha]);
        }
      }
      ctx.globalAlpha = 1;
      x2 += bw + rand() * 5 * dpr;
    }
    return lights;
  }

  function paintWater(ctx, land, W, H, rand, dpr, lights) {
    var horizon = Math.round(H * WATER), depth = H - horizon;
    if (depth < 4) return;

    /* Grund: dunkles Wasser, zum Ufer hin etwas heller. */
    var w = ctx.createLinearGradient(0, horizon, 0, H);
    w.addColorStop(0, '#1a2a3a');
    w.addColorStop(.5, '#0c151e');
    w.addColorStop(1, '#070b10');
    ctx.fillStyle = w;
    ctx.fillRect(0, horizon, W, depth);

    /* Spiegelung: Land zeilenweise gestürzt, mit leichter Wellenverschiebung. */
    var STRIP = Math.max(1, Math.round(2 * dpr));
    for (var y = 0; y < depth; y += STRIP) {
      var u = y / depth;
      var srcY = horizon - y - STRIP;
      if (srcY < 0) break;
      var shift = Math.sin(y / (6 * dpr) + rand() * .3) * (1 + u * 6) * dpr;
      ctx.globalAlpha = .42 * (1 - u * .8);
      ctx.drawImage(land, 0, srcY, W, STRIP, shift, horizon + y, W, STRIP);
    }
    ctx.globalAlpha = 1;

    /* Lichtspuren der Fenster, lang gezogen. */
    lights.forEach(function (L) {
      if (rand() > .55) return;
      var g = ctx.createLinearGradient(0, horizon, 0, horizon + depth * (.35 + rand() * .4));
      g.addColorStop(0, 'rgba(224, 187, 122, ' + (L[1] * .35).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(224, 187, 122, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(L[0] - .5 * dpr, horizon, 2 * dpr, depth);
    });

    /* Mondstrasse. */
    var mx = W * .2;
    var road = ctx.createLinearGradient(0, horizon, 0, H);
    road.addColorStop(0, 'rgba(226, 203, 157, .28)');
    road.addColorStop(1, 'rgba(226, 203, 157, 0)');
    ctx.fillStyle = road;
    for (var r = 0; r < 26; r++) {
      var ry = horizon + r * depth / 26, rw = (4 + r * 2.2 + rand() * 12) * dpr;
      ctx.globalAlpha = .35 + rand() * .5;
      ctx.fillRect(mx - rw / 2 + (rand() - .5) * 10 * dpr, ry, rw, 1.2 * dpr);
    }
    ctx.globalAlpha = 1;

    /* Ein paar ruhige Wellenlinien. */
    ctx.strokeStyle = 'rgba(150, 178, 205, .07)';
    ctx.lineWidth = dpr;
    for (var k = 0; k < 14; k++) {
      var ky = horizon + depth * (.15 + rand() * .8), kx = rand() * W, kl = (30 + rand() * 120) * dpr;
      ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + kl, ky); ctx.stroke();
    }

    /* Uferlinie. */
    ctx.fillStyle = 'rgba(224, 187, 122, .18)';
    ctx.fillRect(0, horizon - .5 * dpr, W, dpr);
  }

  function paint(canvas) {
    var box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.width = Math.round(box.width * dpr);
    var H = canvas.height = Math.round(box.height * dpr);
    var ctx = canvas.getContext('2d');
    var rand = rng(SEED);

    /* Land in einen Zwischenspeicher — er wird für die Spiegelung gebraucht. */
    var land = document.createElement('canvas');
    land.width = W; land.height = H;
    var lights = paintLand(land.getContext('2d'), W, H, rand, dpr);

    ctx.drawImage(land, 0, 0);
    paintWater(ctx, land, W, H, rand, dpr, lights);

    /* Nebelbänder quer über Berg und See. */
    [[.62, .06], [.76, .04]].forEach(function (band) {
      var g = ctx.createLinearGradient(0, H * (band[0] - band[1]), 0, H * (band[0] + band[1]));
      g.addColorStop(0, 'rgba(150, 178, 205, 0)');
      g.addColorStop(.5, 'rgba(150, 178, 205, .10)');
      g.addColorStop(1, 'rgba(150, 178, 205, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, H * (band[0] - band[1]), W, H * band[1] * 2);
    });
  }

  function paintAll() { Array.prototype.forEach.call(scenes, paint); }
  paintAll();

  var pending, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(pending);
    pending = setTimeout(function () {
      /* Auf Handys ändert sich die Höhe beim Scrollen (Adressleiste) — dann nicht neu zeichnen. */
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      paintAll();
    }, 200);
  });

  /* Sanfte Parallaxe der Hero-Kulisse. */
  var hero = document.querySelector('.hero .scene');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) hero.style.transform = 'translateY(' + (y * .22).toFixed(1) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }
})();
