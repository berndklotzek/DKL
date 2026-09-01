/* Wehende Schweizer Fahne auf Canvas.
   Die flache Fahne wird einmal vorgezeichnet und dann spaltenweise versetzt
   wieder aufgetragen — Versatz aus einer Sinuswelle, Helligkeit aus deren
   Steigung. Das ergibt Stoff statt Bild. Ohne Bewegungswunsch steht sie still. */
(function () {
  var canvas = document.querySelector('.flag');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var WAVES = 1.6;      // Wellenbäuche über die Breite
  var SPEED = 1.9;      // Bogenmass pro Sekunde
  var AMP   = 0.075;    // Ausschlag, Anteil der Fahnenhöhe
  var STEP  = 2;        // Spaltenbreite in Gerätepixeln

  var dpr, W, H, side, ox, oy, flat;

  /* Eidgenössische Proportionen: Feld 32 × 32, Kreuzbalken 20 × 6, mittig.
     Die Armlänge ist damit um ein Sechstel grösser als die Armbreite. */
  function drawFlat(size) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    g.fillStyle = '#d52b1e';
    g.fillRect(0, 0, size, size);
    g.fillStyle = '#ffffff';
    var bar = size * 6 / 32, len = size * 20 / 32, m = (size - len) / 2, n = (size - bar) / 2;
    g.fillRect(m, n, len, bar);
    g.fillRect(n, m, bar, len);
    return c;
  }

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var box = canvas.getBoundingClientRect();
    if (!box.width) return false;
    W = Math.round(box.width * dpr);
    H = Math.round(box.height * dpr);
    canvas.width = W;
    canvas.height = H;
    side = Math.round(Math.min(W / (1 + AMP), H / (1 + 2 * AMP)));
    ox = Math.round((W - side) / 2);
    oy = Math.round((H - side) / 2);
    flat = drawFlat(side);
    return true;
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    var amp = side * AMP;

    for (var x = 0; x < side; x += STEP) {
      var u = x / side;                       // 0 am Mast, 1 am freien Ende
      var grip = Math.pow(u, 1.35);           // am Mast gehalten, aussen frei
      var phase = u * Math.PI * 2 * WAVES - t * SPEED;

      var dy = amp * grip * Math.sin(phase);
      var squash = 1 - 0.12 * grip * (1 + Math.cos(phase)) / 2;
      var w = Math.min(STEP + 1, side - x);

      ctx.drawImage(flat, x, 0, w, side,
                    ox + x, oy + dy + side * (1 - squash) / 2, w, side * squash);

      /* Steigung der Welle: wo sich der Stoff wegdreht, wird er dunkler. */
      var slope = grip * Math.cos(phase);
      ctx.fillStyle = slope < 0 ? 'rgba(20,16,14,' + (-slope * 0.3).toFixed(3) + ')'
                                : 'rgba(255,252,245,' + (slope * 0.17).toFixed(3) + ')';
      ctx.fillRect(ox + x, oy + dy + side * (1 - squash) / 2, w, side * squash);
    }
  }

  function frame(ts) {
    render(still ? 0 : ts / 1000);
    if (!still) requestAnimationFrame(frame);
  }

  if (!measure()) return;
  requestAnimationFrame(frame);

  var pending;
  window.addEventListener('resize', function () {
    clearTimeout(pending);
    pending = setTimeout(function () { if (measure() && still) render(0); }, 150);
  });
})();
