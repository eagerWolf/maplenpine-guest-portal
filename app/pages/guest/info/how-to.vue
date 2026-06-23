<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const items = [
  {
    id: 'ac',
    title: 'Air conditioning',
    description: 'On the upper floor there is an air conditioner with a standard remote control. Please adjust it however it suits you best.',
    image: '/how-to/ac.webp',
  },
  {
    id: 'tv',
    title: 'TV',
    description: 'The apartment has a TCL 55P69B 4K UHD TV with Google TV. You can use it for regular TV content, streaming apps and casting your own content through Google TV or Chromecast features. If you want regular TV channels, use the large remote to switch the HDMI source and the small remote to control the TV.',
    image: '/how-to/tv.webp',
  },
  {
    id: 'child-safety',
    title: 'Safety gate for kids',
    description: 'The stairs are protected by a child safety gate. To unlock or lock it, press and twist the button on the holder.',
    image: '/how-to/kids-safety.webp',
  },
  {
    id: 'ventilation',
    title: 'Automatic ventilation',
    description: 'The ventilation controls are located in the lower part of the apartment near the sofa. The right-side control operates ventilation with heat recovery and is the recommended setting for everyday use.',
    image: '/how-to/ventilation-control.webp',
  },
  {
    id: 'blinds',
    title: 'Blinds',
    description: 'Press and hold the up arrow for about a second to raise the blinds and the down arrow to lower them. A short press stops them.',
    image: '/how-to/blinds-control.webp',
  },
  {
    id: 'roof-window',
    title: 'Roof window',
    description: 'Use the arrow buttons to open or close the roof window, and the middle button to stop it at any position. Please do not operate the window manually.',
    image: '/how-to/roof-window.webp',
  },
  {
    id: 'oven',
    title: 'Gorenje combination oven',
    description: 'The kitchen has a Gorenje H30MOBS10HC combination oven. It can be used as a microwave, hot-air/convection oven, grill and air-fry oven. It is useful for quick reheating, breakfast or simple meals during your stay. Detailed operating instructions are available in the PDF document below.',
    image: '/how-to/gorenje-h30mobs10hc-oven.jpg',
    links: [{ label: 'Open PDF manual', href: '/how-to/gorenje-h30mobs10hc-navodila.pdf' }],
  },
  {
    id: 'anti-mosquito',
    title: 'Anti-mosquito protection',
    description: 'To make sleeping more comfortable, there is an anti-mosquito plug on the upper floor. Bedroom-area windows are also protected with mosquito nets.',
  },
  {
    id: 'family-friendly',
    title: 'Baby chair',
    description: 'In the kitchen cabinet under the microwave you will find a child-seat kit that fits the kitchen chair.',
  },
  {
    id: 'bed-safety',
    title: 'Bed safety for kids',
    description: 'If you need a bed safety rail, it is stored under the first single bed. Lift the mattress and place the rail on the bed where you need it.',
  },
  {
    id: 'outdoor-lights',
    title: 'Outdoor light',
    description: 'The outdoor light switch is by the entrance. In the top position the light is always on, in the middle it is off, and in the bottom position it works with the motion sensor.',
    image: '/how-to/outdoor.webp',
  },
  {
    id: 'kitchen-lights',
    title: 'Kitchen light',
    description: 'Under the kitchen cabinet above the stove there is a blue touch switch for the kitchen light. Touch it to turn the light on or off, and hold it to adjust brightness.',
    image: '/how-to/kitchen.webp',
  },
  {
    id: 'bathroom-heating',
    title: 'Bathroom heating',
    description: 'By the bathroom entrance there is a switch with a heating icon. Press it to activate additional bathroom heating for about 30 minutes.',
    image: '/how-to/bathroom.webp',
  },
  {
    id: 'waste-handling',
    title: 'Waste handling',
    description: 'Inside the apartment, under the sink, you will find separate bins for waste sorting. Outside by the driveway there are collection bins, including a separate glass container.',
  },
]
</script>

<template>
  <div class="info-page">

    <div class="info-hero">
      <p class="info-kicker">Guest guide</p>
      <h1>How to use the apartment</h1>
    </div>

    <div class="howto-items">
      <div v-for="item in items" :key="item.id" class="howto-item">
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
            >{{ link.label }}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="info-related">
      <NuxtLink to="/guest/info/good-to-know" class="info-related__card">
        <span class="info-related__title">Good to know</span>
        <span class="info-related__desc">Parking, distances, access and local tips.</span>
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
  color: #202920;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.howto-item__body p {
  margin: 0;
  color: #626a63;
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
  background: #26372c;
  color: #fffdf8;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background 160ms ease;
}
.howto-link:hover { background: #3c5543; }

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
  .howto-item__img { height: 160px; }
}
</style>
