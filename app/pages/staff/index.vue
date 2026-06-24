<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

interface Reservation {
  id: number
  bentralId: string
  name: string
  firstName: string
  lastName: string
  door: string
  checkIn: string
  checkOut: string
  pin: string | null
  accessValidFrom: string | null
  accessValidUntil: string | null
  guestCount: number | null
  guestEmail: string | null
  guestPhone: string | null
  status: string
}

const today = new Date().toISOString().slice(0, 10)
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const { data: calData, refresh, pending } = await useFetch<{ reservations: Reservation[]; allReservations: Reservation[] }>('/api/staff/calendar', {
  query: computed(() => ({ year: currentYear.value, month: currentMonth.value })),
})

const reservations = computed(() => calData.value?.reservations ?? [])
const allReservations = computed(() => calData.value?.allReservations ?? [])

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
}
function goToday() {
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth() + 1
}

// Build array of day objects for the calendar grid
const calendarDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstOfMonth = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()

  // Mon=0 … Sun=6 offset
  let startOffset = firstOfMonth.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days: Array<{ date: string; day: number; thisMonth: boolean }> = []

  // Trailing days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i)
    days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), thisMonth: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      thisMonth: true,
    })
  }
  // Leading days of next month
  const rem = (7 - (days.length % 7)) % 7
  for (let d = 1; d <= rem; d++) {
    const dt = new Date(y, m, d)
    days.push({ date: dt.toISOString().slice(0, 10), day: d, thisMonth: false })
  }
  return days
})

function resvOnDay(date: string): Reservation[] {
  return reservations.value.filter(r => r.checkIn <= date && r.checkOut >= date)
}

function isStart(r: Reservation, date: string) { return r.checkIn === date }
function isEnd(r: Reservation, date: string) { return r.checkOut === date }

function doorBarClass(door: string) {
  if (door.includes(',')) return 'bar--both'
  if (door === 'Maple') return 'bar--maple'
  return 'bar--pine'
}

function doorBadgeClass(door: string) {
  if (door.includes(',')) return 'badge--both'
  if (door === 'Maple') return 'badge--maple'
  return 'badge--pine'
}

// Detail modal
const detail = ref<Reservation | null>(null)
const pinVisible = ref(false)
const extendFrom = ref('')
const extendUntil = ref('')
const extendLoading = ref(false)
const extendError = ref('')
const extendSaved = ref(false)
const pinLoading = ref(false)
const pinError = ref('')
const pinQueued = ref(false)
const sendPinLoading = ref(false)
const sendPinError = ref('')
const sendPinDone = ref(false)

function openDetail(r: Reservation) {
  detail.value = r
  pinVisible.value = false
  extendFrom.value = r.accessValidFrom?.replace(' ', 'T') ?? ''
  extendUntil.value = r.accessValidUntil?.replace(' ', 'T') ?? ''
  extendError.value = ''
  extendSaved.value = false
  pinError.value = ''
  pinQueued.value = false
  sendPinError.value = ''
  sendPinDone.value = false
}

function closeDetail() { detail.value = null }

async function sendPin() {
  if (!detail.value) return
  sendPinLoading.value = true
  sendPinError.value = ''
  sendPinDone.value = false
  try {
    await $fetch(`/api/staff/guests/${detail.value.id}/send-pin`, { method: 'POST' })
    sendPinDone.value = true
  } catch (err: any) {
    sendPinError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    sendPinLoading.value = false
  }
}

async function createPin() {
  if (!detail.value) return
  pinLoading.value = true
  pinError.value = ''
  pinQueued.value = false
  try {
    await $fetch(`/api/staff/guests/${detail.value.id}/create-pin`, { method: 'POST' })
    pinQueued.value = true
    await refresh()
    const fresh = allReservations.value.find(r => r.id === detail.value!.id)
    if (fresh) { detail.value = fresh; pinVisible.value = false }
  } catch (err: any) {
    pinError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    pinLoading.value = false
  }
}

async function submitExtend() {
  if (!detail.value) return
  extendLoading.value = true
  extendError.value = ''
  extendSaved.value = false
  try {
    await $fetch(`/api/staff/guests/${detail.value.id}/extend`, {
      method: 'PATCH',
      body: {
        ...(extendFrom.value ? { accessValidFrom: extendFrom.value } : {}),
        ...(extendUntil.value ? { accessValidUntil: extendUntil.value } : {}),
      },
    })
    extendSaved.value = true
    await refresh()
    const fresh = allReservations.value.find(r => r.id === detail.value!.id)
    if (fresh) detail.value = fresh
  } catch (err: any) {
    extendError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    extendLoading.value = false
  }
}

function formatDt(dt: string | null) {
  if (!dt) return '—'
  return dt
}

function isCurrentMonth() {
  return currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth() + 1
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="cal-header">
      <div class="cal-header__nav">
        <button class="cal-nav-btn" @click="prevMonth" aria-label="Prejšnji mesec">‹</button>
        <h1 class="cal-header__title">
          {{ MONTH_NAMES[currentMonth - 1] }} {{ currentYear }}
        </h1>
        <button class="cal-nav-btn" @click="nextMonth" aria-label="Naslednji mesec">›</button>
      </div>
      <div class="cal-header__actions">
        <button v-if="!isCurrentMonth()" class="cal-today-btn" @click="goToday">Today</button>
        <button class="cal-refresh-btn" :class="{ 'cal-refresh-btn--loading': pending }" @click="refresh()">↻</button>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="cal-grid-wrap">
      <!-- Day-of-week headers -->
      <div class="cal-dow-row">
        <div v-for="d in DAY_NAMES" :key="d" class="cal-dow">{{ d }}</div>
      </div>

      <!-- Day cells -->
      <div class="cal-grid">
        <div
          v-for="cell in calendarDays"
          :key="cell.date"
          class="cal-cell"
          :class="{
            'cal-cell--other': !cell.thisMonth,
            'cal-cell--today': cell.date === today,
          }"
        >
          <span class="cal-cell__num">{{ cell.day }}</span>

          <div
            v-for="r in resvOnDay(cell.date)"
            :key="r.id"
            class="cal-bar"
            :class="[
              doorBarClass(r.door),
              isStart(r, cell.date) && !isEnd(r, cell.date) ? 'cal-bar--start' : '',
              isEnd(r, cell.date) && !isStart(r, cell.date) ? 'cal-bar--end' : '',
              isStart(r, cell.date) && isEnd(r, cell.date) ? 'cal-bar--single' : '',
              !isStart(r, cell.date) && !isEnd(r, cell.date) ? 'cal-bar--mid' : '',
            ]"
            :title="`${r.name} · ${r.door}`"
            @click="openDetail(r)"
          >
            <span v-if="isStart(r, cell.date)" class="cal-bar__pin-dot" :class="r.pin ? 'cal-bar__pin-dot--set' : 'cal-bar__pin-dot--unset'" :title="r.pin ? 'PIN dodeljen' : 'PIN ni dodeljen'" />
            <span v-if="isStart(r, cell.date) || isEnd(r, cell.date) || cell.thisMonth" class="cal-bar__name">
              {{ r.firstName }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="cal-legend">
      <span class="cal-legend__item">
        <span class="cal-legend__dot cal-legend__dot--maple"></span> Maple
      </span>
      <span class="cal-legend__item">
        <span class="cal-legend__dot cal-legend__dot--pine"></span> Pine
      </span>
      <span class="cal-legend__item">
        <span class="cal-legend__dot cal-legend__dot--both"></span> Maple &amp; Pine
      </span>
      <span class="cal-legend__item cal-legend__item--pin">
        <span class="cal-bar__pin-dot cal-bar__pin-dot--set"></span> PIN dodeljen
      </span>
      <span class="cal-legend__item cal-legend__item--pin">
        <span class="cal-bar__pin-dot cal-bar__pin-dot--unset"></span> PIN ni dodeljen
      </span>
    </div>

    <!-- Reservations list for the month -->
    <div class="resv-list">
      <h2 class="resv-list__title">Rezervacije — {{ MONTH_NAMES[currentMonth - 1] }} {{ currentYear }}</h2>
      <div v-if="!allReservations.length" class="resv-list__empty">Ni rezervacij za ta mesec.</div>
      <table v-else class="resv-table">
        <thead>
          <tr>
            <th>Gost</th>
            <th>Vrata</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>PIN</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in allReservations"
            :key="r.id"
            :class="{ 'resv-row--cancelled': r.status === 'cancelled' }"
            @click="r.status !== 'cancelled' && openDetail(r)"
          >
            <td class="resv-td--name">{{ r.name }}</td>
            <td>{{ r.door }}</td>
            <td>{{ r.checkIn }}</td>
            <td>{{ r.checkOut }}</td>
            <td>
              <span class="resv-pin-badge" :class="r.pin ? 'resv-pin-badge--set' : 'resv-pin-badge--unset'">
                {{ r.pin ? 'Dodeljen' : 'Ni dodeljen' }}
              </span>
            </td>
            <td>
              <span class="resv-status-badge" :class="`resv-status-badge--${r.status}`">{{ r.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail drawer -->
    <Teleport to="body">
      <div v-if="detail" class="drawer-overlay" @click.self="closeDetail">
        <div class="drawer">
          <!-- Close -->
          <button class="drawer__close" @click="closeDetail" aria-label="Zapri">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Guest name + door -->
          <div class="drawer__hero">
            <p class="drawer__name">{{ detail.name }}</p>
            <span class="drawer__badge" :class="doorBadgeClass(detail.door)">{{ detail.door }}</span>
          </div>

          <!-- Info rows -->
          <div class="drawer__rows">
            <div class="drawer__row">
              <span class="drawer__label">Check-in</span>
              <span class="drawer__val">{{ detail.checkIn }}</span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">Check-out</span>
              <span class="drawer__val">{{ detail.checkOut }}</span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">PIN active from</span>
              <span class="drawer__val">{{ detail.accessValidFrom ?? '—' }}</span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">PIN expires</span>
              <span class="drawer__val">{{ detail.accessValidUntil ?? '—' }}</span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">Guests</span>
              <span class="drawer__val">{{ detail.guestCount ?? '—' }}</span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">E-mail</span>
              <span class="drawer__val">
                <a v-if="detail.guestEmail" :href="`mailto:${detail.guestEmail}`" class="drawer__link">{{ detail.guestEmail }}</a>
                <span v-else>—</span>
              </span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">Telefon</span>
              <span class="drawer__val">
                <a v-if="detail.guestPhone" :href="`tel:${detail.guestPhone}`" class="drawer__link">{{ detail.guestPhone }}</a>
                <span v-else>—</span>
              </span>
            </div>
            <div class="drawer__row">
              <span class="drawer__label">Bentral ID</span>
              <span class="drawer__val drawer__val--mono">{{ detail.bentralId }}</span>
            </div>
          </div>

          <!-- PIN -->
          <div class="drawer__pin-row">
            <span class="drawer__label">PIN</span>
            <template v-if="detail.pin">
              <span class="drawer__pin" :class="{ 'drawer__pin--visible': pinVisible }">
                {{ pinVisible ? detail.pin : '• • • •' }}
              </span>
              <button class="drawer__pin-toggle" @click="pinVisible = !pinVisible">
                {{ pinVisible ? 'Skrij' : 'Pokaži' }}
              </button>
            </template>
            <span v-else class="drawer__pin-pending">Nastavlja se…</span>
          </div>

          <!-- PIN actions -->
          <div class="drawer__pin-actions">
            <button
              class="drawer__pin-action-btn"
              :class="detail.pin ? 'drawer__pin-action-btn--regen' : 'drawer__pin-action-btn--create'"
              :disabled="pinLoading"
              @click="createPin"
            >
              {{ pinLoading ? '…' : detail.pin ? 'Kreiraj nov PIN' : 'Kreiraj PIN' }}
            </button>
            <button
              v-if="detail.pin"
              class="drawer__pin-action-btn drawer__pin-action-btn--send"
              :disabled="sendPinLoading"
              @click="sendPin"
            >
              {{ sendPinLoading ? '…' : 'Pošlji PIN' }}
            </button>
            <p v-if="pinError" class="drawer__pin-action-error">{{ pinError }}</p>
            <p v-if="pinQueued" class="drawer__pin-action-ok">✓ V pripravi…</p>
            <p v-if="sendPinError" class="drawer__pin-action-error">{{ sendPinError }}</p>
            <p v-if="sendPinDone" class="drawer__pin-action-ok">✓ Sporočilo poslano</p>
          </div>

          <!-- Adjust access times -->
          <div class="drawer__extend">
            <p class="drawer__extend-title">Uredi čas dostopa</p>
            <div class="drawer__extend-field">
              <label class="drawer__extend-label">Dostop od</label>
              <input v-model="extendFrom" type="datetime-local" class="drawer__extend-input" />
            </div>
            <div class="drawer__extend-field">
              <label class="drawer__extend-label">Dostop do</label>
              <input v-model="extendUntil" type="datetime-local" class="drawer__extend-input" />
            </div>
            <button class="drawer__extend-btn" :disabled="extendLoading" @click="submitExtend">
              {{ extendLoading ? '…' : 'Shrani' }}
            </button>
            <p v-if="extendError" class="drawer__extend-error">{{ extendError }}</p>
            <p v-if="extendSaved" class="drawer__extend-ok">✓ Shranjeno</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Header ── */
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.cal-header__nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cal-header__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c2b1f;
  min-width: 180px;
  text-align: center;
}

.cal-nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #475569;
  cursor: pointer;
  transition: background 120ms, border-color 120ms;
  line-height: 1;
}
.cal-nav-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

.cal-header__actions { display: flex; align-items: center; gap: 8px; }

.cal-today-btn {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #475569;
  cursor: pointer;
  transition: background 120ms;
}
.cal-today-btn:hover { background: #f1f5f9; }

.cal-refresh-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #475569;
  cursor: pointer;
  transition: background 120ms;
}
.cal-refresh-btn:hover { background: #f1f5f9; }
.cal-refresh-btn--loading { opacity: 0.5; }

/* ── Calendar grid ── */
.cal-grid-wrap {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.cal-dow-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e2e8f0;
}

.cal-dow {
  padding: 8px 4px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal-cell {
  min-height: 82px;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 6px 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}
.cal-cell:nth-child(7n) { border-right: none; }

.cal-cell--other { background: #fafafa; }
.cal-cell--other .cal-cell__num { color: #cbd5e1; }
.cal-cell--today .cal-cell__num {
  background: #26372c;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-cell__num {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  line-height: 1;
  margin-bottom: 2px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Reservation bars ── */
.cal-bar {
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  padding: 0 5px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 120ms;
  flex-shrink: 0;
  /* Default: continuation (no rounding, full width) */
  border-radius: 0;
  margin-left: -4px;
  margin-right: -4px;
}
.cal-bar:hover { opacity: 0.8; }

.cal-bar--start {
  margin-left: 2px;
  border-radius: 4px 0 0 4px;
}
.cal-bar--end {
  margin-right: 2px;
  border-radius: 0 4px 4px 0;
}
.cal-bar--single {
  margin-left: 2px;
  margin-right: 2px;
  border-radius: 4px;
}

.cal-bar__name {
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  flex: 1;
}

.cal-bar__pin-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 3px;
  pointer-events: none;
}
.cal-bar__pin-dot--set   { background: #86efac; }
.cal-bar__pin-dot--unset { background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); }

/* Colors */
.bar--maple { background: #d97706; color: #fff; }
.bar--pine  { background: #26372c; color: #fffdf8; }
.bar--both  { background: #7c3aed; color: #fff; }

/* ── Legend ── */
.cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-top: 10px;
  padding: 0 2px;
}

.cal-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.cal-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.cal-legend__dot--maple { background: #d97706; }
.cal-legend__dot--pine  { background: #26372c; }
.cal-legend__dot--both  { background: #7c3aed; }

/* ── Reservations list ── */
.resv-list {
  margin-top: 32px;
}

.resv-list__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 10px;
}

.resv-list__empty {
  font-size: 0.88rem;
  color: #94a3b8;
  padding: 12px 0;
}

.resv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.resv-table thead tr {
  border-bottom: 2px solid #e2e8f0;
}

.resv-table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.resv-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 100ms;
  cursor: pointer;
}
.resv-table tbody tr:hover:not(.resv-row--cancelled) { background: #f8fafc; }

.resv-row--cancelled {
  opacity: 0.5;
  cursor: default;
}

.resv-table td {
  padding: 9px 10px;
  color: #334155;
}

.resv-td--name { font-weight: 600; }

.resv-pin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
}
.resv-pin-badge--set   { background: #dcfce7; color: #166534; }
.resv-pin-badge--unset { background: #fef9c3; color: #854d0e; }

.resv-status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
  text-transform: capitalize;
}
.resv-status-badge--active    { background: #dbeafe; color: #1e40af; }
.resv-status-badge--cancelled { background: #fee2e2; color: #991b1b; }
.resv-status-badge--pending   { background: #fef3c7; color: #92400e; }

/* ── Detail drawer ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.drawer {
  background: white;
  width: 100%;
  max-width: 380px;
  height: 100%;
  overflow-y: auto;
  padding: 28px 24px 40px;
  position: relative;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drawer__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  color: #475569;
  transition: background 120ms;
}
.drawer__close:hover { background: #e2e8f0; }

.drawer__hero {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-right: 36px;
}

.drawer__name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.drawer__badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
}
.badge--maple { background: #fef3c7; color: #92400e; }
.badge--pine  { background: #dcfce7; color: #166534; }
.badge--both  { background: #ede9fe; color: #5b21b6; }

.drawer__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.drawer__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 14px;
  border-bottom: 1px solid #f1f5f9;
}
.drawer__row:last-child { border-bottom: none; }

.drawer__label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  flex-shrink: 0;
}

.drawer__val {
  font-size: 0.88rem;
  font-weight: 500;
  color: #1e293b;
  text-align: right;
}
.drawer__val--mono {
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.drawer__link {
  color: #26372c;
  text-decoration: none;
  font-weight: 500;
}
.drawer__link:hover { text-decoration: underline; }

/* PIN row */
.drawer__pin-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.drawer__pin {
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #94a3b8;
  flex: 1;
  transition: color 160ms;
}
.drawer__pin--visible { color: #1e293b; }

.drawer__pin-toggle {
  font-size: 0.75rem;
  font-weight: 600;
  color: #26372c;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.drawer__pin-toggle:hover { text-decoration: underline; }

.drawer__pin-pending {
  font-size: 0.82rem;
  color: #d97706;
  font-style: italic;
}

/* PIN actions */
.drawer__pin-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer__pin-action-btn {
  width: 100%;
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 140ms, opacity 140ms;
}
.drawer__pin-action-btn:disabled { opacity: 0.5; cursor: default; }

.drawer__pin-action-btn--create {
  background: #26372c;
  color: white;
}
.drawer__pin-action-btn--create:hover:not(:disabled) { background: #3c5543; }

.drawer__pin-action-btn--regen {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.drawer__pin-action-btn--regen:hover:not(:disabled) { background: #e2e8f0; }

.drawer__pin-action-btn--send {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.drawer__pin-action-btn--send:hover:not(:disabled) { background: #dbeafe; }

.drawer__pin-action-error {
  margin: 0;
  font-size: 0.82rem;
  color: #dc2626;
}

.drawer__pin-action-ok {
  margin: 0;
  font-size: 0.82rem;
  color: #16a34a;
  font-weight: 600;
}

/* Extend */
.drawer__extend {
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer__extend-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.drawer__extend-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer__extend-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.drawer__extend-row {
  display: flex;
  gap: 8px;
}

.drawer__extend-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  color: #1e293b;
  outline: none;
}
.drawer__extend-input:focus { border-color: #26372c; }

.drawer__extend-btn {
  padding: 8px 16px;
  background: #26372c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 140ms;
  white-space: nowrap;
}
.drawer__extend-btn:hover:not(:disabled) { background: #3c5543; }
.drawer__extend-btn:disabled { opacity: 0.5; cursor: default; }

.drawer__extend-error {
  margin: 0;
  font-size: 0.82rem;
  color: #dc2626;
}

.drawer__extend-ok {
  margin: 0;
  font-size: 0.82rem;
  color: #16a34a;
  font-weight: 600;
}

/* Responsive: full-width drawer on mobile */
@media (max-width: 480px) {
  .drawer-overlay { align-items: flex-end; justify-content: stretch; }
  .drawer { max-width: 100%; height: 85vh; border-radius: 16px 16px 0 0; }
  .cal-cell { min-height: 64px; }
  .cal-header__title { min-width: 140px; font-size: 0.95rem; }
}
</style>
