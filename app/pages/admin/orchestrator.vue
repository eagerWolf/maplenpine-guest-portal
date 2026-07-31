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
  orchestratorApiKey: string
  jobsUrl: string
  resultsUrl: string
  batchPayload: { jobs: Record<string, unknown>[] }
}>('/api/admin/orchestrator/jobs')

const copiedId = ref<number | null>(null)
const copiedAll = ref(false)
const settingsForm = reactive({ auto_publish_ekey: '1', orchestrator_api_key: '' })
const savingSettings = ref(false)
const settingsSaved = ref(false)
const settingsError = ref('')
watch(data, value => { if (!value) return; settingsForm.auto_publish_ekey=value.autoPublishEnabled?'1':'0'; settingsForm.orchestrator_api_key=value.orchestratorApiKey }, {immediate:true})

function fmtJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}
async function saveSettings() {
  savingSettings.value=true;settingsSaved.value=false;settingsError.value=''
  if(settingsForm.auto_publish_ekey==='1'&&!settingsForm.orchestrator_api_key.trim()){settingsError.value='Token je obvezen, ko je avtomatska obdelava vključena.';savingSettings.value=false;return}
  try { await $fetch('/api/admin/settings',{method:'POST',body:{...settingsForm}}); settingsSaved.value=true;await refresh();setTimeout(()=>settingsSaved.value=false,3000) }
  catch(err:any){settingsError.value=err?.data?.statusMessage??'Napaka pri shranjevanju'} finally{savingSettings.value=false}
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
      Pregled opravil za zunanji Orchestrator. Windows Orchestrator vsakih 5 minut prevzame čakajoča opravila,
      jih izvede in rezultate vrne portalu. Opravila iste rezervacije se pred prevzemom združijo.
    </p>

    <div class="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div><h2 class="font-medium text-stone-700">Povezava z Orchestratorjem</h2><p class="mt-1 text-sm text-stone-500">Orchestrator uporablja spodnja naslova za prevzem opravil in vračanje rezultatov.</p></div>
      <label class="block text-sm font-medium text-stone-600">Token
        <input v-model="settingsForm.orchestrator_api_key" type="password" placeholder="Vnesi varen skupni token" autocomplete="new-password" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
        <span class="mt-1 block text-xs font-normal text-stone-400">Uporabi se kot <code>Authorization: Bearer …</code> pri obeh smereh komunikacije.</span>
      </label>
      <div><p class="text-sm font-medium text-stone-600">Naslov za prevzem opravil (GET)</p><code class="mt-1 block break-all rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{{ data?.jobsUrl }}</code></div>
      <div><p class="text-sm font-medium text-stone-600">Naslov za vračanje rezultatov (POST)</p><code class="mt-1 block break-all rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{{ data?.resultsUrl }}</code></div>
      <label class="flex items-center justify-between gap-4 cursor-pointer"><div><p class="text-sm font-medium text-stone-700">Avtomatska obdelava eKey</p><p class="text-xs text-stone-400">Dovoli Orchestratorju prevzem čakajočih opravil.</p></div><button type="button" role="switch" :aria-checked="settingsForm.auto_publish_ekey==='1'" class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors" :class="settingsForm.auto_publish_ekey==='1'?'bg-pine-600':'bg-stone-200'" @click="settingsForm.auto_publish_ekey=settingsForm.auto_publish_ekey==='1'?'0':'1'"><span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition" :class="settingsForm.auto_publish_ekey==='1'?'translate-x-5':'translate-x-0'" /></button></label>
      <p v-if="settingsError" class="text-sm text-red-600">{{settingsError}}</p><p v-if="settingsSaved" class="text-sm text-pine-700">✓ Nastavitve shranjene</p><button :disabled="savingSettings" class="rounded-lg bg-pine-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" @click="saveSettings">{{savingSettings?'Shranjujem…':'Shrani nastavitve'}}</button>
    </div>

    <div
      v-if="data && !data.autoPublishEnabled"
      class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800"
    >
      ⚠ Avtomatska obdelava eKey je izklopljena — Orchestrator bo ob naslednjem preverjanju prejel prazen seznam.
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
