/* Fuhrparkkompass — Ersparnis-Rechner (unverbindliche Schätzung, Annahmen in config.js) */
(function () {
  "use strict";
  const root = document.getElementById("rechner");
  if (!root) return;
  const cfg = (window.FPK && window.FPK.calc) || { saving: { gut: [12, 25], mittel: [8, 18], hoch: [4, 12] }, defaultVehicles: 25, defaultPremium: 1800 };
  const $ = (s) => root.querySelector(s);
  const vehicles = $("#calc-vehicles"), vehiclesOut = $("#calc-vehicles-out");
  const premium = $("#calc-premium"), seg = $(".seg");
  const outBig = $("#calc-big"), outNow = $("#calc-now"), outLow = $("#calc-low"), outHigh = $("#calc-high"), outThree = $("#calc-three");
  const eur = (v) => Math.round(v).toLocaleString("de-DE") + " €";
  let quote = "mittel";

  vehicles.value = cfg.defaultVehicles; premium.value = cfg.defaultPremium;

  const update = () => {
    const n = Math.max(1, parseInt(vehicles.value, 10) || 0);
    const p = Math.max(0, parseFloat(String(premium.value).replace(/\./g, "").replace(",", ".")) || 0);
    const [lo, hi] = cfg.saving[quote] || cfg.saving.mittel;
    const now = n * p, low = now * lo / 100, high = now * hi / 100;
    vehiclesOut.textContent = n.toLocaleString("de-DE");
    outBig.textContent = "bis zu " + eur(high);
    outNow.textContent = eur(now);
    outLow.textContent = eur(low);
    outHigh.textContent = eur(high);
    outThree.textContent = eur(low * 3) + " – " + eur(high * 3);
    root.dataset.state = JSON.stringify({ n, p, quote });
  };
  vehicles.addEventListener("input", update);
  premium.addEventListener("input", update);
  seg.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true"); quote = b.dataset.quote; update();
  }));
  update();

  /* Werte in die Terminbuchung übernehmen */
  const toBooking = $("#calc-to-booking");
  if (toBooking) toBooking.addEventListener("click", () => {
    const v = document.getElementById("bk-vehicles");
    if (v) v.value = vehicles.value;
  });
})();
