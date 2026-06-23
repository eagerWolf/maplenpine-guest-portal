<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const openItem = ref<string | null>(null)

function toggle(id: string) {
  openItem.value = openItem.value === id ? null : id
}

const items = [
  {
    id: 'breakfast',
    title: 'Breakfast delivery',
    description: 'You can order a Bled Breakfast Basket online and have it delivered directly to your apartment. It includes products from local farms and bakeries such as fresh bread, croissants, milk, yogurts, butter, cheese, free-range eggs, homemade salami, honey, jams, seasonal fruit, granola and apple juice.',
    links: [{ label: 'Order breakfast', href: 'https://www.bledbreakfast.com/' }],
  },
  {
    id: 'groceries',
    title: 'Groceries nearby',
    description: 'On the way to the lake you will find a smaller Mercator shop for quick essentials. Two larger grocery stores, Mercator and Spar, are also nearby.',
    links: [
      { label: 'Small Mercator', href: 'https://goo.gl/maps/Sk76eFdxdwDwPFWW9' },
      { label: 'Mercator', href: 'https://goo.gl/maps/z7P9Laq8R9ZtFcc36' },
      { label: 'Spar', href: 'https://goo.gl/maps/YvM5AbGeoeWnqNDy5' },
    ],
  },
  {
    id: 'to-the-lake',
    title: 'Nearest path to Lake Bled',
    description: 'The shortest path to the lake is around 800 metres long and begins on a local road without a sidewalk. It may look a little unusual at first, but it is commonly used and not dangerous.',
    links: [
      { label: 'Nearest path', href: 'https://goo.gl/maps/eEqwY1ne6pniw2rB6' },
      { label: 'Alternative quieter route', href: 'https://goo.gl/maps/EZmGyMntWcTCx31d6' },
    ],
  },
  {
    id: 'bled-castle',
    title: 'Path to Bled Castle',
    description: 'You can walk to Bled Castle directly from the apartment in about 15 minutes. The route includes stairs, so families travelling with a baby or stroller may want to plan the route in advance.',
    links: [{ label: 'Path to the castle', href: 'https://goo.gl/maps/SuBNG7hF5tMgexL77' }],
  },
  {
    id: 'sport',
    title: 'Sport activities',
    description: 'If you are looking for outdoor activities in Bled or elsewhere in Slovenia, the OUTdoor Capital website is a great place to start. You will find ideas for hiking, cycling, water activities and guided adventures.',
    links: [{ label: 'Explore activities', href: 'https://outdoor.capital/maple-pine-bled/' }],
  },
  {
    id: 'bakeries',
    title: 'Bakeries',
    description: 'There are two bakeries close to the apartment. On the map links below you can also check opening hours and whether they are open on Sundays.',
    links: [
      { label: 'Bakery Hitri kruhek', href: 'https://goo.gl/maps/LHxF5x1CktHACWxp9' },
      { label: 'Bakery Planika', href: 'https://goo.gl/maps/36eWoM7fLWAqHvGd7' },
    ],
  },
  {
    id: 'tourist-train',
    title: 'Tourist train around the lake',
    description: 'The tourist train circles Lake Bled. The nearest stop for you is Zdraviliški park.',
    links: [
      { label: 'Tourist train timetable', href: 'https://www.bled.si/en/information/getting-around-bled/20190920131939/tourist-train/' },
      { label: 'Nearest station', href: 'https://goo.gl/maps/MrymrQrLoYBSzzzM8' },
    ],
  },
  {
    id: 'buses',
    title: 'Buses',
    description: 'There is a nearby bus stop for local and regional transport. For departures and current timetables, please check the official Ljubljana bus station website.',
    links: [{ label: 'Bus timetable', href: 'https://www.ap-ljubljana.si/' }],
  },
  {
    id: 'railway',
    title: 'Trains',
    description: 'Bled Jezero station is convenient for trips toward Bohinjska Bistrica, Most na Soči and Nova Gorica. If you are travelling toward Ljubljana or other major destinations, Lesce-Bled station is usually the more practical choice.',
    links: [
      { label: 'Slovenian railways', href: 'https://potniski.sz.si/' },
      { label: 'Bled Jezero station', href: 'https://goo.gl/maps/vWPYX1CBgq1ZfND3A' },
      { label: 'Lesce-Bled station', href: 'https://goo.gl/maps/a553P2DtEtb3aEvQA' },
    ],
  },
  {
    id: 'taxi',
    title: 'Taxi',
    description: 'If you need a taxi, you can call or message the host contact number. Advance booking is recommended during busy periods.',
    links: [{ label: 'Call Tamara', href: 'tel:+38670428058' }],
  },
  {
    id: 'bicycle',
    title: 'Rent a bike',
    description: 'Bled has several bike rental options. The official Bled website keeps an updated overview of standard bicycle rental providers.',
    links: [{ label: 'Bike rental options', href: 'https://www.bled.si/en/information/getting-around-bled/2019100917061847/bike-and-ebike-rental/' }],
  },
  {
    id: 'ebike',
    title: 'Rent an eBike',
    description: 'For eBike rental or organised eBike tours, we recommend checking local providers. You can also ask whether delivery to the apartment and later pick-up are available.',
    links: [{ label: 'eBike rental', href: 'https://www.ab-bike.si/en' }],
  },
  {
    id: 'getting-around',
    title: 'Getting around Bled',
    description: 'Bled is easy to explore on foot, by bike, by bus, by taxi or by the traditional Pletna boat. The official Bled website has a good overview of transport options and practical tips for moving around the area.',
    links: [{ label: 'Getting around Bled', href: 'https://www.bled.si/en/information/getting-around-bled/' }],
  },
]
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">Guest guide</p>
      <h1>Frequently asked questions</h1>
    </div>

    <div class="faq-list">
      <div
        v-for="item in items"
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

    <div class="info-related">
      <NuxtLink to="/guest/info/how-to" class="info-related__card">
        <span class="info-related__title">How to use</span>
        <span class="info-related__desc">Instructions for apartment features.</span>
      </NuxtLink>
      <NuxtLink to="/guest/info/good-to-know" class="info-related__card">
        <span class="info-related__title">Good to know</span>
        <span class="info-related__desc">Parking, distances and local tips.</span>
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
