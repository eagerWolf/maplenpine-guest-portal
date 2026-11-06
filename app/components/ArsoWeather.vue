<script setup lang="ts">
const { locale } = useLocale()
useHead({ script: [{ src: '/weather/widget.js', defer: true }] })
</script>

<template>
  <ClientOnly>
    <component :is="'arso-weather'" :lang="locale" endpoint="/api/public/weather" />
    <template #fallback><a href="https://vreme.arso.gov.si/napoved/Bled/graf">Bled · ARSO ↗</a></template>
  </ClientOnly>
</template>
