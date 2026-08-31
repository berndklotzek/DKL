/* Cloudflare Worker: beide Endpunkte in einer Datei.
   Routen:  POST /api/checkout   und   POST /api/stripe-webhook

   Der Katalog wird eingebettet, weil Worker kein Dateisystem haben:
       import KATALOG from '../catalog.json';  (mit "nodejs_compat" oder Bundler)
   Alternativ den Inhalt von catalog.json als Umgebungsvariable KATALOG_JSON
   hinterlegen — das ist der Weg ohne Bundler.                                */

import { handleCheckout, corsHeaders, verifySignature, CheckoutError } from '../lib/core.mjs';
import { verarbeiteEreignis } from '../lib/fulfillment.mjs';

export default {
  async fetch(request, env) {
    const pfad = new URL(request.url).pathname;
    const ursprung = (env.SITE_URL || '').replace(/\/$/, '');

    if (pfad === '/api/checkout') {
      const kopf = corsHeaders(ursprung);
      if (request.method === 'OPTIONS') { return new Response(null, { status: 204, headers: kopf }); }
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ fehler: 'Nur POST.' }), { status: 405, headers: kopf });
      }
      try {
        const katalog = JSON.parse(env.KATALOG_JSON);
        const ergebnis = await handleCheckout({
          rumpf: await request.text(),
          env: { ...env, KATALOG: katalog },
        });
        return new Response(JSON.stringify(ergebnis), { status: 200, headers: kopf });
      } catch (e) {
        const status = e instanceof CheckoutError ? e.status : 500;
        const text = e instanceof CheckoutError ? e.message
          : 'Die Zahlung konnte nicht gestartet werden. Bitte später erneut versuchen.';
        console.error('checkout:', e);
        return new Response(JSON.stringify({ fehler: text }), { status, headers: kopf });
      }
    }

    if (pfad === '/api/stripe-webhook') {
      if (request.method !== 'POST') { return new Response('Nur POST.', { status: 405 }); }
      try {
        const roh = await request.text();
        const ereignis = await verifySignature(
          roh, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
        await verarbeiteEreignis(ereignis, env);
        return new Response(JSON.stringify({ empfangen: true }), { status: 200 });
      } catch (e) {
        console.error('webhook:', e);
        return new Response(JSON.stringify({ fehler: e.message }),
                            { status: e instanceof CheckoutError ? e.status : 500 });
      }
    }

    return new Response('Nicht gefunden.', { status: 404 });
  },
};
