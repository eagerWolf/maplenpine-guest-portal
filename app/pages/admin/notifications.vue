<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface NotificationRow {
  id: number
  user_email: string | null
  channel: string
  event_type: string
  recipient: string
  subject: string | null
  status: string
  error: string | null
  reference_id: number | null
  created_at: string
}

const PAGE = 50

const page = ref(0)
const filterEvent = ref('')
const filterChannel = ref('')
const filterStatus = ref('')

const query = computed(() => ({
  limit: PAGE,
  offset: page.value * PAGE,
  ...(filterEvent.value ? { event_type: filterEvent.value } : {}),
  ...(filterChannel.value ? { channel: filterChannel.value } : {}),
  ...(filterStatus.value ? { status: filterStatus.value } : {}),
}))

const { data, refresh, pending } = await useFetch<{ rows: NotificationRow[]; total: number }>(
  '/api/admin/notification-log',
  { query },
)

const rows = computed(() => data.value?.rows ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE)))

watch([filterEvent, filterChannel, filterStatus], () => { page.value = 0 })

function eventLabel(e: string) {
  return ({
    job_failed: 'Napaka joba',
    pin_send_failed: 'Napaka pošiljanja',
    sync_error: 'Bentral sync napaka',
    pin_added: 'PIN dodan',
    pin_updated: 'PIN posodobljen',
    housekeeper_reminder: 'Opomnik čistilki',
  } as Record<string, string>)[e] ?? e
}

function eventClass(e: string) {
  const critical = ['job_failed', 'pin_send_failed', 'sync_error']
  if (critical.includes(e)) return 'bg-red-50 text-red-700'
  if (e === 'housekeeper_reminder') return 'bg-purple-50 text-purple-700'
  return 'bg-stone-100 text-stone-600'
}

function channelIcon(ch: string) {
  return ch === 'whatsapp' ? '📱' : '✉️'
}

function statusClass(s: string) {
  return s === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
}

function fmtDate(iso: string) {
  return iso.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-stone-800">Log obvestil</h1>
      <button class="text-sm text-pine-600 hover:underline" :disabled="pending" @click="refresh()">
        {{ pending ? 'Nalagam…' : '↻ Osveži' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <select
        v-model="filterEvent"
        class="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pine-500"
      >
        <option value="">Vsi dogodki</option>
        <option value="job_failed">Napaka joba</option>
        <option value="pin_send_failed">Napaka pošiljanja</option>
        <option value="sync_error">Bentral sync napaka</option>
        <option value="pin_added">PIN dodan</option>
        <option value="pin_updated">PIN posodobljen</option>
        <option value="housekeeper_reminder">Opomnik čistilki</option>
      </select>
      <select
        v-model="filterChannel"
        class="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pine-500"
      >
        <option value="">Vsi kanali</option>
        <option value="email">Email</option>
        <option value="whatsapp">WhatsApp</option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pine-500"
      >
        <option value="">Vsi statusi</option>
        <option value="sent">Poslano</option>
        <option value="failed">Napaka</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div v-if="!rows.length" class="px-5 py-10 text-sm text-stone-400 text-center">
        Ni obvestil.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-stone-200 bg-stone-50">
              <th class="text-left px-4 py-3 font-medium text-stone-600 whitespace-nowrap">Čas</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Dogodek</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Kanal</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Prejemnik</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Napaka</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="row in rows" :key="row.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">{{ fmtDate(row.created_at) }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="eventClass(row.event_type)">
                  {{ eventLabel(row.event_type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-stone-600">
                <span class="text-base" :title="row.channel">{{ channelIcon(row.channel) }}</span>
              </td>
              <td class="px-4 py-3 text-stone-700 text-xs font-mono">{{ row.recipient }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(row.status)">
                  {{ row.status === 'sent' ? 'Poslano' : 'Napaka' }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-red-500 max-w-xs truncate" :title="row.error ?? ''">
                {{ row.error ?? '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-sm text-stone-500">
      <span>{{ total }} skupaj · stran {{ page + 1 }} / {{ totalPages }}</span>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 border border-stone-300 rounded-lg hover:bg-stone-100 disabled:opacity-40"
          :disabled="page === 0"
          @click="page--"
        >
          ←
        </button>
        <button
          class="px-3 py-1 border border-stone-300 rounded-lg hover:bg-stone-100 disabled:opacity-40"
          :disabled="page >= totalPages - 1"
          @click="page++"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>
