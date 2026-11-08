import { reactive } from 'vue'

// Demo-Werkzeug: macht sichtbar, was MSW mit jedem API-Request tut.
// Grundlage sind die Life-Cycle-Events von MSW (worker.events).
export const protokoll = reactive([])

const MAX_EINTRAEGE = 12

// Phasen im Ablaufdiagramm:
// 'pruefen'  zwischen request:start und Ergebnis (MSW führt die Handler aus)
// 'netz'     kein Handler passt, Request geht ans echte Netzwerk
// 'fertig'   Antwort ist da (gemockt oder vom Netzwerk)
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
      phase: 'pruefen',
      weg: 'handler',
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
    if (!e) return
    e.status = 'kein Handler'
    e.phase = 'netz'
    e.weg = 'netz'
  })

  worker.events.on('response:mocked', ({ requestId, response }) => {
    const e = eintrag(requestId)
    if (!e) return
    e.status = 'gemockt'
    e.phase = 'fertig'
    e.code = response.status
  })

  worker.events.on('response:bypass', ({ requestId, response }) => {
    const e = eintrag(requestId)
    if (!e) return
    e.status = 'durchgelassen'
    e.phase = 'fertig'
    e.weg = 'netz'
    e.code = response.status
    e.info = `echte Antwort: ${response.headers.get('content-type') ?? 'unbekannt'}`
  })

  worker.events.on('unhandledException', ({ requestId, error }) => {
    const e = eintrag(requestId)
    if (!e) return
    e.status = 'Fehler im Handler'
    e.phase = 'fertig'
    e.info = error.message
  })
}

// Ergebnis für die Farbe: gemockt / fehler / wartet / durch
export function ergebnis(e) {
  if (e.code >= 400 || e.status === 'Fehler im Handler') return 'fehler'
  if (e.weg === 'netz') return 'durch'
  if (e.phase === 'fertig') return 'gemockt'
  return 'wartet'
}
