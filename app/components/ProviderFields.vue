<script setup lang="ts">
defineProps<{
  provider: Record<string, any>
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <label v-if="!provider.id" class="sm:col-span-2 text-sm text-stone-600">Ime ponudnika
      <input v-model="provider.name" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">Kontaktna oseba
      <input v-model="provider.contact_name" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">WhatsApp
      <input v-model="provider.whatsapp" placeholder="+386 ..." class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono" />
    </label>
    <label class="sm:col-span-2 text-sm text-stone-600">E-pošta
      <input v-model="provider.contact_email" type="email" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">Strošek ponudnika / zajtrk
      <input v-model.number="provider.breakfast_cost" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">Marža / zajtrk
      <input v-model.number="provider.breakfast_margin" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">Rok naročila (ura)
      <input v-model.number="provider.breakfast_cutoff_hour" type="number" min="0" max="23" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">Min. število
      <input v-model.number="provider.breakfast_min_count" type="number" min="1" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="text-sm text-stone-600">Max. število brez podatka o gostih
      <input v-model.number="provider.breakfast_max_count" type="number" min="1" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
    <label class="sm:col-span-2 text-sm text-stone-600">Interne opombe
      <textarea v-model="provider.notes" rows="2" class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
    </label>
  </div>
</template>
