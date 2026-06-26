<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  sumup_api_key: '',
  sumup_merchant_code: '',
  sumup_webhook_secret: '',
})

watch(settings, (s) => {
  if (!s) return
  form.sumup_api_key = s.sumup_api_key ?? ''
  form.sumup_merchant_code = s.sumup_merchant_code ?? ''
  form.sumup_webhook_secret = s.sumup_webhook_secret ?? ''
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
  <div class="max-w-lg space-y-6">

    <div class="bg-white rounded-xl border border-stone-200 p-6">
      <h2 class="font-medium text-stone-700 mb-1">SumUp plačila</h2>
      <p class="text-xs text-stone-400 mb-4">Payment provider za procesiranje spletnih plačil.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">API ključ</label>
          <input v-model="form.sumup_api_key" type="password" placeholder="sup_sk_..." autocomplete="new-password" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 font-mono" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Merchant Code</label>
          <input v-model="form.sumup_merchant_code" type="text" placeholder="MXXXXXXX" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 font-mono" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Webhook Secret (opcijsko)</label>
          <input v-model="form.sumup_webhook_secret" type="password" autocomplete="new-password" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 font-mono" />
          <p class="text-xs text-stone-400 mt-1">Webhook URL: <code class="bg-stone-100 px-1 rounded">/api/webhook/sumup</code></p>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">{{ error }}</div>
    <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">✓ Nastavitve shranjene</div>

    <button class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50" :disabled="saving" @click="save">
      {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
    </button>
  </div>
</template>
