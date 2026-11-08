import { http, HttpResponse } from 'msw/http'
import { speiseplaene } from './daten.js'

// Die Request Handler beschreiben, wie das Backend antworten SOLL.
// Dieselben Handler laufen im Browser (src/mocks/browser.js)
// und in den Tests (src/mocks/node.js).
export const handlers = [
  // GET mit Pfad-Parameter: /api/speiseplan/heute, /api/speiseplan/morgen
  http.get('/api/speiseplan/:tag', ({ params }) => {
    const plan = speiseplaene[params.tag]

    if (!plan) {
      return HttpResponse.json(
        { fehler: `Kein Speiseplan für "${params.tag}"` },
        { status: 404 },
      )
    }

    return HttpResponse.json(plan)
  }),

  // POST mit Body: Der Handler liest, was die App schickt, und antwortet passend
  http.post('/api/bewertung', async ({ request }) => {
    const { gerichtId, sterne } = await request.json()

    if (!Number.isInteger(sterne) || sterne < 1 || sterne > 5) {
      return HttpResponse.json(
        { fehler: 'Sterne müssen zwischen 1 und 5 liegen' },
        { status: 400 },
      )
    }

    return HttpResponse.json(
      { nachricht: `Danke! ${sterne} von 5 Sternen für Gericht ${gerichtId} gespeichert.` },
      { status: 201 },
    )
  }),

  // Für /api/oeffnungszeiten gibt es absichtlich KEINEN Handler (Demo-Schritt 5).
]
