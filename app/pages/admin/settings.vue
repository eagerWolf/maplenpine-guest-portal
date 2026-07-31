<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const route = useRoute()
if (route.path === '/admin/settings') {
  await navigateTo('/admin/settings/general', { replace: true })
}

</script>

<template>
  <NuxtPage />
</template>
