<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const route = useRoute()
const token = route.params.token as string

const guestToken = useGuestToken()
guestToken.value = token

const { data, error, pending } = await useFetch(`/api/guest/${token}`)

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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDt(dt: string | null, opts?: { short?: boolean }) {
  if (!dt) return '—'
  const [datePart, timePart] = dt.split(' ')
  if (!datePart) return dt
  const d = new Date(datePart + 'T00:00:00')
  if (isNaN(d.getTime())) return dt
  const dow = DAYS[d.getDay()]
  const day = d.getDate()
  const mon = MONTHS[d.getMonth()]
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
        <p class="guest-kicker">Maple &amp; Pine · Bled</p>
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
        <p class="guest-kicker">Maple &amp; Pine · Bled</p>
        <h1>Welcome, {{ firstName }}!</h1>
        <p class="guest-hero__sub">
          {{ doorLabel }}
          <template v-if="guestCount">
            <span class="guest-hero__sep">·</span>
            {{ guestCount }} {{ guestCount === 1 ? 'guest' : 'guests' }}
          </template>
        </p>
        <p class="guest-hero__dates">
          <span class="guest-hero__date-item">
            <span class="guest-hero__date-label">Check-in</span>
            {{ formatDt((data as any).checkIn) }}
          </span>
          <span class="guest-hero__date-arrow" aria-hidden="true">→</span>
          <span class="guest-hero__date-item">
            <span class="guest-hero__date-label">Check-out</span>
            {{ formatDt((data as any).checkOut) }}
          </span>
        </p>

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
            Directions
          </a>
          <a
            v-if="contactPhone"
            :href="`tel:${contactPhone}`"
            class="guest-action-btn guest-action-btn--call"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.42 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38a16 16 0 0 0 5.66 5.66l1.34-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
            Call us
          </a>
        </div>
      </div>

      <!-- PIN panel -->
      <div class="pin-panel">
        <p class="guest-kicker">Your access PIN</p>

        <template v-if="(data as any).pin">
          <div class="pin-box" :class="{ 'pin-box--visible': pinVisible }">
            <span class="pin-box__code">
              {{ pinVisible ? (data as any).pin : '• • • •' }}
            </span>
          </div>
          <button class="pin-reveal" @click="pinVisible = !pinVisible">
            {{ pinVisible ? 'Hide PIN' : 'Reveal PIN' }}
          </button>
        </template>

        <div v-else class="pin-pending">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="#7b947e" stroke-width="1.5"/>
            <path d="M10 6v5l3 3" stroke="#7b947e" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p>Your PIN is being set up. You'll receive an email as soon as it's ready.</p>
        </div>

        <div class="door-row">
          <span
            v-for="d in doorList"
            :key="d"
            class="door-badge"
            :class="d === 'Maple' ? 'door-badge--maple' : 'door-badge--pine'"
          >{{ d }} Apartment</span>
        </div>
      </div>

      <!-- Validity strip -->
      <div class="validity-strip">
        <div class="validity-strip__item">
          <span class="validity-strip__label">PIN active from</span>
          <span class="validity-strip__value">{{ formatDt((data as any).accessValidFrom) }}</span>
        </div>
        <div class="validity-strip__divider" aria-hidden="true" />
        <div class="validity-strip__item">
          <span class="validity-strip__label">PIN expires</span>
          <span class="validity-strip__value">{{ formatDt((data as any).accessValidUntil) }}</span>
        </div>
      </div>

      <!-- Weather -->
      <div class="weather-panel">
        <p class="guest-kicker">Vreme · Bled</p>
        <iframe
          src="https://vreme.arso.gov.si/widget/?&loc=Bled"
          style="border:0; height:185px; width:100%;"
          title="Vreme Bled — ARSO"
          loading="lazy"
        />
      </div>

      <!-- Parking -->
      <div class="info-panel">
        <p class="guest-kicker">Parking</p>
        <div class="info-panel__row">
          <svg class="info-panel__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <p>Parkiranje je možno na prvih dveh mestih na levi strani dovoza ob električni polnilnici.</p>
        </div>
      </div>

      <!-- House rules -->
      <div class="info-panel">
        <p class="guest-kicker">House rules</p>
        <ul class="info-rules">
          <li>No smoking inside the apartment.</li>
          <li>Please separate waste and flush toilet paper only.</li>
          <li>Please do not feed the horses — unsuitable food can harm them.</li>
          <li>Do not lean on or climb the upper-floor fence. The horse fence is electrified.</li>
          <li>Tap water is safe to drink.</li>
        </ul>
      </div>

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
}

.guest-hero h1 {
  margin: 0;
  color: #202920;
  font-size: clamp(2.1rem, 6vw, 3.2rem);
  line-height: 1.06;
  font-weight: 620;
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
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin: 18px 0 0;
  padding: 18px 0 0;
  border-top: 1px solid #e4dccf;
}

.guest-hero__date-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.guest-hero__date-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7b947e;
}

.guest-hero__date-arrow {
  color: #c4b9a8;
  font-size: 1.1rem;
  align-self: center;
  padding-top: 14px;
}

.guest-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
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
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  font-variant-numeric: tabular-nums;
  color: #202920;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  user-select: none;
  transition: opacity 160ms ease;
}

.pin-box:not(.pin-box--visible) .pin-box__code {
  opacity: 0.35;
  letter-spacing: 0.35em;
}

.pin-reveal {
  min-height: 44px;
  display: inline-flex;
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
  margin: 0 0 22px;
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

/* Door badges */
.door-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.door-badge {
  display: inline-flex;
  align-items: center;
  background: #eef1eb;
  border: 1px solid #dbe3d8;
  color: #536556;
  padding: 5px 10px;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 6px;
}

.door-badge--maple {
  background: #fef9ee;
  border-color: #f0e0b5;
  color: #7a5a18;
}

/* ── Validity strip ── */
.validity-strip {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
}

.validity-strip__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px clamp(20px, 4vw, 32px);
}

.validity-strip__divider {
  background: #e4dccf;
  width: 1px;
  align-self: stretch;
}

.validity-strip__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7b947e;
}

.validity-strip__value {
  font-size: 1rem;
  font-weight: 620;
  color: #202920;
  line-height: 1.3;
}

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
  margin: 0 0 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-rules li {
  color: #243027;
  font-size: 0.95rem;
  line-height: 1.55;
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

@media (max-width: 480px) {
  .guest-page { padding: 20px 0 0; }

  .validity-strip {
    grid-template-columns: 1fr;
  }
  .validity-strip__divider {
    width: auto;
    height: 1px;
    align-self: auto;
  }
}
</style>
