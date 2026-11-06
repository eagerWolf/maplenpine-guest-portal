<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
const { data: settings } = await useFetch<Record<string, string>>('/api/admin/settings')
const apartments = ['maple', 'pine'] as const
const form = reactive<Record<string, string>>({})
for (const apartment of apartments) for (const suffix of ['token', 'wifi_ssid', 'wifi_password']) {
  const key = `tv_${apartment}_${suffix}`
  form[key] = settings.value?.[key] || ''
}
const message = ref('')
const saving = ref(false)
function generate(apartment: string) {
  form[`tv_${apartment}_token`] = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')
}
async function save() {
  saving.value = true
  message.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: form })
    message.value = 'Shranjeno. Sprememba ali izbris ključa prekliče prejšnji dostop TV-ja.'
  } catch (error: any) { message.value = error?.data?.statusMessage || 'Shranjevanje ni uspelo.' }
  finally { saving.value = false }
}
</script>
<template>
  <form class="max-w-xl space-y-6" @submit.prevent="save">
    <h1 class="text-xl font-semibold">TV portal in Wi-Fi</h1>
    <p class="text-sm text-stone-600">Ključ namestite samo v zaupanja vredno TV-aplikacijo, nikoli v URL ali javni predogled. Za shranjevanje ključev in gesel mora biti nastavljena NUXT_SETTINGS_ENCRYPTION_KEY.</p>
    <fieldset v-for="apartment in apartments" :key="apartment" class="bg-white border rounded-xl p-5 space-y-4">
      <legend class="capitalize font-semibold">{{ apartment }}</legend>
      <label class="block">Wi-Fi omrežje (SSID)
        <input v-model="form[`tv_${apartment}_wifi_ssid`]" maxlength="128" class="block border rounded p-2 w-full" autocomplete="off">
      </label>
      <label class="block">Wi-Fi geslo
        <input v-model="form[`tv_${apartment}_wifi_password`]" maxlength="256" type="password" class="block border rounded p-2 w-full" autocomplete="new-password">
      </label>
      <label class="block">Dostopni ključ TV
        <input v-model="form[`tv_${apartment}_token`]" type="password" class="block border rounded p-2 w-full" autocomplete="new-password">
      </label>
      <button type="button" class="border rounded px-3 py-2" @click="generate(apartment)">Ustvari / zamenjaj ključ</button>
      <button type="button" class="border rounded px-3 py-2 ml-2" @click="form[`tv_${apartment}_token`] = ''">Prekliči dostop</button>
      <p class="text-xs text-stone-500">Sprememba začne veljati po shranjevanju. Ključ lahko iz polja kopirate za namestitev.</p>
    </fieldset>
    <button :disabled="saving" class="bg-pine-700 text-white rounded px-5 py-2">{{ saving ? 'Shranjujem …' : 'Shrani' }}</button>
    <p role="status">{{ message }}</p>
  </form>
</template>
