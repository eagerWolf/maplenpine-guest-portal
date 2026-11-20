<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const hostname = computed(() => {
  try { return new URL(String(config.public.baseUrl)).hostname } catch { return '' }
})
const isProduction = computed(() => hostname.value === 'guest.maplenpine.com')
const isTest = computed(() => hostname.value === 'guesttest.maplenpine.com')
const visible = computed(() => !isProduction.value || /^\/(admin|login|activate)(\/|$)/.test(route.path))
const label = computed(() => isProduction.value ? 'PRODUKCIJA' : isTest.value ? 'TEST' : 'LOKALNO')
</script>

<template>
  <div
    v-if="visible"
    class="border-b px-4 py-2 text-center text-xs font-semibold tracking-wide"
    :class="isProduction ? 'border-emerald-300 bg-emerald-100 text-emerald-950' : 'border-amber-400 bg-amber-200 text-amber-950'"
    role="note"
    aria-label="Okolje portala"
  >
    {{ label }} <span class="mx-2" aria-hidden="true">·</span> {{ hostname }}
  </div>
</template>
