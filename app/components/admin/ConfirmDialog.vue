<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
}>(), { title: 'Potrditev brisanja', confirmLabel: 'Izbriši' })
const emit = defineEmits<{ confirm: []; cancel: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') emit('cancel')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-150" enter-from-class="opacity-0" leave-active-class="transition duration-100" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-[2px]" role="presentation" @click.self="emit('cancel')">
        <div role="alertdialog" aria-modal="true" :aria-labelledby="`confirm-title-${$attrs.id || 'admin'}`" class="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-maple-50 text-xl text-maple-600">!</div>
              <div class="min-w-0">
                <h2 :id="`confirm-title-${$attrs.id || 'admin'}`" class="text-lg font-semibold text-stone-800">{{ title }}</h2>
                <p class="mt-2 text-sm leading-6 text-stone-500">{{ message }}</p>
                <p class="mt-2 text-xs text-stone-400">Tega dejanja ni mogoče razveljaviti.</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col-reverse gap-2 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" class="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100" @click="emit('cancel')">Prekliči</button>
            <button type="button" class="rounded-lg bg-maple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-maple-700" autofocus @click="emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
