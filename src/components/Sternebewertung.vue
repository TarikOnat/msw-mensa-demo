<script setup>
import { ref } from 'vue'

// Fünf Sterne mit Hover-Vorschau. Die Bestätigung zeigt der Speiseplan.
defineProps({ gericht: { type: String, required: true } })
const emit = defineEmits(['bewerten'])

const gewaehlt = ref(0)
const vorschau = ref(0)

function waehle(sterne) {
  gewaehlt.value = sterne
  emit('bewerten', sterne)
}

const voll = (s) => s <= (vorschau.value || gewaehlt.value)
</script>

<template>
  <div class="sterne" role="group" :aria-label="`${gericht} bewerten`" @mouseleave="vorschau = 0">
    <button
      v-for="s in 5"
      :key="s"
      type="button"
      class="stern"
      :class="{ voll: voll(s), gesetzt: s === gewaehlt }"
      :aria-label="`${s} von 5 Sternen`"
      :aria-pressed="gewaehlt === s"
      @mouseenter="vorschau = s"
      @focus="vorschau = s"
      @blur="vorschau = 0"
      @click="waehle(s)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.2l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.85 1.03-6L3.3 9.6l6-.9z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.sterne {
  display: flex;
  margin-right: -3px;
}

.stern {
  border: 0;
  background: none;
  padding: 3px;
  border-radius: var(--radius-klein);
  line-height: 0;
}

.stern svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: transparent;
  stroke: var(--teller-rand);
  stroke-width: 1.8;
  stroke-linejoin: round;
  transition:
    fill var(--dauer-kurz),
    stroke var(--dauer-kurz),
    transform var(--dauer-kurz) var(--kurve);
}

.stern:hover svg { transform: scale(1.12); }

.stern.voll svg {
  fill: var(--safran);
  stroke: #d99a12;
}

/* Kurzes Antippen als Bestätigung des Klicks */
.stern.gesetzt svg { animation: tippen var(--dauer-weg) var(--kurve); }

@keyframes tippen {
  50% { transform: scale(1.3); }
}

@media (prefers-reduced-motion: reduce) {
  .stern.gesetzt svg { animation: none; }
}
</style>
