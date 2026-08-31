/* ============================================================================
   Tests für die Zahlungslogik.

   Prüft genau die Stellen, an denen ein Fehler Geld kostet: Preisbildung,
   Manipulationsschutz, Versandkosten und Signaturprüfung. Es wird kein
   Stripe-Konto und keine Netzverbindung benötigt.

       node stripe/test.mjs
   ========================================================================= */

import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import {
  buildLineItems, shippingOptions, toFormBody, sessionParams,
  verifySignature, CheckoutError,
} from './lib/core.mjs';

const katalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
const SITE = 'https://www.arktik-klima.de';

let bestanden = 0, gescheitert = 0;

function pruefe(name, fn) {
  try { fn(); console.log('  OK      ' + name); bestanden++; }
  catch (e) { console.log('  FEHLER  ' + name + '\n          ' + e.message); gescheitert++; }
}
async function pruefeAsync(name, fn) {
  try { await fn(); console.log('  OK      ' + name); bestanden++; }
  catch (e) { console.log('  FEHLER  ' + name + '\n          ' + e.message); gescheitert++; }
}
function gleich(ist, soll, was) {
  const a = JSON.stringify(ist), b = JSON.stringify(soll);
  if (a !== b) { throw new Error((was || '') + ' erwartet ' + b + ', bekommen ' + a); }
}
function wirft(fn, teil) {
  try { fn(); } catch (e) {
    if (!(e instanceof CheckoutError)) { throw new Error('falscher Fehlertyp: ' + e); }
    if (teil && !e.message.includes(teil)) {
      throw new Error('Meldung "' + e.message + '" enthält nicht "' + teil + '"');
    }
    return;
  }
  throw new Error('hätte einen Fehler werfen müssen');
}

console.log('\nPreisbildung');

pruefe('Preis kommt aus dem Katalog, nicht aus dem Browser', () => {
  // Der Browser behauptet einen Preis von einem Cent — er wird ignoriert.
  const w = [{ sku: 'ARK-FQC12', qty: 1, price: 0.01, name: 'Geschenkt' }];
  const { positionen, zwischensumme } = buildLineItems(w, katalog, SITE);
  gleich(positionen[0].price_data.unit_amount, 74900, 'Stückpreis');
  gleich(positionen[0].price_data.product_data.name, 'ARKTIK Frost QC12 Quick-Connect', 'Name');
  gleich(zwischensumme, 74900, 'Zwischensumme');
});

pruefe('Mengen werden multipliziert', () => {
  const { zwischensumme } = buildLineItems(
    [{ sku: 'ARK-MVD9', qty: 2 }, { sku: 'ARK-ZUB-FA', qty: 3 }], katalog, SITE);
  gleich(zwischensumme, 54900 * 2 + 3900 * 3, 'Zwischensumme');
});

pruefe('Bruttopreise werden als inklusive gekennzeichnet', () => {
  const { positionen } = buildLineItems([{ sku: 'ARK-MV5', qty: 1 }], katalog, SITE);
  gleich(positionen[0].price_data.tax_behavior, 'inclusive', 'Steuerverhalten');
});

console.log('\nManipulationsschutz');

pruefe('unbekannte Artikelnummer wird abgewiesen', () =>
  wirft(() => buildLineItems([{ sku: 'GIBT-ES-NICHT', qty: 1 }], katalog, SITE), 'Unbekannte'));
pruefe('Menge null wird abgewiesen', () =>
  wirft(() => buildLineItems([{ sku: 'ARK-MV5', qty: 0 }], katalog, SITE), 'Menge'));
pruefe('negative Menge wird abgewiesen', () =>
  wirft(() => buildLineItems([{ sku: 'ARK-MV5', qty: -5 }], katalog, SITE), 'Menge'));
pruefe('Kommazahl als Menge wird abgewiesen', () =>
  wirft(() => buildLineItems([{ sku: 'ARK-MV5', qty: 1.5 }], katalog, SITE), 'Menge'));
pruefe('absurde Menge wird gedeckelt', () =>
  wirft(() => buildLineItems([{ sku: 'ARK-MV5', qty: 9999 }], katalog, SITE), 'Menge'));
pruefe('doppelte Position wird abgewiesen', () =>
  wirft(() => buildLineItems(
    [{ sku: 'ARK-MV5', qty: 1 }, { sku: 'ARK-MV5', qty: 1 }], katalog, SITE), 'doppelt'));
pruefe('leerer Warenkorb wird abgewiesen', () =>
  wirft(() => buildLineItems([], katalog, SITE), 'leer'));
pruefe('kein Array wird abgewiesen', () =>
  wirft(() => buildLineItems('alles gratis', katalog, SITE), 'leer'));

console.log('\nVersandkosten');

pruefe('unter der Schwelle: Paketversand Deutschland', () => {
  const [v] = shippingOptions(katalog, 27900, false, 'DE');
  gleich(v.shipping_rate_data.fixed_amount.amount, 590, 'Betrag');
  gleich(v.shipping_rate_data.display_name, 'Paketversand', 'Bezeichnung');
});

pruefe('unter der Schwelle: ein Speditionsartikel genügt', () => {
  const [v] = shippingOptions(katalog, 27900, true, 'DE');
  gleich(v.shipping_rate_data.fixed_amount.amount, 2990, 'Betrag');
});

pruefe('ab 499 Euro versandkostenfrei', () => {
  const [v] = shippingOptions(katalog, 49900, true, 'DE');
  gleich(v.shipping_rate_data.fixed_amount.amount, 0, 'Betrag');
  gleich(v.shipping_rate_data.display_name, 'Versandkostenfrei', 'Bezeichnung');
});

pruefe('einen Cent darunter kostet Versand', () => {
  const [v] = shippingOptions(katalog, 49899, true, 'DE');
  gleich(v.shipping_rate_data.fixed_amount.amount, 2990, 'Betrag');
});

pruefe('Österreich hat eigene Sätze', () => {
  gleich(shippingOptions(katalog, 10000, true, 'AT')[0].shipping_rate_data.fixed_amount.amount, 4990);
  gleich(shippingOptions(katalog, 10000, false, 'AT')[0].shipping_rate_data.fixed_amount.amount, 1290);
});

pruefe('nicht belieferte Länder werden abgewiesen', () =>
  wirft(() => shippingOptions(katalog, 10000, false, 'CH'), 'liefern derzeit nicht'));

pruefe('Versandart folgt dem Katalog', () => {
  const schwer = buildLineItems([{ sku: 'ARK-MVD12', qty: 1 }], katalog, SITE);
  gleich(schwer.brauchtSpedition, true, 'Move Duo 12 wiegt 36 kg');
  const leicht = buildLineItems([{ sku: 'ARK-MV5', qty: 1 }], katalog, SITE);
  gleich(leicht.brauchtSpedition, false, 'Move 5 wiegt 20 kg');
});

console.log('\nFormularkodierung für Stripe');

pruefe('verschachtelte Felder in Klammernotation', () => {
  const kodiert = toFormBody({ mode: 'payment', shipping: { rate: { amount: 2990 } } });
  const p = new URLSearchParams(kodiert);
  gleich(p.get('mode'), 'payment');
  gleich(p.get('shipping[rate][amount]'), '2990');
});

pruefe('Listen mit Index, Objekte darin verschachtelt', () => {
  const p = new URLSearchParams(toFormBody({
    line_items: [{ quantity: 2, price_data: { unit_amount: 74900 } }],
  }));
  gleich(p.get('line_items[0][quantity]'), '2');
  gleich(p.get('line_items[0][price_data][unit_amount]'), '74900');
});

pruefe('Zeichenlisten behalten ihren Index', () => {
  const p = new URLSearchParams(toFormBody({
    shipping_address_collection: { allowed_countries: ['DE', 'AT'] },
  }));
  gleich(p.get('shipping_address_collection[allowed_countries][0]'), 'DE');
  gleich(p.get('shipping_address_collection[allowed_countries][1]'), 'AT');
});

pruefe('leere Werte fallen heraus', () => {
  const p = new URLSearchParams(toFormBody({ a: 'x', b: undefined, c: null }));
  gleich(p.has('b'), false); gleich(p.has('c'), false); gleich(p.get('a'), 'x');
});

pruefe('Umlaute und Sonderzeichen werden kodiert', () => {
  const p = new URLSearchParams(toFormBody({ name: 'Kühlgerät & Zubehör' }));
  gleich(p.get('name'), 'Kühlgerät & Zubehör');
});

console.log('\nSitzungsparameter');

pruefe('Erfolgs- und Abbruchadresse zeigen auf die eigene Domain', () => {
  const { positionen } = buildLineItems([{ sku: 'ARK-MV5', qty: 1 }], katalog, SITE);
  const p = sessionParams({
    positionen, versand: shippingOptions(katalog, 27900, false, 'DE'), siteUrl: SITE });
  gleich(p.success_url, SITE + '/bestellung-erfolgreich.html?sitzung={CHECKOUT_SESSION_ID}');
  gleich(p.cancel_url, SITE + '/warenkorb.html');
  gleich(p.locale, 'de');
  gleich(p.mode, 'payment');
  gleich(p.consent_collection.terms_of_service, 'required');
});

pruefe('kompletter Warenkorb lässt sich kodieren', () => {
  const { positionen, zwischensumme, brauchtSpedition } = buildLineItems(
    [{ sku: 'ARK-FQC12', qty: 1 }, { sku: 'ARK-ZUB-MS5', qty: 1 }], katalog, SITE);
  const kodiert = toFormBody(sessionParams({
    positionen, versand: shippingOptions(katalog, zwischensumme, brauchtSpedition, 'DE'),
    siteUrl: SITE, email: 'kunde@example.de' }));
  const p = new URLSearchParams(kodiert);
  gleich(p.get('line_items[0][price_data][unit_amount]'), '74900');
  gleich(p.get('line_items[1][price_data][unit_amount]'), '8900');
  gleich(p.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), '0',
         'ab 499 Euro versandkostenfrei');
  gleich(p.get('customer_email'), 'kunde@example.de');
});

console.log('\nWebhook-Signatur');

const GEHEIM = 'whsec_testgeheimnis';
function signiere(rumpf, zeit = Math.floor(Date.now() / 1000), geheim = GEHEIM) {
  const hmac = createHmac('sha256', geheim).update(zeit + '.' + rumpf).digest('hex');
  return { kopf: 't=' + zeit + ',v1=' + hmac, rumpf };
}

await pruefeAsync('gültige Signatur wird angenommen', async () => {
  const rumpf = JSON.stringify({ type: 'checkout.session.completed', id: 'evt_1' });
  const { kopf } = signiere(rumpf);
  const ereignis = await verifySignature(rumpf, kopf, GEHEIM);
  gleich(ereignis.type, 'checkout.session.completed');
});

await pruefeAsync('falsches Geheimnis wird abgewiesen', async () => {
  const rumpf = JSON.stringify({ type: 'x' });
  const { kopf } = signiere(rumpf, undefined, 'whsec_falsch');
  try { await verifySignature(rumpf, kopf, GEHEIM); }
  catch (e) { gleich(e.message.includes('stimmt nicht'), true); return; }
  throw new Error('hätte abweisen müssen');
});

await pruefeAsync('veränderter Rumpf wird abgewiesen', async () => {
  const echt = JSON.stringify({ betrag: 74900 });
  const { kopf } = signiere(echt);
  try { await verifySignature(JSON.stringify({ betrag: 1 }), kopf, GEHEIM); }
  catch (e) { gleich(e.message.includes('stimmt nicht'), true); return; }
  throw new Error('hätte abweisen müssen');
});

await pruefeAsync('alte Signatur wird abgewiesen (Wiedereinspielung)', async () => {
  const rumpf = JSON.stringify({ type: 'x' });
  const { kopf } = signiere(rumpf, Math.floor(Date.now() / 1000) - 4000);
  try { await verifySignature(rumpf, kopf, GEHEIM); }
  catch (e) { gleich(e.message.includes('zu alt'), true); return; }
  throw new Error('hätte abweisen müssen');
});

await pruefeAsync('fehlender Signaturkopf wird abgewiesen', async () => {
  try { await verifySignature('{}', '', GEHEIM); }
  catch (e) { gleich(e.message.includes('fehlt'), true); return; }
  throw new Error('hätte abweisen müssen');
});

await pruefeAsync('mehrere v1-Signaturen: eine gültige genügt', async () => {
  const rumpf = JSON.stringify({ type: 'x' });
  const zeit = Math.floor(Date.now() / 1000);
  const echt = createHmac('sha256', GEHEIM).update(zeit + '.' + rumpf).digest('hex');
  const kopf = 't=' + zeit + ',v1=' + 'a'.repeat(64) + ',v1=' + echt;
  await verifySignature(rumpf, kopf, GEHEIM);
});

console.log('\n' + bestanden + ' bestanden, ' + gescheitert + ' gescheitert\n');
process.exit(gescheitert ? 1 : 0);
