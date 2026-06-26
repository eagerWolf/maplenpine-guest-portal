<script setup lang="ts">
definePageMeta({ layout: 'guest' })

const route = useRoute()
const token = route.params.token as string

const guestToken = useGuestToken()
guestToken.value = token

interface DateEntry { date: string; disabled: boolean; reason?: string }
interface AvailabilityData {
  enabled: boolean
  dates: DateEntry[]
  hasJan1Warning: boolean
  jan1Note: string
  pricePerPerson: number
  commissionPercent: number
  minCount: number
  maxCount: number
  orderCutoffHour: number
  availableCount: number
  guestCount: number | null
}
interface GuestOrder {
  id: number
  selectedDates: string[]
  deliverySlot: string
  breakfastCount: number
  vegetarianCount: number
  glutenFreeCount: number
  pricePerPerson: number
  commissionPercent: number
  totalPrice: number
  status: string
  createdAt: string
}

const SLOTS = ['08:00-09:00', '09:00-10:00', '10:00-11:00']

const { data: avail, error: availError } = await useFetch<AvailabilityData>(
  `/api/guest/breakfast/availability`,
  { query: { token }, key: `breakfast-avail-${token}` },
)

const { data: ordersData, refresh: refreshOrders } = await useFetch<{ orders: GuestOrder[] }>(
  `/api/guest/breakfast/orders`,
  { query: { token }, key: `breakfast-orders-${token}` },
)

// ── Return-from-SumUp handling ─────────────────────────────────────────────
const returnOrderId = computed(() => {
  const v = route.query.order
  return v ? parseInt(String(v)) : null
})
const returnOrder = computed(() => {
  if (!returnOrderId.value) return null
  return ordersData.value?.orders.find(o => o.id === returnOrderId.value) ?? null
})

// ── Form state ─────────────────────────────────────────────────────────────
const selectedDates = ref<Set<string>>(new Set())
const deliverySlot = ref('08:00-09:00')
const breakfastCount = ref(2)
const vegetarianCount = ref(0)
const glutenFreeCount = ref(0)
const guestPhone = ref('')
const guestNotes = ref('')

const submitting = ref(false)
const submitError = ref('')

// Derived
const pricePerPerson = computed(() => avail.value?.pricePerPerson ?? 12)
const commissionPercent = computed(() => avail.value?.commissionPercent ?? 12)
const minCount = computed(() => avail.value?.minCount ?? 2)
const maxCount = computed(() => avail.value?.maxCount ?? 8)
const daysCount = computed(() => selectedDates.value.size)
const totalPrice = computed(() =>
  parseFloat((breakfastCount.value * daysCount.value * pricePerPerson.value).toFixed(2)),
)
const partnerAmount = computed(() =>
  parseFloat((totalPrice.value * (1 - commissionPercent.value / 100)).toFixed(2)),
)

// Even-number options for special breakfasts
function evenOptions(maxVal: number): number[] {
  const opts = [0]
  for (let i = 2; i <= maxVal; i += 2) opts.push(i)
  return opts
}
const vegOptions = computed(() => evenOptions(breakfastCount.value))
const gfOptions = computed(() => evenOptions(breakfastCount.value - vegetarianCount.value))

// Reset special counts when total changes
watch(breakfastCount, () => {
  if (vegetarianCount.value > breakfastCount.value) vegetarianCount.value = 0
  if (glutenFreeCount.value > breakfastCount.value - vegetarianCount.value) glutenFreeCount.value = 0
})
watch(vegetarianCount, () => {
  if (glutenFreeCount.value > breakfastCount.value - vegetarianCount.value) glutenFreeCount.value = 0
})

// Init min count
watchEffect(() => {
  if (avail.value && breakfastCount.value < avail.value.minCount) {
    breakfastCount.value = avail.value.minCount
  }
})

function toggleDate(date: string, disabled: boolean) {
  if (disabled) return
  const s = new Set(selectedDates.value)
  s.has(date) ? s.delete(date) : s.add(date)
  selectedDates.value = s
}

function selectAllDates() {
  selectedDates.value = new Set(
    (avail.value?.dates ?? []).filter(d => !d.disabled).map(d => d.date),
  )
}

function clearDates() {
  selectedDates.value = new Set()
}

function formatDate(d: string): string {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('sl-SI', { weekday: 'short', day: 'numeric', month: 'short' })
}

async function submit() {
  submitError.value = ''
  if (selectedDates.value.size === 0) { submitError.value = 'Izberite vsaj en datum.'; return }
  submitting.value = true
  try {
    const result = await $fetch<{ orderId: number; checkoutUrl: string }>(
      '/api/guest/breakfast/order',
      {
        method: 'POST',
        body: {
          token,
          selectedDates: [...selectedDates.value].sort(),
          deliverySlot: deliverySlot.value,
          breakfastCount: breakfastCount.value,
          vegetarianCount: vegetarianCount.value,
          glutenFreeCount: glutenFreeCount.value,
          guestPhone: guestPhone.value || undefined,
          guestNotes: guestNotes.value || undefined,
        },
      },
    )
    // Redirect to SumUp checkout
    window.location.href = result.checkoutUrl
  } catch (err: any) {
    submitError.value = err?.data?.statusMessage ?? 'Napaka pri oddaji naročila.'
    submitting.value = false
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Čaka plačilo', color: 'text-amber-700 bg-amber-50' },
  paid: { label: 'Plačano', color: 'text-blue-700 bg-blue-50' },
  sent_to_partner: { label: 'Poslano partnerju', color: 'text-indigo-700 bg-indigo-50' },
  confirmed_by_partner: { label: 'Potrjeno', color: 'text-pine-700 bg-pine-50' },
  rejected_by_partner: { label: 'Zavrnjeno', color: 'text-red-700 bg-red-50' },
  cancelled: { label: 'Preklicano', color: 'text-stone-500 bg-stone-100' },
  payment_failed: { label: 'Plačilo neuspešno', color: 'text-red-700 bg-red-50' },
  refunded: { label: 'Vračilo opravljeno', color: 'text-orange-700 bg-orange-50' },
}
</script>

<template>
  <div class="bf-page">

    <!-- Error loading availability -->
    <div v-if="availError" class="bf-card">
      <p class="bf-error">Napaka pri nalaganju: {{ (availError as any).data?.statusMessage ?? availError.message }}</p>
    </div>

    <!-- Breakfast disabled -->
    <div v-else-if="avail && !avail.enabled" class="bf-card bf-card--center">
      <div class="bf-icon">🍳</div>
      <h2 class="bf-card__title">Naročanje zajtrka</h2>
      <p class="bf-card__body">Naročanje zajtrkov trenutno ni na voljo. Prosimo, poskusite kasneje.</p>
    </div>

    <template v-else-if="avail">

      <!-- Return from SumUp — show order status -->
      <div v-if="returnOrderId" class="bf-card">
        <h2 class="bf-card__title">Status naročila</h2>
        <template v-if="returnOrder">
          <div class="bf-status-badge" :class="STATUS_LABELS[returnOrder.status]?.color">
            {{ STATUS_LABELS[returnOrder.status]?.label ?? returnOrder.status }}
          </div>
          <p v-if="returnOrder.status === 'sent_to_partner' || returnOrder.status === 'confirmed_by_partner'" class="bf-card__body bf-card__body--ok">
            Naročilo je bilo prejeto in posredovano partnerju Bled Breakfast. Potrditev boste prejeli ločeno. V primeru zavrnitve bo plačilo vrnjeno.
          </p>
          <p v-else-if="returnOrder.status === 'pending_payment' || returnOrder.status === 'paid'" class="bf-card__body">
            Plačilo se procesira... Prosimo osvežite stran čez trenutek.
          </p>
          <p v-else-if="returnOrder.status === 'payment_failed'" class="bf-error">
            Plačilo ni uspelo. Naročilo ni bilo oddano.
          </p>
          <p v-else-if="returnOrder.status === 'refunded'" class="bf-card__body">
            Naročilo je bilo preklicano. Plačilo je vrnjeno.
          </p>
          <NuxtLink :to="`/guest/${token}/breakfast`" class="bf-btn bf-btn--outline" style="margin-top:16px">
            Nazaj na naročanje
          </NuxtLink>
        </template>
        <p v-else class="bf-card__body">Nalagam status naročila...</p>
      </div>

      <!-- Order form -->
      <template v-else>

        <!-- Header -->
        <div class="bf-header">
          <div class="bf-icon">🍳</div>
          <h1 class="bf-header__title">Naroči zajtrk</h1>
          <p class="bf-header__sub">
            Zajtrk vam dostavimo v vaš apartma. Naročilo sprejme Bled Breakfast — naročilo bo posredovano partnerju po uspešnem plačilu.
          </p>
        </div>

        <!-- Jan 1 warning -->
        <div v-if="avail.hasJan1Warning" class="bf-notice bf-notice--info">
          {{ avail.jan1Note }}
        </div>

        <!-- No available dates -->
        <div v-if="avail.availableCount === 0" class="bf-card bf-card--center">
          <p class="bf-card__body">Za vaše bivanje ni na voljo datumov za naročanje zajtrka.<br>
            <small>Upoštevamo rok za naročilo {{ avail.orderCutoffHour }}:00 za naslednji dan.</small>
          </p>
        </div>

        <template v-else>

          <!-- Step 1: Date selection -->
          <div class="bf-card">
            <h2 class="bf-step-title"><span class="bf-step-num">1</span> Izbira datumov dostave</h2>
            <div class="bf-date-actions">
              <button class="bf-link-btn" @click="selectAllDates">Izberi vse</button>
              <span class="bf-sep">·</span>
              <button class="bf-link-btn" @click="clearDates">Počisti</button>
            </div>
            <div class="bf-dates">
              <button
                v-for="d in avail.dates"
                :key="d.date"
                class="bf-date-chip"
                :class="{
                  'bf-date-chip--selected': selectedDates.has(d.date) && !d.disabled,
                  'bf-date-chip--disabled': d.disabled,
                  'bf-date-chip--jan1': d.reason === 'jan1',
                }"
                :disabled="d.disabled"
                :title="d.reason === 'jan1' ? avail.jan1Note : d.reason === 'cutoff' ? 'Rok za naročilo je potekel' : ''"
                @click="toggleDate(d.date, d.disabled)"
              >
                {{ formatDate(d.date) }}
                <span v-if="d.reason === 'jan1'" class="bf-date-chip__note">1. jan</span>
              </button>
            </div>
            <p v-if="selectedDates.size > 0" class="bf-selection-hint">
              Izbrani: {{ selectedDates.size }} {{ selectedDates.size === 1 ? 'dan' : 'dnevi/dni' }}
            </p>
          </div>

          <!-- Step 2: Count -->
          <div class="bf-card">
            <h2 class="bf-step-title"><span class="bf-step-num">2</span> Število zajtrkov na dan</h2>
            <div class="bf-counter">
              <button class="bf-counter__btn" :disabled="breakfastCount <= minCount" @click="breakfastCount--">−</button>
              <span class="bf-counter__val">{{ breakfastCount }}</span>
              <button class="bf-counter__btn" :disabled="breakfastCount >= maxCount" @click="breakfastCount++">+</button>
            </div>
            <p class="bf-hint">Min {{ minCount }}{{ avail.guestCount ? `, max ${maxCount} (glede na število gostov)` : `, max ${maxCount}` }}</p>
          </div>

          <!-- Step 3: Delivery slot -->
          <div class="bf-card">
            <h2 class="bf-step-title"><span class="bf-step-num">3</span> Termin dostave</h2>
            <div class="bf-slots">
              <label v-for="slot in SLOTS" :key="slot" class="bf-slot">
                <input v-model="deliverySlot" type="radio" :value="slot" class="bf-slot__radio" />
                <span class="bf-slot__label">{{ slot }}</span>
              </label>
            </div>
          </div>

          <!-- Step 4: Special options -->
          <div class="bf-card">
            <h2 class="bf-step-title"><span class="bf-step-num">4</span> Posebne opcije</h2>
            <p class="bf-hint">Posebne opcije v sodih številih, vsota ne sme preseči skupnega števila zajtrkov.</p>
            <div class="bf-specials">
              <div class="bf-special-row">
                <label class="bf-special-label">
                  🌿 Vegetarijanski
                </label>
                <select v-model.number="vegetarianCount" class="bf-select">
                  <option v-for="n in vegOptions" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <div class="bf-special-row">
                <label class="bf-special-label">
                  🌾 Brez glutena
                </label>
                <select v-model.number="glutenFreeCount" class="bf-select">
                  <option v-for="n in gfOptions" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 5: Contact + notes -->
          <div class="bf-card">
            <h2 class="bf-step-title"><span class="bf-step-num">5</span> Kontakt in opombe</h2>
            <div class="bf-field">
              <label class="bf-label">Telefonska številka (opcijsko)</label>
              <input v-model="guestPhone" type="tel" placeholder="+386 40 123 456" class="bf-input" />
            </div>
            <div class="bf-field">
              <label class="bf-label">Opombe (alergije, posebne želje...)</label>
              <textarea v-model="guestNotes" rows="3" placeholder="Npr. alergija na jajca..." class="bf-input bf-input--textarea" />
            </div>
          </div>

          <!-- Summary -->
          <div v-if="selectedDates.size > 0" class="bf-summary">
            <h2 class="bf-summary__title">Povzetek naročila</h2>
            <div class="bf-summary__rows">
              <div class="bf-summary__row">
                <span>Datumi dostave</span>
                <span>{{ [...selectedDates].sort().map(formatDate).join(', ') }}</span>
              </div>
              <div class="bf-summary__row">
                <span>Termin</span>
                <span>{{ deliverySlot }}</span>
              </div>
              <div class="bf-summary__row">
                <span>Zajtrki na dan</span>
                <span>{{ breakfastCount }}</span>
              </div>
              <div v-if="vegetarianCount > 0" class="bf-summary__row">
                <span>Vegetarijanski</span>
                <span>{{ vegetarianCount }}</span>
              </div>
              <div v-if="glutenFreeCount > 0" class="bf-summary__row">
                <span>Brez glutena</span>
                <span>{{ glutenFreeCount }}</span>
              </div>
              <div class="bf-summary__row">
                <span>Cena na zajtrk</span>
                <span>{{ pricePerPerson.toFixed(2) }} EUR</span>
              </div>
              <div class="bf-summary__row">
                <span>Število dni</span>
                <span>{{ daysCount }}</span>
              </div>
              <div class="bf-summary__row bf-summary__row--total">
                <span>Skupaj</span>
                <span>{{ totalPrice.toFixed(2) }} EUR</span>
              </div>
            </div>
            <p class="bf-summary__note">
              Po uspešnem plačilu bo naročilo posredovano Bled Breakfast. Potrditev naročila ni avtomatska — v primeru zavrnitve vam bo plačilo vrnjeno.
            </p>
          </div>

          <!-- Error -->
          <div v-if="submitError" class="bf-notice bf-notice--error">{{ submitError }}</div>

          <!-- Submit -->
          <button
            class="bf-btn bf-btn--primary"
            :disabled="submitting || selectedDates.size === 0"
            @click="submit"
          >
            <span v-if="submitting">Preusmerjam na plačilo…</span>
            <span v-else-if="selectedDates.size === 0">Izberite datume</span>
            <span v-else>Plačaj {{ totalPrice.toFixed(2) }} EUR</span>
          </button>

        </template>
      </template>

      <!-- Existing orders -->
      <div v-if="ordersData?.orders?.length && !returnOrderId" class="bf-card" style="margin-top: 32px">
        <h2 class="bf-step-title">Vaša naročila</h2>
        <div class="bf-orders">
          <div v-for="o in ordersData.orders" :key="o.id" class="bf-order">
            <div class="bf-order__header">
              <span class="bf-order__dates">{{ o.selectedDates.map(formatDate).join(', ') }}</span>
              <span class="bf-status-badge" :class="STATUS_LABELS[o.status]?.color ?? 'text-stone-600 bg-stone-100'">
                {{ STATUS_LABELS[o.status]?.label ?? o.status }}
              </span>
            </div>
            <div class="bf-order__meta">
              {{ o.deliverySlot }} · {{ o.breakfastCount }} zajtrkov · {{ o.totalPrice.toFixed(2) }} EUR
            </div>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<style scoped>
.bf-page {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 0 48px;
}

.bf-card {
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: 24px clamp(18px, 4vw, 28px);
  margin-bottom: 16px;
}
.bf-card--center { text-align: center; }
.bf-card__title { margin: 0 0 8px; font-size: 1.15rem; font-weight: 620; color: #202920; }
.bf-card__body { margin: 0; color: #626a63; line-height: 1.7; font-size: 0.95rem; }
.bf-card__body--ok { color: #26372c; }

.bf-header {
  text-align: center;
  padding: 28px 0 24px;
}
.bf-icon { font-size: 2.4rem; margin-bottom: 8px; }
.bf-header__title { margin: 0 0 8px; font-size: clamp(1.4rem, 5vw, 1.9rem); font-weight: 640; color: #202920; }
.bf-header__sub { margin: 0; color: #626a63; font-size: 0.95rem; line-height: 1.7; }

.bf-notice {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  line-height: 1.6;
}
.bf-notice--info { background: #fef9c3; border: 1px solid #fde047; color: #713f12; }
.bf-notice--error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

.bf-step-title {
  display: flex; align-items: center; gap: 10px;
  margin: 0 0 16px; font-size: 1rem; font-weight: 640; color: #202920;
}
.bf-step-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; background: #26372c; color: #fffdf8;
  border-radius: 50%; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}

/* Dates */
.bf-date-actions { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.bf-link-btn { background: none; border: none; cursor: pointer; color: #26372c; font-size: 0.85rem; font-weight: 600; padding: 0; text-decoration: underline; }
.bf-sep { color: #c4b9a8; }
.bf-dates { display: flex; flex-wrap: wrap; gap: 8px; }
.bf-date-chip {
  padding: 8px 14px; border: 1.5px solid #e4dccf; border-radius: 6px;
  background: #fffdf8; cursor: pointer; font-size: 0.85rem; font-weight: 500;
  color: #243027; transition: all 140ms ease; font-family: inherit;
  display: flex; align-items: center; gap: 6px;
}
.bf-date-chip:hover:not(:disabled) { border-color: #9db39e; background: #f0ebe1; }
.bf-date-chip--selected { background: #26372c; color: #fffdf8; border-color: #26372c; }
.bf-date-chip--disabled { opacity: 0.4; cursor: not-allowed; }
.bf-date-chip--jan1 { border-style: dashed; }
.bf-date-chip__note { font-size: 0.72rem; opacity: 0.7; }
.bf-selection-hint { margin: 12px 0 0; color: #7b947e; font-size: 0.85rem; }

/* Counter */
.bf-counter { display: flex; align-items: center; gap: 16px; }
.bf-counter__btn {
  width: 40px; height: 40px; border: 1.5px solid #e4dccf; border-radius: 6px;
  background: #fffdf8; font-size: 1.2rem; cursor: pointer; color: #243027;
  transition: all 140ms ease; font-family: inherit;
}
.bf-counter__btn:hover:not(:disabled) { background: #f0ebe1; border-color: #9db39e; }
.bf-counter__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.bf-counter__val { font-size: 1.5rem; font-weight: 700; color: #202920; min-width: 32px; text-align: center; }

/* Slots */
.bf-slots { display: flex; flex-direction: column; gap: 10px; }
.bf-slot { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.bf-slot__radio { width: 18px; height: 18px; accent-color: #26372c; flex-shrink: 0; cursor: pointer; }
.bf-slot__label { font-size: 0.95rem; font-weight: 500; color: #243027; }

/* Specials */
.bf-specials { display: flex; flex-direction: column; gap: 14px; }
.bf-special-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bf-special-label { font-size: 0.95rem; color: #243027; }
.bf-select {
  padding: 8px 12px; border: 1.5px solid #e4dccf; border-radius: 6px;
  background: #fffdf8; font-size: 0.9rem; color: #243027; font-family: inherit;
  cursor: pointer; min-width: 80px;
}

/* Fields */
.bf-field { margin-bottom: 14px; }
.bf-label { display: block; font-size: 0.85rem; font-weight: 600; color: #465146; margin-bottom: 6px; }
.bf-input {
  width: 100%; padding: 10px 12px; border: 1.5px solid #e4dccf; border-radius: 6px;
  background: #fffdf8; font-size: 0.95rem; color: #243027; font-family: inherit;
  box-sizing: border-box; transition: border-color 140ms ease;
}
.bf-input:focus { outline: none; border-color: #26372c; }
.bf-input--textarea { resize: vertical; min-height: 80px; }

.bf-hint { margin: 8px 0 0; color: #94a3b8; font-size: 0.82rem; }
.bf-error { color: #991b1b; font-size: 0.9rem; margin: 0; }

/* Summary */
.bf-summary {
  background: #f5f1e9; border: 1.5px solid #dbd4c7; padding: 24px;
  margin-bottom: 16px;
}
.bf-summary__title { margin: 0 0 16px; font-size: 1rem; font-weight: 640; color: #202920; }
.bf-summary__rows { display: flex; flex-direction: column; gap: 0; }
.bf-summary__row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 8px 0; border-bottom: 1px solid #e4dccf;
  font-size: 0.9rem; color: #465146;
}
.bf-summary__row:last-child { border-bottom: none; }
.bf-summary__row--total { font-weight: 700; font-size: 1rem; color: #202920; padding-top: 12px; }
.bf-summary__note { margin: 14px 0 0; font-size: 0.82rem; color: #7b947e; line-height: 1.6; }

/* Buttons */
.bf-btn {
  display: block; width: 100%; min-height: 52px; padding: 14px 24px;
  border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 160ms ease; border: none; text-align: center;
  text-decoration: none;
}
.bf-btn--primary { background: #26372c; color: #fffdf8; }
.bf-btn--primary:hover:not(:disabled) { background: #3c5543; }
.bf-btn--primary:disabled { opacity: 0.45; cursor: not-allowed; }
.bf-btn--outline {
  background: transparent; color: #26372c; border: 1.5px solid #26372c;
  display: inline-block; width: auto;
}
.bf-btn--outline:hover { background: #f0ebe1; }

/* Status badge */
.bf-status-badge {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 100px; font-size: 0.78rem; font-weight: 600;
}

/* Orders list */
.bf-orders { display: flex; flex-direction: column; gap: 12px; }
.bf-order { padding: 12px; background: #f5f1e9; border-radius: 6px; }
.bf-order__header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
.bf-order__dates { font-size: 0.9rem; font-weight: 600; color: #243027; }
.bf-order__meta { font-size: 0.82rem; color: #626a63; }
</style>
