<script setup>
import { defineAsyncComponent, ref } from 'vue'
import Speiseplan from './components/Speiseplan.vue'

defineProps({ mockingAktiv: Boolean })

// Die Demo-Steuerung gibt es nur in der Entwicklung
const DemoPanel = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./demo/DemoPanel.vue'))
  : null

// Zählt hoch, wenn ein Szenario gewechselt wird. Der Speiseplan lädt dann neu.
const neuLaden = ref(0)
</script>

<template>
  <div class="buehne" :class="{ 'nur-app': !mockingAktiv }">
    <section class="spalte">
      <p class="spalten-titel">Die App <span>weiß nichts von MSW</span></p>
      <Speiseplan :neu-laden="neuLaden" />
    </section>

    <section v-if="mockingAktiv && DemoPanel" class="spalte">
      <p class="spalten-titel">Mock Service Worker <span>Demo-Steuerung</span></p>
      <DemoPanel @szenario-gewechselt="neuLaden++" />
    </section>
  </div>
</template>
