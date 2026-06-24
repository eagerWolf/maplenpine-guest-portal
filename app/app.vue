<script setup lang="ts">
const config = useRuntimeConfig()
const gaId = config.public.gaId as string

if (gaId) {
  useHead({
    script: [
      {
        key: 'gtag-src',
        src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
        async: true,
        tagPriority: 'high',
      },
      {
        key: 'gtag-init',
        innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_location:window.location.href});`,
        tagPriority: 'high',
      },
    ],
  })
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>