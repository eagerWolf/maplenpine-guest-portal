<script setup lang="ts">
import { notificationEvents, notificationSamples, defaultNotificationTemplate, renderNotificationTemplate, type EditableNotificationEvent } from '#shared/notificationTemplates'
const selected = ref<EditableNotificationEvent>('arrival_today')
const templates = reactive<Record<string,string>>({})
const testPhone = ref('')
const testStatus = ref('')
const testing = ref(false)
const base = useRuntimeConfig().public.baseUrl as string
const preview = computed(() => '[TEST] ' + renderNotificationTemplate(templates[selected.value] || defaultNotificationTemplate, notificationSamples[selected.value] + '\n' + base + (selected.value === 'cleaning_reminder' ? '/cleaning/test-preview' : '/admin'),base))
async function sendTest() {
  testing.value = true; testStatus.value = ''
  try {
    await save()
    if (error.value) return
    await $fetch('/api/admin/whatsapp/test', {method:'POST',body:{type:selected.value}})
    testStatus.value = 'Test sprejet pri ponudniku. Preverite svoj WhatsApp.'
  } catch (err:any) { testStatus.value = err?.data?.statusMessage || 'Pošiljanje ni uspelo.' }
  finally { testing.value = false }
}

definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_whatsapp_from: '',
  twilio_staff_content_sid: '',
})

watch(settings, (s) => {
  if (!s) return
  testPhone.value = s.notification_test_phone || ''
  for (const name of Object.keys(notificationEvents)) templates[name] = s[`notification_template_${name}`] || defaultNotificationTemplate
  form.twilio_account_sid = s.twilio_account_sid ?? ''
  form.twilio_auth_token = s.twilio_auth_token ?? ''
  form.twilio_whatsapp_from = s.twilio_whatsapp_from ?? ''
  form.twilio_staff_content_sid = s.twilio_staff_content_sid ?? ''
}, { immediate: true })

const configured = computed(() => !!(form.twilio_account_sid && form.twilio_auth_token && form.twilio_whatsapp_from && form.twilio_staff_content_sid))

const saving = ref(false)
const saved = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...form, notification_test_phone:testPhone.value, ...Object.fromEntries(Object.entries(templates).map(([key,value])=>[`notification_template_${key}`,value])) } })
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
        Obvestila čistilkam, sprejemu in administratorjem. Brez pravilne konfiguracije je dostava označena kot neuspešna.
        PIN in povezava do gostovega portala sta namenjena pošiljanju prek Bentrala.
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
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Odobrena predloga za obvestila (Content SID)</label>
          <input v-model="form.twilio_staff_content_sid" placeholder="HX…" class="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
          <p v-pre class="text-xs text-stone-400 mt-1">Predloga: Maple &amp; Pine — obvestilo: {{1}}. Podrobnosti: {{2}}. Povezava: {{3}}. Pred uporabo mora biti odobrena v Twiliu/WhatsAppu.</p>
        </div>
      </div>
    </div>

    <section class="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
      <h2 class="font-medium">Besedila obvestil in preizkus</h2>
      <p class="text-sm text-stone-500">Urejate vsebino spremenljivk odobrene Twilio predloge. Njenega zunanjega besedila s tem ne spreminjate. Vsa testna sporočila gredo samo na spodnjo številko in vsebujejo izmišljene podatke.</p>
      <label class="block text-sm">Moja testna številka
        <input v-model="testPhone" type="tel" placeholder="+386…" class="w-full border rounded-lg p-2" />
      </label>
      <label class="block text-sm">Vrsta obvestila
        <select v-model="selected" class="w-full border rounded-lg p-2"><option v-for="(label,key) in notificationEvents" :key="key" :value="key">{{ label }}</option></select>
      </label>
      <textarea v-model="templates[selected]" rows="6" class="w-full border rounded-lg p-2 font-mono text-sm" aria-label="Predloga obvestila" />
      <p class="text-xs text-stone-500">Ohranite {title} (naslov), {details} (podatki) in {link} (povezava). Okoli njih lahko dodate svoje besedilo. Največ 1500 znakov.</p>
      <pre class="whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-sm">{{ preview }}</pre>
      <p class="text-xs text-stone-500">Na WhatsAppu bo vsebina vstavljena v odobreno predlogo »Maple &amp; Pine — obvestilo / Podrobnosti / Povezava«. Testna povezava za čiščenje ne omogoča potrditve.</p>
      <button :disabled="testing || saving || !testPhone" class="bg-pine-600 text-white rounded-lg px-4 py-2 disabled:opacity-50" @click="sendTest">{{ testing ? 'Pošiljam…' : 'Shrani in pošlji ta test meni' }}</button>
      <p role="status" class="text-sm">{{ testStatus }}</p>
    </section>

    <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">{{ error }}</div>
    <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">✓ Nastavitve shranjene</div>

    <button class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50" :disabled="saving" @click="save">
      {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
    </button>
  </div>
</template>
