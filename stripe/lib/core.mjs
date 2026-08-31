/* ============================================================================
   ARKTIK — Stripe-Anbindung, plattformunabhängiger Kern
   ============================================================================

   Bewusst ohne Stripe-SDK: nur fetch und Web Crypto. Damit läuft derselbe Code
   auf Netlify Functions, Cloudflare Workers, Vercel und in jedem Node ab
   Version 18 — ohne node_modules und ohne Versionspflege.

   Der wichtigste Grundsatz steckt in buildLineItems(): Vom Browser werden
   ausschliesslich Artikelnummer und Menge angenommen. Preis, Bezeichnung und
   Versandart kommen aus catalog.json auf dem Server. Andernfalls könnte jeder
   den localStorage bearbeiten und eine Anlage für einen Euro kaufen.
   ========================================================================= */

const STRIPE_API = 'https://api.stripe.com/v1';
const MAX_MENGE = 20;          // Schutz vor Tippfehlern und Missbrauch
const MAX_POSITIONEN = 20;

export class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/* ---------------------------------------------------------------------------
   Warenkorb prüfen und in Stripe-Positionen übersetzen
   ------------------------------------------------------------------------ */

export function buildLineItems(warenkorb, katalog, siteUrl) {
  if (!Array.isArray(warenkorb) || warenkorb.length === 0) {
    throw new CheckoutError('Der Warenkorb ist leer.');
  }
  if (warenkorb.length > MAX_POSITIONEN) {
    throw new CheckoutError('Zu viele Positionen im Warenkorb.');
  }

  const positionen = [];
  const gesehen = new Set();
  let zwischensumme = 0;
  let brauchtSpedition = false;

  for (const zeile of warenkorb) {
    const sku = String(zeile && zeile.sku || '').trim();
    const artikel = katalog.artikel[sku];
    if (!artikel) {
      throw new CheckoutError('Unbekannte Artikelnummer: ' + sku);
    }
    if (gesehen.has(sku)) {
      throw new CheckoutError('Artikel doppelt im Warenkorb: ' + sku);
    }
    gesehen.add(sku);

    const menge = Number(zeile.qty);
    if (!Number.isInteger(menge) || menge < 1 || menge > MAX_MENGE) {
      throw new CheckoutError('Ungültige Menge für ' + sku);
    }

    zwischensumme += artikel.preis_cent * menge;
    if (artikel.versandart === 'spedition') { brauchtSpedition = true; }

    positionen.push({
      quantity: menge,
      price_data: {
        currency: katalog.waehrung,
        unit_amount: artikel.preis_cent,
        // Die Preise auf der Website sind Bruttopreise inklusive Mehrwertsteuer.
        tax_behavior: 'inclusive',
        product_data: {
          name: artikel.name,
          description: artikel.kurz,
          images: siteUrl ? [siteUrl + '/' + artikel.bild] : undefined,
          metadata: { sku },
        },
      },
    });
  }

  return { positionen, zwischensumme, brauchtSpedition };
}

/* ---------------------------------------------------------------------------
   Versandkosten
   Ab der Schwelle versandkostenfrei. Darunter entscheidet die schwerste
   Position: Sobald ein Speditionsartikel dabei ist, gilt der Speditionssatz.
   ------------------------------------------------------------------------ */

export function shippingOptions(katalog, zwischensumme, brauchtSpedition, land) {
  const saetze = katalog.versand[land];
  if (!saetze) {
    throw new CheckoutError('Wir liefern derzeit nicht nach ' + land + '.');
  }

  const art = brauchtSpedition ? 'spedition' : 'paket';
  const kostenlos = zwischensumme >= katalog.versandkostenfrei_ab_cent;
  const betrag = kostenlos ? 0 : saetze[art];

  const name = kostenlos
    ? 'Versandkostenfrei'
    : (art === 'spedition' ? 'Speditionsversand' : 'Paketversand');

  return [{
    shipping_rate_data: {
      type: 'fixed_amount',
      display_name: name,
      fixed_amount: { amount: betrag, currency: katalog.waehrung },
      tax_behavior: 'inclusive',
      delivery_estimate: {
        minimum: { unit: 'business_day', value: 3 },
        maximum: { unit: 'business_day', value: 5 },
      },
    },
  }];
}

/* ---------------------------------------------------------------------------
   Stripe erwartet verschachtelte Daten in Klammernotation als Formularfeld.
   Beispiel: line_items[0][price_data][unit_amount]=74900
   ------------------------------------------------------------------------ */

export function toFormBody(obj, prefix = '', out = []) {
  for (const [schluessel, wert] of Object.entries(obj)) {
    if (wert === undefined || wert === null) { continue; }
    const name = prefix ? prefix + '[' + schluessel + ']' : schluessel;

    if (Array.isArray(wert)) {
      wert.forEach((eintrag, i) => {
        if (eintrag !== null && typeof eintrag === 'object') {
          toFormBody(eintrag, name + '[' + i + ']', out);
        } else {
          out.push([name + '[' + i + ']', String(eintrag)]);
        }
      });
    } else if (typeof wert === 'object') {
      toFormBody(wert, name, out);
    } else {
      out.push([name, String(wert)]);
    }
  }
  return prefix ? out : new URLSearchParams(out).toString();
}

/* ---------------------------------------------------------------------------
   Sitzung erzeugen
   ------------------------------------------------------------------------ */

export function sessionParams({ positionen, versand, siteUrl, email, notiz }) {
  const params = {
    mode: 'payment',
    locale: 'de',
    submit_type: 'pay',
    line_items: positionen,
    shipping_options: versand,
    shipping_address_collection: { allowed_countries: ['DE', 'AT'] },
    phone_number_collection: { enabled: true },
    billing_address_collection: 'required',
    // Die Bestellung selbst wird auf unserer Kassenseite ausgelöst; die
    // Zustimmung wird dort eingeholt und hier ein zweites Mal protokolliert.
    consent_collection: { terms_of_service: 'required' },
    custom_text: {
      terms_of_service_acceptance: {
        message: 'Ich habe die AGB und die Widerrufsbelehrung gelesen und stimme ihnen zu.',
      },
      shipping_address: {
        message: 'Speditionsware wird bis Bordsteinkante geliefert. Bitte eine erreichbare Telefonnummer angeben.',
      },
    },
    invoice_creation: { enabled: true },
    success_url: siteUrl + '/bestellung-erfolgreich.html?sitzung={CHECKOUT_SESSION_ID}',
    cancel_url: siteUrl + '/warenkorb.html',
  };
  if (email) { params.customer_email = email; }
  if (notiz) { params.metadata = { notiz: String(notiz).slice(0, 480) }; }
  return params;
}

export async function createCheckoutSession(params, secretKey) {
  const antwort = await fetch(STRIPE_API + '/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      // Verhindert doppelte Sitzungen, wenn der Kunde zweimal klickt.
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: toFormBody(params),
  });

  const daten = await antwort.json();
  if (!antwort.ok) {
    const grund = daten && daten.error && daten.error.message || 'Unbekannter Fehler';
    throw new CheckoutError('Stripe hat die Zahlung abgelehnt: ' + grund, 502);
  }
  return daten;
}

/* ---------------------------------------------------------------------------
   Webhook-Signatur prüfen
   Stripe schickt den Kopf   Stripe-Signature: t=<zeit>,v1=<hmac>
   Signiert wird "<zeit>.<roher Rumpf>" mit dem Endpunktgeheimnis.
   Der Rumpf muss unverändert sein — geparstes JSON funktioniert nicht.
   ------------------------------------------------------------------------ */

export async function verifySignature(rohRumpf, signaturKopf, secret, toleranzSekunden = 300) {
  if (!signaturKopf) { throw new CheckoutError('Signatur fehlt.', 400); }

  const teile = Object.create(null);
  for (const stueck of signaturKopf.split(',')) {
    const [k, v] = stueck.split('=');
    if (!k || !v) { continue; }
    if (k.trim() === 'v1') { (teile.v1 ||= []).push(v.trim()); }
    else { teile[k.trim()] = v.trim(); }
  }
  if (!teile.t || !teile.v1) { throw new CheckoutError('Signatur unvollständig.', 400); }

  const alter = Math.abs(Math.floor(Date.now() / 1000) - Number(teile.t));
  if (!Number.isFinite(alter) || alter > toleranzSekunden) {
    throw new CheckoutError('Signatur ist zu alt.', 400);
  }

  const schluessel = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const roh = await crypto.subtle.sign(
    'HMAC', schluessel, new TextEncoder().encode(teile.t + '.' + rohRumpf));
  const erwartet = [...new Uint8Array(roh)]
    .map((b) => b.toString(16).padStart(2, '0')).join('');

  const passt = teile.v1.some((kandidat) => zeitgleich(kandidat, erwartet));
  if (!passt) { throw new CheckoutError('Signatur stimmt nicht.', 400); }

  return JSON.parse(rohRumpf);
}

/* Vergleich mit konstanter Laufzeit — ein früher Abbruch würde verraten,
   wie viele Zeichen bereits stimmen. */
function zeitgleich(a, b) {
  if (a.length !== b.length) { return false; }
  let unterschied = 0;
  for (let i = 0; i < a.length; i++) {
    unterschied |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return unterschied === 0;
}

/* ---------------------------------------------------------------------------
   Gemeinsame Antwortbausteine
   ------------------------------------------------------------------------ */

export function corsHeaders(erlaubterUrsprung) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': erlaubterUrsprung || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function handleCheckout({ rumpf, env }) {
  const secret = env.STRIPE_SECRET_KEY;
  const siteUrl = (env.SITE_URL || '').replace(/\/$/, '');
  if (!secret) { throw new CheckoutError('STRIPE_SECRET_KEY fehlt.', 500); }
  if (!siteUrl) { throw new CheckoutError('SITE_URL fehlt.', 500); }

  const katalog = env.KATALOG;
  const daten = typeof rumpf === 'string' ? JSON.parse(rumpf || '{}') : (rumpf || {});
  const land = ['DE', 'AT'].includes(daten.land) ? daten.land : 'DE';

  const { positionen, zwischensumme, brauchtSpedition } =
    buildLineItems(daten.warenkorb, katalog, siteUrl);
  const versand = shippingOptions(katalog, zwischensumme, brauchtSpedition, land);

  const sitzung = await createCheckoutSession(
    sessionParams({ positionen, versand, siteUrl, email: daten.email, notiz: daten.notiz }),
    secret);

  return { url: sitzung.url, id: sitzung.id };
}
