<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  bentral_checkin_time: '',
  bentral_checkout_time: '',
  checkin_offset_minutes: '',
  checkout_offset_minutes: '',
  hot_interval_minutes: '',
  warm_interval_hours: '',
  cold_interval_hours: '',
  contact_phone: '',
  property_nav_url: '',
})

watch(settings, (s) => {
  if (!s) return
  form.bentral_checkin_time = s.bentral_checkin_time ?? '15:00'
  form.bentral_checkout_time = s.bentral_checkout_time ?? '11:00'
  form.checkin_offset_minutes = s.checkin_offset_minutes ?? '-120'
  form.checkout_offset_minutes = s.checkout_offset_minutes ?? '30'
  form.hot_interval_minutes = s.hot_interval_minutes ?? '30'
  form.warm_interval_hours = s.warm_interval_hours ?? '5'
  form.cold_interval_hours = s.cold_interval_hours ?? '24'
  form.contact_phone = s.contact_phone ?? ''
  form.property_nav_url = s.property_nav_url ?? ''
}, { immediate: true })

const saving = ref(false)
const saved = ref(false)
const error = ref('')
const refreshingTimes = ref(false)
const timesError = ref('')

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...form } })
    saved.value = true
    await refresh()
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Napaka pri shranjevanju'
  } finally {
    saving.value = false
  }
}

async function refreshBentralTimes() {
  refreshingTimes.value = true
  timesError.value = ''
  try {
    const res = await $fetch<{ checkinFrom: string; checkoutTo: string }>('/api/admin/settings/bentral-times', { method: 'POST' })
    form.bentral_checkin_time = res.checkinFrom
    form.bentral_checkout_time = res.checkoutTo
    await refresh()
  } catch (err: any) {
    timesError.value = err?.data?.statusMessage ?? 'Napaka pri branju iz Bentrala'
  } finally {
    refreshingTimes.value = false
  }
}

function accessPreview(time: string, offset: number): string {
  if (!time || isNaN(offset)) return '—'
  const [h, m] = time.split(':').map(Number)
  let total = h * 60 + m + offset
  total = ((total % 1440) + 1440) % 1440
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-stone-800 mb-6">Nastavitve</h1>

    <div class="max-w-lg space-y-6">

      <!-- Official check-in/out times -->
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <div class="flex items-start justify-between mb-1">
          <h2 class="font-medium text-stone-700">Uradni čas prijave in odjave</h2>
          <button
            class="text-xs font-medium text-pine-600 hover:text-pine-800 disabled:opacity-40 transition-colors"
            :disabled="refreshingTimes"
            @click="refreshBentralTimes"
          >
            {{ refreshingTimes ? 'Osvežujem…' : '↻ Uvozi iz Bentrala' }}
          </button>
        </div>
        <p class="text-xs text-stone-400 mb-4">
          Ta ura se prikaže gostu na portalu. Za eKey dostop se nato doda odmik (spodaj).
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Prijava od</label>
            <input
              v-model="form.bentral_checkin_time"
              type="time"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Odjava do</label>
            <input
              v-model="form.bentral_checkout_time"
              type="time"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
          </div>
        </div>
        <p v-if="timesError" class="text-xs text-red-600 mt-2">{{ timesError }}</p>
      </div>

      <!-- eKey access offsets -->
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="font-medium text-stone-700 mb-1">Odmik za eKey dostop</h2>
        <p class="text-xs text-stone-400 mb-4">
          Gost vidi uradni čas zgoraj. eKey PIN pa velja od/do uradnega časa ± odmik.
        </p>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Odmik ob prijavi (min)</label>
            <input
              v-model="form.checkin_offset_minutes"
              type="number"
              min="-720"
              max="720"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <div class="mt-2 text-xs text-stone-500 flex gap-2 items-center flex-wrap">
              <span class="inline-flex items-center gap-1 bg-stone-100 rounded px-2 py-0.5">
                Gost vidi: <strong>{{ form.bentral_checkin_time || '—' }}</strong>
              </span>
              <span class="text-stone-300">→</span>
              <span class="inline-flex items-center gap-1 bg-pine-50 text-pine-700 rounded px-2 py-0.5">
                eKey od: <strong>{{ form.bentral_checkin_time && form.checkin_offset_minutes ? accessPreview(form.bentral_checkin_time, parseInt(form.checkin_offset_minutes)) : '—' }}</strong>
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Odmik ob odjavi (min)</label>
            <input
              v-model="form.checkout_offset_minutes"
              type="number"
              min="-720"
              max="720"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <div class="mt-2 text-xs text-stone-500 flex gap-2 items-center flex-wrap">
              <span class="inline-flex items-center gap-1 bg-stone-100 rounded px-2 py-0.5">
                Gost vidi: <strong>{{ form.bentral_checkout_time || '—' }}</strong>
              </span>
              <span class="text-stone-300">→</span>
              <span class="inline-flex items-center gap-1 bg-pine-50 text-pine-700 rounded px-2 py-0.5">
                eKey do: <strong>{{ form.bentral_checkout_time && form.checkout_offset_minutes ? accessPreview(form.bentral_checkout_time, parseInt(form.checkout_offset_minutes)) : '—' }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact & Navigation -->
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="font-medium text-stone-700 mb-4">Kontakt in navigacija</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Telefonska številka (za klice gostov)</label>
            <input
              v-model="form.contact_phone"
              type="tel"
              placeholder="+386 40 123 456"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Prikazana kot gumb »Pokliči« na gostovi strani</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Navigacijski URL (Google Maps / Waze)</label>
            <input
              v-model="form.property_nav_url"
              type="url"
              placeholder="https://maps.google.com/?q=..."
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Prikazana kot gumb »Navigacija« na gostovi strani</p>
          </div>
        </div>
      </div>

      <!-- Sync intervals -->
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="font-medium text-stone-700 mb-1">Intervali Bentral sinhronizacije</h2>
        <p class="text-xs text-stone-400 mb-4">Spremembe intervalov zahtevajo ponovni zagon strežnika.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Hot tier — interval (min)</label>
            <input
              v-model="form.hot_interval_minutes"
              type="number"
              min="5"
              max="120"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Danes + jutri · privzeto 30 min</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Warm tier — interval (ure)</label>
            <input
              v-model="form.warm_interval_hours"
              type="number"
              min="1"
              max="24"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Naslednji 7 dni · privzeto 5 ur</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Cold tier — interval (ure)</label>
            <input
              v-model="form.cold_interval_hours"
              type="number"
              min="12"
              max="168"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Prihodnje leto · privzeto 24 ur</p>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">
        {{ error }}
      </div>
      <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">
        ✓ Nastavitve shranjene
      </div>

      <button
        class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
      </button>
    </div>
  </div>
</template>
