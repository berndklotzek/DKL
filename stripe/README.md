# Stripe einrichten

Der Shop ist eine statische Website. Für Zahlungen kommt genau eine
Serverfunktion dazu — mehr braucht es nicht.

**Warum überhaupt ein Server?** Weil der Warenkorb im Browser des Kunden liegt
und dort manipulierbar ist. Käme der Preis aus dem Browser, könnte jeder mit der
Entwicklerkonsole eine Anlage für einen Euro kaufen. Die Funktion nimmt deshalb
nur **Artikelnummer und Menge** entgegen und schlägt den Preis in
`catalog.json` nach. Ausserdem darf der geheime Stripe-Schlüssel niemals in
den Browser gelangen.

```
stripe/
  catalog.json                       Preisquelle, wird von tools/build.py erzeugt
  lib/core.mjs                       Warenkorbprüfung, Versand, Stripe-Aufruf, Signaturprüfung
  lib/fulfillment.mjs                was nach einer bezahlten Bestellung passiert
  netlify/functions/checkout.mjs     erzeugt die Zahlungssitzung
  netlify/functions/stripe-webhook.mjs  nimmt Stripe-Ereignisse entgegen
  cloudflare/worker.mjs              dieselben zwei Endpunkte für Cloudflare
  netlify.toml                       Netlify-Konfiguration
  test.mjs                           Tests der Zahlungslogik
```

Kein Stripe-SDK, keine node_modules. Nur `fetch` und Web Crypto — läuft auf
Netlify, Cloudflare Workers, Vercel und in jedem Node ab Version 18.

---

## Einrichtung in sieben Schritten

### 1. Stripe-Konto anlegen

Auf `dashboard.stripe.com` registrieren, Unternehmensdaten hinterlegen
(Einzelunternehmen, Ihre Anschrift, IBAN). Bis zur Freischaltung arbeiten Sie im
**Testmodus** — das reicht für alles Folgende.

### 2. Schlüssel holen

Dashboard → Entwickler → API-Schlüssel:

- **Veröffentlichbarer Schlüssel** (`pk_test_…`) — wird hier nicht gebraucht
- **Geheimer Schlüssel** (`sk_test_…`) — kommt in die Umgebungsvariablen

Der geheime Schlüssel gehört **niemals** in das Repository. Wer ihn hat, kann
Zahlungen in Ihrem Namen auslösen und Geld zurückbuchen.

### 3. Rechtstexte in Stripe hinterlegen

Dashboard → Einstellungen → Geschäftsdaten. Dort die Adressen eintragen:

- AGB: `https://IHRE-DOMAIN/recht/agb.html`
- Datenschutz: `https://IHRE-DOMAIN/recht/datenschutz.html`

Ohne den AGB-Link zeigt Stripe das Zustimmungshäkchen nicht an, das die Funktion
mit `consent_collection` anfordert — die Sitzung schlägt dann fehl.

### 4. Zahlungsarten aktivieren

Dashboard → Einstellungen → Zahlungsmethoden. Für Deutschland sinnvoll: Karte,
PayPal, Klarna, SEPA-Lastschrift, Giropay/EPS für Österreich. Stripe blendet
automatisch ein, was zum Land und Betrag des Kunden passt.

### 5. Veröffentlichen

**Netlify** (der einfachere Weg):

```bash
cp stripe/netlify.toml ./netlify.toml        # ins Wurzelverzeichnis
netlify deploy --prod
```

Umgebungsvariablen unter Site settings → Environment variables:

| Variable | Wert |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…`, später `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | aus Schritt 6 |
| `SITE_URL` | `https://www.arktik-klima.de` ohne Schrägstrich am Ende |
| `ORDER_WEBHOOK_URL` | optional, für Bestellbenachrichtigungen |

**Cloudflare Workers:** `stripe/cloudflare/worker.mjs` als Worker
veröffentlichen, dieselben Variablen setzen und zusätzlich den Inhalt von
`catalog.json` als `KATALOG_JSON` hinterlegen. Danach in `tools/build.py` unter
`SITE["checkout_endpoint"]` auf `/api/checkout` umstellen und neu bauen.

### 6. Webhook einrichten

Dashboard → Entwickler → Webhooks → Endpunkt hinzufügen:

- Adresse: `https://IHRE-DOMAIN/.netlify/functions/stripe-webhook`
- Ereignisse: `checkout.session.completed`,
  `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`

Das angezeigte Signaturgeheimnis (`whsec_…`) als `STRIPE_WEBHOOK_SECRET`
hinterlegen.

**Der Webhook ist nicht optional.** Die Erfolgsseite erreicht nicht jeder Kunde
— manche schliessen den Browser nach der Zahlung. Und bei Lastschrift oder
Klarna wird erst Tage später bezahlt. Ohne Webhook erfahren Sie von diesen
Bestellungen nichts.

### 7. Testen

```bash
node stripe/test.mjs        # prüft Preise, Versand und Signatur ohne Netz
```

Dann eine echte Testbestellung im Testmodus:

| Fall | Kartennummer |
|---|---|
| Zahlung erfolgreich | `4242 4242 4242 4242` |
| Karte abgelehnt | `4000 0000 0000 0002` |
| 3-D-Secure erforderlich | `4000 0025 0000 3155` |

Beliebiges künftiges Ablaufdatum, beliebige Prüfziffer. Webhook lokal prüfen:

```bash
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

**Bevor Sie live gehen:** einmal den kompletten Weg durchspielen — bestellen,
zahlen, Bestätigung prüfen, im Dashboard die Zahlung sehen, danach eine
Rückerstattung auslösen und prüfen, dass `charge.refunded` ankommt.

---

## Was die Funktion prüft

Diese Fälle sind in `test.mjs` abgedeckt und laufen bei jeder Änderung mit:

- Der Preis kommt aus dem Katalog. Ein manipulierter Warenkorb mit
  `price: 0.01` ändert nichts.
- Unbekannte Artikelnummern, Mengen unter 1, über 20, Kommazahlen und doppelte
  Positionen werden abgewiesen.
- Versandkosten: ab 499 € frei, darunter Paket oder Spedition je nach
  schwerster Position, eigene Sätze für Österreich.
- Webhook-Signatur: falsches Geheimnis, veränderter Rumpf und alte Zeitstempel
  werden abgewiesen. Der Vergleich läuft mit konstanter Laufzeit.

---

## Rechtliche Punkte, die an der Zahlung hängen

- **Die Bestellschaltfläche heisst „Zahlungspflichtig bestellen".** Das
  schreibt § 312j Abs. 3 BGB vor, und die Bestellung wird auf **unserer**
  Kassenseite ausgelöst — nicht erst bei Stripe, dessen Schaltfläche „Bezahlen"
  heisst. Ändern Sie die Beschriftung nicht.
- **Zustimmung zu AGB und Widerrufsbelehrung** wird auf der Kassenseite
  eingeholt; Stripe protokolliert sie über `consent_collection` ein zweites Mal.
- **Bestellbestätigung.** Stripe verschickt eine Zahlungsquittung, das ist
  **keine** Bestellbestätigung im Sinne des BGB. Die muss unverzüglich mit allen
  Vertragsdaten von Ihnen kommen — über `ORDER_WEBHOOK_URL` an einen
  E-Mail-Dienst oder vorerst von Hand.
- **Rechnung.** `invoice_creation` ist eingeschaltet, Stripe erzeugt also eine
  Rechnung. Ob deren Pflichtangaben für das deutsche Umsatzsteuerrecht
  ausreichen, prüfen Sie mit dem Steuerbüro, bevor Sie sich darauf verlassen.
- **Datenschutz.** Mit Stripe brauchen Sie einen Auftragsverarbeitungsvertrag,
  und die Datenschutzerklärung muss Stripe als Empfänger nennen. Der
  mitgelieferte Text beschreibt noch den Zustand ohne Zahlungsdienstleister und
  ist zu ergänzen.

---

## Was ich nicht prüfen konnte

Die Logik ist getestet, der Weg zu Stripe nicht: Aus der Entwicklungsumgebung
heraus gibt es weder ein Stripe-Konto noch Zugriff auf `api.stripe.com`. Der
Code ist gegen die dokumentierte REST-Schnittstelle geschrieben, aber die erste
echte Testbestellung nach Schritt 7 ersetzt keine Prüfung — machen Sie sie,
bevor Sie den Live-Schlüssel eintragen.
