<script setup>
import { ref, watch } from 'vue'
import { ladeSpeiseplan, bewerte, ladeOeffnungszeiten } from '../api.js'

const props = defineProps({ neuLaden: Number })

const tag = ref('heute')
const zustand = ref('laden') // 'laden' | 'fertig' | 'fehler'
const plan = ref(null)
const fehlermeldung = ref('')
const rueckmeldungen = ref({}) // gerichtId -> Text nach der Bewertung
const oeffnungszeiten = ref('')

const euro = (betrag) =>
  betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

async function laden() {
  zustand.value = 'laden'
  rueckmeldungen.value = {}
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
    rueckmeldungen.value[gericht.id] = await bewerte(gericht.id, sterne)
  } catch (fehler) {
    rueckmeldungen.value[gericht.id] = `Fehler: ${fehler.message}`
  }
}

async function zeigeOeffnungszeiten() {
  oeffnungszeiten.value = 'Wird geladen …'
  try {
    oeffnungszeiten.value = await ladeOeffnungszeiten()
  } catch (fehler) {
    oeffnungszeiten.value = `Nicht verfügbar: ${fehler.message}`
  }
}

watch([tag, () => props.neuLaden], laden, { immediate: true })
</script>

<template>
  <div class="karte app">
    <header class="app-kopf">
      <div>
        <p class="kicker">Campus-Mensa</p>
        <h1>Speiseplan</h1>
      </div>
      <div class="tabs" role="tablist">
        <button
          v-for="t in ['heute', 'morgen']"
          :key="t"
          role="tab"
          :aria-selected="tag === t"
          :class="{ aktiv: tag === t }"
          @click="tag = t"
        >
          {{ t }}
        </button>
      </div>
    </header>

    <div v-if="zustand === 'laden'" class="hinweis laden">
      <span class="spinner" aria-hidden="true"></span>
      Speiseplan wird geladen …
    </div>

    <div v-else-if="zustand === 'fehler'" class="hinweis fehler">
      <strong>Der Speiseplan ist gerade nicht verfügbar.</strong>
      <span>{{ fehlermeldung }}</span>
      <button class="knopf" @click="laden">Erneut versuchen</button>
    </div>

    <div v-else-if="plan.gerichte.length === 0" class="hinweis leer">
      <strong>Die Mensa hat {{ tag }} geschlossen.</strong>
      <span>Es gibt keine Gerichte.</span>
    </div>

    <ul v-else class="gerichte">
      <li v-for="gericht in plan.gerichte" :key="gericht.id" class="gericht">
        <div class="gericht-zeile">
          <span class="name">{{ gericht.name }}</span>
          <span class="preis">{{ euro(gericht.preis) }}</span>
        </div>
        <div class="gericht-zeile">
          <span class="chip" :data-kategorie="gericht.kategorie">{{ gericht.kategorie }}</span>
          <span class="sterne" :aria-label="`${gericht.name} bewerten`">
            <button
              v-for="s in 5"
              :key="s"
              :aria-label="`${s} Sterne`"
              @click="sterneVergeben(gericht, s)"
            >
              ★
            </button>
          </span>
        </div>
        <p v-if="rueckmeldungen[gericht.id]" class="rueckmeldung">
          {{ rueckmeldungen[gericht.id] }}
        </p>
      </li>
    </ul>

    <footer class="app-fuss">
      <button class="knopf leise" @click="zeigeOeffnungszeiten">Öffnungszeiten anzeigen</button>
      <span v-if="oeffnungszeiten">{{ oeffnungszeiten }}</span>
    </footer>
  </div>
</template>
