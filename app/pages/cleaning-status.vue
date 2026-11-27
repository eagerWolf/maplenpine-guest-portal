<script setup lang="ts">
definePageMeta({middleware:['auth']})
const month=ref(new Date().toISOString().slice(0,7))
const {data,error}=await useFetch<{door:string;date:string;cleanedDoor:string|null;confirmed_at:string|null;confirmed_by_name:string|null}[]>('/api/staff/cleaning-status',{query:{month}})
</script>
<template><section><h1 class="text-xl font-semibold">Pregled čiščenj</h1><label class="block my-4">Mesec <input v-model="month" type="month" class="border rounded p-2" /></label><p v-if="error">Pregleda ni mogoče naložiti.</p><p v-else-if="!data?.length">Ni načrtovanih čiščenj.</p><ul><li v-for="(item,i) in data" :key="i" class="bg-white border rounded p-4 mb-2"><strong>{{ item.date.split('-').reverse().join('.') }} · {{ item.cleanedDoor || item.door }}</strong><p>{{ item.confirmed_at ? 'Pospravljeno' : 'Potrebno čiščenje' }}</p><p v-if="item.confirmed_at">{{ item.confirmed_by_name }} · {{ new Date(item.confirmed_at).toLocaleString('sl-SI', {timeZone:'Europe/Ljubljana'}) }}</p></li></ul></section></template>
