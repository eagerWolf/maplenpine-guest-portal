<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

// --- Jobs (PIN generation events) ---
const jobPage = ref(0)
const perPage = 50

const { data: jobData, pending: jobPending } = await useFetch('/api/admin/logs', {
  query: computed(() => ({ limit: perPage, offset: jobPage.value * perPage })),
})

// --- Sync runs ---
const { data: syncData, pending: syncPending } = await useFetch('/api/admin/sync-runs', {
  query: { limit: 30 },
})

function actionLabel(action: string) {
  return { insert: 'Dodana koda', update: 'Posodobitev', cancel: 'Preklic' }[action] ?? action
}

function statusLabel(status: string) {
  return { success: 'Uspešno', failed: 'Napaka', pending: 'Čaka', in_progress: 'V teku' }[status] ?? status
}

function statusClass(status: string) {
  return {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
  }[status] ?? 'bg-stone-100 text-stone-600'
}

function triggeredByLabel(t: string | null) {
  if (!t) return '—'
  if (t === 'bentral_sync') return 'Bentral sync'
  if (t === 'cron') return 'Samodejno'
  if (t.startsWith('manual:')) return t.replace('manual:', '')
  if (t.startsWith('staff:')) return t.replace('staff:', '')
  return t
}

function syncMessage(run: { isError: boolean; tier: string; from: string | null; to: string | null; fetched: number | null; inserted: number | null; updated: number | null; cancelled: number | null; triggeredBy: string }) {
  const who = run.triggeredBy === 'cron' ? 'Samodejni' : `Ročni (${run.triggeredBy.replace('manual:', '')})`
  if (run.isError) return `${who} sync (${run.tier}) — napaka pri povezavi z Bentral`
  const parts: string[] = []
  if (run.fetched !== null) parts.push(`prebrano ${run.fetched}`)
  if (run.inserted) parts.push(`${run.inserted} nova`)
  if (run.updated) parts.push(`${run.updated} posob.`)
  if (run.cancelled) parts.push(`${run.cancelled} preklic`)
  if (!run.inserted && !run.updated && !run.cancelled) parts.push('brez sprememb')
  return `${who} sync (${run.tier}) — ${parts.join(', ')}`
}

function fmtTs(ts: string) {
  return ts.slice(0, 16).replace('T', ' ')
}

const jobTotalPages = computed(() => Math.ceil((jobData.value?.total ?? 0) / perPage))
</script>

<template>
  <div class="space-y-8">

    <!-- Sync runs -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-semibold text-stone-700">Sinhronizacije iz Bentrala</h2>
        <div class="text-xs text-stone-400">Zadnjih {{ syncData?.runs?.length ?? 0 }} runov</div>
      </div>

      <div class="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
        <div
          v-for="run in syncData?.runs"
          :key="run.id"
          class="flex items-start gap-3 px-4 py-3"
          :class="run.isError ? 'bg-red-50' : ''"
        >
          <span class="text-base mt-0.5 flex-shrink-0">{{ run.isError ? '🔴' : (run.inserted || run.updated || run.cancelled) ? '🟡' : '🟢' }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-stone-700 leading-snug">{{ syncMessage(run) }}</p>
            <p v-if="run.isError && run.error" class="text-xs text-red-600 mt-0.5 break-all">{{ run.error }}</p>
          </div>
          <span class="text-xs text-stone-400 whitespace-nowrap font-mono flex-shrink-0 mt-0.5">{{ fmtTs(run.createdAt) }}</span>
        </div>
        <div v-if="syncPending" class="px-4 py-5 text-center text-stone-400 text-sm">Nalagam…</div>
        <div v-else-if="!syncData?.runs?.length" class="px-4 py-5 text-center text-stone-400 text-sm">
          Še ni sinhronizacij. Ob naslednjem cron runu se bo tukaj pojavil vpis.
        </div>
      </div>
    </div>

    <!-- Job log (PIN generation) -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-semibold text-stone-700">Log aktivnosti (eKey jobi)</h2>
        <div class="text-xs text-stone-400">Skupaj: {{ jobData?.total ?? 0 }}</div>
      </div>

      <div class="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead>
            <tr class="border-b border-stone-200 bg-stone-50">
              <th class="text-left px-4 py-3 font-medium text-stone-600 w-8">#</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Gost</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Vrata</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Akcija</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Sprožil</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Čas</th>
              <th class="text-left px-4 py-3 font-medium text-stone-600">Razlog</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr
              v-for="job in jobData?.jobs"
              :key="job.id"
              class="hover:bg-stone-50 transition-colors"
            >
              <td class="px-4 py-3 text-stone-400 font-mono text-xs">{{ job.id }}</td>
              <td class="px-4 py-3 font-medium text-stone-800">{{ job.guest_name }}</td>
              <td class="px-4 py-3 text-stone-500">{{ job.door }}</td>
              <td class="px-4 py-3 text-stone-600">{{ actionLabel(job.action) }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(job.status)">
                  {{ statusLabel(job.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-stone-500 text-xs">{{ triggeredByLabel(job.triggered_by) }}</td>
              <td class="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">{{ fmtTs(job.created_at) }}</td>
              <td class="px-4 py-3 text-maple-600 text-xs max-w-xs truncate">{{ job.reason ?? '' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="jobPending" class="px-4 py-6 text-center text-stone-400">Nalagam…</div>
        <div v-else-if="!jobData?.jobs?.length" class="px-4 py-6 text-center text-stone-400">
          Ni zapisov.
        </div>
      </div>

      <div v-if="jobTotalPages > 1" class="flex items-center justify-between mt-4 text-sm text-stone-500">
        <button
          class="px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40"
          :disabled="jobPage === 0"
          @click="jobPage--"
        >
          ← Prejšnja
        </button>
        <span>Stran {{ jobPage + 1 }} / {{ jobTotalPages }}</span>
        <button
          class="px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40"
          :disabled="jobPage >= jobTotalPages - 1"
          @click="jobPage++"
        >
          Naslednja →
        </button>
      </div>
    </div>

  </div>
</template>
