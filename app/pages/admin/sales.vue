<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const CATEGORY_LABELS: Record<string, string> = {
  breakfast: 'Zajtrk',
  ebike: 'E-kolesa',
  transfer: 'Transfer',
  laundry: 'Pranje perila',
  activities: 'Aktivnosti',
  other: 'Drugo',
}

interface PartnerOrder {
  id: number
  reservationId: number
  guestName: string
  guestPhone: string | null
  guestEmail: string | null
  apartment: string
  selectedDates: string[]
  deliverySlot: string
  breakfastCount: number
  vegetarianCount: number
  glutenFreeCount: number
  guestNotes: string | null
  partnerProvisionPerUnit: number
  marginPerUnit: number
  totalPrice: number
  partnerName: string | null
  partnerCategory: string | null
  status: string
  paymentId: string | null
  paymentTransactionId: string | null
  refundStatus: string | null
  sentToPartnerAt: string | null
  partnerConfirmedAt: string | null
  partnerRejectedAt: string | null
  cancelledAt: string | null
  refundedAt: string | null
  createdAt: string
}

const statusFilter = ref('')

const { data, refresh } = await useFetch<{ orders: PartnerOrder[]; total: number }>(
  '/api/admin/breakfast/orders',
  { query: computed(() => ({ status: statusFilter.value || undefined, limit: 200 })) },
)

const orders = computed(() => data.value?.orders ?? [])

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Čaka plačilo', cls: 'badge--warn' },
  paid: { label: 'Plačano', cls: 'badge--blue' },
  sent_to_partner: { label: 'Poslano', cls: 'badge--indigo' },
  confirmed_by_partner: { label: 'Potrjeno', cls: 'badge--ok' },
  rejected_by_partner: { label: 'Zavrnjeno', cls: 'badge--err' },
  cancelled: { label: 'Preklicano', cls: 'badge--muted' },
  payment_failed: { label: 'Plačilo neuspešno', cls: 'badge--err' },
  refunded: { label: 'Vrnjeno', cls: 'badge--warn' },
}

const PAID_STATUSES = ['paid', 'sent_to_partner', 'confirmed_by_partner']

// ── Stats ────────────────────────────────────────────────────────────────────
const paidOrders = computed(() => orders.value.filter(o => PAID_STATUSES.includes(o.status)))

const stats = computed(() => {
  const paid = paidOrders.value
  return {
    total: data.value?.total ?? 0,
    paidCount: paid.length,
    revenue: paid.reduce((s, o) => s + o.totalPrice, 0),
    partnerTotal: paid.reduce((s, o) => s + o.breakfastCount * o.selectedDates.length * o.partnerProvisionPerUnit, 0),
    myMargin: paid.reduce((s, o) => s + o.breakfastCount * o.selectedDates.length * o.marginPerUnit, 0),
  }
})

// ── Breakdown by partner category ────────────────────────────────────────────
const breakdown = computed(() => {
  const map = new Map<string, { category: string; orders: number; revenue: number; partnerTotal: number; margin: number }>()
  for (const o of paidOrders.value) {
    const cat = o.partnerCategory ?? 'breakfast'
    const key = cat
    const existing = map.get(key) ?? { category: cat, orders: 0, revenue: 0, partnerTotal: 0, margin: 0 }
    const units = o.breakfastCount * o.selectedDates.length
    existing.orders++
    existing.revenue += o.totalPrice
    existing.partnerTotal += units * o.partnerProvisionPerUnit
    existing.margin += units * o.marginPerUnit
    map.set(key, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
})

// ── Order drawer ─────────────────────────────────────────────────────────────
const selectedOrder = ref<PartnerOrder | null>(null)
const actionLoading = ref(false)
const actionError = ref('')

function openOrder(o: PartnerOrder) {
  selectedOrder.value = o
  actionError.value = ''
}

function partnerAmount(o: PartnerOrder) {
  return (o.breakfastCount * o.selectedDates.length * o.partnerProvisionPerUnit).toFixed(2)
}

function myMarginAmt(o: PartnerOrder) {
  return (o.breakfastCount * o.selectedDates.length * o.marginPerUnit).toFixed(2)
}

async function doAction(orderId: number, action: string) {
  actionLoading.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/admin/breakfast/orders/${orderId}`, { method: 'PATCH', body: { action } })
    await refresh()
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = orders.value.find(o => o.id === orderId) ?? null
    }
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    actionLoading.value = false
  }
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('sl-SI', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtTs(ts: string | null) {
  if (!ts) return '—'
  return ts.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-stone-800 mb-6">Statistika prodaje</h1>

    <!-- KPI Stats -->
    <div class="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Skupaj naročil</div>
        <div class="text-2xl font-bold text-stone-800">{{ stats.total }}</div>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Plačana</div>
        <div class="text-2xl font-bold text-stone-800">{{ stats.paidCount }}</div>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Skupni prihodek</div>
        <div class="text-2xl font-bold text-stone-800">{{ stats.revenue.toFixed(2) }} €</div>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Za partnerje</div>
        <div class="text-2xl font-bold text-stone-800">{{ stats.partnerTotal.toFixed(2) }} €</div>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4 border-pine-200 bg-pine-50">
        <div class="text-xs font-semibold uppercase tracking-wide text-pine-600 mb-1">Moja marža</div>
        <div class="text-2xl font-bold text-pine-700">{{ stats.myMargin.toFixed(2) }} €</div>
      </div>
    </div>

    <!-- Breakdown by service type -->
    <div v-if="breakdown.length > 0" class="bg-white rounded-xl border border-stone-200 overflow-x-auto mb-6">
      <div class="px-4 py-3 border-b border-stone-100 bg-stone-50">
        <h2 class="text-sm font-semibold text-stone-700">Po tipu storitve</h2>
      </div>
      <table class="w-full min-w-[560px] text-sm">
        <thead>
          <tr class="border-b border-stone-100">
            <th class="text-left py-2 px-4 font-medium text-stone-500">Storitev</th>
            <th class="text-right py-2 px-4 font-medium text-stone-500">Naročil</th>
            <th class="text-right py-2 px-4 font-medium text-stone-500">Prihodek</th>
            <th class="text-right py-2 px-4 font-medium text-stone-500">Za partnerja</th>
            <th class="text-right py-2 px-4 font-medium text-pine-600">Marža</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in breakdown" :key="row.category" class="border-b border-stone-50 last:border-0">
            <td class="py-2.5 px-4 font-medium text-stone-700">{{ CATEGORY_LABELS[row.category] ?? row.category }}</td>
            <td class="py-2.5 px-4 text-right text-stone-600">{{ row.orders }}</td>
            <td class="py-2.5 px-4 text-right text-stone-700 font-medium">{{ row.revenue.toFixed(2) }} €</td>
            <td class="py-2.5 px-4 text-right text-stone-600">{{ row.partnerTotal.toFixed(2) }} €</td>
            <td class="py-2.5 px-4 text-right font-semibold text-pine-700">{{ row.margin.toFixed(2) }} €</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Orders table -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-stone-700">Naročila</h2>
      <select v-model="statusFilter" class="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-pine-500">
        <option value="">Vsi statusi</option>
        <option v-for="(v, k) in STATUS_LABELS" :key="k" :value="k">{{ v.label }}</option>
      </select>
    </div>

    <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div v-if="orders.length === 0" class="p-8 text-center text-stone-400">Ni naročil.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-sm">
          <thead>
            <tr class="bg-stone-50 border-b border-stone-200">
              <th class="text-left py-3 px-4 font-semibold text-stone-600">#</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Gost</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Partner</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Datumi</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Prihodek</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Marža</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Status</th>
              <th class="text-left py-3 px-4 font-semibold text-stone-600">Datum</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in orders"
              :key="o.id"
              class="border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors"
              @click="openOrder(o)"
            >
              <td class="py-3 px-4 text-stone-400 font-mono text-xs">{{ o.id }}</td>
              <td class="py-3 px-4 font-medium text-stone-800">{{ o.guestName }}</td>
              <td class="py-3 px-4 text-stone-600 text-xs">
                <span class="font-medium">{{ o.partnerName ?? '—' }}</span>
                <span v-if="o.partnerCategory" class="ml-1 text-stone-400">({{ CATEGORY_LABELS[o.partnerCategory] ?? o.partnerCategory }})</span>
              </td>
              <td class="py-3 px-4 text-stone-600 text-xs">{{ o.selectedDates.map(fmtDate).join(', ') }}</td>
              <td class="py-3 px-4 font-medium text-stone-800">{{ o.totalPrice.toFixed(2) }} €</td>
              <td class="py-3 px-4 font-medium text-pine-700">{{ myMarginAmt(o) }} €</td>
              <td class="py-3 px-4">
                <span class="badge" :class="STATUS_LABELS[o.status]?.cls ?? 'badge--muted'">
                  {{ STATUS_LABELS[o.status]?.label ?? o.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-stone-400 text-xs">{{ fmtTs(o.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order detail drawer -->
    <Transition name="drawer">
      <div v-if="selectedOrder" class="fixed inset-0 z-50 flex justify-end bg-black/20" @click.self="selectedOrder = null">
        <div class="w-full max-w-sm bg-white shadow-2xl overflow-y-auto">

          <div class="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <h2 class="font-semibold text-stone-800">Naročilo #{{ selectedOrder.id }}</h2>
            <button class="text-stone-400 hover:text-stone-600" @click="selectedOrder = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="px-5 py-4 space-y-4 text-sm">
            <div class="space-y-1">
              <div class="flex justify-between"><span class="text-stone-400">Gost</span><span class="font-medium">{{ selectedOrder.guestName }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Apartma</span><span>{{ selectedOrder.apartment }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Tel.</span><span class="font-mono text-xs">{{ selectedOrder.guestPhone ?? '—' }}</span></div>
            </div>

            <div class="border-t border-stone-100 pt-4 space-y-1">
              <div class="flex justify-between"><span class="text-stone-400">Partner</span><span class="font-medium">{{ selectedOrder.partnerName ?? '—' }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Tip storitve</span><span>{{ CATEGORY_LABELS[selectedOrder.partnerCategory ?? ''] ?? '—' }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Datumi</span><span class="text-xs">{{ selectedOrder.selectedDates.map(fmtDate).join(', ') }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Termin</span><span>{{ selectedOrder.deliverySlot }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Število</span><span>{{ selectedOrder.breakfastCount }}</span></div>
              <div v-if="selectedOrder.vegetarianCount" class="flex justify-between"><span class="text-stone-400">Vegetarijanski</span><span>{{ selectedOrder.vegetarianCount }}</span></div>
              <div v-if="selectedOrder.glutenFreeCount" class="flex justify-between"><span class="text-stone-400">Brez glutena</span><span>{{ selectedOrder.glutenFreeCount }}</span></div>
              <div v-if="selectedOrder.guestNotes" class="flex justify-between"><span class="text-stone-400">Opomba</span><span class="text-right max-w-xs">{{ selectedOrder.guestNotes }}</span></div>
            </div>

            <div class="border-t border-stone-100 pt-4 space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-stone-400">Skupaj plačano</span>
                <span class="font-semibold text-stone-800">{{ selectedOrder.totalPrice.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-stone-400">Za partnerja</span>
                <span class="text-stone-600">{{ partnerAmount(selectedOrder) }} €</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-stone-400">Vaša marža</span>
                <span class="font-medium text-pine-700">{{ myMarginAmt(selectedOrder) }} €</span>
              </div>
            </div>

            <div class="border-t border-stone-100 pt-4 space-y-1 text-xs">
              <div class="flex justify-between"><span class="text-stone-400">Status</span><span class="badge" :class="STATUS_LABELS[selectedOrder.status]?.cls">{{ STATUS_LABELS[selectedOrder.status]?.label ?? selectedOrder.status }}</span></div>
              <div class="flex justify-between"><span class="text-stone-400">Naročeno</span><span>{{ fmtTs(selectedOrder.createdAt) }}</span></div>
              <div v-if="selectedOrder.sentToPartnerAt" class="flex justify-between"><span class="text-stone-400">Poslano</span><span>{{ fmtTs(selectedOrder.sentToPartnerAt) }}</span></div>
              <div v-if="selectedOrder.partnerConfirmedAt" class="flex justify-between"><span class="text-stone-400">Potrjeno</span><span>{{ fmtTs(selectedOrder.partnerConfirmedAt) }}</span></div>
              <div v-if="selectedOrder.partnerRejectedAt" class="flex justify-between"><span class="text-stone-400">Zavrnjeno</span><span>{{ fmtTs(selectedOrder.partnerRejectedAt) }}</span></div>
            </div>

            <p v-if="actionError" class="text-xs text-red-600">{{ actionError }}</p>

            <!-- Actions -->
            <div v-if="!['cancelled', 'refunded', 'payment_failed', 'rejected_by_partner'].includes(selectedOrder.status)" class="border-t border-stone-100 pt-4 space-y-2">
              <button
                v-if="['sent_to_partner', 'confirmed_by_partner'].includes(selectedOrder.status)"
                class="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                :disabled="actionLoading"
                @click="doAction(selectedOrder.id, 'resend')"
              >↻ Znova pošlji partnerju</button>
              <button
                v-if="PAID_STATUSES.includes(selectedOrder.status)"
                class="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                :disabled="actionLoading"
                @click="doAction(selectedOrder.id, 'cancel')"
              >Prekliči in vrni plačilo</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: opacity 200ms ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active > div:last-child, .drawer-leave-active > div:last-child { transition: transform 220ms ease; }
.drawer-enter-from > div:last-child, .drawer-leave-to > div:last-child { transform: translateX(100%); }

.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
.badge--ok { background: #dcfce7; color: #166534; }
.badge--blue { background: #dbeafe; color: #1d4ed8; }
.badge--indigo { background: #e0e7ff; color: #3730a3; }
.badge--warn { background: #fef9c3; color: #854d0e; }
.badge--err { background: #fee2e2; color: #991b1b; }
.badge--muted { background: #f1f5f9; color: #64748b; }
</style>
