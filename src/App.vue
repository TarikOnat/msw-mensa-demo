<script setup>
import { defineAsyncComponent, ref } from 'vue'
import Speiseplan from './components/Speiseplan.vue'

const props = defineProps({ mockingAktiv: Boolean })

// Die Demo-Teile gibt es nur in der Entwicklung. Die DEV-Prüfung steht direkt
// am Import, damit Vite sie aus dem Produktions-Build entfernt.
const DemoPanel = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./demo/DemoPanel.vue'))
  : null
const Schrittleiste = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./demo/Schrittleiste.vue'))
  : null
const demoAktiv = Boolean(DemoPanel) && props.mockingAktiv

// Zählt hoch, wenn ein Szenario gewechselt wird. Der Speiseplan lädt dann neu.
const neuLaden = ref(0)
</script>

<template>
  <div class="buehne" :class="{ 'nur-app': !demoAktiv }">
    <Schrittleiste v-if="demoAktiv" class="leiste" />

    <main class="welt app-welt">
      <p v-if="demoAktiv" class="welt-titel">Die App weiß nichts von MSW</p>
      <Speiseplan :neu-laden="neuLaden" />
    </main>

    <aside v-if="demoAktiv" class="welt msw-welt">
      <DemoPanel @szenario-gewechselt="neuLaden++" />
    </aside>
  </div>
</template>

<style scoped>
.buehne {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'leiste leiste'
    'app msw';
  height: 100vh;
}

.leiste { grid-area: leiste; }

.welt {
  min-height: 0;
  overflow-y: auto;
  padding: var(--abstand-4) var(--abstand-5) var(--abstand-5);
}

.app-welt {
  grid-area: app;
  background: var(--tablett);
}

.msw-welt {
  grid-area: msw;
  background: var(--leitstand);
  color: var(--anzeige);
}

.welt-titel {
  margin: 0 0 var(--abstand-2);
  font-weight: 600;
  font-size: var(--text-klein);
  color: var(--aubergine-leise);
}

/* Ohne MSW: nur die App, mittig */
.buehne.nur-app {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  grid-template-areas: 'app';
}

.nur-app .app-welt {
  display: grid;
  align-content: start;
  justify-content: center;
  grid-template-columns: minmax(0, 36rem);
  padding-top: clamp(var(--abstand-5), 8vh, 96px);
}

/* Schmale Fenster: untereinander, ganze Seite scrollt */
@media (max-width: 900px) {
  .buehne {
    height: auto;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'leiste' 'app' 'msw';
  }
  .welt { overflow: visible; padding: var(--abstand-4); }
}
</style>
