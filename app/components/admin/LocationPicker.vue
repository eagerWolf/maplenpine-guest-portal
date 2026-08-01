<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'

interface Location {
  id: number
  name: string
  address: string | null
  google_maps_url: string | null
  latitude: number | null
  longitude: number | null
  free_parking: number
}

const props = defineProps<{ modelValue: number | null; label?: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  selected: [value: Location | null]
}>()
const { data, refresh } = await useFetch<{ locations: Location[] }>('/api/admin/locations')
const adding = ref(false)
const saving = ref(false)
const error = ref('')
const mapElement = ref<HTMLElement | null>(null)
const draft = reactive({
  name: '', address: '', google_maps_url: '', latitude: 46.3683, longitude: 14.1146, free_parking: false,
})
let map: LeafletMap | null = null
let marker: Marker | null = null

function select(value: string) {
  const id = value ? Number(value) : null
  emit('update:modelValue', id)
  emit('selected', data.value?.locations.find(location => location.id === id) || null)
}

function setCoordinates(latitude: number, longitude: number) {
  draft.latitude = Number(latitude.toFixed(6))
  draft.longitude = Number(longitude.toFixed(6))
  draft.google_maps_url = `https://www.google.com/maps/search/?api=1&query=${draft.latitude},${draft.longitude}`
  marker?.setLatLng([draft.latitude, draft.longitude])
}

async function initialiseMap() {
  if (!import.meta.client || !mapElement.value || map) return
  const L = await import('leaflet')
  map = L.map(mapElement.value).setView([draft.latitude, draft.longitude], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)
  const pin = L.divIcon({
    className: '',
    html: '<div class="location-map-pin"><span></span></div>',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  })
  marker = L.marker([draft.latitude, draft.longitude], { draggable: true, icon: pin }).addTo(map)
  map.on('click', event => setCoordinates(event.latlng.lat, event.latlng.lng))
  marker.on('dragend', () => {
    const point = marker?.getLatLng()
    if (point) setCoordinates(point.lat, point.lng)
  })
  setCoordinates(draft.latitude, draft.longitude)
}

watch(adding, async open => {
  if (open) {
    await nextTick()
    await initialiseMap()
    setTimeout(() => map?.invalidateSize(), 0)
  } else if (map) {
    map.remove()
    map = null
    marker = null
  }
})

onBeforeUnmount(() => map?.remove())

async function add() {
  saving.value = true
  error.value = ''
  try {
    const body = {
      ...draft,
      name: draft.name.trim() || draft.address.trim() || `Lokacija ${draft.latitude}, ${draft.longitude}`,
    }
    const result = await $fetch<{ id: number }>('/api/admin/locations', { method: 'POST', body })
    await refresh()
    emit('update:modelValue', Number(result.id))
    emit('selected', data.value?.locations.find(location => location.id === Number(result.id)) || null)
    adding.value = false
    Object.assign(draft, { name: '', address: '', google_maps_url: '', latitude: 46.3683, longitude: 14.1146, free_parking: false })
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Lokacije ni bilo mogoče shraniti.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-stone-600">{{ label || 'Lokacija' }}</label>
    <div class="flex gap-2">
      <select :value="modelValue || ''" class="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" @change="select(($event.target as HTMLSelectElement).value)">
        <option value="">— Brez lokacije —</option>
        <option v-for="location in data?.locations" :key="location.id" :value="location.id">
          {{ location.name }}{{ location.address ? ` · ${location.address}` : '' }}{{ location.free_parking ? ' · brezplačno parkiranje' : '' }}
        </option>
      </select>
      <button type="button" class="rounded-lg border border-stone-300 px-3 text-sm hover:bg-stone-50" :aria-expanded="adding" @click="adding = !adding">{{ adding ? '×' : '+' }}</button>
    </div>

    <div v-if="adding" class="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div class="grid gap-2 sm:grid-cols-2">
        <input v-model="draft.name" placeholder="Ime lokacije" class="rounded-lg border border-stone-300 p-2 text-sm" />
        <input v-model="draft.address" placeholder="Naslov" class="rounded-lg border border-stone-300 p-2 text-sm" />
      </div>
      <div class="overflow-hidden rounded-lg border border-stone-300 bg-stone-200">
        <div ref="mapElement" class="h-72 w-full" />
      </div>
      <p class="text-xs text-stone-500">Kliknite na zemljevid ali povlecite pin na natančno mesto.</p>
      <div class="grid gap-2 sm:grid-cols-2">
        <label class="text-xs text-stone-500">Zemljepisna širina<input v-model.number="draft.latitude" type="number" step="0.000001" readonly class="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-sm" /></label>
        <label class="text-xs text-stone-500">Zemljepisna dolžina<input v-model.number="draft.longitude" type="number" step="0.000001" readonly class="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-sm" /></label>
      </div>
      <input v-model="draft.google_maps_url" readonly class="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-500" aria-label="Google Maps povezava" />
      <p v-if="error" class="rounded-lg bg-maple-50 px-3 py-2 text-sm text-maple-600">{{ error }}</p>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="flex items-center gap-2 text-sm text-stone-600"><input v-model="draft.free_parking" type="checkbox" class="rounded border-stone-300 text-pine-600" /> Brezplačno parkiranje</label>
        <button type="button" class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white hover:bg-pine-700 disabled:opacity-50" :disabled="saving" @click="add">{{ saving ? 'Shranjujem…' : 'Shrani lokacijo' }}</button>
      </div>
    </div>
  </div>
</template>

<style>
.location-map-pin {
  position: relative;
  width: 30px;
  height: 40px;
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.3));
}
.location-map-pin::before {
  position: absolute;
  top: 0;
  left: 1px;
  width: 28px;
  height: 28px;
  content: '';
  background: #315c4c;
  border: 3px solid white;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}
.location-map-pin span {
  position: absolute;
  z-index: 1;
  top: 9px;
  left: 11px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 9999px;
}
</style>
