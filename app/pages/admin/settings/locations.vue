<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface Location {
  id: number
  name: string
  country: string
  address: string | null
  google_maps_url: string | null
  latitude: number | null
  longitude: number | null
  free_parking: number
  active: number
}

const { data, refresh } = await useFetch<{ locations: Location[] }>('/api/admin/locations')
const locations = ref<Location[]>([])
watch(data, value => { locations.value = (value?.locations ?? []).map(location => ({ ...location })) }, { immediate: true })
const addLocationId = ref<number | null>(null)
const savingId = ref<number | null>(null)
const savedId = ref<number | null>(null)
const error = ref('')
const deletion = useAdminConfirm()

async function save(location: Location) {
  savingId.value = location.id
  savedId.value = null
  error.value = ''
  try {
    await $fetch(`/api/admin/locations/${location.id}`, { method: 'PATCH', body: location })
    await refresh()
    savedId.value = location.id
    setTimeout(() => { if (savedId.value === location.id) savedId.value = null }, 2500)
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Lokacije ni bilo mogoče shraniti.'
  } finally {
    savingId.value = null
  }
}

async function remove(location: Location) {
  if (!await deletion.ask({ title: 'Izbrišem lokacijo?', message: `»${location.name}« bo trajno odstranjena. Če je še v uporabi, bo brisanje varno zavrnjeno.` })) return
  error.value = ''
  try {
    await $fetch(`/api/admin/locations/${location.id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Lokacije ni bilo mogoče izbrisati.'
  }
}

async function locationAdded() {
  await refresh()
  addLocationId.value = null
}
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-stone-800">Lokacije</h1>
      <p class="mt-1 text-sm text-stone-500">Skupne lokacije za restavracije, ponudnike storitev in povezave Google Maps.</p>
    </div>

    <div class="rounded-xl border-2 border-pine-200 bg-white p-5">
      <AdminLocationPicker v-model="addLocationId" label="Dodaj novo lokacijo" @selected="locationAdded" />
    </div>

    <div v-if="error" class="rounded-lg bg-maple-50 px-4 py-3 text-sm text-maple-600">{{ error }}</div>

    <div v-for="location in locations" :key="location.id" class="rounded-xl border border-stone-200 bg-white p-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="sm:col-span-2 text-sm text-stone-600">Ime<input v-model="location.name" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Naslov<input v-model="location.address" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Država<input v-model="location.country" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Zemljepisna širina<input v-model.number="location.latitude" type="number" min="-90" max="90" step="0.000001" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Zemljepisna dolžina<input v-model.number="location.longitude" type="number" min="-180" max="180" step="0.000001" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <a v-if="location.google_maps_url" :href="location.google_maps_url" target="_blank" rel="noopener" class="sm:col-span-2 truncate text-sm text-pine-700 underline">Odpri lokacijo v Google Maps ↗</a>
        <label class="flex items-center gap-2 text-sm text-stone-600"><input v-model="location.free_parking" :true-value="1" :false-value="0" type="checkbox" class="rounded border-stone-300 text-pine-600" /> Brezplačno parkiranje</label>
        <label class="flex items-center gap-2 text-sm text-stone-600"><input v-model="location.active" :true-value="1" :false-value="0" type="checkbox" class="rounded border-stone-300 text-pine-600" /> Aktivna</label>
      </div>
      <div class="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
        <button type="button" class="text-sm text-maple-600 hover:underline" @click="remove(location)">Izbriši</button>
        <div class="flex items-center gap-3">
          <span v-if="savedId === location.id" class="text-sm text-pine-700">✓ Shranjeno</span>
          <button type="button" class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white hover:bg-pine-700 disabled:opacity-50" :disabled="savingId === location.id" @click="save(location)">{{ savingId === location.id ? 'Shranjujem…' : 'Shrani' }}</button>
        </div>
      </div>
    </div>
    <AdminConfirmDialog :open="deletion.open.value" :title="deletion.title.value" :message="deletion.message.value" :confirm-label="deletion.confirmLabel.value" @confirm="deletion.confirm" @cancel="deletion.cancel" />
  </div>
</template>
