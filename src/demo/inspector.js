import { reactive } from 'vue'

// Demo-Werkzeug: macht sichtbar, was MSW mit jedem API-Request tut.
// Grundlage sind die Life-Cycle-Events von MSW (worker.events).
export const protokoll = reactive([])

const MAX_EINTRAEGE = 10

export function verbindeInspector(worker) {
  const istApiRequest = (request) => new URL(request.url).pathname.startsWith('/api/')
  const eintrag = (requestId) => protokoll.find((e) => e.id === requestId)

  worker.events.on('request:start', ({ request, requestId }) => {
    if (!istApiRequest(request)) return
    protokoll.unshift({
      id: requestId,
      zeit: new Date().toLocaleTimeString('de-DE'),
      methode: request.method,
      pfad: new URL(request.url).pathname,
      status: 'abgefangen, wartet …',
      code: null,
      info: '',
    })
    if (protokoll.length > MAX_EINTRAEGE) protokoll.pop()
  })

  worker.events.on('request:match', ({ requestId }) => {
    const e = eintrag(requestId)
    if (e) e.status = 'Handler gefunden'
  })

  worker.events.on('request:unhandled', ({ requestId }) => {
    const e = eintrag(requestId)
    if (e) e.status = 'kein Handler'
  })

  worker.events.on('response:mocked', ({ requestId, response }) => {
    const e = eintrag(requestId)
    if (!e) return
    e.status = 'gemockt'
    e.code = response.status
  })

  worker.events.on('response:bypass', ({ requestId, response }) => {
    const e = eintrag(requestId)
    if (!e) return
    e.status = 'durchgelassen'
    e.code = response.status
    e.info = `echte Antwort: ${response.headers.get('content-type') ?? 'unbekannt'}`
  })

  worker.events.on('unhandledException', ({ requestId, error }) => {
    const e = eintrag(requestId)
    if (!e) return
    e.status = 'Fehler im Handler'
    e.info = error.message
  })
}
