<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const route = useRoute()
const token = route.params.token as string

const guestToken = useGuestToken()
guestToken.value = token

const { locale, setLocale, t } = useLocale()

const { data, error, pending } = await useFetch(`/api/guest/${token}`)

// Auto-set locale from reservation's guest_lang on first load
watchEffect(() => {
  if (data.value) {
    const lang = (data.value as any)?.lang
    if (lang) setLocale(lang)
  }
})

const pinVisible = ref(false)

const firstName = computed(() => {
  const name = (data.value as any)?.name ?? ''
  return name.split(' ')[0] ?? name
})

const doorList = computed(() => {
  const door = (data.value as any)?.door ?? ''
  return door.split(',').map((d: string) => d.trim()).filter(Boolean)
})

const doorLabel = computed(() => {
  const list = doorList.value
  if (list.length === 2) return 'Maple & Pine Apartments'
  return `${list[0]} Apartment`
})

const guestCount = computed(() => (data.value as any)?.guestCount ?? null)
const contactPhone = computed(() => (data.value as any)?.contactPhone ?? null)
const propertyNavUrl = computed(() => (data.value as any)?.propertyNavUrl ?? null)

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// Localised month/day abbreviations
const MONTHS: Record<string, string[]> = {
  en: MONTHS_EN,
  sl: ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
  de: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
  hr: ['Sij','Velj','Ožu','Tra','Svi','Lip','Srp','Kol','Ruj','Lis','Stu','Pro'],
  sr: ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
}
const DAYS: Record<string, string[]> = {
  en: DAYS_EN,
  sl: ['Ned','Pon','Tor','Sre','Čet','Pet','Sob'],
  de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
  hr: ['Ned','Pon','Uto','Sri','Čet','Pet','Sub'],
  sr: ['Ned','Pon','Uto','Sre','Čet','Pet','Sub'],
}

function formatDt(dt: string | null, opts?: { short?: boolean }) {
  if (!dt) return '—'
  const [datePart, timePart] = dt.split(' ')
  if (!datePart) return dt
  const d = new Date(datePart + 'T00:00:00')
  if (isNaN(d.getTime())) return dt
  const loc = locale.value
  const dow = (DAYS[loc] ?? DAYS_EN)[d.getDay()]
  const day = d.getDate()
  const mon = (MONTHS[loc] ?? MONTHS_EN)[d.getMonth()]
  if (opts?.short) return timePart ? `${day} ${mon} ${timePart}` : `${day} ${mon}`
  return timePart ? `${dow} ${day} ${mon} · ${timePart}` : `${dow} ${day} ${mon}`
}
</script>

<template>
  <div class="guest-page">

    <!-- Loading -->
    <div v-if="pending" class="guest-loading" aria-live="polite">
      <div class="guest-loading__spinner" />
    </div>

    <!-- Error -->
    <template v-else-if="error">
      <div class="guest-hero">
        <p class="guest-kicker">{{ t.hero.kicker }}</p>
        <h1>Access not found</h1>
        <p class="guest-hero__sub">
          {{ (error as any).data?.statusMessage ?? 'This link is invalid or has expired.' }}
        </p>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="data">

      <!-- Hero -->
      <div class="guest-hero">
        <p class="guest-kicker">{{ t.hero.kicker }}</p>
        <p class="guest-hero__welcome">{{ t.hero.welcome }}</p>
        <h1 class="guest-hero__name-line"><span class="guest-hero__name">{{ firstName }}</span>!</h1>
        <p class="guest-hero__sub">
          <strong>{{ doorLabel }}</strong>
          <template v-if="guestCount">
            <span class="guest-hero__sep">·</span>
            {{ guestCount }} {{ guestCount === 1 ? t.hero.guestSingular : t.hero.guestPlural }}
          </template>
        </p>
        <div class="guest-hero__dates">
          <span class="guest-hero__date-item">
            <span class="guest-hero__date-label">{{ t.hero.checkIn }}</span>
            <span class="guest-hero__date-val">{{ formatDt((data as any).checkIn) }}</span>
          </span>
          <span class="guest-hero__date-item">
            <span class="guest-hero__date-label">{{ t.hero.checkOut }}</span>
            <span class="guest-hero__date-val">{{ formatDt((data as any).checkOut) }}</span>
          </span>
        </div>

        <!-- Nav + Call buttons -->
        <div v-if="propertyNavUrl || contactPhone" class="guest-hero__actions">
          <a
            v-if="propertyNavUrl"
            :href="propertyNavUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="guest-action-btn guest-action-btn--nav"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            {{ t.hero.directions }}
          </a>
          <a
            v-if="contactPhone"
            :href="`tel:${contactPhone}`"
            class="guest-action-btn guest-action-btn--call"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.42 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38a16 16 0 0 0 5.66 5.66l1.34-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
            {{ t.hero.callUs }}
          </a>
        </div>
      </div>

      <!-- PIN panel -->
      <div class="pin-panel">
        <p class="guest-kicker">{{ t.pin.kicker }}</p>

        <template v-if="(data as any).pin">
          <div class="pin-box" :class="{ 'pin-box--visible': pinVisible }">
            <span class="pin-box__code">
              {{ pinVisible ? (data as any).pin : '• • • •' }}
            </span>
          </div>
          <button class="pin-reveal" @click="pinVisible = !pinVisible">
            {{ pinVisible ? t.pin.hide : t.pin.reveal }}
          </button>
        </template>

        <div v-else class="pin-pending">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="#7b947e" stroke-width="1.5"/>
            <path d="M10 6v5l3 3" stroke="#7b947e" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p>{{ t.pin.pending }}</p>
        </div>

      </div>

      <!-- Weather -->
      <div class="weather-panel">
        <p class="guest-kicker">{{ t.weather.kicker }}</p>
        <iframe
          src="https://vreme.arso.gov.si/widget/?&loc=Bled"
          style="border:0; height:185px; width:100%;"
          title="Vreme Bled — ARSO"
          loading="lazy"
        />
      </div>

      <!-- Parking -->
      <div class="info-panel">
        <p class="guest-kicker">{{ t.parking.kicker }}</p>
        <div class="info-panel__row">
          <svg class="info-panel__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <p>{{ t.parking.text }}</p>
        </div>
      </div>

      <!-- House rules -->
      <div class="info-panel">
        <p class="guest-kicker">{{ t.rules.kicker }}</p>
        <ul class="info-rules">
          <li v-for="(rule, i) in t.rules.items" :key="i">
            <span class="info-rules__bullet" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5C5 1.5 3.5 3 3.5 4.5c0 2 1.5 3.5 3.5 5.5 2-2 3.5-3.5 3.5-5.5C10.5 3 9 1.5 7 1.5z" fill="#7b947e"/>
                <path d="M7 4.5v5" stroke="#fffdf8" stroke-width="0.8" stroke-linecap="round"/>
              </svg>
            </span>
            <span>{{ rule }}</span>
          </li>
        </ul>
      </div>

      <!-- Adventure teaser -->
      <NuxtLink to="/guest/info/suggestions" class="adventure-card">
        <div class="adventure-card__video">
          <iframe
            src="https://www.youtube.com/embed/ZpIO7qyk760?si=HaZpAqX8mg89Ptbl"
            title="Bled"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          />
        </div>
        <div class="adventure-card__body">
          <h2 class="adventure-card__title">{{ t.adventure.title }}</h2>
          <p class="adventure-card__desc">{{ t.adventure.desc }}</p>
          <span class="adventure-card__cta">
            {{ t.adventure.cta }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </NuxtLink>

    </template>
  </div>
</template>

<style scoped>
.guest-page {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 0 0;
  color: #243027;
}

/* ── Loading ── */
.guest-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.guest-loading__spinner {
  width: 32px;
  height: 32px;
  border: 2.5px solid #e4dccf;
  border-top-color: #26372c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Shared kicker ── */
.guest-kicker {
  margin: 0 0 12px;
  color: #7b947e;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Hero ── */
.guest-hero {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: clamp(28px, 5vw, 48px);
  margin: 0 0 18px;
  text-align: center;
}

.guest-hero__welcome {
  margin: 0 0 2px;
  font-family: 'Dancing Script', cursive;
  font-size: clamp(2.2rem, 7vw, 3.2rem);
  font-weight: 600;
  color: #7b947e;
  line-height: 1.2;
}

.guest-hero__name-line {
  margin: 0;
  color: #202920;
  font-size: clamp(2.1rem, 6vw, 3.2rem);
  line-height: 1.06;
  font-weight: 620;
}

.guest-hero__name {
  text-transform: uppercase;
}

.guest-hero__sub {
  margin: 14px 0 0;
  color: #626a63;
  font-size: 1.02rem;
  line-height: 1.6;
}

.guest-hero__sep {
  margin: 0 6px;
  color: #c4b9a8;
}

.guest-hero__dates {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin: 20px 0 0;
  padding: 20px 0 0;
  border-top: 1px solid #e4dccf;
  width: 100%;
}

.guest-hero__date-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.guest-hero__date-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7b947e;
}

.guest-hero__date-val {
  font-size: 1rem;
  font-weight: 620;
  color: #202920;
  line-height: 1.2;
}

.guest-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.guest-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 10px 18px;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}

.guest-action-btn--nav {
  background: #26372c;
  color: #fffdf8;
  border: none;
}
.guest-action-btn--nav:hover { background: #3c5543; }

.guest-action-btn--call {
  background: transparent;
  color: #26372c;
  border: 1.5px solid #26372c;
}
.guest-action-btn--call:hover { background: #f0ebe1; }

/* ── PIN panel ── */
.pin-panel {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: clamp(28px, 5vw, 48px);
  margin: 0 0 18px;
}

.pin-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f1e9;
  border: 1.5px solid #e4dccf;
  border-radius: 6px;
  padding: 20px 24px;
  margin: 0 0 18px;
  min-height: 84px;
  transition: border-color 160ms ease, background 160ms ease;
}

.pin-box--visible {
  background: #fffdf8;
  border-color: #26372c;
}

.pin-box__code {
  font-size: clamp(1.4rem, 8vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.22em;
  font-variant-numeric: tabular-nums;
  color: #202920;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  user-select: none;
  transition: opacity 160ms ease;
  white-space: nowrap;
}

.pin-box:not(.pin-box--visible) .pin-box__code {
  opacity: 0.35;
  letter-spacing: 0.35em;
}

.pin-reveal {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #26372c;
  padding: 10px 20px;
  color: #fffdf8;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: background 160ms ease;
  margin: 0 auto 22px;
  width: fit-content;
}
.pin-reveal:hover { background: #3c5543; }

/* PIN pending */
.pin-pending {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f5f1e9;
  border: 1.5px solid #dbe3d8;
  border-radius: 6px;
  padding: 18px 20px;
  margin: 0 0 22px;
}
.pin-pending p {
  margin: 0;
  color: #465146;
  font-size: 0.95rem;
  line-height: 1.65;
}
.pin-pending svg { flex-shrink: 0; margin-top: 2px; }

.weather-panel {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: 24px clamp(20px, 4vw, 32px);
  margin: 18px 0 0;
}

/* ── Info panels (parking, house rules) ── */
.info-panel {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: 24px clamp(20px, 4vw, 32px);
  margin: 18px 0 0;
}

.info-panel__row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-panel__icon {
  color: #7b947e;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-panel__row p {
  margin: 0;
  color: #243027;
  font-size: 0.95rem;
  line-height: 1.65;
}

.info-rules {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-rules li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #243027;
  font-size: 0.93rem;
  line-height: 1.6;
  padding: 10px 0;
  border-bottom: 1px solid #eee8de;
}

.info-rules li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-rules li:first-child {
  padding-top: 0;
}

.info-rules__bullet {
  flex-shrink: 0;
  margin-top: 3px;
  display: flex;
}

.info-panel__link {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #26372c;
  text-decoration: none;
  border-bottom: 1px solid #c4b9a8;
  padding-bottom: 1px;
  transition: border-color 140ms ease, color 140ms ease;
}
.info-panel__link:hover { color: #3c5543; border-color: #26372c; }

/* ── Adventure teaser ── */
.adventure-card {
  display: block;
  background: #fffdf8;
  border: 1px solid #e4dccf;
  overflow: hidden;
  margin: 18px 0 0;
  text-decoration: none;
  transition: border-color 180ms ease;
}
.adventure-card:hover { border-color: #9db39e; }

.adventure-card__video {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-bottom: 1px solid #e4dccf;
  background: #1a1a1a;
}
.adventure-card__video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.adventure-card__body {
  padding: clamp(24px, 4vw, 36px);
}

.adventure-card__title {
  margin: 0 0 10px;
  color: #202920;
  font-size: clamp(1.4rem, 4vw, 1.9rem);
  font-weight: 620;
  line-height: 1.15;
}

.adventure-card__desc {
  margin: 0 0 18px;
  color: #626a63;
  line-height: 1.75;
  font-size: 0.95rem;
}

.adventure-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #26372c;
  border-bottom: 1.5px solid #9db39e;
  padding-bottom: 1px;
  transition: color 140ms ease, border-color 140ms ease;
}
.adventure-card:hover .adventure-card__cta { color: #3c5543; border-color: #26372c; }

@media (max-width: 480px) {
  .guest-page { padding: 20px 0 0; }
  .guest-hero__dates { flex-direction: column; gap: 16px; align-items: center; }
  .guest-hero__date-item { align-items: center; }
}

</style>
