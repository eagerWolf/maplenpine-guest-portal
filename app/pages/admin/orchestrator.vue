<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface OrchestratorJob {
  id: number
  guestName: string
  door: string
  status: string
  triggeredBy: string | null
  createdAt: string
  mergesWithCount: number
  orchestratorPayload: Record<string, unknown>
}

const { data, refresh, pending } = await useFetch<{
  jobs: OrchestratorJob[]
  autoPublishEnabled: boolean
  batchPayload: { jobs: Record<string, unknown>[] }
}>('/api/admin/orchestrator/jobs')

const copiedId = ref<number | null>(null)
const copiedAll = ref(false)

function fmtJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

async function copyJob(job: OrchestratorJob) {
  await navigator.clipboard.writeText(fmtJson(job.orchestratorPayload))
  copiedId.value = job.id
  setTimeout(() => { copiedId.value = null }, 2000)
}

async function copyAll() {
  if (!data.value) return
  await navigator.clipboard.writeText(fmtJson(data.value.batchPayload))
  copiedAll.value = true
  setTimeout(() => { copiedAll.value = false }, 2000)
}

function statusLabel(status: string) {
  return ({ pending: 'Čaka', in_progress: 'V teku' } as Record<string, string>)[status] ?? status
}

function statusClass(status: string) {
  return ({
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
  } as Record<string, string>)[status] ?? 'bg-stone-100 text-stone-600'
}

function fmtTs(ts: string) {
  return ts.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-stone-800">Orchestrator</h1>
      <button
        class="text-sm px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
        :disabled="pending"
        @click="refresh()"
      >
        ↻ Osveži
      </button>
    </div>

    <p class="text-sm text-stone-500 -mt-2">
      Pregled čakajočih jobov, ki jih bo pobral orchestrator ob naslednjem pollu (GET /api/orchestrator/jobs).
      Ta stran je samo za pregled — ne spremeni stanja jobov. Jobi za isto rezervacijo se v dejanskem klicu
      združijo v enega (spodaj vsak prikazan posebej, "Kopiraj celoten JSON" pa vsebuje že združeno različico).
    </p>

    <div
      v-if="data && !data.autoPublishEnabled"
      class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800"
    >
      ⚠ "Samodejno izdaj eKey" je izklopljen v nastavitvah — orchestrator bo ob naslednjem pollu prejel prazen seznam, ne glede na spodnjo čakalno vrsto.
    </div>

    <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 class="font-medium text-stone-700">Čakalna vrsta ({{ data?.jobs.length ?? 0 }})</h2>
        <button
          v-if="data?.jobs.length"
          class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          :class="copiedAll ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'"
          @click="copyAll"
        >
          {{ copiedAll ? '✓ Kopirano' : 'Kopiraj celoten JSON' }}
        </button>
      </div>

      <div v-if="pending" class="px-5 py-6 text-center text-stone-400 text-sm">Nalagam…</div>
      <div v-else-if="!data?.jobs.length" class="px-5 py-6 text-center text-stone-400 text-sm">
        Ni čakajočih jobov.
      </div>
      <div v-else class="divide-y divide-stone-100">
        <div v-for="job in data.jobs" :key="job.id" class="px-5 py-4">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-stone-800">{{ job.guestName }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(job.status)">
                  {{ statusLabel(job.status) }}
                </span>
                <span v-if="job.mergesWithCount" class="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                  Združen z {{ job.mergesWithCount }} {{ job.mergesWithCount === 1 ? 'drugim jobom' : 'drugimi jobi' }}
                </span>
              </div>
              <p class="text-xs text-stone-400 mt-0.5">
                {{ job.door }} · {{ fmtTs(job.createdAt) }} · sprožil: {{ job.triggeredBy ?? '—' }}
              </p>
            </div>
            <button
              class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              :class="copiedId === job.id ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'"
              @click="copyJob(job)"
            >
              {{ copiedId === job.id ? '✓ Kopirano' : 'Kopiraj JSON' }}
            </button>
          </div>
          <pre class="mt-3 bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-700 overflow-x-auto">{{ fmtJson(job.orchestratorPayload) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
