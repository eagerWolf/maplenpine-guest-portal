<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface StaffUser {
  id: number
  email: string
  role: string
  notification_level: string
  whatsapp_phone: string | null
  notify_housekeeper: number
  notify_checkin: number
  notes: string | null
  active: number
  created_at: string
}

const { data: users, refresh } = await useFetch<StaffUser[]>('/api/admin/users')

const showAdd = ref(false)
const newEmail = ref('')
const newRole = ref<'staff' | 'admin'>('staff')
const newNotificationLevel = ref<'none' | 'errors' | 'all'>('none')
const addLoading = ref(false)
const addError = ref('')

async function addUser() {
  addLoading.value = true
  addError.value = ''
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: { email: newEmail.value, role: newRole.value, notification_level: newNotificationLevel.value },
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
const deletion = useAdminConfirm()

async function removeUser(user: StaffUser) {
  if (!await deletion.ask({ title: 'Odstranim uporabnika?', message: `${user.email} ne bo imel več dostopa do administracije.` })) return
  await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
  await refresh()
}

// Per-user notification edit modal
const editUser = ref<StaffUser | null>(null)
const editLevel = ref<'none' | 'errors' | 'all'>('none')
const editPhone = ref('')
const editNotifyHousekeeper = ref(false)
const editNotifyCheckin = ref(false)
const editNotes = ref('')
const editActive = ref(true)
const editLoading = ref(false)
const editError = ref('')
const editSaved = ref(false)

function openEdit(u: StaffUser) {
  editUser.value = u
  editLevel.value = (u.notification_level as 'none' | 'errors' | 'all') || 'none'
  editPhone.value = u.whatsapp_phone ?? ''
  editNotifyHousekeeper.value = !!u.notify_housekeeper
  editNotifyCheckin.value = !!u.notify_checkin
  editNotes.value = u.notes ?? ''
  editActive.value = !!u.active
  editError.value = ''
  editSaved.value = false
}

function closeEdit() {
  editUser.value = null
}

async function saveEdit() {
  if (!editUser.value) return
  editLoading.value = true
  editError.value = ''
  editSaved.value = false
  try {
    await $fetch(`/api/admin/users/${editUser.value.id}`, {
      method: 'PATCH',
      body: {
        notification_level: editLevel.value,
        whatsapp_phone: editPhone.value,
        notify_housekeeper: editNotifyHousekeeper.value,
        notify_checkin: editNotifyCheckin.value,
        notes: editNotes.value,
        active: editActive.value,
      },
    })
    editSaved.value = true
    await refresh()
    setTimeout(closeEdit, 800)
  } catch (err: any) {
    editError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    editLoading.value = false
  }
}

function formatDate(iso: string) {
  return iso.slice(0, 10)
}

function levelLabel(level: string) {
  return ({ none: 'Brez', errors: 'Napake', all: 'Vse' } as Record<string, string>)[level] ?? level
}

function levelClass(level: string) {
  return ({
    none: 'bg-stone-100 text-stone-500',
    errors: 'bg-amber-100 text-amber-700',
    all: 'bg-pine-100 text-pine-700',
  } as Record<string, string>)[level] ?? 'bg-stone-100 text-stone-500'
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
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
        <select
          v-model="newNotificationLevel"
          class="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 bg-white"
        >
          <option value="none">Brez obvestil</option>
          <option value="errors">Samo napake</option>
          <option value="all">Vsa obvestila</option>
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

    <!-- Mobile user cards -->
    <div class="space-y-3 sm:hidden">
      <article v-for="u in users" :key="u.id" class="rounded-xl border border-stone-200 bg-white p-4" :class="{ 'opacity-50': !u.active }">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="break-all text-sm font-semibold leading-5 text-stone-800">{{ u.email }}</p>
            <p v-if="u.id === currentUser?.id" class="mt-0.5 text-xs text-stone-400">Trenutno prijavljeni uporabnik</p>
          </div>
          <span v-if="!u.active" class="flex-none rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Neaktiven</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="rounded-full px-2 py-1 text-xs font-medium" :class="u.role === 'admin' ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600'">{{ u.role === 'admin' ? 'Admin' : 'Osebje' }}</span>
          <span class="rounded-full px-2 py-1 text-xs font-medium" :class="levelClass(u.notification_level)">{{ levelLabel(u.notification_level) }}</span>
          <span v-if="u.notify_housekeeper" class="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">Opomnik za čiščenje</span>
        </div>
        <p v-if="u.notes" class="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-stone-500">{{ u.notes }}</p>
        <div class="mt-4 flex gap-2 border-t border-stone-100 pt-3">
          <button class="min-h-10 flex-1 rounded-lg border border-stone-300 px-3 text-sm font-medium text-pine-700" @click="openEdit(u)">Uredi</button>
          <button v-if="u.id !== currentUser?.id" class="min-h-10 flex-1 rounded-lg border border-maple-200 bg-maple-50 px-3 text-sm font-medium text-maple-700" @click="removeUser(u)">Odstrani</button>
        </div>
      </article>
    </div>

    <!-- Desktop users table -->
    <div class="relative hidden overflow-x-auto rounded-xl border border-stone-200 bg-white [scrollbar-gutter:stable] sm:block">
      <table class="w-full min-w-[660px] text-sm">
        <thead>
          <tr class="border-b border-stone-200 bg-stone-50">
            <th class="text-left px-4 py-3 font-medium text-stone-600">Email</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600 hidden sm:table-cell">Vloga</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600 hidden sm:table-cell">Obvestila</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Opomnik</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600 hidden md:table-cell">Opombe</th>
            <th class="sticky right-0 z-10 bg-stone-50 px-4 py-3 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.45)]"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr
            v-for="u in users"
            :key="u.id"
            class="group hover:bg-stone-50 transition-opacity"
            :class="{ 'opacity-40': !u.active }"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-stone-800 font-medium">{{ u.email }}</span>
                <span v-if="u.id === currentUser?.id" class="text-xs text-stone-400">(vi)</span>
                <span v-if="!u.active" class="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">Neaktiven</span>
              </div>
              <div class="sm:hidden mt-0.5 flex gap-1.5 flex-wrap">
                <span class="text-xs px-1.5 py-0.5 rounded-full font-medium" :class="u.role === 'admin' ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600'">{{ u.role === 'admin' ? 'Admin' : 'Osebje' }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded-full font-medium" :class="levelClass(u.notification_level)">{{ levelLabel(u.notification_level) }}</span>
              </div>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="u.role === 'admin' ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600'">
                {{ u.role === 'admin' ? 'Admin' : 'Osebje' }}
              </span>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="levelClass(u.notification_level)">
                {{ levelLabel(u.notification_level) }}
              </span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <span v-if="u.notify_housekeeper" class="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Da</span>
              <span v-else class="text-xs text-stone-300">—</span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-stone-500 text-xs max-w-[180px] truncate" :title="u.notes ?? ''">
              {{ u.notes || '—' }}
            </td>
            <td class="sticky right-0 bg-white px-4 py-3 text-right shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.45)] group-hover:bg-stone-50">
              <div class="flex items-center justify-end gap-3 whitespace-nowrap">
              <button
                class="text-xs text-pine-600 hover:underline"
                @click="openEdit(u)"
              >
                Uredi
              </button>
              <button
                v-if="u.id !== currentUser?.id"
                class="text-xs text-maple-600 hover:underline"
                @click="removeUser(u)"
              >
                Odstrani
              </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit notification modal -->
    <Teleport to="body">
      <div v-if="editUser" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeEdit">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          <div class="flex items-start justify-between mb-1">
            <h2 class="font-semibold text-stone-800">Uredi uporabnika</h2>
            <label class="flex items-center gap-2 cursor-pointer select-none mt-0.5">
              <span class="text-xs font-medium" :class="editActive ? 'text-pine-700' : 'text-red-500'">
                {{ editActive ? 'Aktiven' : 'Neaktiven' }}
              </span>
              <div
                class="relative w-9 h-5 rounded-full transition-colors"
                :class="editActive ? 'bg-pine-500' : 'bg-red-400'"
                @click="editActive = !editActive"
              >
                <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" :class="editActive ? 'left-4' : 'left-0.5'" />
              </div>
            </label>
          </div>
          <p class="text-sm text-stone-400 mb-5">{{ editUser.email }}</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">Opombe</label>
              <input
                v-model="editNotes"
                type="text"
                placeholder="npr. čiščenje, sprejemi, nadomeščanje…"
                class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">Nivo obvestil</label>
              <select
                v-model="editLevel"
                class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 bg-white"
              >
                <option value="none">Brez obvestil</option>
                <option value="errors">Samo napake (job_failed, pin_send_failed, sync_error)</option>
                <option value="all">Vsa obvestila (vključno z PIN dodan/posodobljen)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">WhatsApp številka</label>
              <input
                v-model="editPhone"
                type="tel"
                placeholder="+386 40 123 456"
                class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
              />
              <p class="text-xs text-stone-400 mt-1">Prazno = samo email obvestila</p>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer select-none">
                <div
                  class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                  :class="editNotifyHousekeeper ? 'bg-purple-500' : 'bg-stone-300'"
                  @click="editNotifyHousekeeper = !editNotifyHousekeeper"
                >
                  <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" :class="editNotifyHousekeeper ? 'left-5' : 'left-1'" />
                </div>
                <span class="text-sm font-medium text-stone-700">Opomnik za čiščenje</span>
              </label>
              <p class="text-xs text-stone-400 mt-1 ml-14">WhatsApp 24h pred odjavo gosta. Zahteva WhatsApp številko.</p>
            </div>
            <div>
              <label class="flex items-center gap-3 cursor-pointer select-none">
                <div
                  class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                  :class="editNotifyCheckin ? 'bg-purple-500' : 'bg-stone-300'"
                  @click="editNotifyCheckin = !editNotifyCheckin"
                >
                  <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" :class="editNotifyCheckin ? 'left-5' : 'left-1'" />
                </div>
                <span class="text-sm font-medium text-stone-700">Opomnik za sprejem</span>
              </label>
              <p class="text-xs text-stone-400 mt-1 ml-14">WhatsApp 24h pred prihodom gosta. Zahteva WhatsApp številko.</p>
            </div>
          </div>

          <div v-if="editError" class="mt-3 text-sm text-red-600">{{ editError }}</div>
          <div v-if="editSaved" class="mt-3 text-sm text-pine-700 font-medium">✓ Shranjeno</div>

          <div class="flex gap-3 mt-5">
            <button
              class="flex-1 bg-pine-600 hover:bg-pine-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              :disabled="editLoading"
              @click="saveEdit"
            >
              {{ editLoading ? 'Shranjujem…' : 'Shrani' }}
            </button>
            <button
              class="flex-1 text-stone-600 hover:bg-stone-100 text-sm font-medium py-2 rounded-lg transition-colors"
              @click="closeEdit"
            >
              Prekliči
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <AdminConfirmDialog :open="deletion.open.value" :title="deletion.title.value" :message="deletion.message.value" :confirm-label="deletion.confirmLabel.value" @confirm="deletion.confirm" @cancel="deletion.cancel" />
  </div>
</template>
