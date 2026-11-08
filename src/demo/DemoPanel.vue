<script setup>
import { ref } from 'vue'
import { worker } from '../mocks/browser.js'
import { szenarien } from '../mocks/szenarien.js'
import { protokoll } from './inspector.js'

const emit = defineEmits(['szenario-gewechselt'])

const auswahl = [
  { name: 'normal', code: 'worker.resetHandlers()' },
  { name: 'langsam', code: 'worker.use(szenarien.langsam)' },
  { name: 'fehler', code: 'worker.use(szenarien.fehler)' },
  { name: 'leer', code: 'worker.use(szenarien.leer)' },
]
const aktiv = ref(auswahl[0])

function waehle(eintrag) {
  // Zuerst immer zurück auf die normalen Handler, dann das Szenario davorsetzen
  worker.resetHandlers()
  if (eintrag.name !== 'normal') {
    worker.use(szenarien[eintrag.name])
  }
  aktiv.value = eintrag
  emit('szenario-gewechselt')
}

// Farbe im Inspector: grün = gemockt, rot = Fehlerstatus, gelb = wartet, blau = durchgelassen
function statusKlasse(eintrag) {
  if (eintrag.code >= 400 || eintrag.status === 'Fehler im Handler') return 'fehler'
  return (
    {
      gemockt: 'ok',
      'Handler gefunden': 'wartet',
      'abgefangen, wartet …': 'wartet',
      durchgelassen: 'durch',
      'kein Handler': 'durch',
    }[eintrag.status] ?? ''
  )
}
</script>

<template>
  <div class="karte demo">
    <h2>Szenario</h2>
    <div class="szenarien">
      <button
        v-for="s in auswahl"
        :key="s.name"
        class="szenario"
        :class="{ aktiv: aktiv.name === s.name }"
        @click="waehle(s)"
      >
        {{ s.name }}
      </button>
    </div>
    <pre class="code-zeile"><code>{{ aktiv.code }}</code></pre>

    <h2>Inspector <span class="leise-text">worker.events</span></h2>
    <p v-if="protokoll.length === 0" class="leise-text">Noch keine API-Requests.</p>
    <ol v-else class="protokoll">
      <li v-for="e in protokoll" :key="e.id" :class="statusKlasse(e)">
        <span class="zeit">{{ e.zeit }}</span>
        <span class="methode">{{ e.methode }}</span>
        <span class="pfad">{{ e.pfad }}</span>
        <span class="status">
          {{ e.status }}<template v-if="e.code"> · {{ e.code }}</template>
        </span>
        <span v-if="e.info" class="info">{{ e.info }}</span>
      </li>
    </ol>
  </div>
</template>
