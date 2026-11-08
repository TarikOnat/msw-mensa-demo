<script setup>
// Platzhalter in der Form der Gerichtliste, solange der Speiseplan lädt
defineProps({ zeilen: { type: Number, default: 4 } })
</script>

<template>
  <ul class="skelett" aria-hidden="true">
    <li v-for="z in zeilen" :key="z" class="zeile">
      <span class="block bild"></span>
      <span class="text">
        <span class="block name" :style="{ width: `${58 + ((z * 17) % 30)}%` }"></span>
        <span class="block beilage"></span>
        <span class="block chip"></span>
      </span>
      <span class="block preis"></span>
    </li>
  </ul>
</template>

<style scoped>
.skelett {
  list-style: none;
  margin: 0;
  padding: 0;
}

.zeile {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) 10rem;
  gap: var(--abstand-4);
  align-items: start;
  padding: 10px 0;
  border-top: 1px dashed var(--teller-rand);
}

.zeile:first-child { border-top: 0; }

.text {
  display: flex;
  flex-direction: column;
  gap: var(--abstand-2);
}

.block {
  display: block;
  border-radius: var(--radius-klein);
  background: var(--skelett);
  animation: atmen 1.4s ease-in-out infinite;
}

.bild { width: 3.5rem; height: 3.5rem; border-radius: 50%; }
.name { height: 1.3rem; }
.beilage { width: 70%; height: 0.9rem; }
.chip { width: 6rem; height: 1.4rem; border-radius: 99px; }
.preis { height: 1.3rem; }

/* Versetzt pulsieren, damit es nicht flackert */
.zeile:nth-child(2) .block { animation-delay: 120ms; }
.zeile:nth-child(3) .block { animation-delay: 240ms; }
.zeile:nth-child(4) .block { animation-delay: 360ms; }

@keyframes atmen {
  50% { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .block { animation: none; }
}
</style>
