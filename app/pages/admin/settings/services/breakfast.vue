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
  breakfast_enabled: number
  breakfast_cost: number
  breakfast_margin: number
  breakfast_cutoff_hour: number
  breakfast_jan1_note: string | null
  breakfast_min_count: number
  breakfast_max_count: number
  breakfast_exceptions: Array<{ date: string; recurring: boolean }>
}

const { data: settings, refresh: refreshSettings } = await useFetch<Record<string, string>>('/api/admin/settings')
const { data, refresh } = await useFetch<{ providers: Provider[] }>('/api/admin/breakfast/providers')
const providers = ref<Provider[]>([])
watch(data, (value) => {
  providers.value = (value?.providers ?? []).map(provider => ({
    ...provider,
    breakfast_exceptions: Array.isArray(provider.breakfast_exceptions) ? provider.breakfast_exceptions.map(item => ({ ...item })) : [],
  }))
}, { immediate: true })
const enabled = ref(settings.value?.breakfast_enabled === '1')
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const newProvider = ref(false)

const twilioReady = computed(() => Boolean(
  settings.value?.twilio_account_sid?.trim()
  && settings.value?.twilio_auth_token?.trim()
  && settings.value?.twilio_whatsapp_from?.trim(),
))

function emptyProvider(): Omit<Provider, 'id'> {
  return {
    name: '', contact_name: '', contact_email: '', whatsapp: '', notes: '', active: 1,
    breakfast_enabled: 1, breakfast_cost: 12, breakfast_margin: 2, breakfast_cutoff_hour: 18,
    breakfast_jan1_note: 'Naročilo za 1. januar ni možno, ker partner ta dan ne obratuje.',
    breakfast_min_count: 2, breakfast_max_count: 8,
    breakfast_exceptions: [{ date: '01-01', recurring: true }],
  }
}
const draft = reactive(emptyProvider())

async function saveAll() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    if (enabled.value && !twilioReady.value) throw new Error('Najprej nastavite Twilio WhatsApp.')
    const activeProviders = providers.value.filter(p => p.active && p.breakfast_enabled)
    if (enabled.value && activeProviders.length === 0) throw new Error('Omogočite vsaj enega ponudnika zajtrka.')
    for (const provider of providers.value) {
      if (provider.breakfast_enabled && (!provider.whatsapp?.trim() || !provider.contact_email?.trim())) {
        throw new Error(`Pri ponudniku ${provider.name} vnesite WhatsApp in e-pošto.`)
      }
      await $fetch(`/api/admin/breakfast/providers/${provider.id}`, { method: 'PATCH', body: provider })
    }
    await $fetch('/api/admin/settings', { method: 'POST', body: { breakfast_enabled: enabled.value ? '1' : '0' } })
    await Promise.all([refresh(), refreshSettings()])
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Napaka pri shranjevanju'
  } finally { saving.value = false }
}

async function addProvider() {
  error.value = ''
  try {
    if (!draft.name.trim()) throw new Error('Vnesite ime ponudnika.')
    await $fetch('/api/admin/breakfast/providers', { method: 'POST', body: draft })
    Object.assign(draft, emptyProvider())
    newProvider.value = false
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Ponudnika ni bilo mogoče dodati'
  }
}

function addException(provider: Record<string, any>) {
  if (!Array.isArray(provider.breakfast_exceptions)) provider.breakfast_exceptions = []
  provider.breakfast_exceptions.push({ date: '', recurring: true })
}

function removeException(provider: Record<string, any>, index: number) {
  if (Array.isArray(provider.breakfast_exceptions)) provider.breakfast_exceptions.splice(index, 1)
}

function exceptionCalendarValue(exception: { date: string; recurring: boolean }): string {
  if (exception.recurring && /^\d{2}-\d{2}$/.test(exception.date)) {
    return `${new Date().getFullYear()}-${exception.date}`
  }
  return exception.date || ''
}

function setExceptionDate(exception: { date: string; recurring: boolean }, value: string) {
  exception.date = exception.recurring ? value.slice(5) : value
}

function setExceptionRecurring(exception: { date: string; recurring: boolean }, recurring: boolean) {
  const calendarDate = exceptionCalendarValue(exception)
  exception.recurring = recurring
  exception.date = recurring ? calendarDate.slice(5) : calendarDate
}
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div class="rounded-xl border border-stone-200 bg-white p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="font-medium text-stone-700">Prodaja zajtrka</h2>
          <p class="mt-1 text-xs text-stone-400">Gost lahko izbira med vsemi omogočenimi ponudniki.</p>
        </div>
        <button type="button" role="switch" :aria-checked="enabled" :disabled="!twilioReady && !enabled"
          class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors disabled:opacity-40"
          :class="enabled ? 'bg-pine-600' : 'bg-stone-200'" @click="enabled = !enabled">
          <span class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" :class="enabled ? 'translate-x-5' : 'translate-x-0'" />
        </button>
      </div>
      <div v-if="!twilioReady" class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Prodajo lahko omogočite po nastavitvi
        <NuxtLink to="/admin/settings/integrations/whatsapp" class="font-medium underline">Twilio WhatsApp</NuxtLink>.
      </div>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="font-medium text-stone-700">Ponudniki zajtrka</h2>
      <button class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white hover:bg-pine-700" @click="newProvider = !newProvider">+ Dodaj ponudnika</button>
    </div>

    <div v-if="newProvider" class="rounded-xl border-2 border-pine-200 bg-white p-5">
      <h3 class="mb-4 font-medium text-stone-700">Nov ponudnik</h3>
      <ProviderFields :provider="draft" />
      <div class="mt-4 border-t border-stone-100 pt-4">
        <div class="mb-2 flex items-center justify-between gap-3"><div><div class="text-sm font-medium text-stone-700">Izjeme dobave</div><p class="text-xs text-stone-400">Obvestilo gostu se sestavi samodejno v vseh jezikih.</p></div><button type="button" class="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" @click="draft.breakfast_exceptions.push({ date: '', recurring: true })">+ Dodaj datum</button></div>
        <div v-for="(exception, index) in draft.breakfast_exceptions" :key="index" class="mb-2 flex items-center gap-2 rounded-lg bg-stone-50 p-2"><input :value="exceptionCalendarValue(exception)" type="date" class="min-w-44 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" @input="setExceptionDate(exception, ($event.target as HTMLInputElement).value)" /><label class="flex items-center gap-2 text-xs"><input :checked="exception.recurring" type="checkbox" @change="setExceptionRecurring(exception, ($event.target as HTMLInputElement).checked)" /> Vsako leto</label><button type="button" class="px-2 text-lg text-maple-500" @click="removeException(draft, index)">×</button></div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded-lg px-4 py-2 text-sm text-stone-500" @click="newProvider = false">Prekliči</button>
        <button class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white" @click="addProvider">Dodaj</button>
      </div>
    </div>

    <div v-for="provider in providers" :key="provider.id" class="rounded-xl border border-stone-200 bg-white p-5">
      <div class="mb-4 flex items-center justify-between gap-4">
        <input v-model="provider.name" class="min-w-0 flex-1 border-0 p-0 text-base font-semibold text-stone-800 focus:ring-0" />
        <label class="flex items-center gap-2 text-sm text-stone-500">
          <input v-model="provider.breakfast_enabled" :true-value="1" :false-value="0" type="checkbox" class="rounded border-stone-300 text-pine-600" /> Omogočen
        </label>
      </div>
      <ProviderFields :provider="provider" />
      <div class="mt-4 border-t border-stone-100 pt-4">
        <div class="mb-2 flex items-center justify-between gap-3"><div><div class="text-sm font-medium text-stone-700">Izjeme dobave</div><p class="text-xs text-stone-400">Obvestilo gostu se sestavi samodejno v vseh jezikih.</p></div><button type="button" class="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" @click="provider.breakfast_exceptions.push({ date: '', recurring: true })">+ Dodaj datum</button></div>
        <div v-for="(exception, index) in provider.breakfast_exceptions" :key="index" class="mb-2 flex items-center gap-2 rounded-lg bg-stone-50 p-2"><input :value="exceptionCalendarValue(exception)" type="date" class="min-w-44 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" @input="setExceptionDate(exception, ($event.target as HTMLInputElement).value)" /><label class="flex items-center gap-2 text-xs"><input :checked="exception.recurring" type="checkbox" @change="setExceptionRecurring(exception, ($event.target as HTMLInputElement).checked)" /> Vsako leto</label><button type="button" class="px-2 text-lg text-maple-500" @click="removeException(provider, index)">×</button></div>
      </div>
    </div>

    <div v-if="error" class="rounded-lg bg-maple-50 px-4 py-3 text-sm text-maple-600">{{ error }}</div>
    <div v-if="saved" class="rounded-lg bg-pine-50 px-4 py-3 text-sm text-pine-700">✓ Nastavitve shranjene</div>
    <button class="w-full rounded-lg bg-pine-600 px-4 py-2.5 font-medium text-white hover:bg-pine-700 disabled:opacity-50" :disabled="saving" @click="saveAll">
      {{ saving ? 'Shranjujem…' : 'Shrani vse nastavitve' }}
    </button>
  </div>
</template>
