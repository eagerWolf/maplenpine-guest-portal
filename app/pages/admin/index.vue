<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { data: guests } = await useFetch('/api/staff/guests')
const { data: logsData } = await useFetch('/api/admin/logs', { query: { limit: 10, offset: 0 } })

const today = new Date().toISOString().slice(0, 10)

const stats = computed(() => {
  const all = (guests.value as any[]) ?? []
  return {
    total: all.length,
    checkedIn: all.filter((g: any) => g.checkIn <= today && g.checkOut >= today).length,
    noPinYet: all.filter((g: any) => !g.pin).length,
  }
})

const syncLoading = ref(false)
const syncDone = ref(false)

async function triggerSync() {
  syncLoading.value = true
  syncDone.value = false
  try {
    await $fetch('/api/admin/sync', { method: 'POST', body: { tier: 'hot' } })
    syncDone.value = true
    setTimeout(() => { syncDone.value = false }, 3000)
  } finally {
    syncLoading.value = false
  }
}

function actionLabel(action: string) {
  return { insert: 'Dodana koda', update: 'Posodobitev', cancel: 'Preklic' }[action] ?? action
}

function statusClass(status: string) {
  return {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
  }[status] ?? 'bg-stone-100 text-stone-600'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-stone-800">Nadzorna plošča</h1>
      <button
        class="inline-flex items-center gap-2 text-sm bg-pine-600 hover:bg-pine-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        :disabled="syncLoading"
        @click="triggerSync"
      >
        <span v-if="syncLoading">Sinhronizacija…</span>
        <span v-else-if="syncDone">✓ Sproži sync</span>
        <span v-else>↻ Sproži Bentral sync</span>
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-stone-200 p-5">
        <div class="text-2xl font-bold text-stone-800">{{ stats.total }}</div>
        <div class="text-sm text-stone-500 mt-1">Aktivnih rezervacij</div>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-5">
        <div class="text-2xl font-bold text-pine-600">{{ stats.checkedIn }}</div>
        <div class="text-sm text-stone-500 mt-1">Danes prijavljenih</div>
      </div>
      <div
        class="rounded-xl border p-5"
        :class="stats.noPinYet > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-200'"
      >
        <div class="text-2xl font-bold" :class="stats.noPinYet > 0 ? 'text-amber-600' : 'text-stone-800'">
          {{ stats.noPinYet }}
        </div>
        <div class="text-sm mt-1" :class="stats.noPinYet > 0 ? 'text-amber-600' : 'text-stone-500'">
          Brez PIN kode
        </div>
      </div>
    </div>

    <!-- Recent jobs -->
    <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 class="font-medium text-stone-700">Zadnje aktivnosti</h2>
        <NuxtLink to="/admin/logs" class="text-xs text-pine-600 hover:underline">Vsi logi →</NuxtLink>
      </div>
      <div v-if="!logsData?.jobs?.length" class="px-5 py-6 text-sm text-stone-400 text-center">
        Ni aktivnosti.
      </div>
      <div v-else class="divide-y divide-stone-50">
        <div
          v-for="job in logsData.jobs"
          :key="job.id"
          class="px-5 py-3 flex items-center gap-3 text-sm"
        >
          <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(job.status)">
            {{ job.status }}
          </span>
          <span class="font-medium text-stone-700 flex-1">{{ job.guest_name }}</span>
          <span class="text-stone-500">{{ actionLabel(job.action) }}</span>
          <span class="text-xs text-stone-400 hidden sm:block">{{ job.created_at.slice(0, 16).replace('T', ' ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
