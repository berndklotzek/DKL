/* ============================================================================
   Was nach einer bezahlten Bestellung passiert.

   Hier steht bewusst wenig: Ohne Datenbank und ohne Warenwirtschaft ist die
   ehrlichste Lösung, die Bestellung zu protokollieren und Ihnen eine E-Mail zu
   schicken. Sobald ein Lagersystem dazukommt, wird diese Datei erweitert.
   ========================================================================= */

export async function verarbeiteEreignis(ereignis, env) {
  switch (ereignis.type) {
    case 'checkout.session.completed': {
      const s = ereignis.data.object;
      // Bei Lastschrift oder Rechnung ist die Sitzung abgeschlossen, das Geld
      // aber noch nicht da. Erst 'paid' heisst bezahlt.
      const bezahlt = s.payment_status === 'paid';
      const bestellung = {
        sitzung: s.id,
        bezahlt,
        betrag: (s.amount_total / 100).toFixed(2) + ' ' + String(s.currency).toUpperCase(),
        email: s.customer_details && s.customer_details.email,
        name: s.customer_details && s.customer_details.name,
        telefon: s.customer_details && s.customer_details.phone,
        lieferadresse: s.collected_information && s.collected_information.shipping_details
          || s.shipping_details || null,
        notiz: s.metadata && s.metadata.notiz,
      };
      console.log('Bestellung', JSON.stringify(bestellung));
      await benachrichtige(bestellung, env);
      break;
    }

    case 'checkout.session.async_payment_succeeded':
      console.log('Zahlung nachträglich eingegangen:', ereignis.data.object.id);
      await benachrichtige({ sitzung: ereignis.data.object.id, bezahlt: true }, env);
      break;

    case 'checkout.session.async_payment_failed':
      console.warn('Zahlung fehlgeschlagen:', ereignis.data.object.id);
      break;

    case 'charge.refunded':
      console.log('Rückerstattung:', ereignis.data.object.id);
      break;

    default:
      // Unbekannte Ereignisse mit 200 quittieren, sonst wiederholt Stripe sie.
      break;
  }
}

/* Benachrichtigung über einen HTTP-Endpunkt Ihrer Wahl.
   ORDER_WEBHOOK_URL kann ein E-Mail-Dienst, ein Zapier-Haken oder ein
   Nachrichtenkanal sein. Ist nichts gesetzt, bleibt es beim Protokolleintrag. */
async function benachrichtige(bestellung, env) {
  const ziel = env.ORDER_WEBHOOK_URL;
  if (!ziel) { return; }
  try {
    await fetch(ziel, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Neue Bestellung', bestellung }),
    });
  } catch (e) {
    // Eine gescheiterte Benachrichtigung darf den Webhook nicht scheitern
    // lassen — sonst stellt Stripe stundenlang erneut zu.
    console.error('Benachrichtigung fehlgeschlagen:', e);
  }
}
