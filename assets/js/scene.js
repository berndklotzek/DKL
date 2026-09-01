/* Dämmerungskulisse auf Canvas: Himmel, Sterne, vier Bergketten mit
   Luftperspektive, Dunstbänder und die Lichter einer Stadt am Fuss.

   Alles wird aus einem festen Startwert gewürfelt — dieselbe Kulisse auf
   jedem Gerät und bei jedem Aufruf. Ein Markenbild darf nicht flackern.
   Gezeichnet wird einmal; bewegt wird nur die Fahne darüber. */
(function () {
  var scenes = document.querySelectorAll('.scene');
  if (!scenes.length) return;

  var SEED = 20260901;

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

  function paint(canvas) {
    var box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.width = Math.round(box.width * dpr);
    var H = canvas.height = Math.round(box.height * dpr);
    var ctx = canvas.getContext('2d');
    var rand = rng(SEED);

    /* Himmel: Nachtblau oben, aufgehellter Horizont, warmer Schimmer. */
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   '#0a121c');
    sky.addColorStop(.40, '#1b2b3d');
    sky.addColorStop(.70, '#31485f');
    sky.addColorStop(1,   '#22344a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * .5, H * .74, 0, W * .5, H * .74, W * .7);
    glow.addColorStop(0, 'rgba(201, 168, 107, .28)');
    glow.addColorStop(1, 'rgba(201, 168, 107, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    /* Sterne, nur in der oberen Hälfte und sehr zurückhaltend. */
    for (var s = 0; s < 90; s++) {
      var sx = rand() * W, sy = rand() * H * .45, sr = (rand() * .9 + .3) * dpr;
      ctx.globalAlpha = .10 + rand() * .35;
      ctx.fillStyle = '#dce6f2';
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* Bergketten von hinten nach vorn: je näher, desto dunkler und ruhiger. */
    var layers = [
      { base: .58, amp: .18, rough: 1.5, fill: '#44607e', haze: 'rgba(78, 108, 140, .5)' },
      { base: .68, amp: .17, rough: 1.3, fill: '#33485f', haze: 'rgba(52, 76, 102, .45)' },
      { base: .79, amp: .13, rough: 1.0, fill: '#1e2d3d', haze: 'rgba(30, 46, 64, .42)' },
      { base: .90, amp: .07, rough: .7, fill: '#101a25', haze: 'rgba(14, 23, 33, .38)' }
    ];

    layers.forEach(function (L) {
      var pts = ridge(rand, 129, L.rough);
      var baseY = H * L.base;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var i = 0; i < pts.length; i++) {
        var x = i / (pts.length - 1) * W;
        ctx.lineTo(x, baseY - pts[i] * H * L.amp);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = L.fill;
      ctx.fill();

      /* Dunst am Fuss der Kette — das ist die Luftperspektive. */
      var hz = ctx.createLinearGradient(0, baseY - H * L.amp, 0, baseY + H * .1);
      hz.addColorStop(0, 'rgba(0,0,0,0)');
      hz.addColorStop(1, L.haze);
      ctx.fillStyle = hz;
      ctx.fillRect(0, baseY - H * L.amp, W, H * (L.amp + .1));
    });

    /* Stadt am Fuss: Silhouetten mit ein paar warmen Fenstern. */
    var groundY = H * .945, x2 = 0;
    while (x2 < W) {
      var bw = (6 + rand() * 22) * dpr;
      var bh = (10 + rand() * 46) * dpr;
      ctx.fillStyle = '#080d13';
      ctx.fillRect(x2, groundY - bh, bw, bh + H);
      for (var f = 0; f < 3; f++) {
        if (rand() > .5) {
          ctx.globalAlpha = .45 + rand() * .5;
          ctx.fillStyle = '#e0bb7a';
          ctx.fillRect(x2 + (2 + rand() * (bw - 5)), groundY - bh + rand() * (bh - 4), 1.6 * dpr, 1.6 * dpr);
        }
      }
      ctx.globalAlpha = 1;
      x2 += bw + rand() * 5 * dpr;
    }

    /* Zwei ruhige Nebelbänder legen sich quer darüber. */
    [[.66, .07], [.83, .05]].forEach(function (band) {
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

  var pending;
  window.addEventListener('resize', function () {
    clearTimeout(pending);
    pending = setTimeout(paintAll, 200);
  });
})();
