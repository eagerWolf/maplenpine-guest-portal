<script setup lang="ts">
definePageMeta({ layout: 'guest', middleware: 'guest-token' })

const { t, locale } = useLocale()
const token=String(useRoute().params.token)
const {data}=await useFetch<any[]>('/api/guest/restaurants',{query:{token}})
const restaurants=computed(()=>(data.value||[]).map(item=>({...item,description:item.description[locale.value]||item.description.en,image:item.imagePath})))
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">{{ t.pages.restaurants.kicker }}</p>
      <h1>{{ t.pages.restaurants.title }}</h1>
    </div>

    <div class="rest-list">
      <div v-for="r in restaurants" :key="r.id" class="rest-card">
        <img v-if="r.image" :src="r.image" :alt="r.name" class="rest-card__img" loading="lazy" />
        <div class="rest-card__body">
          <div class="rest-card__top">
            <h2 class="rest-card__name">{{ r.name }}</h2>
            <span class="rest-card__type">{{ r.type }}</span>
          </div>
          <p class="rest-card__desc">{{ r.description }}</p>
          <a
            :href="r.website"
            target="_blank"
            rel="noopener noreferrer"
            class="rest-card__link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            {{ r.name }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-page {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 0 48px;
  color: #1c2541;
}

.info-hero {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: clamp(28px, 5vw, 48px);
  margin: 0 0 18px;
}

.info-kicker {
  margin: 0 0 12px;
  color: #7986b8;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.info-hero h1 {
  margin: 0;
  color: #1a2036;
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.08;
  font-weight: 620;
}

.rest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 18px;
}

.rest-card {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  overflow: hidden;
}

.rest-card__img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid #e4dccf;
}

.rest-card__body {
  padding: clamp(20px, 4vw, 32px);
}

.rest-card__top {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 10px;
  flex-wrap: wrap;
}

.rest-card__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2036;
}

.rest-card__type {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7986b8;
  background: #f5f1e9;
  border: 1px solid #e4dccf;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

.rest-card__desc {
  margin: 0 0 14px;
  color: #5b6485;
  line-height: 1.75;
  font-size: 0.93rem;
}

.rest-card__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e3a8a;
  text-decoration: none;
  border-bottom: 1px solid #c4b9a8;
  padding-bottom: 1px;
  transition: color 140ms ease, border-color 140ms ease;
}
.rest-card__link:hover { color: #2547b3; border-color: #1e3a8a; }

.info-related {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-related__card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: 18px;
  text-decoration: none;
  transition: border-color 160ms ease, background 160ms ease;
}
.info-related__card:hover { background: #f5f1e9; border-color: #c8bfb2; }

.info-related__title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e3a8a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-related__desc {
  font-size: 0.82rem;
  color: #7986b8;
  line-height: 1.55;
}

@media (max-width: 480px) {
  .info-page { padding: 20px 0 40px; }
  .info-related { grid-template-columns: 1fr; }
}
</style>
