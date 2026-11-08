<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import { worker } from '../mocks/browser.js'
import { szenarien } from '../mocks/szenarien.js'
import { protokoll, ergebnis } from './inspector.js'
import Ablaufdiagramm from './Ablaufdiagramm.vue'

const emit = defineEmits(['szenario-gewechselt'])

const auswahl = [
  { name: 'normal', taste: '1', code: 'worker.resetHandlers()', handler: 'handlers.js' },
  { name: 'langsam', taste: '2', code: 'worker.use(szenarien.langsam)', handler: 'szenarien.langsam' },
  { name: 'Fehler', taste: '3', code: 'worker.use(szenarien.fehler)', handler: 'szenarien.fehler' },
  { name: 'leer', taste: '4', code: 'worker.use(szenarien.leer)', handler: 'szenarien.leer' },
]
const aktiv = ref(auswahl[0])

function waehle(eintrag) {
  // Zuerst immer zurück auf die normalen Handler, dann das Szenario davorsetzen
  worker.resetHandlers()
  if (eintrag.name !== 'normal') {
    worker.use(szenarien[eintrag.name.toLowerCase()])
  }
  aktiv.value = eintrag
  emit('szenario-gewechselt')
}

// Tastenkürzel 1–4 für die Szenarien
function taste(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
  if (event.target.closest?.('input, textarea, select')) return
  const eintrag = auswahl.find((s) => s.taste === event.key)
  if (eintrag) waehle(eintrag)
}
onMounted(() => window.addEventListener('keydown', taste))
onBeforeUnmount(() => window.removeEventListener('keydown', taste))
</script>

<template>
  <div class="pult">
    <header class="pult-kopf">
      <h2>Mock Service Worker</h2>
      <span class="lampe">Worker aktiv</span>
    </header>

    <section class="bereich" data-bereich="szenarien" aria-labelledby="titel-szenario">
      <h3 id="titel-szenario">Szenario</h3>
      <div class="szenarien">
        <button
          v-for="s in auswahl"
          :key="s.name"
          type="button"
          class="szenario"
          :class="{ aktiv: aktiv.name === s.name }"
          :aria-pressed="aktiv.name === s.name"
          :aria-keyshortcuts="s.taste"
          @click="waehle(s)"
        >
          {{ s.name }}
          <kbd>{{ s.taste }}</kbd>
        </button>
      </div>
      <pre class="code-zeile"><span class="prompt" aria-hidden="true">›</span><code>{{ aktiv.code }}</code></pre>
    </section>

    <section class="bereich" data-bereich="diagramm" aria-labelledby="titel-ablauf">
      <h3 id="titel-ablauf">Ablauf</h3>
      <Ablaufdiagramm :szenario="aktiv.handler" />
    </section>

    <section class="bereich liste" data-bereich="liste" aria-labelledby="titel-liste">
      <h3 id="titel-liste">Letzte Requests <code>worker.events</code></h3>
      <p v-if="protokoll.length === 0" class="leer">Noch keine API-Requests.</p>
      <ol v-else class="protokoll">
        <li v-for="e in protokoll" :key="e.id" :data-farbe="ergebnis(e)">
          <span class="zeit">{{ e.zeit }}</span>
          <span class="methode">{{ e.methode }}</span>
          <span class="pfad">{{ e.pfad }}</span>
          <span class="status">
            {{ e.status }}<b v-if="e.code" class="code">{{ e.code }}</b>
          </span>
          <span v-if="e.info" class="info">{{ e.info }}</span>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.pult {
  display: flex;
  flex-direction: column;
  gap: var(--abstand-4);
  height: 100%;
  min-height: 30rem;
  font-family: var(--schrift-technik);
  color: var(--anzeige);
}

.pult-kopf {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--abstand-4);
}

h2 {
  margin: 0;
  font-size: var(--text-gross);
  font-weight: 600;
}

.lampe {
  display: inline-flex;
  align-items: center;
  gap: var(--abstand-2);
  font-size: var(--text-klein);
  color: var(--anzeige-leise);
}

.lampe::before {
  content: '';
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  background: var(--status-gemockt);
  box-shadow: 0 0 8px var(--status-gemockt);
}

.bereich {
  display: flex;
  flex-direction: column;
  gap: var(--abstand-2);
}

h3 {
  display: flex;
  align-items: baseline;
  gap: var(--abstand-2);
  margin: 0;
  font-size: var(--text-klein);
  font-weight: 600;
  color: var(--anzeige-leise);
}

h3 code {
  font-family: var(--schrift-code);
  font-weight: 400;
  color: var(--anzeige-leise);
  opacity: 0.8;
}

/* ---------- Szenarien ---------- */
.szenarien {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--abstand-2);
}

.szenario {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--abstand-2);
  padding: var(--abstand-2) var(--abstand-2) var(--abstand-2) var(--abstand-3);
  border: 1px solid var(--leitung);
  border-radius: var(--radius-pult);
  background: var(--pult);
  color: var(--anzeige);
  font-weight: 600;
  text-align: left;
  transition: border-color var(--dauer-kurz), background var(--dauer-kurz);
}

.szenario:hover { border-color: var(--anzeige-leise); }

.szenario.aktiv {
  border-color: var(--status-wartet);
  background: var(--pult-hoch);
  box-shadow: inset 0 -3px 0 var(--status-wartet);
}

kbd {
  display: grid;
  place-items: center;
  min-width: 1.4em;
  height: 1.4em;
  border: 1px solid var(--leitung);
  border-bottom-width: 2px;
  border-radius: 4px;
  font-family: var(--schrift-code);
  font-size: 0.7em;
  font-weight: 400;
  color: var(--anzeige-leise);
}

.szenario.aktiv kbd { color: var(--status-wartet); border-color: currentColor; }

.code-zeile {
  display: flex;
  gap: var(--abstand-2);
  margin: 0;
  padding: var(--abstand-2) var(--abstand-3);
  border-radius: var(--radius-pult);
  background: var(--leitstand);
  border: 1px solid var(--leitung);
  font-family: var(--schrift-code);
  font-size: 0.9rem;
  overflow-x: auto;
}

.prompt { color: var(--status-gemockt); }

:focus-visible { outline-color: var(--status-durch); }

/* ---------- Request-Liste ---------- */
.liste {
  flex: 1;
  min-height: 7rem;
}

.leer {
  margin: 0;
  color: var(--anzeige-leise);
  font-size: 0.9rem;
}

.protokoll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
  border-top: 1px solid var(--leitung);
}

.protokoll li {
  --farbe: var(--anzeige-leise);
  display: grid;
  grid-template-columns: auto 3.3em minmax(0, 1fr) auto;
  gap: 2px var(--abstand-3);
  align-items: baseline;
  padding: 6px var(--abstand-2) 6px var(--abstand-3);
  border-bottom: 1px solid var(--leitung);
  box-shadow: inset 3px 0 0 var(--farbe);
}

.protokoll li[data-farbe='gemockt'] { --farbe: var(--status-gemockt); }
.protokoll li[data-farbe='fehler'] { --farbe: var(--status-fehler); }
.protokoll li[data-farbe='wartet'] { --farbe: var(--status-wartet); }
.protokoll li[data-farbe='durch'] { --farbe: var(--status-durch); }

.zeit {
  color: var(--anzeige-leise);
  font-variant-numeric: tabular-nums;
}

.methode,
.pfad,
.code,
.info {
  font-family: var(--schrift-code);
}

.methode { font-weight: 600; }
.pfad { overflow-wrap: anywhere; }

.status {
  display: flex;
  align-items: baseline;
  gap: var(--abstand-2);
  color: var(--farbe);
  font-weight: 600;
  white-space: nowrap;
}

.code {
  padding: 0 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--farbe) 18%, transparent);
}

.info {
  grid-column: 3 / -1;
  color: var(--anzeige-leise);
  font-size: 0.9em;
}
</style>
