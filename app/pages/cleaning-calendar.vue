<script setup lang="ts">
definePageMeta({layout:'auth'})
const session=useUserSession()
await session.fetch()
if(!session.loggedIn.value) await navigateTo('/login')
const month=ref(new Date().toISOString().slice(0,7))
const {data,error}=await useFetch<{door:string;date:string;completed:number}[]>('/api/staff/cleaning-calendar',{query:{month}})
async function logout(){await $fetch('/api/auth/logout',{method:'POST'});await navigateTo('/login')}
</script>
<template>
 <main class="w-full max-w-3xl p-5 bg-white rounded-xl">
  <div class="flex justify-between gap-4"><h1 class="text-xl font-semibold">Koledar čiščenj</h1><button @click="logout">Odjava</button></div>
  <label class="block my-5">Mesec <input v-model="month" type="month" class="border rounded p-2" /></label>
  <p v-if="error">Koledarja ni bilo mogoče naložiti.</p>
  <p v-else-if="!data?.length">Ta mesec ni načrtovanih čiščenj.</p>
  <ul><li v-for="(item,i) in data" :key="i" class="border-b py-4 flex justify-between gap-3"><span>{{ item.date.split('-').reverse().join('.') }} · {{ item.door.replace(',', ' in ') }}</span><span>{{ item.completed ? 'Pospravljeno' : 'Potrebno čiščenje' }}</span></li></ul>
 </main>
</template>
