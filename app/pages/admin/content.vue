<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const route = useRoute()
if (route.path === '/admin/content') {
  await navigateTo('/admin/content/restaurants', { replace: true })
}

</script>

<template>
  <NuxtPage />
</template>
