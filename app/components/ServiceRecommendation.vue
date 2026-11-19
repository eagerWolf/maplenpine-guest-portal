<script setup lang="ts">
import { recommendation, serviceCopy, type ServiceKind } from '#shared/serviceRecommendations'
const props = defineProps<{ kind: ServiceKind }>()
const { locale } = useLocale()
const { data: settings } = await useFetch<Record<string, string>>('/api/public/settings')
const copy = computed(() => serviceCopy[locale.value])
const provider = computed(() => recommendation(props.kind, locale.value, settings.value || {}))
</script>

<template>
  <section class="recommendation">
    <header>
      <p class="kicker">{{ copy.recommendation }}</p>
      <h1>{{ copy[kind] }}</h1>
    </header>
    <article class="provider">
      <img v-if="kind === 'breakfast'" src="/suggestions/bled-breakfast.webp" alt="Bled Breakfast" class="provider-image" />
      <div class="provider-body">
        <h2>{{ provider.name }}</h2>
        <p>{{ provider.description }}</p>
        <aside>{{ provider.note }}</aside>
        <a :href="provider.url" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">{{ copy[kind === 'breakfast' ? 'breakfastAction' : 'bikesAction'] }} ↗</a>
        <p class="direct">{{ copy.direct }}</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.recommendation{width:100%;max-width:720px;margin:0 auto;padding:36px 0 56px;color:#1c2541}.kicker{font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#778169}h1{font-size:clamp(30px,5vw,42px);line-height:1.2;margin:10px 0 28px}h2{font-size:26px;margin:0 0 16px}.provider{border:1px solid #e7e5df;border-radius:20px;overflow:hidden;background:#fff}.provider-image{width:100%;max-height:300px;object-fit:cover}.provider-body{padding:clamp(20px,5vw,36px)}p{line-height:1.8;white-space:pre-line}aside{background:#f3f5ed;border-left:3px solid #82916c;border-radius:6px;padding:18px;margin:24px 0;line-height:1.7;white-space:pre-line}a{display:inline-flex;justify-content:center;background:#354e41;color:white;border-radius:9px;padding:14px 22px;text-decoration:none;font-weight:600;line-height:1.5}a:focus-visible{outline:3px solid #82916c;outline-offset:4px}.direct{font-size:13px;color:#647067;margin-top:20px}
</style>
