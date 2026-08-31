/* Netlify Function: nimmt Stripe-Ereignisse entgegen.
   Endpunkt in Stripe eintragen: https://IHRE-DOMAIN/.netlify/functions/stripe-webhook

   Ohne diesen Endpunkt erfahren Sie von einer Bestellung nur, wenn der Kunde
   auf der Erfolgsseite landet — und das tut er nicht immer. Zahlungen per
   Lastschrift oder Rechnung werden ausserdem erst Tage später bestätigt.      */

import { verifySignature, CheckoutError } from '../../lib/core.mjs';
import { verarbeiteEreignis } from '../../lib/fulfillment.mjs';

export default async (request) => {
  if (request.method !== 'POST') { return new Response('Nur POST.', { status: 405 }); }

  const geheim = process.env.STRIPE_WEBHOOK_SECRET;
  if (!geheim) { return new Response('STRIPE_WEBHOOK_SECRET fehlt.', { status: 500 }); }

  try {
    // Der rohe Rumpf ist zwingend: Geparstes JSON verändert die Bytes und
    // die Signatur passt dann nicht mehr.
    const roh = await request.text();
    const ereignis = await verifySignature(roh, request.headers.get('stripe-signature'), geheim);
    await verarbeiteEreignis(ereignis, process.env);
    return new Response(JSON.stringify({ empfangen: true }), { status: 200 });
  } catch (e) {
    console.error('webhook:', e);
    const status = e instanceof CheckoutError ? e.status : 500;
    return new Response(JSON.stringify({ fehler: e.message }), { status });
  }
};
