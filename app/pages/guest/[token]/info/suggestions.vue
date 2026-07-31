<script setup lang="ts">
definePageMeta({ layout: 'guest', middleware: 'guest-token' })

const { t, locale } = useLocale()
const token=String(useRoute().params.token)
const {data}=await useFetch<any[]>('/api/guest/suggestions',{query:{token}})
const visibleSuggestions=computed(()=>(data.value||[]).map(item=>({...item,title:item.title[locale.value]||item.title.en,description:item.description[locale.value]||item.description.en,image:item.imagePath})))
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">{{ t.pages.suggestions.kicker }}</p>
      <h1>{{ t.pages.suggestions.title }}</h1>
    </div>

    <div class="sug-list">
      <div v-for="s in visibleSuggestions" :key="s.id" class="sug-card">
        <img :src="s.image" :alt="s.title" class="sug-card__img" loading="lazy" />
        <div class="sug-card__body">
          <h2 class="sug-card__name">{{ s.title }}</h2>
          <p class="sug-card__desc">{{ s.description }}</p>
          <div v-if="s.buttons?.length" class="sug-card__btns">
            <a
              v-for="btn in s.buttons"
              :key="btn.href"
              :href="btn.href"
              :target="btn.target ?? '_blank'"
              rel="noopener noreferrer"
              class="sug-btn"
            >{{ btn.label?.[locale] || btn.label?.en || btn.label }}</a>
          </div>
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

.sug-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sug-card {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  overflow: hidden;
}

.sug-card__img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid #e4dccf;
}

.sug-card__body {
  padding: clamp(20px, 4vw, 32px);
}

.sug-card__name {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2036;
  line-height: 1.3;
}

.sug-card__desc {
  margin: 0 0 16px;
  color: #5b6485;
  line-height: 1.75;
  font-size: 0.93rem;
}

.sug-card__btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sug-btn {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 7px 14px;
  background: #1e3a8a;
  color: #fffdf8;
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background 160ms ease;
  white-space: nowrap;
}
.sug-btn:hover { background: #2547b3; }

@media (max-width: 480px) {
  .info-page { padding: 20px 0 40px; }
  .sug-card__img { height: 180px; }
}
</style>
