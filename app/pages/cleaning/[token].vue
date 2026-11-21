<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Potrditev čiščenja · Maple & Pine', meta: [{name:'robots',content:'noindex, nofollow'},{name:'referrer',content:'no-referrer'}] })
const token = String(useRoute().params.token)
const {data,error,refresh} = await useFetch(`/api/cleaning/${token}`)
const saving = ref(false)
const failure = ref('')
async function confirm() {
  if (saving.value || data.value?.confirmedAt) return
  saving.value = true
  failure.value = ''
  try {
    await $fetch(`/api/cleaning/${token}/confirm`,{method:'POST',body:{confirm:true}})
    await refresh()
  } catch (err:any) { failure.value = err?.data?.statusMessage || 'Potrditev ni uspela. Poskusite znova.' }
  finally { saving.value = false }
}
</script>
<template>
  <main class="cleaning">
    <section>
      <p>Maple &amp; Pine</p>
      <template v-if="error"><h1>Povezava ni več veljavna</h1><p>Za novo povezavo se obrnite na sprejem.</p></template>
      <template v-else-if="data">
        <h1>{{ data.door }} · potrditev čiščenja</h1>
        <p>{{ data.date.split('-').reverse().join('.') }}</p>
        <p v-if="data.confirmedAt" role="status">✓ Čiščenje je potrjeno. Obvestilo za lastnika in sprejem je pripravljeno za pošiljanje.</p>
        <template v-else>
          <p>Potrdite šele, ko je apartma pospravljen in pripravljen za prihod gostov.</p>
          <button v-if="data.canConfirm" :disabled="saving" @click="confirm">{{ saving ? 'Potrjujem…' : 'Apartma je pospravljen in pripravljen' }}</button>
          <p v-else>Potrditev bo mogoča na dan odhoda gostov.</p>
        </template>
        <p v-if="failure" role="alert">{{ failure }}</p>
      </template>
    </section>
  </main>
</template>
<style scoped>
.cleaning{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f6f5ef;color:#213b30;font-family:system-ui}section{max-width:560px;background:white;border-radius:16px;padding:32px;border:1px solid #e0e4de}h1{font-size:26px}p{line-height:1.7}button{background:#354e41;color:white;border:0;border-radius:8px;padding:18px;width:100%;font:inherit;font-weight:600;cursor:pointer}button:disabled{opacity:.6}button:focus-visible{outline:3px solid #b2caa6;outline-offset:4px}
</style>
