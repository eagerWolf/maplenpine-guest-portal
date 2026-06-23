<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

interface Guest {
  id: number
  bentralId: string
  name: string
  firstName: string
  lastName: string
  door: string
  checkIn: string
  checkOut: string
  pin: string | null
  accessValidFrom: string | null
  accessValidUntil: string | null
  status: string
}

const { data: guests, refresh, pending } = await useFetch<Guest[]>('/api/staff/guests')

// Extend modal
const extendTarget = ref<Guest | null>(null)
const extendUntil = ref('')
const extendLoading = ref(false)
const extendError = ref('')

function openExtend(guest: Guest) {
  extendTarget.value = guest
  extendUntil.value = guest.accessValidUntil ?? ''
  extendError.value = ''
}

async function submitExtend() {
  if (!extendTarget.value) return
  extendLoading.value = true
  extendError.value = ''
  try {
    await $fetch(`/api/staff/guests/${extendTarget.value.id}/extend`, {
      method: 'PATCH',
      body: { accessValidUntil: extendUntil.value },
    })
    extendTarget.value = null
    await refresh()
  } catch (err: any) {
    extendError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    extendLoading.value = false
  }
}

const pinVisible = ref<Record<number, boolean>>({})

function today() {
  return new Date().toISOString().slice(0, 10)
}

function isCheckedIn(guest: Guest) {
  return guest.checkIn <= today() && guest.checkOut >= today()
}

function doorBadgeClass(door: string) {
  if (door.includes(',')) return 'bg-purple-100 text-purple-700'
  if (door === 'Maple') return 'bg-amber-100 text-amber-700'
  return 'bg-pine-100 text-pine-700'
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-stone-800">Aktivni gostje</h1>
      <button
        class="text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors"
        @click="refresh()"
      >
        ↻ Osveži
      </button>
    </div>

    <div v-if="pending" class="text-center text-stone-400 py-12">Nalagam…</div>

    <div v-else-if="!guests?.length" class="text-center text-stone-400 py-12 bg-white rounded-xl border border-stone-200">
      Ni aktivnih gostov.
    </div>

    <div v-else class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <!-- Mobile cards -->
      <div class="sm:hidden divide-y divide-stone-100">
        <div v-for="guest in guests" :key="guest.id" class="p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-stone-800">{{ guest.name }}</div>
              <div class="text-xs text-stone-400 mt-0.5">{{ guest.checkIn }} → {{ guest.checkOut }}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="doorBadgeClass(guest.door)">
              {{ guest.door }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="guest.pin">
              <span class="font-mono text-sm font-semibold tracking-widest text-stone-700">
                {{ pinVisible[guest.id] ? guest.pin : '••••' }}
              </span>
              <button class="text-xs text-pine-600" @click="pinVisible[guest.id] = !pinVisible[guest.id]">
                {{ pinVisible[guest.id] ? 'skrij' : 'pokaži' }}
              </button>
            </template>
            <span v-else class="text-xs text-amber-600">PIN se nastavlja…</span>
          </div>
          <div class="text-xs text-stone-500">
            Dostop do: <strong>{{ guest.accessValidUntil ?? '—' }}</strong>
          </div>
          <button
            class="text-xs text-pine-600 border border-pine-200 rounded px-2 py-1 hover:bg-pine-50"
            @click="openExtend(guest)"
          >
            Podaljšaj dostop
          </button>
        </div>
      </div>

      <!-- Desktop table -->
      <table class="hidden sm:table w-full text-sm">
        <thead>
          <tr class="border-b border-stone-200 bg-stone-50">
            <th class="text-left px-4 py-3 font-medium text-stone-600">Gost</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600">Vrata</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600">Check-in</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600">Check-out</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600">PIN</th>
            <th class="text-left px-4 py-3 font-medium text-stone-600">Dostop do</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr
            v-for="guest in guests"
            :key="guest.id"
            class="hover:bg-stone-50 transition-colors"
            :class="isCheckedIn(guest) ? 'bg-pine-50/30' : ''"
          >
            <td class="px-4 py-3 font-medium text-stone-800">{{ guest.name }}</td>
            <td class="px-4 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="doorBadgeClass(guest.door)">
                {{ guest.door }}
              </span>
            </td>
            <td class="px-4 py-3 text-stone-600">{{ guest.checkIn }}</td>
            <td class="px-4 py-3 text-stone-600">{{ guest.checkOut }}</td>
            <td class="px-4 py-3">
              <template v-if="guest.pin">
                <span class="font-mono font-semibold tracking-widest">
                  {{ pinVisible[guest.id] ? guest.pin : '••••' }}
                </span>
                <button
                  class="ml-2 text-xs text-pine-600 hover:underline"
                  @click="pinVisible[guest.id] = !pinVisible[guest.id]"
                >
                  {{ pinVisible[guest.id] ? 'skrij' : 'pokaži' }}
                </button>
              </template>
              <span v-else class="text-xs text-amber-600 italic">nastavlja se…</span>
            </td>
            <td class="px-4 py-3 text-stone-600">{{ guest.accessValidUntil ?? '—' }}</td>
            <td class="px-4 py-3">
              <button
                class="text-xs text-pine-600 border border-pine-200 rounded px-2 py-1 hover:bg-pine-50 transition-colors"
                @click="openExtend(guest)"
              >
                Podaljšaj
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Extend modal -->
    <Teleport to="body">
      <div
        v-if="extendTarget"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        @click.self="extendTarget = null"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
          <h2 class="text-lg font-semibold text-stone-800 mb-1">Podaljšaj dostop</h2>
          <p class="text-sm text-stone-500 mb-4">{{ extendTarget.name }}</p>

          <label class="block text-sm font-medium text-stone-700 mb-1">Nova veljavnost do</label>
          <input
            v-model="extendUntil"
            type="datetime-local"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500 mb-3"
          />

          <div v-if="extendError" class="text-sm text-maple-600 bg-maple-50 rounded px-3 py-2 mb-3">
            {{ extendError }}
          </div>

          <div class="flex gap-2 justify-end">
            <button
              class="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              @click="extendTarget = null"
            >
              Prekliči
            </button>
            <button
              class="px-4 py-2 text-sm bg-pine-600 hover:bg-pine-700 text-white rounded-lg transition-colors disabled:opacity-50"
              :disabled="extendLoading"
              @click="submitExtend"
            >
              {{ extendLoading ? 'Shranjujem…' : 'Shrani' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
