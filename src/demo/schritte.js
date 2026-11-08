import { reactive } from 'vue'

// Die 5 Demo-Schritte aus der README.
// "fokus": Bereiche (data-bereich), die hell bleiben. Alles andere wird abgedunkelt.
// "knoten": Station im Ablaufdiagramm, die zusätzlich markiert wird.
// Im Hinweis stehen Code-Teile in `Backticks`.
export const schritte = [
  {
    titel: 'Abfangen',
    hinweis: 'Kein Backend. Jeder Request läuft durch den Service Worker.',
    fokus: ['app-kopf', 'app-liste', 'diagramm', 'liste'],
    knoten: 'sw',
  },
  {
    titel: 'Handler',
    hinweis: 'Im Editor: `src/mocks/handlers.js`',
    fokus: ['app-liste', 'diagramm', 'liste'],
    knoten: 'handler',
  },
  {
    titel: 'Szenarien',
    hinweis: 'Tasten 1–4: `worker.use()` setzt einen anderen Handler davor',
    fokus: ['szenarien', 'diagramm', 'app-kopf', 'app-liste'],
    knoten: 'handler',
  },
  {
    titel: 'Tests',
    hinweis: 'Im Terminal: `npm test` mit denselben Handlern',
    fokus: [],
    knoten: null,
  },
  {
    titel: 'Kein Handler',
    hinweis: '„Öffnungszeiten“: kein Handler, Request geht ans Netzwerk',
    fokus: ['app-fuss', 'diagramm', 'liste'],
    knoten: 'netz',
  },
]

// 0 = Übersicht ohne Hervorhebung, 1–5 = Schritt
export const demo = reactive({ schritt: 0 })
