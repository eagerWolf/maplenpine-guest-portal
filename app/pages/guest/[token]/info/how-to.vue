<script setup lang="ts">
definePageMeta({ layout: 'guest', middleware: 'guest-token' })

const { t, locale } = useLocale()
const token=String(useRoute().params.token)
const {data}=await useFetch<any[]>('/api/guest/howto',{query:{token}})
const howTo=computed(()=>(data.value||[]).map(item=>({...item,title:item.title[locale.value]||item.title.en,description:item.description[locale.value]||item.description.en,image:item.imagePath})))
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">{{ t.pages.howTo.kicker }}</p>
      <h1>{{ t.pages.howTo.title }}</h1>
    </div>

    <div class="howto-items">
      <div v-for="item in howTo" :key="item.id" class="howto-item">
        <img v-if="item.image" :src="item.image" :alt="item.title" class="howto-item__img" loading="lazy" />
        <div class="howto-item__body">
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
          <div v-if="item.links" class="howto-item__links">
            <a
              v-for="link in item.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="howto-link"
            >{{ link.label?.[locale] || link.label?.en || link.label }}</a>
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

.howto-items {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0 0 18px;
}

.howto-item {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  overflow: hidden;
}

.howto-item__img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid #e4dccf;
}

.howto-item__body {
  padding: clamp(20px, 4vw, 32px);
}

.howto-item__body h2 {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2036;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.howto-item__body p {
  margin: 0;
  color: #5b6485;
  line-height: 1.75;
  font-size: 0.95rem;
}

.howto-item__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.howto-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  background: #1e3a8a;
  color: #fffdf8;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background 160ms ease;
}
.howto-link:hover { background: #2547b3; }

.info-related {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  .howto-item__img { height: 160px; }
}
</style>
