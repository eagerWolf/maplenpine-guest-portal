<script setup lang="ts">
defineProps<{ recurring: boolean; validFrom: string; validTo: string }>()
const emit = defineEmits<{
  'update:recurring': [boolean]
  'update:validFrom': [string]
  'update:validTo': [string]
}>()
</script>

<template>
  <fieldset class="rounded-xl border border-stone-200 bg-stone-50 p-4">
    <legend class="px-1 text-sm font-medium text-stone-700">Veljavnost (neobvezno)</legend>
    <label class="mb-3 flex items-center gap-2 text-sm text-stone-600">
      <input :checked="recurring" type="checkbox" class="rounded" @change="emit('update:recurring', ($event.target as HTMLInputElement).checked)" />
      Ponovi vsako leto (leto se ne upošteva)
    </label>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label class="text-xs font-medium text-stone-600">Veljavno od
        <input :value="validFrom" :type="recurring ? 'text' : 'date'" :placeholder="recurring ? 'MM-DD, npr. 12-01' : ''" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" @input="emit('update:validFrom', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-xs font-medium text-stone-600">Veljavno do
        <input :value="validTo" :type="recurring ? 'text' : 'date'" :placeholder="recurring ? 'MM-DD, npr. 03-31' : ''" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" @input="emit('update:validTo', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <p class="mt-2 text-xs text-stone-400">Prazno obdobje pomeni, da je vnos viden vedno. Obdobje lahko prečka novo leto.</p>
  </fieldset>
</template>
