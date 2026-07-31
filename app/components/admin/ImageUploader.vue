<script setup lang="ts">
const props = defineProps<{ imageUrl?: string | null; uploadUrl: string }>()
const emit = defineEmits<{ uploaded: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref('')

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const form = new FormData()
    form.append('image', file)
    await $fetch(props.uploadUrl, { method: 'POST', body: form })
    emit('uploaded')
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Napaka pri nalaganju'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="flex items-center gap-3">
    <img v-if="imageUrl" :src="imageUrl" class="w-20 h-20 object-cover rounded-lg border border-stone-200" />
    <div v-else class="w-20 h-20 rounded-lg border border-dashed border-stone-300 flex items-center justify-center text-stone-300 text-xs text-center">Ni slike</div>
    <div>
      <input ref="fileInput" type="file" accept="image/webp,image/jpeg,image/png" class="hidden" @change="onFileChange" />
      <button
        type="button"
        class="text-xs px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50"
        :disabled="uploading"
        @click="fileInput?.click()"
      >
        {{ uploading ? 'Nalagam…' : (imageUrl ? 'Zamenjaj sliko' : 'Naloži sliko') }}
      </button>
      <p v-if="error" class="text-xs text-red-600 mt-1">{{ error }}</p>
    </div>
  </div>
</template>
