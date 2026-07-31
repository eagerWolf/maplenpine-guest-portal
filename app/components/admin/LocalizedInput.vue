<script setup lang="ts">
import { LOCALES } from '~/i18n/translations'

const props = defineProps<{
  modelValue: Record<string, string>
  label: string
  multiline?: boolean
  rows?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [Record<string, string>] }>()

function update(locale: string, value: string) {
  emit('update:modelValue', { ...props.modelValue, [locale]: value })
}
</script>

<template>
  <fieldset class="rounded-xl border border-stone-200 p-4">
    <legend class="px-1 text-sm font-semibold text-stone-700">{{ label }}</legend>
    <div class="space-y-3">
      <label v-for="l in LOCALES" :key="l.code" class="block">
        <span class="mb-1 block text-xs font-semibold text-stone-500">{{ l.label }}</span>
        <textarea
          v-if="multiline"
          :value="modelValue[l.code] ?? ''"
          :rows="rows ?? 3"
          class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          @input="update(l.code, ($event.target as HTMLTextAreaElement).value)"
        />
        <input
          v-else
          type="text"
          :value="modelValue[l.code] ?? ''"
          class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pine-500"
          @input="update(l.code, ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </fieldset>
</template>
