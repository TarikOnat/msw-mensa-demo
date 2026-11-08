# MSW-Demo: Mensa-Speiseplan

Live-Demo zur Präsentation **„Mock Service Worker“** im Modul *Komponentenbasierte Entwicklung* (HTW Berlin, WiSe 2026/27).

Eine kleine Vue-App zeigt den Speiseplan einer Mensa. Ein Backend gibt es nicht: Alle API-Anfragen beantwortet [Mock Service Worker](https://mswjs.io) (MSW). Die App selbst weiß davon nichts.

Stack: Vue 3 · Vite · **MSW 3** · Vitest

## Starten

```bash
npm install
npm run dev            # App mit MSW auf http://localhost:5173
npm test               # Tests mit denselben Handlern wie im Browser
npm run dev:ohne-msw   # dieselbe App ohne MSW (es gibt kein Backend)
```

Läuft komplett offline. Node.js 22.22 oder neuer ist nötig (Voraussetzung von MSW 3).

## Demo-Ablauf

| # | Schritt | MSW-Funktion |
|---|---------|--------------|
| 1 | App lädt den Speiseplan, obwohl kein Backend läuft. Der Inspector zeigt jeden abgefangenen Request. | Abfangen per Service Worker, Life-Cycle-Events (`worker.events`) |
| 2 | Handler im Code: `GET /api/speiseplan/:tag` mit Pfad-Parameter, `POST /api/bewertung` liest den Request-Body | Request Handler (`http`, `HttpResponse`) |
| 3 | Szenario wechseln: langsam, Fehler, leer | Handler zur Laufzeit überschreiben (`worker.use`, `delay`) |
| 4 | `npm test`: dieselben Handler in Node.js, Fehlerfall per `server.use` | `setupServer`, Wiederverwendung |
| 5 | „Öffnungszeiten anzeigen“: Für diese Adresse gibt es keinen Handler | Passthrough, Warnung bei unbehandelten Requests |

### Steuerung während der Demo

| Taste | Wirkung |
|-------|---------|
| ← / → | Demo-Schritt zurück / weiter. Die Schrittleiste hebt hervor, worauf es ankommt. |
| Esc | Hervorhebung aus, alles sichtbar |
| 1 – 4 | Szenario normal / langsam / Fehler / leer |

Das Ablaufdiagramm zeigt jeden Request als Punkt auf dem Weg App → Service Worker → Handler → Antwort. Requests ohne Handler nehmen die Abzweigung über das echte Netzwerk. Farben: grün = gemockt, rot = Fehlerstatus, gelb = wartet, blau = durchgelassen.

## Projektstruktur

```
src/
├── api.js                  # App-Code: fetch-Aufrufe, kennt MSW nicht
├── components/             # die eigentliche App, kennt MSW nicht
│   ├── Speiseplan.vue      # Speiseplan mit Zuständen laden / Fehler / leer
│   ├── Sternebewertung.vue
│   ├── KategorieIcon.vue   # Icons vegan / vegetarisch / Fleisch / Fisch
│   └── LadeSkelett.vue
├── mocks/
│   ├── handlers.js         # Request Handler (Browser und Tests)
│   ├── szenarien.js        # Sonderfälle: langsam, Fehler, leer
│   ├── daten.js            # Beispieldaten
│   ├── browser.js          # setupWorker: MSW im Browser
│   └── node.js             # setupServer: MSW in Node.js (Tests)
├── demo/
│   ├── DemoPanel.vue       # Szenario-Steuerung und Inspector (nur Entwicklung)
│   ├── Ablaufdiagramm.vue  # Requests als Punkte auf dem Weg durch MSW
│   ├── Schrittleiste.vue   # die 5 Demo-Schritte oben
│   ├── schritte.js         # Texte und Hervorhebungen der Schritte
│   └── inspector.js        # wertet die Life-Cycle-Events von MSW aus
├── tokens.css              # alle Farben, Schriften und Abstände
└── main.js                 # startet MSW nur im Entwicklungsmodus
tests/
├── setup.js                # server.listen / resetHandlers / close
└── api.test.js             # 8 Tests gegen die gemockte API
public/
├── bilder/                 # Tellerbilder der Gerichte (SVG)
└── mockServiceWorker.js    # Worker-Skript, erzeugt mit `npx msw init public`
```

## Wichtig zu wissen

- **MSW startet nur im Entwicklungsmodus.** Im Produktions-Build (`npm run build`) ist MSW nicht enthalten.
- **Der App-Code bleibt unverändert.** `src/api.js` ruft dieselben Adressen auf, die später ein echtes Backend bedient.
- **Die Speiseplan-Daten sind erfunden.** Das Datum ist immer das echte Datum von heute und morgen.
- **Schriften kommen aus npm** (`@fontsource`). Die App braucht kein Internet.
