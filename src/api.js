// Die App kennt nur die Adressen ihres Backends. Von MSW weiß sie nichts:
// Dieser Code bleibt gleich, egal ob MSW oder ein echtes Backend antwortet.
const url = (pfad) => new URL(pfad, window.location.href)

// Liest eine JSON-Antwort und wirft verständliche Fehler
async function json(antwort) {
  const typ = antwort.headers.get('content-type') ?? ''
  if (!typ.includes('application/json')) {
    throw new Error('Kein Backend erreichbar')
  }
  const daten = await antwort.json()
  if (!antwort.ok) {
    throw new Error(daten.fehler ?? `Server antwortet mit Status ${antwort.status}`)
  }
  return daten
}

export async function ladeSpeiseplan(tag) {
  const antwort = await fetch(url(`/api/speiseplan/${tag}`))
  if (!antwort.ok) {
    throw new Error(`Server antwortet mit Status ${antwort.status}`)
  }
  return json(antwort)
}

export async function bewerte(gerichtId, sterne) {
  const antwort = await fetch(url('/api/bewertung'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gerichtId, sterne }),
  })
  const daten = await json(antwort)
  return daten.nachricht
}

export async function ladeOeffnungszeiten() {
  const antwort = await fetch(url('/api/oeffnungszeiten'))
  const daten = await json(antwort)
  return daten.text
}
