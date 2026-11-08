<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { protokoll, ergebnis } from './inspector.js'
import { demo, schritte } from './schritte.js'

// Lebendes Ablaufdiagramm als Gleisbild: Jeder Request fährt als Punkt
// von Station zu Station. Die Phase kommt aus inspector.js (worker.events).
const props = defineProps({ szenario: { type: String, required: true } })

// Lage der Stationen: x in Prozent der Breite, y in em
const stationen = {
  app: { x: 9, y: 4.4, titel: 'App', unter: 'fetch()' },
  sw: { x: 36.3, y: 4.4, titel: 'Service Worker', unter: 'fängt ab' },
  handler: { x: 63.6, y: 4.4, titel: 'Handler' },
  antwort: { x: 91, y: 4.4, titel: 'Antwort' },
  netz: { x: 77.3, y: 8.8, titel: 'echtes Netzwerk', unter: 'durchgelassen' },
}

const wege = {
  handler: ['app', 'sw', 'handler', 'antwort'],
  netz: ['app', 'sw', 'handler', 'netz', 'antwort'],
}

// Bis zu welcher Station darf der Punkt schon fahren?
function ziel(e) {
  const weg = wege[e.weg]
  if (e.phase === 'fertig') return weg.length - 1
  if (e.phase === 'netz') return weg.indexOf('netz')
  return weg.indexOf('handler') // MSW führt gerade die Handler aus
}

const TAKT = 360 // ms pro Station
const NACHLAUF = 2400 // so lange bleibt ein Punkt an der Antwort stehen

const punkte = ref([]) // { id, schritt, fertigSeit }
const bekannt = new Set(protokoll.map((e) => e.id))

// Neue Requests bekommen einen Punkt an der App
watch(
  () => protokoll.map((e) => e.id),
  (ids) => {
    for (const id of ids) {
      if (bekannt.has(id)) continue
      bekannt.add(id)
      punkte.value.push({ id, schritt: 0, fertigSeit: null })
    }
  },
)

function takt() {
  const jetzt = Date.now()
  punkte.value = punkte.value.filter((p) => {
    const e = protokoll.find((x) => x.id === p.id)
    if (!e) return false
    if (p.schritt < ziel(e)) p.schritt++
    if (p.schritt === wege[e.weg].length - 1) p.fertigSeit ??= jetzt
    return p.fertigSeit === null || jetzt - p.fertigSeit < NACHLAUF
  })
}

let timer
onMounted(() => (timer = setInterval(takt, TAKT)))
onBeforeUnmount(() => clearInterval(timer))

// Punkte mit Position und Farbe für die Anzeige
const sichtbar = computed(() =>
  punkte.value
    .map((p) => {
      const e = protokoll.find((x) => x.id === p.id)
      if (!e) return null
      const station = wege[e.weg][p.schritt]
      return { id: p.id, station, farbe: ergebnis(e), ...stationen[station] }
    })
    .filter(Boolean),
)

// Station leuchtet in der Farbe des Punkts, der gerade dort steht
const belegt = computed(() => {
  const belegung = {}
  for (const p of sichtbar.value) belegung[p.station] = p.farbe
  return belegung
})

const letzteAntwort = computed(() => protokoll.find((e) => e.phase === 'fertig'))

function unterzeile(name) {
  if (name === 'handler') return props.szenario
  if (name === 'antwort') return letzteAntwort.value?.code ? `Status ${letzteAntwort.value.code}` : 'noch keine'
  return stationen[name].unter
}

const markiert = computed(() => schritte[demo.schritt - 1]?.knoten ?? null)

const legende = [
  { farbe: 'gemockt', text: 'gemockt' },
  { farbe: 'fehler', text: 'Fehlerstatus' },
  { farbe: 'wartet', text: 'wartet' },
  { farbe: 'durch', text: 'durchgelassen' },
]
</script>

<template>
  <div class="ablauf">
    <div class="gleisbild" role="img" aria-label="Ablauf: App, Service Worker, Handler, Antwort. Ohne Handler: echtes Netzwerk.">
      <svg class="gleise" aria-hidden="true">
        <line class="gleis" x1="9%" y1="4.4em" x2="91%" y2="4.4em" />
        <line class="gleis neben" x1="63.6%" y1="4.4em" x2="77.3%" y2="8.8em" />
        <line class="gleis neben" x1="77.3%" y1="8.8em" x2="91%" y2="4.4em" />
      </svg>

      <!-- Richtungspfeile zwischen den Stationen -->
      <span v-for="x in [22.65, 49.95, 77.3]" :key="x" class="pfeil" :style="{ left: `${x}%` }" aria-hidden="true"></span>

      <div
        v-for="(s, name) in stationen"
        :key="name"
        class="station"
        :class="[`station-${name}`, { markiert: markiert === name }]"
        :data-farbe="belegt[name]"
        :style="{ left: `${s.x}%`, top: `${s.y}em` }"
      >
        <span class="beschriftung">
          <span class="titel">{{ s.titel }}</span>
          <code class="unter" :class="{ szenario: name === 'handler' }">{{ unterzeile(name) }}</code>
        </span>
        <span class="ring"></span>
      </div>

      <span
        v-for="p in sichtbar"
        :key="p.id"
        class="punkt"
        :data-farbe="p.farbe"
        :style="{ left: `${p.x}%`, top: `${p.y}em` }"
      ></span>
    </div>

    <ul class="legende">
      <li v-for="l in legende" :key="l.farbe" :data-farbe="l.farbe">{{ l.text }}</li>
    </ul>
  </div>
</template>

<style scoped>
.ablauf {
  display: flex;
  flex-direction: column;
  gap: var(--abstand-2);
}

.gleisbild {
  position: relative;
  height: 12.8em;
  border-radius: var(--radius-pult);
  background:
    radial-gradient(circle, var(--pult-hoch) 1px, transparent 1.2px) 0 0 / 18px 18px,
    var(--pult);
  border: 1px solid var(--leitung);
}

.gleise {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  font-size: 1em;
  overflow: visible;
}

.gleis {
  stroke: var(--leitung);
  stroke-width: 4;
  stroke-linecap: round;
}

.gleis.neben { stroke-dasharray: 2 9; }

.pfeil {
  position: absolute;
  top: 4.4em;
  width: 0.55em;
  height: 0.55em;
  border-top: 2px solid var(--anzeige-leise);
  border-right: 2px solid var(--anzeige-leise);
  transform: translate(-50%, -50%) rotate(45deg);
}

/* ---------- Stationen ---------- */
.station {
  --farbe: var(--leitung);
  position: absolute;
  transform: translate(-50%, -50%);
}

.station[data-farbe='gemockt'] { --farbe: var(--status-gemockt); }
.station[data-farbe='fehler'] { --farbe: var(--status-fehler); }
.station[data-farbe='wartet'] { --farbe: var(--status-wartet); }
.station[data-farbe='durch'] { --farbe: var(--status-durch); }

.ring {
  display: block;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  border: 3px solid var(--farbe);
  background: var(--leitstand);
  transition:
    border-color var(--dauer-kurz),
    box-shadow var(--dauer-kurz);
}

.station[data-farbe] .ring {
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--farbe) 22%, transparent);
}

.station[data-farbe='wartet'] .ring { animation: warten 1.2s ease-in-out infinite; }

@keyframes warten {
  50% { box-shadow: 0 0 0 11px color-mix(in srgb, var(--farbe) 12%, transparent); }
}

/* Beschriftung über der Station, beim Netzwerk darunter */
.beschriftung {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.55em);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  text-align: center;
}

.station-netz .beschriftung {
  bottom: auto;
  top: calc(100% + 0.45em);
}

.titel {
  font-weight: 600;
  font-size: 0.95em;
  color: var(--anzeige);
}

.unter {
  font-family: var(--schrift-code);
  font-size: 0.75em;
  color: var(--anzeige-leise);
}

.unter.szenario {
  margin-top: 2px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--pult-hoch);
  color: var(--status-wartet);
}

.station-app .beschriftung { left: 0; transform: translateX(-0.75em); align-items: flex-start; }
.station-antwort .beschriftung { left: auto; right: 0; transform: translateX(0.75em); align-items: flex-end; }

/* Markiert durch die Schrittleiste */
.station.markiert::after {
  content: '';
  position: absolute;
  inset: -0.7em;
  border: 2px dashed var(--anzeige);
  border-radius: 50%;
}

.station.markiert .titel { color: #fff; text-decoration: underline 2px; text-underline-offset: 4px; }

/* ---------- Punkte ---------- */
.punkt {
  --farbe: var(--status-wartet);
  position: absolute;
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  background: var(--farbe);
  box-shadow: 0 0 10px 2px color-mix(in srgb, var(--farbe) 55%, transparent);
  transform: translate(-50%, -50%);
  transition:
    left var(--dauer-weg) var(--kurve),
    top var(--dauer-weg) var(--kurve),
    background var(--dauer-kurz);
  z-index: 1;
}

.punkt[data-farbe='gemockt'] { --farbe: var(--status-gemockt); }
.punkt[data-farbe='fehler'] { --farbe: var(--status-fehler); }
.punkt[data-farbe='durch'] { --farbe: var(--status-durch); }

/* ---------- Legende ---------- */
.legende {
  display: flex;
  flex-wrap: wrap;
  gap: var(--abstand-1) var(--abstand-4);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-klein);
  color: var(--anzeige-leise);
}

.legende li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legende li::before {
  content: '';
  width: 0.65em;
  height: 0.65em;
  border-radius: 50%;
  background: var(--farbe);
}

.legende [data-farbe='gemockt'] { --farbe: var(--status-gemockt); }
.legende [data-farbe='fehler'] { --farbe: var(--status-fehler); }
.legende [data-farbe='wartet'] { --farbe: var(--status-wartet); }
.legende [data-farbe='durch'] { --farbe: var(--status-durch); }

@media (prefers-reduced-motion: reduce) {
  .station[data-farbe='wartet'] .ring { animation: none; }
}
</style>
