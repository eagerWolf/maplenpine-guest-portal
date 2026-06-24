<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const { t, faq } = useLocale()
const openItem = ref<string | null>(null)
function toggle(id: string) {
  openItem.value = openItem.value === id ? null : id
}
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">{{ t.pages.faq.kicker }}</p>
      <h1>{{ t.pages.faq.title }}</h1>
    </div>

    <div class="faq-list">
      <div
        v-for="item in faq"
        :key="item.id"
        class="faq-item"
        :class="{ 'faq-item--open': openItem === item.id }"
      >
        <button class="faq-item__trigger" @click="toggle(item.id)">
          <span>{{ item.title }}</span>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="faq-item__chevron" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div v-if="openItem === item.id" class="faq-item__body">
          <p>{{ item.description }}</p>
          <div v-if="item.links?.length" class="faq-item__links">
            <a
              v-for="link in item.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="faq-link"
            >{{ link.label }}</a>
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
  color: #243027;
}

.info-hero {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: clamp(28px, 5vw, 48px);
  margin: 0 0 18px;
}

.info-kicker {
  margin: 0 0 12px;
  color: #7b947e;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.info-hero h1 {
  margin: 0;
  color: #202920;
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.08;
  font-weight: 620;
}

.faq-list {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  margin: 0 0 18px;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid #e4dccf;
}
.faq-item:last-child { border-bottom: none; }

.faq-item__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px clamp(20px, 4vw, 32px);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: #243027;
  transition: background 140ms ease;
}
.faq-item__trigger:hover { background: #f5f1e9; }
.faq-item--open .faq-item__trigger { background: #f5f1e9; color: #26372c; }

.faq-item__chevron {
  flex-shrink: 0;
  color: #7b947e;
  transition: transform 200ms ease;
}
.faq-item--open .faq-item__chevron { transform: rotate(180deg); }

.faq-item__body {
  padding: 0 clamp(20px, 4vw, 32px) 22px;
  background: #f5f1e9;
}

.faq-item__body p {
  margin: 0 0 14px;
  color: #626a63;
  line-height: 1.75;
  font-size: 0.95rem;
}

.faq-item__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.faq-link {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 7px 14px;
  background: #26372c;
  color: #fffdf8;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background 160ms ease;
}
.faq-link:hover { background: #3c5543; }

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
  color: #26372c;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-related__desc {
  font-size: 0.82rem;
  color: #7b947e;
  line-height: 1.55;
}

@media (max-width: 480px) {
  .info-page { padding: 20px 0 40px; }
  .info-related { grid-template-columns: 1fr; }
}
</style>
