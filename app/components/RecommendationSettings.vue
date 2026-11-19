<script setup lang="ts">
import { recommendationDefaults, serviceLocales, type ServiceKind } from '#shared/serviceRecommendations'
const props = defineProps<{ kind: ServiceKind }>()
const { data: settings } = await useFetch<Record<string, string>>('/api/admin/settings')
const prefix = `recommendation_${props.kind}_`
const form = reactive(Object.fromEntries(Object.entries(recommendationDefaults).filter(([key]) => key.startsWith(prefix)).map(([key, value]) => [key, settings.value?.[key] || value])))
const saving = ref(false)
const saved = ref(false)
const error = ref('')
async function save() {
  saving.value = true; saved.value = false; error.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...form, breakfast_enabled: '0', ebike_enabled: '0' } })
    await refreshNuxtData()
    saved.value = true
  } catch (err: any) { error.value = err?.data?.statusMessage || 'Shranjevanje ni uspelo.' }
  finally { saving.value = false }
}
</script>
<template>
  <div class="max-w-3xl space-y-6">
    <header><h1 class="text-2xl font-semibold text-stone-800">{{ kind === 'breakfast' ? 'Priporočilo za zajtrk' : 'Priporočilo za najem koles' }}</h1>
      <p class="mt-2 text-sm text-stone-500">Gost naročilo in plačilo uredi pri ponudniku. Portal prikazuje opis in zunanjo povezavo.</p>
    </header>
    <form class="space-y-5 rounded-xl border border-stone-200 bg-white p-6" @submit.prevent="save">
      <label class="block text-sm font-medium">Ponudnik<input v-model="form[prefix + 'name']" required maxlength="200" class="mt-2 block w-full rounded border border-stone-300 p-3" /></label>
      <label class="block text-sm font-medium">Povezava za naročilo / spletna stran<input v-model="form[prefix + 'url']" required type="url" class="mt-2 block w-full rounded border border-stone-300 p-3" /></label>
      <fieldset v-for="lang in serviceLocales" :key="lang" class="space-y-3 border-t border-stone-100 pt-5">
        <legend class="font-semibold uppercase text-stone-600">{{ lang }}</legend>
        <label class="block text-sm">Opis<textarea v-model="form[prefix + 'description_' + lang]" rows="4" maxlength="4000" class="mt-2 block w-full rounded border border-stone-300 p-3" /></label>
        <label class="block text-sm">Opomba za gosta<textarea v-model="form[prefix + 'note_' + lang]" rows="3" maxlength="4000" class="mt-2 block w-full rounded border border-stone-300 p-3" /></label>
      </fieldset>
      <p v-if="error" role="alert" class="text-sm text-red-700">{{ error }}</p>
      <p v-if="saved" role="status" class="text-sm text-green-700">Priporočilo je shranjeno.</p>
      <button type="submit" :disabled="saving" class="rounded-lg bg-pine-700 px-5 py-3 font-medium text-white disabled:opacity-50">{{ saving ? 'Shranjujem …' : 'Shrani priporočilo' }}</button>
    </form>
  </div>
</template>
