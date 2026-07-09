<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const guestToken = useGuestToken()

onMounted(() => {
  if (guestToken.value) {
    navigateTo(`/guest/${guestToken.value}/breakfast`, { replace: true })
  }
})
</script>

<template>
  <div style="padding: 48px; text-align: center; color: #5b6485;">
    <p>{{ guestToken ? 'Preusmerjam...' : 'Za naročilo zajtrka odprite portal s svojo osebno povezavo.' }}</p>
  </div>
</template>
