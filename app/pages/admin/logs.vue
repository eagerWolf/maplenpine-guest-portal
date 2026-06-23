<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const page = ref(0)
const perPage = 50

const { data, refresh, pending } = await useFetch('/api/admin/logs', {
  query: computed(() => ({ limit: perPage, offset: page.value * perPage })),
})

function actionLabel(action: string) {
  return {
    insert: 'Dodana koda',
    update: 'Posodobitev',
    cancel: 'Preklic',
  }[action] ?? action
}

function statusLabel(status: string) {
  return {
    success: 'Uspešno',
    failed: 'Napaka',
    pending: 'Čaka',
    in_progress: 'V teku',
  }[status] ?? status
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
  if (t.startsWith('staff:')) return t.replace('staff:', '')
  return t
}

const totalPages = computed(() => Math.ceil((data.value?.total ?? 0) / perPage))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-stone-800">Log aktivnosti</h1>
      <div class="text-sm text-stone-400">Skupaj: {{ data?.total ?? 0 }}</div>
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
            v-for="job in data?.jobs"
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
            <td class="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
              {{ job.created_at.slice(0, 16).replace('T', ' ') }}
            </td>
            <td class="px-4 py-3 text-maple-600 text-xs max-w-xs truncate">{{ job.reason ?? '' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="pending" class="px-4 py-6 text-center text-stone-400">Nalagam…</div>
      <div v-else-if="!data?.jobs?.length" class="px-4 py-6 text-center text-stone-400">
        Ni zapisov.
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-sm text-stone-500">
      <button
        class="px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40"
        :disabled="page === 0"
        @click="page--"
      >
        ← Prejšnja
      </button>
      <span>Stran {{ page + 1 }} / {{ totalPages }}</span>
      <button
        class="px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40"
        :disabled="page >= totalPages - 1"
        @click="page++"
      >
        Naslednja →
      </button>
    </div>
  </div>
</template>
