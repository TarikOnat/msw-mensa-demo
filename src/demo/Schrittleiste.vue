<script setup>
import { computed, onBeforeUnmount, onMounted, watchEffect } from 'vue'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import { demo, schritte } from './schritte.js'

// Hervorhebung als CSS aus schritte.js erzeugen: Bereiche außerhalb des
// Fokus werden abgedunkelt. Die App-Komponenten tragen nur data-bereich.
const regeln = schritte.map((s, i) => {
  const ausser = s.fokus.map((f) => `:not([data-bereich="${f}"])`).join('')
  return `html[data-schritt="${i + 1}"] [data-bereich]${ausser} { opacity: 0.28; filter: saturate(0.3); }`
})
const stil = document.createElement('style')
stil.textContent = [
  '[data-bereich] { transition: opacity var(--dauer-weg), filter var(--dauer-weg); }',
  ...regeln,
].join('\n')

watchEffect(() => {
  document.documentElement.dataset.schritt = demo.schritt
})

const aktuell = computed(() => schritte[demo.schritt - 1] ?? null)

// Hinweis in Text- und Code-Teile zerlegen (Code steht in `Backticks`)
const hinweisTeile = computed(() => {
  const text = aktuell.value?.hinweis ?? 'Pfeiltaste → startet die Demo-Schritte'
  return text.split('`').map((teil, i) => ({ teil, code: i % 2 === 1 }))
})

function gehe(schritt) {
  demo.schritt = Math.min(Math.max(schritt, 0), schritte.length)
}

function taste(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  if (event.target.closest?.('input, textarea, select, [role="tablist"]')) return
  if (event.key === 'ArrowRight') gehe(demo.schritt + 1)
  else if (event.key === 'ArrowLeft') gehe(demo.schritt - 1)
  else if (event.key === 'Escape') gehe(0)
  else return
  event.preventDefault()
}

onMounted(() => {
  document.head.append(stil)
  window.addEventListener('keydown', taste)
})
onBeforeUnmount(() => {
  stil.remove()
  window.removeEventListener('keydown', taste)
})
</script>

<template>
  <nav class="leiste" aria-label="Demo-Schritte">
    <ol class="schritte">
      <li v-for="(s, i) in schritte" :key="s.titel">
        <button
          type="button"
          class="schritt"
          :class="{ aktiv: demo.schritt === i + 1, erledigt: demo.schritt > i + 1 }"
          :aria-current="demo.schritt === i + 1 ? 'step' : undefined"
          @click="gehe(demo.schritt === i + 1 ? 0 : i + 1)"
        >
          <span class="nummer">{{ i + 1 }}</span>
          {{ s.titel }}
        </button>
      </li>
    </ol>

    <p class="hinweis" aria-live="polite">
      <template v-for="(t, i) in hinweisTeile" :key="i">
        <code v-if="t.code">{{ t.teil }}</code>
        <template v-else>{{ t.teil }}</template>
      </template>
    </p>

    <div class="pfeile">
      <button type="button" aria-label="Vorheriger Schritt" :disabled="demo.schritt === 0" @click="gehe(demo.schritt - 1)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" /></svg>
      </button>
      <button
        type="button"
        aria-label="Nächster Schritt"
        :disabled="demo.schritt === schritte.length"
        @click="gehe(demo.schritt + 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6" /></svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.leiste {
  display: flex;
  align-items: center;
  gap: var(--abstand-4);
  min-height: 2.6rem;
  padding: var(--abstand-1) var(--abstand-4);
  background: var(--leitstand);
  border-bottom: 1px solid var(--leitung);
  color: var(--anzeige);
  font-family: var(--schrift-technik);
  font-size: 0.85rem;
}

.schritte {
  display: flex;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
  flex: none;
}

.schritt {
  display: flex;
  align-items: center;
  gap: var(--abstand-2);
  border: 0;
  padding: 5px var(--abstand-3) 5px 6px;
  border-radius: 99px;
  background: transparent;
  color: var(--anzeige-leise);
  white-space: nowrap;
  transition: background var(--dauer-kurz), color var(--dauer-kurz);
}

.schritt:hover { color: var(--anzeige); background: var(--pult); }

.nummer {
  display: grid;
  place-items: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 50%;
  border: 1.5px solid var(--leitung);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 0.8rem;
}

.schritt.erledigt .nummer {
  border-color: var(--anzeige-leise);
}

.schritt.aktiv {
  background: var(--pult-hoch);
  color: var(--anzeige);
  font-weight: 600;
}

.schritt.aktiv .nummer {
  background: var(--anzeige);
  border-color: var(--anzeige);
  color: var(--leitstand);
}

.hinweis {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--anzeige);
}

.hinweis code {
  font-family: var(--schrift-code);
  font-size: 0.95em;
  color: var(--status-gemockt);
}

.pfeile {
  display: flex;
  gap: 2px;
  flex: none;
}

.pfeile button {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--leitung);
  border-radius: var(--radius-klein);
  background: transparent;
  color: var(--anzeige);
}

.pfeile button:disabled { opacity: 0.35; cursor: default; }

.pfeile svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

:focus-visible { outline-color: var(--status-durch); }

@media (max-width: 1100px) {
  .hinweis { white-space: normal; }
  .leiste { flex-wrap: wrap; }
}
</style>
