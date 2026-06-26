<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string

interface PartnerOrder {
  id: number
  apartment: string
  guestName: string
  guestPhone: string | null
  selectedDates: string[]
  deliverySlot: string
  breakfastCount: number
  vegetarianCount: number
  glutenFreeCount: number
  guestNotes: string | null
  totalPrice: number
  status: string
  actionable: boolean
  confirmedAt: string | null
  rejectedAt: string | null
  createdAt: string
}

const { data, error } = await useFetch<PartnerOrder>(`/api/partner/breakfast/${token}`)

const confirming = ref(false)
const rejecting = ref(false)
const done = ref('')
const actionError = ref('')

async function confirm() {
  confirming.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/partner/breakfast/${token}/confirm`, { method: 'POST' })
    done.value = 'confirmed'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    confirming.value = false
  }
}

async function reject() {
  if (!window.confirm('Ste prepričani, da želite zavrniti naročilo? Plačilo bo vrnjeno gostu.')) return
  rejecting.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/partner/breakfast/${token}/reject`, { method: 'POST' })
    done.value = 'rejected'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    rejecting.value = false
  }
}

function fmt(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="partner-wrap">
    <header class="partner-header">
      <div class="partner-header__inner">
        <img src="/logo-text-only.webp" alt="Maple & Pine Bled" class="partner-logo" />
        <span class="partner-header__sub">Partner portal</span>
      </div>
    </header>

    <main class="partner-main">

      <div v-if="error" class="partner-card partner-card--error">
        <h1>Naročilo ni najdeno</h1>
        <p>{{ (error as any).data?.statusMessage ?? 'Ta povezava ni veljavna ali je naročilo bilo izbrisano.' }}</p>
      </div>

      <div v-else-if="data" class="partner-card">

        <div v-if="done === 'confirmed'" class="partner-done partner-done--ok">
          <div class="partner-done__icon">✓</div>
          <h2>Naročilo potrjeno</h2>
          <p>Zahvaljujemo se za potrditev. Gost bo obveščen.</p>
        </div>

        <div v-else-if="done === 'rejected'" class="partner-done partner-done--rejected">
          <div class="partner-done__icon">✗</div>
          <h2>Naročilo zavrnjeno</h2>
          <p>Plačilo bo vrnjeno gostu. Hvala za obvestilo.</p>
        </div>

        <template v-else>
          <div class="partner-badge" :class="{
            'partner-badge--sent': data.status === 'sent_to_partner',
            'partner-badge--confirmed': data.status === 'confirmed_by_partner',
            'partner-badge--rejected': data.status === 'rejected_by_partner',
          }">
            {{ data.status === 'confirmed_by_partner' ? 'Potrjeno' : data.status === 'rejected_by_partner' ? 'Zavrnjeno' : 'Čaka potrditev' }}
          </div>

          <h1 class="partner-title">Naročilo zajtrka #{{ data.id }}</h1>

          <table class="partner-table">
            <tbody>
              <tr><td>Apartma</td><td><strong>{{ data.apartment }}</strong></td></tr>
              <tr><td>Gost</td><td>{{ data.guestName }}</td></tr>
              <tr><td>Telefon gosta</td><td>{{ data.guestPhone ?? '—' }}</td></tr>
              <tr>
                <td>Datumi dostave</td>
                <td>
                  <div v-for="d in data.selectedDates" :key="d">{{ fmt(d) }}</div>
                </td>
              </tr>
              <tr><td>Termin dostave</td><td><strong>{{ data.deliverySlot }}</strong></td></tr>
              <tr><td>Število zajtrkov/dan</td><td>{{ data.breakfastCount }}</td></tr>
              <tr v-if="data.vegetarianCount > 0"><td>Vegetarijanski</td><td>{{ data.vegetarianCount }}</td></tr>
              <tr v-if="data.glutenFreeCount > 0"><td>Brez glutena</td><td>{{ data.glutenFreeCount }}</td></tr>
              <tr v-if="data.guestNotes"><td>Opombe</td><td>{{ data.guestNotes }}</td></tr>
              <tr class="partner-table__total"><td>Skupni znesek</td><td><strong>{{ data.totalPrice.toFixed(2) }} EUR</strong></td></tr>
            </tbody>
          </table>

          <!-- Already actioned -->
          <div v-if="data.status === 'confirmed_by_partner'" class="partner-info">
            ✓ Naročilo ste že potrdili {{ data.confirmedAt ? `(${data.confirmedAt.slice(0, 16).replace('T', ' ')})` : '' }}.
          </div>
          <div v-else-if="data.status === 'rejected_by_partner'" class="partner-info partner-info--warn">
            Naročilo ste že zavrnili {{ data.rejectedAt ? `(${data.rejectedAt.slice(0, 16).replace('T', ' ')})` : '' }}.
          </div>

          <!-- Action buttons -->
          <div v-if="data.actionable && data.status === 'sent_to_partner'" class="partner-actions">
            <p v-if="actionError" class="partner-error">{{ actionError }}</p>
            <button class="partner-btn partner-btn--confirm" :disabled="confirming || rejecting" @click="confirm">
              {{ confirming ? 'Potrjujem…' : '✓ Potrdi naročilo' }}
            </button>
            <button class="partner-btn partner-btn--reject" :disabled="confirming || rejecting" @click="reject">
              {{ rejecting ? 'Zavrnjujem…' : '✗ Zavrni naročilo' }}
            </button>
          </div>
        </template>
      </div>

    </main>

    <footer class="partner-footer">
      Maple &amp; Pine Apartments · Bled, Slovenia
    </footer>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
</style>

<style scoped>
.partner-wrap {
  min-height: 100dvh;
  background: #f5f1e9;
  display: flex;
  flex-direction: column;
}

.partner-header {
  background: #26372c;
  padding: 14px 24px;
}
.partner-header__inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}
.partner-logo { height: 32px; width: auto; display: block; }
.partner-header__sub {
  color: rgba(255,253,248,0.5);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.partner-main {
  flex: 1;
  padding: 32px 16px 64px;
}

.partner-card {
  max-width: 540px;
  margin: 0 auto;
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: clamp(24px, 5vw, 40px);
}
.partner-card--error { text-align: center; color: #991b1b; }

.partner-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.partner-badge--sent { background: #fef9c3; color: #713f12; }
.partner-badge--confirmed { background: #dcfce7; color: #166534; }
.partner-badge--rejected { background: #fee2e2; color: #991b1b; }

.partner-title {
  margin: 0 0 20px;
  font-size: 1.4rem;
  font-weight: 640;
  color: #202920;
}

.partner-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-bottom: 24px;
}
.partner-table td {
  padding: 10px 0;
  border-bottom: 1px solid #e4dccf;
  vertical-align: top;
  line-height: 1.6;
}
.partner-table td:first-child {
  color: #626a63;
  padding-right: 16px;
  white-space: nowrap;
  width: 140px;
}
.partner-table td:last-child { color: #202920; }
.partner-table__total td {
  font-weight: 700;
  font-size: 1rem;
  border-bottom: none;
  padding-top: 14px;
}

.partner-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.partner-btn {
  width: 100%;
  min-height: 50px;
  padding: 13px 20px;
  border-radius: 6px;
  font-size: 0.98rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: background 160ms ease;
}
.partner-btn--confirm { background: #26372c; color: #fffdf8; }
.partner-btn--confirm:hover:not(:disabled) { background: #3c5543; }
.partner-btn--reject { background: transparent; color: #991b1b; border: 1.5px solid #fca5a5; }
.partner-btn--reject:hover:not(:disabled) { background: #fef2f2; }
.partner-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.partner-info {
  margin-top: 0;
  padding: 12px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 0.9rem;
  border-radius: 4px;
}
.partner-info--warn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.partner-done {
  text-align: center;
  padding: 20px 0;
}
.partner-done__icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  font-weight: 700;
}
.partner-done--ok .partner-done__icon { color: #26372c; }
.partner-done--rejected .partner-done__icon { color: #991b1b; }
.partner-done h2 { margin: 0 0 8px; font-size: 1.2rem; color: #202920; }
.partner-done p { margin: 0; color: #626a63; }

.partner-error { color: #991b1b; font-size: 0.9rem; margin: 0 0 8px; }

.partner-footer {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 0.82rem;
  background: #26372c;
  color: rgba(255,253,248,0.4);
}
</style>
