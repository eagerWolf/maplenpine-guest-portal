<script setup lang="ts">
import { portalPageTitle } from '#shared/pageTitles'
const config = useRuntimeConfig()
const gaId = config.public.gaId as string

// Cleaning links are capabilities; never send their URLs to analytics.
const route = useRoute()
const { locale } = useLocale()
useHead(() => ({
  title: portalPageTitle(route.path, locale.value, String(config.public.baseUrl)),
  meta: [{name:'robots',content:'noindex, nofollow'}],
}))
if (gaId && !route.path.startsWith('/cleaning/')) {
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
  <EnvironmentBanner />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
