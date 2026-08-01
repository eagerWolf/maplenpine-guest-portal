<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface Provider {
  id: number
  name: string
  contact_name: string | null
  contact_email: string | null
  whatsapp: string | null
  notes: string | null
  active: number
  rental_enabled: number
  rental_daily_cost: number
  rental_daily_margin: number
  rental_exceptions: Array<{ date: string; recurring: boolean }>
  pickup_location_id: number | null
  return_location_id: number | null
}

const { data: settings, refresh: refreshSettings } = await useFetch<Record<string, string>>('/api/admin/settings')
const { data, refresh } = await useFetch<{ providers: Provider[] }>('/api/admin/ebike/providers')
const providers = ref<Provider[]>([])
watch(data, value => {
  providers.value = (value?.providers ?? []).map(provider => ({ ...provider }))
}, { immediate: true })

const enabled = ref(settings.value?.ebike_enabled === '1')
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const newProvider = ref(false)

const twilioReady = computed(() => Boolean(
  settings.value?.twilio_account_sid?.trim()
  && settings.value?.twilio_auth_token?.trim()
  && settings.value?.twilio_whatsapp_from?.trim(),
))
const emailReady = computed(() => Boolean(
  settings.value?.sendgrid_api_key?.trim() && settings.value?.email_from?.trim(),
))
const communicationReady = computed(() => twilioReady.value && emailReady.value)

function emptyProvider(): Omit<Provider, 'id'> {
  return {
    name: '', contact_name: '', contact_email: '', whatsapp: '', notes: '', active: 1,
    rental_enabled: 1, rental_daily_cost: 0, rental_daily_margin: 0,
    rental_exceptions: [], pickup_location_id: null, return_location_id: null,
  }
}
const draft = reactive(emptyProvider())

function validateProvider(provider: Omit<Provider, 'id'> | Provider) {
  if (!provider.name?.trim()) throw new Error('Vnesite ime ponudnika.')
  if (provider.rental_enabled && (!provider.whatsapp?.trim() || !provider.contact_email?.trim())) {
    throw new Error(`Pri ponudniku ${provider.name} vnesite WhatsApp in e-pošto.`)
  }
  if (provider.rental_enabled && (!provider.pickup_location_id || !provider.return_location_id)) {
    throw new Error(`Pri ponudniku ${provider.name} izberite lokacijo prevzema in vračila.`)
  }
}

async function addProvider() {
  error.value = ''
  try {
    validateProvider(draft)
    await $fetch('/api/admin/ebike/providers', { method: 'POST', body: draft })
    Object.assign(draft, emptyProvider())
    newProvider.value = false
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Ponudnika ni bilo mogoče dodati'
  }
}

async function saveAll() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    if (enabled.value && !twilioReady.value) throw new Error('Najprej nastavite Twilio WhatsApp.')
    if (enabled.value && !emailReady.value) throw new Error('Najprej nastavite SendGrid e-pošto.')
    const activeProviders = providers.value.filter(provider => provider.active && provider.rental_enabled)
    if (enabled.value && activeProviders.length === 0) throw new Error('Omogočite vsaj enega ponudnika e-koles.')
    for (const provider of providers.value) {
      validateProvider(provider)
      await $fetch(`/api/admin/ebike/providers/${provider.id}`, { method: 'PATCH', body: provider })
    }
    await $fetch('/api/admin/settings', { method: 'POST', body: { ebike_enabled: enabled.value ? '1' : '0' } })
    await Promise.all([refresh(), refreshSettings()])
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Napaka pri shranjevanju'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div class="rounded-xl border border-stone-200 bg-white p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="font-medium text-stone-700">Najem e-koles</h2>
          <p class="mt-1 text-xs text-stone-400">Najprej se pošlje povpraševanje, po potrditvi ponudnika pa se gostu omogoči plačilo.</p>
        </div>
        <button type="button" role="switch" :aria-checked="enabled" :disabled="!communicationReady && !enabled"
          class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors disabled:opacity-40"
          :class="enabled ? 'bg-pine-600' : 'bg-stone-200'" @click="enabled = !enabled">
          <span class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" :class="enabled ? 'translate-x-5' : 'translate-x-0'" />
        </button>
      </div>
      <div v-if="!twilioReady" class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Storitev lahko omogočite po nastavitvi
        <NuxtLink to="/admin/settings/integrations/whatsapp" class="font-medium underline">Twilio WhatsApp</NuxtLink>.
      </div>
      <div v-if="!emailReady" class="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Za obvestila ponudniku nastavite tudi
        <NuxtLink to="/admin/settings/integrations/whatsapp#email" class="font-medium underline">SendGrid e-pošto</NuxtLink>.
      </div>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="font-medium text-stone-700">Ponudniki e-koles</h2>
      <button class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white hover:bg-pine-700" @click="newProvider = !newProvider">+ Dodaj ponudnika</button>
    </div>

    <div v-if="newProvider" class="rounded-xl border-2 border-pine-200 bg-white p-5">
      <h3 class="mb-4 font-medium text-stone-700">Nov ponudnik</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="sm:col-span-2 text-sm text-stone-600">Ime ponudnika<input v-model="draft.name" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Kontaktna oseba<input v-model="draft.contact_name" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">WhatsApp<input v-model="draft.whatsapp" placeholder="+386 ..." class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono" /></label>
        <label class="sm:col-span-2 text-sm text-stone-600">E-pošta<input v-model="draft.contact_email" type="email" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Cena ponudnika / dan<input v-model.number="draft.rental_daily_cost" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Marža / dan<input v-model.number="draft.rental_daily_margin" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <AdminLocationPicker v-model="draft.pickup_location_id" label="Lokacija prevzema" />
        <AdminLocationPicker v-model="draft.return_location_id" label="Lokacija vračila" />
        <label class="sm:col-span-2 text-sm text-stone-600">Interne opombe<textarea v-model="draft.notes" rows="2" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded-lg px-4 py-2 text-sm text-stone-500" @click="newProvider = false">Prekliči</button>
        <button class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white" @click="addProvider">Dodaj</button>
      </div>
    </div>

    <div v-for="provider in providers" :key="provider.id" class="rounded-xl border border-stone-200 bg-white p-5">
      <div class="mb-4 flex items-center justify-between gap-4">
        <input v-model="provider.name" class="min-w-0 flex-1 border-0 p-0 text-base font-semibold text-stone-800 focus:ring-0" />
        <button type="button" role="switch" :aria-checked="Boolean(provider.rental_enabled)"
          class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors"
          :class="provider.rental_enabled ? 'bg-pine-600' : 'bg-stone-200'" @click="provider.rental_enabled = provider.rental_enabled ? 0 : 1">
          <span class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" :class="provider.rental_enabled ? 'translate-x-5' : 'translate-x-0'" />
        </button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="text-sm text-stone-600">Kontaktna oseba<input v-model="provider.contact_name" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">WhatsApp<input v-model="provider.whatsapp" placeholder="+386 ..." class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono" /></label>
        <label class="sm:col-span-2 text-sm text-stone-600">E-pošta<input v-model="provider.contact_email" type="email" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Cena ponudnika / dan<input v-model.number="provider.rental_daily_cost" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label class="text-sm text-stone-600">Marža / dan<input v-model.number="provider.rental_daily_margin" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <AdminLocationPicker v-model="provider.pickup_location_id" label="Lokacija prevzema" />
        <AdminLocationPicker v-model="provider.return_location_id" label="Lokacija vračila" />
        <label class="sm:col-span-2 text-sm text-stone-600">Interne opombe<textarea v-model="provider.notes" rows="2" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
      </div>
    </div>

    <div v-if="error" class="rounded-lg bg-maple-50 px-4 py-3 text-sm text-maple-600">{{ error }}</div>
    <div v-if="saved" class="rounded-lg bg-pine-50 px-4 py-3 text-sm text-pine-700">✓ Nastavitve shranjene</div>
    <button class="w-full rounded-lg bg-pine-600 px-4 py-2.5 font-medium text-white hover:bg-pine-700 disabled:opacity-50" :disabled="saving" @click="saveAll">
      {{ saving ? 'Shranjujem…' : 'Shrani vse nastavitve' }}
    </button>
  </div>
</template>
