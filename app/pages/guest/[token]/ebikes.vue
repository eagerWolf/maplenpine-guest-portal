<script setup lang="ts">
import type { Locale } from '~/composables/useLocale'
definePageMeta({ layout: 'guest', middleware: 'guest-access-check' })

interface Place { name: string | null; address: string | null; mapsUrl: string | null; freeParking?: boolean }
interface Provider { id: number; name: string; pricePerDay: number; pickup: Place; returnLocation: Place }
interface RentalRequest { id: number; startDate: string; endDate: string; bikeCount: number; totalPrice: number; status: string; partnerName: string }
type Copy = Record<string, string>
const copy: Record<Locale, Copy> = {
  en: { title:'E-bike rental',intro:'Send an availability request. Payment becomes available after confirmation.',day:'day',pickup:'Pickup',returnAt:'Return',parking:'Free parking',maps:'Google Maps',bikes:'Number of e-bikes',phone:'Phone',notes:'Notes',send:'Send request',sending:'Sending…',status:'Status',pay:'Pay now',paymentError:'Payment could not be opened.',requested:'Request sent',approved:'Available — awaiting payment',awaiting_payment:'Awaiting payment',paid:'Paid',rejected:'Not available',payment_failed:'Payment failed' },
  sl: { title:'Najem e-koles',intro:'Pošljite povpraševanje. Plačilo bo omogočeno po potrditvi ponudnika.',day:'dan',pickup:'Prevzem',returnAt:'Vračilo',parking:'Brezplačno parkiranje',maps:'Google Zemljevidi',bikes:'Število e-koles',phone:'Telefon',notes:'Opombe',send:'Pošlji povpraševanje',sending:'Pošiljam…',status:'Status',pay:'Plačaj zdaj',paymentError:'Plačila ni bilo mogoče odpreti.',requested:'Povpraševanje poslano',approved:'Na voljo — čaka na plačilo',awaiting_payment:'Čaka na plačilo',paid:'Plačano',rejected:'Ni na voljo',payment_failed:'Plačilo ni uspelo' },
  de: { title:'E-Bike-Verleih',intro:'Senden Sie eine Anfrage. Die Zahlung wird nach der Bestätigung freigeschaltet.',day:'Tag',pickup:'Abholung',returnAt:'Rückgabe',parking:'Kostenloses Parken',maps:'Google Maps',bikes:'Anzahl der E-Bikes',phone:'Telefon',notes:'Anmerkungen',send:'Anfrage senden',sending:'Wird gesendet…',status:'Status',pay:'Jetzt bezahlen',paymentError:'Die Zahlung konnte nicht geöffnet werden.',requested:'Anfrage gesendet',approved:'Verfügbar — Zahlung ausstehend',awaiting_payment:'Zahlung ausstehend',paid:'Bezahlt',rejected:'Nicht verfügbar',payment_failed:'Zahlung fehlgeschlagen' },
  hr: { title:'Najam e-bicikala',intro:'Pošaljite upit. Plaćanje je omogućeno nakon potvrde pružatelja.',day:'dan',pickup:'Preuzimanje',returnAt:'Povrat',parking:'Besplatno parkiranje',maps:'Google karte',bikes:'Broj e-bicikala',phone:'Telefon',notes:'Napomene',send:'Pošalji upit',sending:'Šaljem…',status:'Status',pay:'Plati sada',paymentError:'Plaćanje nije moguće otvoriti.',requested:'Upit poslan',approved:'Dostupno — čeka plaćanje',awaiting_payment:'Čeka plaćanje',paid:'Plaćeno',rejected:'Nije dostupno',payment_failed:'Plaćanje nije uspjelo' },
  sr: { title:'Iznajmljivanje e-bicikala',intro:'Pošaljite upit. Plaćanje je omogućeno nakon potvrde pružaoca.',day:'dan',pickup:'Preuzimanje',returnAt:'Vraćanje',parking:'Besplatan parking',maps:'Google mape',bikes:'Broj e-bicikala',phone:'Telefon',notes:'Napomene',send:'Pošalji upit',sending:'Šaljem…',status:'Status',pay:'Plati sada',paymentError:'Plaćanje nije moguće otvoriti.',requested:'Upit poslat',approved:'Dostupno — čeka plaćanje',awaiting_payment:'Čeka plaćanje',paid:'Plaćeno',rejected:'Nije dostupno',payment_failed:'Plaćanje nije uspelo' },
}

const token = String(useRoute().params.token)
useGuestToken().value = token
const { locale } = useLocale()
const text = computed(() => copy[locale.value])
const { data: providers } = await useFetch<{ providers: Provider[] }>('/api/guest/ebike/providers', { query: { token } })
const { data: requests, refresh } = await useFetch<{ requests: RentalRequest[] }>('/api/guest/ebike/requests', { query: { token } })
const form = reactive({ partnerId: 0, startDate: '', endDate: '', bikeCount: 1, guestPhone: '', notes: '' })
const selectedProvider = computed(() => providers.value?.providers.find(provider => provider.id === form.partnerId))
watchEffect(() => { if (!form.partnerId && providers.value?.providers[0]) form.partnerId = providers.value.providers[0].id })
const busy = ref(false)
const error = ref('')
const paymentRequestId = ref<number | null>(null)

async function submit() {
  busy.value = true; error.value = ''
  try {
    await $fetch('/api/guest/ebike/requests', { method:'POST', body:{ ...form, token } })
    await refresh(); form.notes = ''
  } catch (cause: unknown) {
    const err = cause as { data?: { statusMessage?: string }; message?: string }
    error.value = err.data?.statusMessage || err.message || 'Error'
  } finally { busy.value = false }
}
async function loadSumUp() {
  if (window.SumUpCard) return
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-sumup-sdk]')
    if (existing) { existing.addEventListener('load', () => resolve(), { once:true }); existing.addEventListener('error', reject, { once:true }); return }
    const script = document.createElement('script')
    script.src = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js'; script.dataset.sumupSdk = 'true'
    script.onload = () => resolve(); script.onerror = () => reject(new Error('SDK')); document.head.appendChild(script)
  })
}
async function pay(id: number) {
  error.value = ''; paymentRequestId.value = id
  try {
    const result = await $fetch<{ checkoutId: string }>(`/api/guest/ebike/${id}/checkout`, { method:'POST', body:{ token } })
    await nextTick(); await loadSumUp()
    window.SumUpCard?.mount({ id:`sumup-card-${id}`, checkoutId:result.checkoutId, onResponse:() => refresh() })
    await refresh()
  } catch (cause: unknown) {
    const err = cause as { data?: { statusMessage?: string }; message?: string }
    error.value = err.data?.statusMessage || err.message || text.value.paymentError || 'Payment error'; paymentRequestId.value = null
  }
}
function statusLabel(status: string) { return text.value[status] || status }
declare global { interface Window { SumUpCard?: { mount(options: { id:string; checkoutId:string; onResponse:() => void }): void } } }
</script>

<template>
  <div class="mx-auto max-w-xl space-y-6 p-5">
    <div><h1 class="text-2xl font-semibold">🚲 {{ text.title }}</h1><p class="text-stone-500">{{ text.intro }}</p></div>
    <form class="space-y-4 rounded-xl bg-white p-5" @submit.prevent="submit">
      <select v-model.number="form.partnerId" class="w-full rounded border p-3">
        <option v-for="provider in providers?.providers" :key="provider.id" :value="provider.id">{{ provider.name }} · {{ provider.pricePerDay.toFixed(2) }} EUR/{{ text.day }}</option>
      </select>
      <div v-if="selectedProvider?.pickup.name" class="space-y-1 rounded bg-stone-50 p-3 text-sm">
        <p><b>{{ text.pickup }}:</b> {{ selectedProvider.pickup.name }} · {{ selectedProvider.pickup.address }}</p>
        <p v-if="selectedProvider.returnLocation.name"><b>{{ text.returnAt }}:</b> {{ selectedProvider.returnLocation.name }} · {{ selectedProvider.returnLocation.address }}</p>
        <p v-if="selectedProvider.pickup.freeParking">{{ text.parking }}</p>
        <a v-if="selectedProvider.pickup.mapsUrl" :href="selectedProvider.pickup.mapsUrl" target="_blank" rel="noopener noreferrer" class="text-pine-700 underline">{{ text.maps }}</a>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><input v-model="form.startDate" required type="date" class="rounded border p-3"><input v-model="form.endDate" required type="date" class="rounded border p-3"></div>
      <input v-model.number="form.bikeCount" required type="number" min="1" max="20" class="w-full rounded border p-3" :placeholder="text.bikes">
      <input v-model="form.guestPhone" class="w-full rounded border p-3" :placeholder="text.phone">
      <textarea v-model="form.notes" class="w-full rounded border p-3" :placeholder="text.notes" />
      <p v-if="error" class="text-red-600">{{ error }}</p>
      <button class="w-full rounded bg-pine-600 p-3 text-white disabled:opacity-60" :disabled="busy">{{ busy ? text.sending : text.send }}</button>
    </form>
    <div v-for="request in requests?.requests" :key="request.id" class="rounded-xl bg-white p-4">
      <b>{{ request.partnerName }}</b><p>{{ request.startDate }}–{{ request.endDate }} · {{ request.bikeCount }} · {{ request.totalPrice.toFixed(2) }} EUR</p>
      <p>{{ text.status }}: {{ statusLabel(request.status) }}</p>
      <button v-if="request.status === 'approved'" class="mt-3 rounded bg-pine-600 px-4 py-2 text-white" @click="pay(request.id)">{{ text.pay }}</button>
      <div v-if="paymentRequestId === request.id" :id="`sumup-card-${request.id}`" class="mt-4" />
    </div>
  </div>
</template>
