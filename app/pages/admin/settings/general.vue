<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')
const { data: websiteStatus, refresh: refreshWebsiteStatus } = await useFetch<any>('/api/admin/website/status')

const form = reactive({
  contact_phone: '',
  property_nav_url: '',
  housekeeper_whatsapp: '',
  reception_whatsapp: '',
  instagram_url: '',
  facebook_url: '',
  website_export_token: '',
  website_public_url: 'https://maplenpine.com',
  website_portal_public_url: '',
  cloudflare_deploy_hook: '',
  website_nightly_publish: '0',
})

watch(settings, (s) => {
  if (!s) return
  form.contact_phone = s.contact_phone ?? ''
  form.property_nav_url = s.property_nav_url ?? ''
  form.housekeeper_whatsapp = s.housekeeper_whatsapp ?? ''
  form.reception_whatsapp = s.reception_whatsapp ?? ''
  form.instagram_url = s.instagram_url ?? ''
  form.facebook_url = s.facebook_url ?? ''
  form.website_export_token = s.website_export_token ?? ''
  form.website_public_url = s.website_public_url ?? 'https://maplenpine.com'
  form.website_portal_public_url = s.website_portal_public_url ?? ''
  form.cloudflare_deploy_hook = s.cloudflare_deploy_hook ?? ''
  form.website_nightly_publish = s.website_nightly_publish ?? '0'
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
    await refreshWebsiteStatus()
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Napaka pri shranjevanju'
  } finally {
    saving.value = false
  }
}

const publishing = ref(false)
const publishMessage = ref('')
function generateExportToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  form.website_export_token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
async function publishWebsite() {
  publishing.value = true
  publishMessage.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...form } })
    await $fetch('/api/admin/website/publish', { method: 'POST' })
    publishMessage.value = 'Cloudflare build je bil uspešno sprožen.'
    await refreshWebsiteStatus()
  } catch (err: any) {
    publishMessage.value = err?.data?.statusMessage ?? 'Objave ni bilo mogoče sprožiti.'
  } finally { publishing.value = false }
}
</script>

<template>
  <div class="max-w-lg space-y-6">

    <div class="bg-white rounded-xl border border-stone-200 p-6">
      <h2 class="font-medium text-stone-700 mb-4">Kontakt in navigacija</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Telefonska številka (za klice gostov)</label>
          <input v-model="form.contact_phone" type="tel" placeholder="+386 40 123 456" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          <p class="text-xs text-stone-400 mt-1">Prikazana kot gumb »Pokliči« na gostovi strani</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Navigacijski URL (Google Maps / Waze)</label>
          <input v-model="form.property_nav_url" type="url" placeholder="https://maps.google.com/?q=..." class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          <p class="text-xs text-stone-400 mt-1">Prikazana kot gumb »Navigacija« na gostovi strani</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">WhatsApp čistilke</label>
          <input v-model="form.housekeeper_whatsapp" type="tel" placeholder="+386 40 123 456" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          <p class="text-xs text-stone-400 mt-1">Obvestilo 24h pred odjavo (čiščenje) — format +386... · prazno = izklopljeno</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">WhatsApp sprejem</label>
          <input v-model="form.reception_whatsapp" type="tel" placeholder="+386 40 123 456" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
          <p class="text-xs text-stone-400 mt-1">Obvestilo 24h pred prihodom gosta (sprejem) — format +386... · prazno = izklopljeno</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Instagram URL</label>
          <input v-model="form.instagram_url" type="url" placeholder="https://www.instagram.com/maple.and.pine.bled/" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Facebook URL</label>
          <input v-model="form.facebook_url" type="url" placeholder="https://www.facebook.com/mapleandpinebled" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-stone-200 p-6">
      <h2 class="font-medium text-stone-700 mb-1">Spletna stran maplenpine.com</h2>
      <p class="mb-4 text-xs text-stone-400">Portal je vir vsebine. Cloudflare ob objavi izdela novo statično različico strani.</p>
      <div class="space-y-4">
        <label class="block text-sm font-medium text-stone-600">Javni URL portala
          <input v-model="form.website_portal_public_url" type="url" placeholder="https://portal.maplenpine.com" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <span class="mt-1 block text-xs font-normal text-stone-400">Mora biti dosegljiv iz Cloudflare build okolja; uporablja se tudi za prenos slik.</span>
        </label>
        <label class="block text-sm font-medium text-stone-600">Javni URL spletne strani
          <input v-model="form.website_public_url" type="url" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </label>
        <div>
          <label class="block text-sm font-medium text-stone-600">Token za izvoz vsebine</label>
          <div class="mt-1 flex gap-2"><input v-model="form.website_export_token" type="password" autocomplete="new-password" class="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" /><button type="button" class="rounded-lg bg-stone-100 px-3 text-xs text-stone-700" @click="generateExportToken">Generiraj</button></div>
        </div>
        <label class="block text-sm font-medium text-stone-600">Cloudflare Pages Deploy Hook
          <input v-model="form.cloudflare_deploy_hook" type="password" autocomplete="off" placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..." class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </label>
        <label class="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-3 text-sm text-stone-700"><span>Nočna objava ob 01:15</span><input v-model="form.website_nightly_publish" type="checkbox" true-value="1" false-value="0" class="h-4 w-4" /></label>
        <div v-if="websiteStatus" class="rounded-lg border border-stone-200 p-3 text-xs text-stone-500">
          <p>Izvoz: {{ websiteStatus.counts.restaurants }} restavracij · {{ websiteStatus.counts.suggestions }} predlogov · {{ websiteStatus.counts.news }} novic</p>
          <p class="mt-1">Zadnja sprožitev: {{ websiteStatus.lastPublishAt ? new Date(websiteStatus.lastPublishAt).toLocaleString('sl-SI') : 'še nikoli' }} · {{ websiteStatus.lastPublishStatus || '—' }}</p>
          <p v-if="websiteStatus.lastPublishError" class="mt-1 text-red-600">{{ websiteStatus.lastPublishError }}</p>
        </div>
        <button type="button" :disabled="publishing || !form.cloudflare_deploy_hook" class="w-full rounded-lg bg-maple-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50" @click="publishWebsite">{{ publishing ? 'Sprožam…' : 'Shrani in objavi zdaj' }}</button>
        <p v-if="publishMessage" class="text-xs text-stone-600">{{ publishMessage }}</p>
      </div>
    </div>

    <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">{{ error }}</div>
    <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">✓ Nastavitve shranjene</div>

    <button class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50" :disabled="saving" @click="save">
      {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
    </button>
  </div>
</template>
