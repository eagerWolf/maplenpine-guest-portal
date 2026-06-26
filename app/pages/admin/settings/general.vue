<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/admin/settings')

const form = reactive({
  contact_phone: '',
  property_nav_url: '',
  housekeeper_whatsapp: '',
  instagram_url: '',
  facebook_url: '',
})

watch(settings, (s) => {
  if (!s) return
  form.contact_phone = s.contact_phone ?? ''
  form.property_nav_url = s.property_nav_url ?? ''
  form.housekeeper_whatsapp = s.housekeeper_whatsapp ?? ''
  form.instagram_url = s.instagram_url ?? ''
  form.facebook_url = s.facebook_url ?? ''
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
          <p class="text-xs text-stone-400 mt-1">Obvestilo 24h pred menjavo — format +386... · prazno = izklopljeno</p>
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

    <div v-if="error" class="text-sm text-maple-600 bg-maple-50 rounded-lg px-4 py-3">{{ error }}</div>
    <div v-if="saved" class="text-sm text-pine-700 bg-pine-50 rounded-lg px-4 py-3">✓ Nastavitve shranjene</div>

    <button class="w-full bg-pine-600 hover:bg-pine-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50" :disabled="saving" @click="save">
      {{ saving ? 'Shranjujem…' : 'Shrani nastavitve' }}
    </button>
  </div>
</template>
