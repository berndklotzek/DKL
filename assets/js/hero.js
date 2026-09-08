/* Hero-Kulisse: sanft wandernde Lichtbänder und ein feines Netz aus Punkten,
   das sich leicht mit der Maus bewegt. Bei "Bewegung reduzieren" wird nur ein
   einzelnes, ruhiges Bild gezeichnet. */
(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0, dpr = 1, nodes = [], t = 0, raf = 0;
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.4 + .6, p: Math.random() * Math.PI * 2
    }));
  }

  function bands() {
    /* Drei breite, weiche Lichtbahnen in Gold und Blau */
    const specs = [
      { c: "201,162,77", a: .16, y: .28, amp: .08, k: 1.0, s: .00022 },
      { c: "43,101,175", a: .22, y: .62, amp: .1, k: 1.4, s: .00017 },
      { c: "226,201,138", a: .07, y: .48, amp: .06, k: .8, s: .00028 }
    ];
    for (const b of specs) {
      ctx.beginPath();
      const yc = h * b.y + (mouse.y - .5) * 40;
      for (let x = -20; x <= w + 20; x += 12) {
        const y = yc + Math.sin(x * .0025 * b.k + t * b.s * 1000) * h * b.amp
                     + Math.sin(x * .006 + t * b.s * 600) * h * b.amp * .35;
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(w + 20, h + 40); ctx.lineTo(-20, h + 40); ctx.closePath();
      const g = ctx.createLinearGradient(0, yc - h * .25, 0, yc + h * .35);
      g.addColorStop(0, `rgba(${b.c},0)`);
      g.addColorStop(.5, `rgba(${b.c},${b.a})`);
      g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.fill();
    }
  }

  function net() {
    const ox = (mouse.x - .5) * 24, oy = (mouse.y - .5) * 24;
    for (const n of nodes) {
      if (!reduce) { n.x += n.vx; n.y += n.vy; }
      if (n.x < -10) n.x = w + 10; if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10; if (n.y > h + 10) n.y = -10;
    }
    ctx.lineWidth = .6;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 150 * 150) {
          ctx.strokeStyle = `rgba(226,201,138,${(1 - Math.sqrt(d) / 150) * .16})`;
          ctx.beginPath(); ctx.moveTo(a.x + ox, a.y + oy); ctx.lineTo(b.x + ox, b.y + oy); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const tw = .55 + Math.sin(t * .002 + n.p) * .45;
      ctx.fillStyle = `rgba(226,201,138,${.35 + tw * .45})`;
      ctx.beginPath(); ctx.arc(n.x + ox, n.y + oy, n.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame(now) {
    t = now || 0;
    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    ctx.clearRect(0, 0, w, h);
    bands(); net();
    if (!reduce) raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => { resize(); if (reduce) frame(0); }, { passive: true });
  window.addEventListener("pointermove", e => { mouse.tx = e.clientX / w; mouse.ty = e.clientY / Math.max(h, 1); }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (reduce) return;
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
  });

  resize(); frame(0);
})();
