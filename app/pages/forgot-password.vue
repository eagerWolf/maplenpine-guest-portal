<script setup lang="ts">
definePageMeta({layout:'auth'})
const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
async function submit() {
  loading.value=true; error.value=''; message.value=''
  try {
    const result = await $fetch<{message:string}>('/api/auth/forgot-password',{method:'POST',body:{email:email.value}})
    message.value=result.message
  } catch (cause:any) { error.value=cause?.data?.statusMessage || 'Zahteve ni bilo mogoče poslati.' }
  finally { loading.value=false }
}
</script>
<template>
  <div class="w-full max-w-sm border border-stone-200 bg-white p-8">
    <img src="/logo-text-only.webp" alt="Maple & Pine" class="mx-auto mb-6 h-12" />
    <h1 class="text-xl font-semibold">Pozabil sem geslo</h1>
    <p class="my-4 text-sm text-stone-600">Vnesite e-poštni naslov svojega računa. Poslali vam bomo povezavo za nastavitev novega gesla.</p>
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block text-sm">E-poštni naslov<input v-model="email" type="email" autocomplete="email" required maxlength="254" class="mt-1 w-full rounded-lg border p-3" /></label>
      <p v-if="message" role="status" class="text-sm text-pine-700">{{ message }}</p>
      <p v-if="error" role="alert" class="text-sm text-red-700">{{ error }}</p>
      <button :disabled="loading" class="w-full rounded-lg bg-pine-600 p-3 text-white disabled:opacity-50">{{ loading ? 'Pošiljam…' : 'Pošlji povezavo' }}</button>
      <NuxtLink to="/login" class="block text-center text-sm text-pine-700">Nazaj na prijavo</NuxtLink>
    </form>
  </div>
</template>
