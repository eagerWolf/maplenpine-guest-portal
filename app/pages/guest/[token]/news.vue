<script setup lang="ts">
import { newsCopy, newsTagLabels, newsTagLabel, type GuestNewsItem, type NewsTag } from '#shared/news'
definePageMeta({layout:'guest',middleware:'guest-access-check'})
const token=useRoute().params.token as string
const {locale,t}=useLocale()
const {data,error,refresh}=await useFetch<GuestNewsItem[]>('/api/guest/news',{query:{token}})
const selected=ref<NewsTag|null>(null)
const availableTags=computed(()=>Object.keys(newsTagLabels).filter(tag=>data.value?.some(n=>n.tags.includes(tag as NewsTag))) as NewsTag[])
const visible=computed(()=>(data.value||[]).filter(n=>!selected.value||n.tags.includes(selected.value)))
</script>
<template>
 <main class="guest-news-page">
  <NuxtLink :to="`/guest/${token}`" class="back">← {{newsCopy[locale].back}}</NuxtLink>
  <h1>{{t.news.kicker}}</h1>
  <div v-if="data?.length" class="filters" :aria-label="t.news.kicker">
   <button :aria-pressed="selected===null" @click="selected=null">{{newsCopy[locale].all}}</button>
   <button v-for="tag in availableTags" :key="tag" :aria-pressed="selected===tag" @click="selected=tag">{{newsTagLabel(tag,locale)}}</button>
  </div>
  <div v-if="error" role="alert"><p>{{newsCopy[locale].error}}</p><button @click="refresh()">{{newsCopy[locale].retry}}</button></div>
  <div v-else class="news-content"><GuestNewsCard v-for="item in visible" :key="item.id" :item="item"/><p v-if="!visible.length">{{newsCopy[locale].empty}}</p></div>
 </main>
</template>
<style scoped>
.guest-news-page {max-width:780px;margin:0 auto;padding:28px 24px 60px}
.back {color:#16614e;font-size:.9rem;text-decoration:underline}
h1 {font-size:2rem;font-weight:700;color:#1a2036;margin:20px 0}
.filters {display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
button {border:1px solid #d5dfd7;border-radius:24px;padding:8px 14px;font-size:.85rem;color:#28503e;background:white}
button[aria-pressed=true] {background:#28503e;color:white;border-color:#28503e}
.news-content {background:#fff;padding:24px;border:1px solid #eee8de;border-radius:18px}
@media(max-width:480px){.guest-news-page{padding:22px 16px 40px}.news-content{padding:18px}}
</style>
