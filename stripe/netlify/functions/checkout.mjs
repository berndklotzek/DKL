/* Netlify Function: erzeugt die Stripe-Zahlungssitzung.
   Aufruf vom Browser: POST /.netlify/functions/checkout            */

import { readFileSync } from 'node:fs';
import { handleCheckout, corsHeaders, CheckoutError } from '../../lib/core.mjs';

const KATALOG = JSON.parse(readFileSync(new URL('../../catalog.json', import.meta.url), 'utf8'));

export default async (request) => {
  const ursprung = (process.env.SITE_URL || '').replace(/\/$/, '');
  const kopf = corsHeaders(ursprung);

  if (request.method === 'OPTIONS') { return new Response(null, { status: 204, headers: kopf }); }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ fehler: 'Nur POST.' }), { status: 405, headers: kopf });
  }

  try {
    const ergebnis = await handleCheckout({
      rumpf: await request.text(),
      env: { ...process.env, KATALOG },
    });
    return new Response(JSON.stringify(ergebnis), { status: 200, headers: kopf });
  } catch (e) {
    const status = e instanceof CheckoutError ? e.status : 500;
    // Interne Fehler nicht nach aussen durchreichen.
    const text = status >= 500 && !(e instanceof CheckoutError)
      ? 'Die Zahlung konnte nicht gestartet werden. Bitte später erneut versuchen.'
      : e.message;
    console.error('checkout:', e);
    return new Response(JSON.stringify({ fehler: text }), { status, headers: kopf });
  }
};
