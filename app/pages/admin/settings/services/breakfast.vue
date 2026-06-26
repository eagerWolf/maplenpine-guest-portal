<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  breakfast_enabled: '0',
  breakfast_partner_whatsapp: '',
  breakfast_partner_cost: '12.00',
  breakfast_margin: '2.00',
  breakfast_order_cutoff_hour: '18',
  breakfast_jan1_note: '',
  breakfast_min_count: '2',
  breakfast_max_count_fallback: '8',
})

watch(settings, (s) => {
  if (!s) return
  form.breakfast_enabled = s.breakfast_enabled ?? '0'
  form.breakfast_partner_whatsapp = s.breakfast_partner_whatsapp ?? ''
  form.breakfast_partner_cost = s.breakfast_partner_cost ?? '12.00'
  form.breakfast_margin = s.breakfast_margin ?? '2.00'
  form.breakfast_order_cutoff_hour = s.breakfast_order_cutoff_hour ?? '18'
  form.breakfast_jan1_note = s.breakfast_jan1_note ?? ''
  form.breakfast_min_count = s.breakfast_min_count ?? '2'
  form.breakfast_max_count_fallback = s.breakfast_max_count_fallback ?? '8'
}, { immediate: true })

const partnerCost = computed(() => parseFloat(form.breakfast_partner_cost) || 0)
const margin = computed(() => parseFloat(form.breakfast_margin) || 0)
const guestPrice = computed(() => partnerCost.value + margin.value)

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
  <div class="max-w-lg space-y-6">

    <div class="bg-white rounded-xl border border-stone-200 p-6">
      <h2 class="font-medium text-stone-700 mb-4">Zajtrk (Bled Breakfast)</h2>
      <div class="space-y-5">

        <!-- Enable toggle -->
        <label class="flex items-center justify-between gap-4 cursor-pointer">
          <div class="text-sm font-medium text-stone-700">Omogoči naročanje zajtrka</div>
          <button
            type="button"
            role="switch"
            :aria-checked="form.breakfast_enabled === '1'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-2"
            :class="form.breakfast_enabled === '1' ? 'bg-pine-600' : 'bg-stone-200'"
            @click="form.breakfast_enabled = form.breakfast_enabled === '1' ? '0' : '1'"
          >
            <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200" :class="form.breakfast_enabled === '1' ? 'translate-x-5' : 'translate-x-0'" />
          </button>
        </label>

        <!-- Partner WhatsApp -->
        <div class="border-t border-stone-100 pt-4">
          <label class="block text-sm font-medium text-stone-600 mb-1">WhatsApp partnerja</label>
          <input
            v-model="form.breakfast_partner_whatsapp"
            type="text"
            placeholder="+386 41 123 456"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
          <p class="text-xs text-stone-400 mt-1">Na to številko se pošlje naročilo zajtrka.</p>
        </div>

        <!-- Partner cost + margin -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Strošek partnerja (EUR / zajtrk)</label>
            <input v-model="form.breakfast_partner_cost" type="number" step="0.01" min="0" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
            <p class="text-xs text-stone-400 mt-1">Partner dobi ta znesek</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Vaša marža (EUR / zajtrk)</label>
            <input v-model="form.breakfast_margin" type="number" step="0.01" min="0" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
            <p class="text-xs text-stone-400 mt-1">Portal obdrži ta znesek</p>
          </div>
        </div>

        <!-- Live preview -->
        <div v-if="partnerCost > 0 || margin > 0" class="bg-stone-50 rounded-lg px-4 py-3 text-sm space-y-1">
          <div class="flex justify-between">
            <span class="text-stone-500">Partner dobi:</span>
            <span class="font-medium text-stone-700">{{ partnerCost.toFixed(2) }} EUR / zajtrk</span>
          </div>
          <div class="flex justify-between">
            <span class="text-stone-500">Vaša marža:</span>
            <span class="font-medium text-pine-700">{{ margin.toFixed(2) }} EUR / zajtrk</span>
          </div>
          <div class="flex justify-between border-t border-stone-200 pt-1 mt-1">
            <span class="text-stone-600 font-medium">Gost plača:</span>
            <span class="font-semibold text-stone-800">{{ guestPrice.toFixed(2) }} EUR / zajtrk</span>
          </div>
        </div>

        <!-- Min/max counts -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Min. zajtrkov</label>
            <input v-model="form.breakfast_min_count" type="number" min="1" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-1">Max (če ni podatka o gostih)</label>
            <input v-model="form.breakfast_max_count_fallback" type="number" min="1" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          </div>
        </div>

        <!-- Cutoff -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Rok naročila za naslednji dan (ura)</label>
          <input v-model="form.breakfast_order_cutoff_hour" type="number" min="0" max="23" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          <p class="text-xs text-stone-400 mt-1">Po tej uri naročilo za jutri ni mogoče (privzeto 18).</p>
        </div>

        <!-- Jan 1 note -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Opomba za 1. januar</label>
          <input v-model="form.breakfast_jan1_note" type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
        </div>

      </div>
    </div>

    <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">{{ error }}</div>
    <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">✓ Nastavitve shranjene</div>

    <button
      class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
      :disabled="saving"
      @click="save"
    >
      {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
    </button>
  </div>
</template>
