import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'
import { datum } from './daten.js'

// Sonderfälle als zusätzliche Handler. Sie werden zur Laufzeit VOR die
// normalen Handler gesetzt: im Browser mit worker.use(), im Test mit server.use().
export const szenarien = {
  // Wartet 3 Sekunden und gibt nichts zurück. Dann übernimmt der normale
  // Handler aus handlers.js und liefert den Speiseplan.
  langsam: http.get('/api/speiseplan/:tag', async () => {
    await delay(3000)
  }),

  fehler: http.get('/api/speiseplan/:tag', () => {
    return HttpResponse.json({ fehler: 'Interner Serverfehler' }, { status: 500 })
  }),

  leer: http.get('/api/speiseplan/:tag', ({ params }) => {
    return HttpResponse.json({
      tag: params.tag,
      datum: datum[params.tag] ?? null,
      mensa: 'Campus-Mensa',
      gerichte: [],
    })
  }),
}
