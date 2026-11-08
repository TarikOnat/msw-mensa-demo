<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ladeSpeiseplan, bewerte, ladeOeffnungszeiten } from '../api.js'
import KategorieIcon from './KategorieIcon.vue'
import Sternebewertung from './Sternebewertung.vue'
import LadeSkelett from './LadeSkelett.vue'

const props = defineProps({ neuLaden: Number })

const tage = [
  { wert: 'heute', text: 'Heute' },
  { wert: 'morgen', text: 'Morgen' },
]
const tag = ref('heute')
const zustand = ref('laden') // 'laden' | 'fertig' | 'fehler'
const plan = ref(null)
const fehlermeldung = ref('')
const meldungen = ref({}) // gerichtId -> { text, ok } nach der Bewertung
const oeffnungszeiten = ref(null) // { text, ok }

const euro = (betrag) =>
  betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

// "2026-11-09" -> "Montag, 9. November"
const titel = computed(() => {
  if (zustand.value === 'fertig' && plan.value?.datum) {
    return new Date(`${plan.value.datum}T12:00`).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }
  return tage.find((t) => t.wert === tag.value).text
})

const andererTag = computed(() => tage.find((t) => t.wert !== tag.value))

// Bestätigung nach der Bewertung: ersetzt kurz die Unterzeile des Gerichts
const ausblenden = new Map() // gerichtId -> Timer
function zeigeMeldung(id, meldung) {
  clearTimeout(ausblenden.get(id))
  meldungen.value[id] = meldung
  ausblenden.set(id, setTimeout(() => delete meldungen.value[id], 4000))
}
function alleMeldungenWeg() {
  ausblenden.forEach(clearTimeout)
  ausblenden.clear()
  meldungen.value = {}
}
onBeforeUnmount(alleMeldungenWeg)

async function laden() {
  zustand.value = 'laden'
  alleMeldungenWeg()
  try {
    plan.value = await ladeSpeiseplan(tag.value)
    zustand.value = 'fertig'
  } catch (fehler) {
    fehlermeldung.value = fehler.message
    zustand.value = 'fehler'
  }
}

async function sterneVergeben(gericht, sterne) {
  try {
    zeigeMeldung(gericht.id, { text: await bewerte(gericht.id, sterne), ok: true })
  } catch (fehler) {
    zeigeMeldung(gericht.id, { text: fehler.message, ok: false })
  }
}

async function zeigeOeffnungszeiten() {
  oeffnungszeiten.value = { text: 'Wird geladen …', ok: true }
  try {
    oeffnungszeiten.value = { text: await ladeOeffnungszeiten(), ok: true }
  } catch (fehler) {
    oeffnungszeiten.value = { text: `Nicht verfügbar: ${fehler.message}`, ok: false }
  }
}

watch([tag, () => props.neuLaden], laden, { immediate: true })
</script>

<template>
  <article class="app">
    <header class="kopf" data-bereich="app-kopf">
      <p class="mensa">Campus-Mensa</p>
      <h1 class="datum">{{ titel }}</h1>
      <div class="tage" role="tablist" aria-label="Tag wählen">
        <button
          v-for="t in tage"
          :key="t.wert"
          type="button"
          role="tab"
          :aria-selected="tag === t.wert"
          :class="{ aktiv: tag === t.wert }"
          @click="tag = t.wert"
        >
          {{ t.text }}
        </button>
      </div>
    </header>

    <div class="inhalt" data-bereich="app-liste" aria-live="polite" :aria-busy="zustand === 'laden'">
      <LadeSkelett v-if="zustand === 'laden'" />

      <!-- Fehler: Server antwortet nicht oder mit Fehlerstatus -->
      <div v-else-if="zustand === 'fehler'" class="zustand">
        <svg class="zustand-bild" viewBox="0 0 120 96" aria-hidden="true">
          <ellipse cx="60" cy="58" rx="50" ry="26" class="teller" />
          <ellipse cx="60" cy="56" rx="34" ry="16" class="teller-innen" />
          <path d="M52 40l8 10-6 6 9 12" class="riss" />
          <path d="M60 8v18M60 32v2" class="warnung" />
        </svg>
        <h2>Speiseplan nicht verfügbar</h2>
        <p>Der Speiseplan konnte nicht geladen werden. Versuch es gleich noch einmal.</p>
        <p class="detail">{{ fehlermeldung }}</p>
        <button type="button" class="knopf" @click="laden">Erneut laden</button>
      </div>

      <!-- Leer: Antwort ist da, aber ohne Gerichte -->
      <div v-else-if="plan.gerichte.length === 0" class="zustand">
        <svg class="zustand-bild" viewBox="0 0 120 96" aria-hidden="true">
          <path d="M22 66a38 38 0 0 1 76 0z" class="glocke" />
          <circle cx="60" cy="24" r="5" class="glocke" />
          <rect x="12" y="66" width="96" height="8" rx="4" class="glocke-fuss" />
        </svg>
        <h2>Mensa geschlossen</h2>
        <p>Für {{ tag }} steht kein Gericht auf dem Plan.</p>
        <button type="button" class="knopf leise" @click="tag = andererTag.wert">
          Plan für {{ andererTag.text.toLowerCase() }} ansehen
        </button>
      </div>

      <template v-else>
        <div class="preis-kopf" aria-hidden="true">
          <span title="Studierende">Stud.</span>
          <span title="Bedienstete">Bed.</span>
          <span title="Gäste">Gäste</span>
        </div>
        <ul class="gerichte">
          <li v-for="gericht in plan.gerichte" :key="gericht.id" class="gericht">
            <img class="bild" :src="gericht.bild" alt="" width="64" height="64" />
            <h3 class="name">{{ gericht.name }}</h3>
            <dl class="preise">
              <div class="preis studierende">
                <dt>Studierende</dt>
                <dd>{{ euro(gericht.preise.studierende) }}</dd>
              </div>
              <div class="preis">
                <dt>Bedienstete</dt>
                <dd>{{ euro(gericht.preise.bedienstete) }}</dd>
              </div>
              <div class="preis">
                <dt>Gäste</dt>
                <dd>{{ euro(gericht.preise.gaeste) }}</dd>
              </div>
            </dl>
            <Transition name="tausch" mode="out-in">
              <p
                v-if="meldungen[gericht.id]"
                :key="meldungen[gericht.id].text"
                class="unterzeile meldung"
                :class="{ fehler: !meldungen[gericht.id].ok }"
                role="status"
              >
                <svg v-if="meldungen[gericht.id].ok" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {{ meldungen[gericht.id].text }}
              </p>
              <p v-else class="unterzeile">
                <span class="kategorie" :data-kategorie="gericht.kategorie">
                  <KategorieIcon :kategorie="gericht.kategorie" />
                  {{ gericht.kategorie }}
                </span>
                <span class="beilage">{{ gericht.beilage }}</span>
              </p>
            </Transition>
            <Sternebewertung
              class="sterne-feld"
              :gericht="gericht.name"
              @bewerten="(s) => sterneVergeben(gericht, s)"
            />
          </li>
        </ul>
      </template>
    </div>

    <footer class="fuss" data-bereich="app-fuss">
      <button type="button" class="knopf leise" @click="zeigeOeffnungszeiten">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="knopf-icon">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
        Öffnungszeiten anzeigen
      </button>
      <span v-if="oeffnungszeiten" class="oeffnungszeiten" :class="{ fehler: !oeffnungszeiten.ok }">
        {{ oeffnungszeiten.text }}
      </span>
    </footer>
  </article>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  background: var(--teller);
  border-radius: var(--radius-teller);
  box-shadow:
    0 1px 0 var(--teller-rand),
    0 18px 40px -24px rgb(120 40 20 / 0.35);
  overflow: hidden;
  font-family: var(--schrift-app);
  color: var(--aubergine);
}

/* ---------- Kopf: Tomatenband mit Datum ---------- */
.kopf {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'mensa tage'
    'datum datum';
  align-items: center;
  column-gap: var(--abstand-4);
  padding: var(--abstand-4) var(--abstand-5) var(--abstand-4);
  background: var(--tomate);
  color: #fff;
}

.mensa {
  grid-area: mensa;
  margin: 0;
  font-weight: 600;
  opacity: 0.9;
}

.datum {
  grid-area: datum;
  margin: 2px 0 0;
  font-family: var(--schrift-karte);
  font-weight: 400;
  font-size: var(--text-titel);
  line-height: 1.1;
}

.tage {
  grid-area: tage;
  display: flex;
  gap: var(--abstand-1);
  padding: var(--abstand-1);
  border-radius: 99px;
  background: var(--tomate-dunkel);
}

.tage button {
  border: 0;
  padding: 3px var(--abstand-4);
  border-radius: 99px;
  background: transparent;
  color: #fff;
  font-weight: 600;
  transition: background var(--dauer-kurz), color var(--dauer-kurz);
}

.tage button.aktiv {
  background: #fff;
  color: var(--tomate-dunkel);
}

.tage button:focus-visible { outline-color: #fff; }

/* ---------- Inhalt ---------- */
.inhalt {
  flex: 1;
  padding: var(--abstand-2) var(--abstand-5) 0;
}

.preis-kopf,
.preise {
  display: grid;
  grid-template-columns: repeat(3, 3.3rem);
  gap: 6px;
  justify-content: end;
  text-align: right;
}

.preis-kopf {
  padding-bottom: var(--abstand-1);
  font-size: var(--text-klein);
  font-weight: 600;
  color: var(--aubergine-leise);
}

.gerichte {
  list-style: none;
  margin: 0;
  padding: 0;
}

.gericht {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  grid-template-areas:
    'bild name preise'
    'bild unter sterne';
  align-items: center;
  column-gap: var(--abstand-4);
  row-gap: 4px;
  padding: 10px 0;
  border-top: 1px dashed var(--teller-rand);
}

.gericht:first-child { border-top: 0; }

.bild {
  grid-area: bild;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  box-shadow: 0 6px 12px -8px rgb(60 20 10 / 0.5);
}

.name {
  grid-area: name;
  min-width: 0;
  margin: 0;
  font-family: var(--schrift-karte);
  font-weight: 400;
  font-size: var(--text-gross);
  line-height: 1.2;
}

.beilage {
  font-size: 0.85rem;
  color: var(--aubergine-leise);
}

.preise {
  grid-area: preise;
  margin: 0;
}

.sterne-feld {
  grid-area: sterne;
  justify-self: end;
}

.preis dt {
  /* Nur für Screenreader, sichtbar ist die Kopfzeile */
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.preis dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--aubergine-leise);
  font-size: 0.95rem;
}

.preis.studierende dd {
  color: var(--aubergine);
  font-weight: 700;
}

.unterzeile {
  grid-area: unter;
  display: flex;
  align-items: center;
  gap: 2px var(--abstand-2);
  flex-wrap: wrap;
  min-width: 0;
  margin: 0;
}

.meldung {
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 6px;
  font-size: var(--text-klein);
  font-weight: 600;
  line-height: 1.3;
  color: var(--basilikum);
}

.meldung svg {
  flex: none;
  width: 1.15em;
  height: 1.15em;
  margin-top: 1px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.meldung.fehler { color: var(--tomate-dunkel); }

.tausch-enter-active,
.tausch-leave-active {
  transition: opacity var(--dauer-kurz), transform var(--dauer-kurz) var(--kurve);
}

.tausch-enter-from { opacity: 0; transform: translateY(4px); }
.tausch-leave-to { opacity: 0; }

.kategorie {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px var(--abstand-3) 2px var(--abstand-2);
  border-radius: 99px;
  font-size: var(--text-klein);
  font-weight: 600;
  color: var(--farbe);
  background: color-mix(in srgb, var(--farbe) 11%, white);
}

.kategorie[data-kategorie='vegan'] { --farbe: var(--kat-vegan); }
.kategorie[data-kategorie='vegetarisch'] { --farbe: var(--kat-vegetarisch); }
.kategorie[data-kategorie='Fleisch'] { --farbe: var(--kat-fleisch); }
.kategorie[data-kategorie='Fisch'] { --farbe: var(--kat-fisch); }

/* ---------- Zustände: Fehler und leer ---------- */
.zustand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--abstand-5) var(--abstand-4) var(--abstand-4);
}

.zustand h2 {
  margin: var(--abstand-3) 0 var(--abstand-1);
  font-family: var(--schrift-karte);
  font-weight: 400;
  font-size: 1.5rem;
}

.zustand p {
  margin: 0;
  max-width: 30ch;
  color: var(--aubergine-leise);
}

.zustand .detail {
  margin-top: var(--abstand-2);
  padding: 2px var(--abstand-3);
  border-radius: var(--radius-klein);
  background: var(--tomate-hell);
  color: var(--tomate-dunkel);
  font-size: var(--text-klein);
  font-weight: 600;
}

.zustand .knopf { margin-top: var(--abstand-4); }

.zustand-bild { width: 8rem; height: auto; }
.teller { fill: var(--tablett); stroke: var(--teller-rand); stroke-width: 2; }
.teller-innen { fill: #fff; stroke: var(--teller-rand); stroke-width: 2; }
.riss { fill: none; stroke: var(--aubergine-leise); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.warnung { fill: none; stroke: var(--tomate); stroke-width: 5; stroke-linecap: round; }
.glocke { fill: var(--tablett); stroke: var(--aubergine-leise); stroke-width: 2.5; }
.glocke-fuss { fill: var(--aubergine-leise); }

/* ---------- Knöpfe und Fuß ---------- */
.knopf {
  display: inline-flex;
  align-items: center;
  gap: var(--abstand-2);
  border: 0;
  padding: var(--abstand-2) var(--abstand-4);
  border-radius: 99px;
  background: var(--tomate);
  color: #fff;
  font-weight: 600;
  transition: background var(--dauer-kurz);
}

.knopf:hover { background: var(--tomate-dunkel); }

.knopf.leise {
  background: var(--tablett);
  color: var(--aubergine);
}

.knopf.leise:hover { background: var(--tomate-hell); }

.knopf-icon {
  width: 1.1em;
  height: 1.1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.fuss {
  display: flex;
  align-items: center;
  gap: var(--abstand-3);
  flex-wrap: wrap;
  padding: var(--abstand-3) var(--abstand-5) var(--abstand-4);
  border-top: 1px solid var(--teller-rand);
}

.oeffnungszeiten { font-size: 0.9rem; color: var(--aubergine-leise); }
.oeffnungszeiten.fehler { color: var(--tomate-dunkel); font-weight: 600; }
</style>
