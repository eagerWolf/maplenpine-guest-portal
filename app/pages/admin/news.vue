<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface NewsItem {
  id: number
  title_sl: string
  title_en: string
  content_sl: string
  content_en: string
  active: number
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

const { data: news, refresh } = await useFetch<NewsItem[]>('/api/admin/news')

const showAdd = ref(false)
const newTitleSl = ref('')
const newTitleEn = ref('')
const newContentSl = ref('')
const newContentEn = ref('')
const newValidFrom = ref('')
const newValidTo = ref('')
const addLoading = ref(false)
const addError = ref('')

async function addNews() {
  addLoading.value = true
  addError.value = ''
  try {
    await $fetch('/api/admin/news', {
      method: 'POST',
      body: {
        title_sl: newTitleSl.value,
        title_en: newTitleEn.value,
        content_sl: newContentSl.value,
        content_en: newContentEn.value,
        active: true,
        valid_from: newValidFrom.value || null,
        valid_to: newValidTo.value || null,
      },
    })
    newTitleSl.value = ''
    newTitleEn.value = ''
    newContentSl.value = ''
    newContentEn.value = ''
    newValidFrom.value = ''
    newValidTo.value = ''
    showAdd.value = false
    await refresh()
  } catch (err: any) {
    addError.value = err?.data?.statusMessage ?? 'Napaka'
  } finally {
    addLoading.value = false
  }
}

async function toggleActive(item: NewsItem) {
  await $fetch(`/api/admin/news/${item.id}`, { method: 'PATCH', body: { active: !item.active } })
  await refresh()
}

async function removeNews(id: number) {
  if (!confirm('Res izbrisati to novico?')) return
  await $fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
  await refresh()
}

// Edit modal
const editItem = ref<NewsItem | null>(null)
const editTitleSl = ref('')
const editTitleEn = ref('')
const editContentSl = ref('')
const editContentEn = ref('')
const editActive = ref(true)
const editValidFrom = ref('')
const editValidTo = ref('')
const editLoading = ref(false)
const editError = ref('')
const editSaved = ref(false)

function openEdit(item: NewsItem) {
  editItem.value = item
  editTitleSl.value = item.title_sl
  editTitleEn.value = item.title_en
  editContentSl.value = item.content_sl
  editContentEn.value = item.content_en
  editActive.value = !!item.active
  editValidFrom.value = item.valid_from ?? ''
  editValidTo.value = item.valid_to ?? ''
  editError.value = ''
  editSaved.value = false
}

function closeEdit() {
  editItem.value = null
}

async function saveEdit() {
  if (!editItem.value) return
  editLoading.value = true
  editError.value = ''
  editSaved.value = false
  try {
    await $fetch(`/api/admin/news/${editItem.value.id}`, {
      method: 'PATCH',
      body: {
        title_sl: editTitleSl.value,
        title_en: editTitleEn.value,
        content_sl: editContentSl.value,
        content_en: editContentEn.value,
        active: editActive.value,
        valid_from: editValidFrom.value || null,
        valid_to: editValidTo.value || null,
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

function fmtDate(iso: string) {
  return iso.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-stone-800">Novice za goste</h1>
      <button
        class="text-sm bg-pine-600 hover:bg-pine-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        @click="showAdd = !showAdd"
      >
        + Nova novica
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showAdd" class="bg-white rounded-xl border border-stone-200 p-5 mb-6">
      <h2 class="font-medium text-stone-700 mb-4">Nova novica</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Naslov (SL)</label>
          <input
            v-model="newTitleSl"
            type="text"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Naslov (EN)</label>
          <input
            v-model="newTitleEn"
            type="text"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Vsebina (SL)</label>
          <textarea
            v-model="newContentSl"
            rows="4"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Vsebina (EN)</label>
          <textarea
            v-model="newContentEn"
            rows="4"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Veljavno od <span class="text-stone-400 font-normal">(neobvezno)</span></label>
          <input
            v-model="newValidFrom"
            type="date"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1">Veljavno do <span class="text-stone-400 font-normal">(neobvezno)</span></label>
          <input
            v-model="newValidTo"
            type="date"
            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button
          class="px-4 py-2 bg-pine-600 hover:bg-pine-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          :disabled="addLoading"
          @click="addNews"
        >
          {{ addLoading ? 'Objavljam…' : 'Objavi' }}
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

    <!-- News list -->
    <div class="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
      <div v-if="!news?.length" class="px-5 py-6 text-center text-stone-400 text-sm">Ni novic.</div>
      <div
        v-for="item in news"
        :key="item.id"
        class="px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
        :class="{ 'opacity-50': !item.active }"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-stone-800">{{ item.title_sl }}</span>
            <span class="text-stone-400 text-sm">/ {{ item.title_en }}</span>
            <span v-if="!item.active" class="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-500">Neaktivna</span>
            <span v-if="item.valid_from || item.valid_to" class="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
              {{ item.valid_from ?? '…' }} → {{ item.valid_to ?? '…' }}
            </span>
          </div>
          <p class="text-xs text-stone-400 mt-1">{{ fmtDate(item.created_at) }}</p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <div
              class="relative w-9 h-5 rounded-full transition-colors"
              :class="item.active ? 'bg-pine-500' : 'bg-stone-300'"
              @click="toggleActive(item)"
            >
              <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" :class="item.active ? 'left-4' : 'left-0.5'" />
            </div>
          </label>
          <button class="text-xs text-pine-600 hover:underline" @click="openEdit(item)">Uredi</button>
          <button class="text-xs text-maple-600 hover:underline" @click="removeNews(item.id)">Izbriši</button>
        </div>
      </div>
    </div>

    <!-- Edit modal -->
    <Teleport to="body">
      <div v-if="editItem" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeEdit">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between mb-5">
            <h2 class="font-semibold text-stone-800">Uredi novico</h2>
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <span class="text-xs font-medium" :class="editActive ? 'text-pine-700' : 'text-stone-500'">
                {{ editActive ? 'Aktivna' : 'Neaktivna' }}
              </span>
              <div
                class="relative w-9 h-5 rounded-full transition-colors"
                :class="editActive ? 'bg-pine-500' : 'bg-stone-300'"
                @click="editActive = !editActive"
              >
                <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" :class="editActive ? 'left-4' : 'left-0.5'" />
              </div>
            </label>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">Naslov (SL)</label>
              <input v-model="editTitleSl" type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">Naslov (EN)</label>
              <input v-model="editTitleEn" type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">Vsebina (SL)</label>
              <textarea v-model="editContentSl" rows="4" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-1">Vsebina (EN)</label>
              <textarea v-model="editContentEn" rows="4" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-stone-600 mb-1">Veljavno od <span class="text-stone-400 font-normal">(neobvezno)</span></label>
                <input v-model="editValidFrom" type="date" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-600 mb-1">Veljavno do <span class="text-stone-400 font-normal">(neobvezno)</span></label>
                <input v-model="editValidTo" type="date" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500" />
              </div>
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
  </div>
</template>
