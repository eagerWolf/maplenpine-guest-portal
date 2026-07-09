<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_whatsapp_from: '',
})

watch(settings, (s) => {
  if (!s) return
  form.twilio_account_sid = s.twilio_account_sid ?? ''
  form.twilio_auth_token = s.twilio_auth_token ?? ''
  form.twilio_whatsapp_from = s.twilio_whatsapp_from ?? ''
}, { immediate: true })

const configured = computed(() => !!(form.twilio_account_sid && form.twilio_auth_token && form.twilio_whatsapp_from))

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
      <div class="flex items-center justify-between mb-1">
        <h2 class="font-medium text-stone-700">WhatsApp (Twilio)</h2>
        <span
          class="text-xs px-2 py-0.5 rounded-full font-medium"
          :class="configured ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-500'"
        >
          {{ configured ? 'Aktivno' : 'Ni nastavljeno' }}
        </span>
      </div>
      <p class="text-xs text-stone-400 mb-4">
        Uporablja se za vsa WhatsApp sporočila (naročila zajtrka, opomniki za sprejem/čiščenje, napake).
        Dokler ni izpolnjeno vse spodaj, se sporočila samo zapišejo v log, ne pošljejo se dejansko.
      </p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Account SID</label>
          <input v-model="form.twilio_account_sid" type="text" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" autocomplete="off" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 font-mono" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Auth Token</label>
          <input v-model="form.twilio_auth_token" type="password" autocomplete="new-password" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 font-mono" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">WhatsApp številka (Twilio sender)</label>
          <input v-model="form.twilio_whatsapp_from" type="tel" placeholder="+14155238886" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 font-mono" />
          <p class="text-xs text-stone-400 mt-1">Twilio WhatsApp-enabled številka, brez predpone "whatsapp:"</p>
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
