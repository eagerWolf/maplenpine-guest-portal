<script setup lang="ts">
definePageMeta({layout:'auth'})
useHead({meta:[{name:'referrer',content:'no-referrer'},{name:'robots',content:'noindex, nofollow'}]})
const token = ref('')
onMounted(()=>{
  token.value=window.location.hash.slice(1)
  window.history.replaceState(null,'','/reset-password')
})
const password = ref('')
const confirmation = ref('')
const loading = ref(false)
const done = ref(false)
const error = ref('')
async function submit(event: SubmitEvent) {
  if (loading.value) return
  const fields = new FormData(event.currentTarget as HTMLFormElement)
  password.value = String(fields.get('password') || '')
  confirmation.value = String(fields.get('confirm-password') || '')
  error.value=''
  if (password.value !== confirmation.value) { error.value='Gesli se ne ujemata.'; return }
  loading.value=true
  try {
    await $fetch('/api/auth/reset-password',{method:'POST',body:{token:token.value,password:password.value}})
    password.value=''; confirmation.value=''; token.value=''; done.value=true
  } catch (cause:any) { error.value=cause?.data?.statusMessage || 'Ponastavitev ni uspela.' }
  finally { loading.value=false }
}
</script>
<template>
  <div class="w-full max-w-sm border border-stone-200 bg-white p-8">
    <img src="/logo-text-only.webp" alt="Maple & Pine" class="mx-auto mb-6 h-12" />
    <h1 class="mb-4 text-xl font-semibold">Nastavitev novega gesla</h1>
    <div v-if="done" role="status" class="space-y-4 text-sm"><p>Geslo je posodobljeno. Prejšnje prijavne seje so preklicane.</p><NuxtLink to="/login" class="text-pine-700 underline">Prijavite se z novim geslom</NuxtLink></div>
    <form v-else id="reset-password-form" action="/api/auth/reset-password" method="post" autocomplete="on" class="space-y-4" @submit.prevent="submit">
      <p class="text-sm text-stone-600">Povezava velja 30 minut in jo lahko uporabite enkrat.</p>
      <label class="block text-sm">Novo geslo<input id="new-password" name="password" v-model="password" type="password" autocomplete="new-password" minlength="10" required class="mt-1 w-full rounded-lg border p-3" /></label>
      <label class="block text-sm">Ponovite geslo<input id="confirm-password" name="confirm-password" v-model="confirmation" type="password" autocomplete="new-password" minlength="10" required class="mt-1 w-full rounded-lg border p-3" /></label>
      <p v-if="error" role="alert" class="text-sm text-red-700">{{ error }}</p>
      <button type="submit" :disabled="loading || !token" class="w-full rounded-lg bg-pine-600 p-3 text-white disabled:opacity-50">{{ loading ? 'Shranjujem…' : 'Nastavi novo geslo' }}</button>
    </form>
  </div>
</template>
