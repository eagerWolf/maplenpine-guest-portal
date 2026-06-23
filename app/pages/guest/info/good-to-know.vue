<script setup lang="ts">
definePageMeta({ layout: 'guest' })
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">Guest guide</p>
      <h1>Good to know</h1>
    </div>

    <section class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <h2>Check-in / Check-out</h2>
          <p>Check-in: from 15:00<br>Check-out: by 11:00</p>
        </div>
        <div class="info-card">
          <h2>Access</h2>
          <p>Self check-in using a door access code sent after reservation.</p>
        </div>
        <div class="info-card">
          <h2>Parking</h2>
          <p>Free private parking in front of the apartment.</p>
        </div>
        <div class="info-card">
          <h2>Distances</h2>
          <p>
            Lake Bled — 800 m<br>
            Bled Castle — 1.2 km<br>
            Lesce-Bled train station — 4 km<br>
            Ljubljana airport — 35 km
          </p>
        </div>
      </div>
    </section>

    <div class="info-related">
      <NuxtLink to="/guest/info/how-to" class="info-related__card">
        <span class="info-related__title">How to use</span>
        <span class="info-related__desc">Instructions for apartment features.</span>
      </NuxtLink>
      <NuxtLink to="/guest/info/faq" class="info-related__card">
        <span class="info-related__title">FAQ</span>
        <span class="info-related__desc">Groceries, transport and activities.</span>
      </NuxtLink>
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

.info-section {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: clamp(24px, 4vw, 38px);
  margin: 0 0 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-card {
  background: #f5f1e9;
  border: 1px solid #e4dccf;
  padding: 18px 20px;
}

.info-card h2 {
  margin: 0 0 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #465146;
}

.info-card p {
  margin: 0;
  color: #626a63;
  font-size: 0.95rem;
  line-height: 1.7;
}

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
  .info-grid { grid-template-columns: 1fr; }
  .info-related { grid-template-columns: 1fr; }
}
</style>
