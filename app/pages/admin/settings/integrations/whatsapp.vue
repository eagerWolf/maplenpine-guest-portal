<script setup lang="ts">
import { notificationEvents, notificationSamples, defaultNotificationTemplate, renderNotificationTemplate, type EditableNotificationEvent } from '#shared/notificationTemplates'
const selected = ref<EditableNotificationEvent>('arrival_today')
const templates = reactive<Record<string,string>>({})
const contentSids = reactive<Record<string,string>>({})
const { data: testRecipient } = await useFetch<{recipient:string,valid:boolean}>('/api/admin/whatsapp/recipient')
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
  for (const name of Object.keys(notificationEvents)) {
    templates[name] = s[`notification_template_${name}`] || defaultNotificationTemplate
    contentSids[name] = s[`twilio_content_sid_${name}`] || ''
  }
  form.twilio_account_sid = s.twilio_account_sid ?? ''
  form.twilio_auth_token = s.twilio_auth_token ?? ''
  form.twilio_whatsapp_from = s.twilio_whatsapp_from ?? ''
  form.twilio_staff_content_sid = s.twilio_staff_content_sid ?? ''
}, { immediate: true })

const configured = computed(() => !!(form.twilio_account_sid && form.twilio_auth_token && form.twilio_whatsapp_from && (form.twilio_staff_content_sid || Object.values(contentSids).some(Boolean))))

const saving = ref(false)
const saved = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...form, ...Object.fromEntries(Object.entries(contentSids).map(([key,value])=>[`twilio_content_sid_${key}`,value])), ...Object.fromEntries(Object.entries(templates).map(([key,value])=>[`notification_template_${key}`,value])) } })
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
          {{ configured ? 'Konfiguracija izpolnjena' : 'Ni nastavljeno' }}
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
      <p class="text-sm text-stone-500">Urejate vsebino spremenljivk odobrene Twilio predloge. Njenega zunanjega besedila s tem ne spreminjate. Test vsebuje izmišljene podatke in se vedno pošlje samo trenutno prijavljenemu administratorju.</p>
      <div class="rounded-lg bg-stone-50 p-3 text-sm">
        <p>Moja WhatsApp številka: <strong>{{ testRecipient?.recipient || 'Ni izpolnjena' }}</strong></p>
        <p v-if="!testRecipient?.valid" class="mt-1 text-maple-600">Pred preizkusom v nastavitvah uporabnikov pri svojem računu izpolnite WhatsApp številko v mednarodni obliki (+386…).</p>
      </div>
      <label class="block text-sm">Vrsta obvestila
        <select v-model="selected" class="w-full border rounded-lg p-2"><option v-for="(label,key) in notificationEvents" :key="key" :value="key">{{ label }}</option></select>
      </label>
      <label class="block text-sm">Odobreni Twilio Content SID za to vrsto obvestila
        <input v-model="contentSids[selected]" placeholder="HX… (prazno: skupna predloga)" class="w-full border rounded-lg p-2 font-mono text-sm" />
      </label>
      <p class="text-xs text-stone-500">Vsaka vrsta lahko uporablja svojo operativno predlogo. Vnesite SID, ko je predloga odobrena; pošiljanje ostaja odvisno od nastavitev okolja.</p>
      <textarea v-model="templates[selected]" rows="6" class="w-full border rounded-lg p-2 font-mono text-sm" aria-label="Predloga obvestila" />
      <p class="text-xs text-stone-500">Ohranite {title} (naslov), {details} (podatki) in {link} (povezava). Okoli njih lahko dodate svoje besedilo. Največ 1500 znakov.</p>
      <details class="rounded-lg border border-stone-200 p-3 text-sm text-stone-600">
        <summary class="cursor-pointer font-medium">Kako oblikujem WhatsApp sporočilo?</summary>
        <div class="mt-3 space-y-3">
          <p>Oznake vnesite neposredno v besedilo. WhatsApp podpira poudarke in emojije, ne podpira pa CSS, izbire pisave, velikosti ali barv.</p>
          <ul class="space-y-1">
            <li><code>*krepko*</code> → <strong>krepko</strong></li>
            <li><code>_ležeče_</code> → <em>ležeče</em></li>
            <li><code>~prečrtano~</code> → <s>prečrtano</s></li>
            <li><code>```enaka širina znakov```</code> → <span class="font-mono">enaka širina znakov</span></li>
          </ul>
          <p>Primer z vsemi obveznimi spremenljivkami:</p>
          <pre class="whitespace-pre-wrap rounded-lg bg-stone-50 p-3 font-mono text-xs">🧹 *{title}*

{details}

Povezava:
{link}

_Maple &amp; Pine_</pre>
          <p>Predogled spodaj prikazuje izvorno besedilo z oznakami. Končni videz preverite z ročnim testom na svoji številki. Trenutna Twilio predloga podrobnosti združi v eno vrstico; prazne vrstice iz urejevalnika se zato ne ohranijo v celoti. Za drugačno razporeditev je treba prilagoditi in ponovno odobriti Twilio predlogo.</p>
        </div>
      </details>
      <pre class="whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-sm">{{ preview }}</pre>
      <p class="text-xs text-stone-500">Na WhatsAppu bo vsebina vstavljena v izbrano odobreno Twilio predlogo (oziroma skupno predlogo, če posebna ni nastavljena). Testna povezava za čiščenje ne omogoča potrditve.</p>
      <button :disabled="testing || saving || !testRecipient?.valid" class="bg-pine-600 text-white rounded-lg px-4 py-2 disabled:opacity-50" @click="sendTest">{{ testing ? 'Pošiljam…' : 'Shrani in pošlji ta test meni' }}</button>
      <p role="status" class="text-sm">{{ testStatus }}</p>
    </section>

    <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">{{ error }}</div>
    <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">✓ Nastavitve shranjene</div>

    <button class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50" :disabled="saving" @click="save">
      {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
    </button>
  </div>
</template>
