<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface StaffUser {
  id: number
  email: string
  role: string
  created_at: string
}

const { data: users, refresh } = await useFetch<StaffUser[]>('/api/admin/users')

const showAdd = ref(false)
const newEmail = ref('')
const newRole = ref<'staff' | 'admin'>('staff')
const addLoading = ref(false)
const addError = ref('')

async function addUser() {
  addLoading.value = true
  addError.value = ''
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: { email: newEmail.value, role: newRole.value },
    })
    newEmail.value = ''
    showAdd.value = false
    await refresh()
  } catch (err: any) {
    addError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    addLoading.value = false
  }
}

const { user: currentUser } = useUserSession()

async function removeUser(id: number) {
  if (!confirm('Res odstraniti tega uporabnika?')) return
  await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  await refresh()
}

function formatDate(iso: string) {
  return iso.slice(0, 10)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-stone-800">Upravljanje osebja</h1>
      <button
        class="text-sm bg-pine-600 hover:bg-pine-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        @click="showAdd = !showAdd"
      >
        + Dodaj uporabnika
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showAdd" class="bg-white rounded-xl border border-stone-200 p-5 mb-6">
      <h2 class="font-medium text-stone-700 mb-4">Nov uporabnik</h2>
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="newEmail"
          type="email"
          placeholder="email@primer.si"
          class="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
        />
        <select
          v-model="newRole"
          class="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 bg-white"
        >
          <option value="staff">Osebje</option>
          <option value="admin">Admin</option>
        </select>
        <button
          class="px-4 py-2 bg-pine-600 hover:bg-pine-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          :disabled="addLoading"
          @click="addUser"
        >
          {{ addLoading ? 'Dodajam…' : 'Dodaj' }}
        </button>
        <button
          class="px-4 py-2 text-stone-500 hover:bg-stone-100 text-sm rounded-lg transition-colors"
          @click="showAdd = false"
        >
          Prekliči
        </button>
      </div>
      <div v-if="addError" class="mt-2 text-sm text-maple-600">{{ addError }}</div>
    </div>

    <!-- Users table -->
    <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-stone-200 bg-stone-50">
            <th class="text-left px-4 py-3 font-medium text-stone-600">Email</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600">Vloga</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600 hidden sm:table-cell">Dodan</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr v-for="u in users" :key="u.id" class="hover:bg-stone-50">
            <td class="px-4 py-3 text-stone-800">
              {{ u.email }}
              <span v-if="u.id === currentUser?.id" class="ml-2 text-xs text-stone-400">(vi)</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="u.role === 'admin' ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600'"
              >
                {{ u.role === 'admin' ? 'Admin' : 'Osebje' }}
              </span>
            </td>
            <td class="px-4 py-3 text-stone-400 hidden sm:table-cell">{{ formatDate(u.created_at) }}</td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="u.id !== currentUser?.id"
                class="text-xs text-maple-600 hover:underline"
                @click="removeUser(u.id)"
              >
                Odstrani
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
