<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  check_in_time: '',
  check_out_time: '',
  hot_interval_minutes: '',
  warm_interval_hours: '',
  cold_interval_hours: '',
})

watch(settings, (s) => {
  if (!s) return
  form.check_in_time = s.check_in_time ?? '11:30'
  form.check_out_time = s.check_out_time ?? '13:00'
  form.hot_interval_minutes = s.hot_interval_minutes ?? '30'
  form.warm_interval_hours = s.warm_interval_hours ?? '5'
  form.cold_interval_hours = s.cold_interval_hours ?? '24'
}, { immediate: true })

const saving = ref(false)
const saved = ref(false)
const error = ref('')

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
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-stone-800 mb-6">Nastavitve</h1>

    <div class="max-w-lg space-y-6">
      <!-- Access times -->
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="font-medium text-stone-700 mb-4">Privzeti časi dostopa</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Check-in ura (privzeto)</label>
            <input
              v-model="form.check_in_time"
              type="time"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Privzeta ura začetka dostopa pri novih rezervacijah</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Check-out ura (privzeto)</label>
            <input
              v-model="form.check_out_time"
              type="time"
              class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
            <p class="text-xs text-stone-400 mt-1">Privzeta ura konca dostopa pri novih rezervacijah</p>
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
