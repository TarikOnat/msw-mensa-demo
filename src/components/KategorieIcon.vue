<script setup>
// Icon pro Kategorie als Inline-SVG (24×24, Strichstärke 1.8)
defineProps({ kategorie: String })
</script>

<template>
  <svg
    class="kategorie-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- vegan: Blatt -->
    <template v-if="kategorie === 'vegan'">
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19l8-8" />
    </template>
    <!-- vegetarisch: Ei -->
    <template v-else-if="kategorie === 'vegetarisch'">
      <path d="M12 3c3.6 0 6.5 6 6.5 10a6.5 6.5 0 0 1-13 0C5.5 9 8.4 3 12 3z" />
      <circle cx="12" cy="14" r="2.6" />
    </template>
    <!-- Fleisch: Keule -->
    <template v-else-if="kategorie === 'Fleisch'">
      <path d="M13.8 14.4c-3.2.9-6.6-2.5-5.7-5.7C9 5.4 12.4 3.5 15.4 4.1c2.4.5 4 2.1 4.5 4.5.6 3-1.6 5.1-6.1 5.8z" />
      <path d="M10.2 13.8 6.6 17.4" />
      <circle cx="4.9" cy="17.3" r="1.5" />
      <circle cx="6.7" cy="19.1" r="1.5" />
    </template>
    <!-- Fisch -->
    <template v-else-if="kategorie === 'Fisch'">
      <path d="M6.5 12c2.4-3.8 5.6-5.8 8.7-5.8 2.8 0 4.8 2.4 6.3 5.8-1.5 3.4-3.5 5.8-6.3 5.8-3.1 0-6.3-2-8.7-5.8z" />
      <path d="M6.5 12 2.5 8.3v7.4z" />
      <circle cx="17" cy="11" r="0.9" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>

<style scoped>
.kategorie-icon {
  width: 1.15em;
  height: 1.15em;
  flex: none;
}
</style>
