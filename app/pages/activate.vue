<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const token = String(useRoute().query.token || '')
const password = ref('')
const confirmation = ref('')
const loading = ref(false)
const error = ref('')

async function activate() {
  error.value = ''
  if (!token) error.value = 'Aktivacijska povezava ni veljavna.'
  else if (password.value.length < 10) error.value = 'Geslo mora imeti vsaj 10 znakov.'
  else if (password.value !== confirmation.value) error.value = 'Gesli se ne ujemata.'
  if (error.value) return
  loading.value = true
  try {
    await $fetch('/api/auth/activate', { method: 'POST', body: { token, password: password.value } })
    await navigateTo('/admin')
  } catch (cause: any) {
    error.value = cause?.data?.statusMessage || 'Aktivacija ni uspela.'
  } finally { loading.value = false }
}
</script>

<template>
  <div class="w-full max-w-sm border border-stone-200 bg-white p-8 shadow-sm">
    <img src="/logo-text-only.webp" alt="Maple & Pine" class="mx-auto mb-6 h-12" />
    <h1 class="mb-2 text-xl font-semibold text-stone-800">Aktivacija računa</h1>
    <p class="mb-5 text-sm text-stone-500">Izberite geslo za administracijo.</p>
    <form class="space-y-4" @submit.prevent="activate">
      <input v-model="password" type="password" minlength="10" autocomplete="new-password" placeholder="Novo geslo (vsaj 10 znakov)" class="w-full rounded-lg border p-3" required />
      <input v-model="confirmation" type="password" minlength="10" autocomplete="new-password" placeholder="Ponovite geslo" class="w-full rounded-lg border p-3" required />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button class="w-full rounded-lg bg-pine-600 p-3 font-medium text-white disabled:opacity-50" :disabled="loading">{{ loading ? 'Aktiviram…' : 'Aktiviraj račun' }}</button>
    </form>
  </div>
</template>
