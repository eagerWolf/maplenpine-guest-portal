<script setup lang="ts">
definePageMeta({middleware:['auth','admin']})
type Person={id:number;name:string;email:string;role:string;guest_contact:number;portal_access:number;notifications_enabled:number;staff_manager:number;notify_housekeeper:number;notify_checkin:number;whatsapp_phone:string|null;active:number}
const {data:people,refresh}=await useFetch<Person[]>('/api/admin/users')
const {user:currentUser}=useUserSession()
const deletion=useAdminConfirm()
const deleting=ref<number|null>(null),deleteError=ref('')
async function removePerson(person:Person){
 if(deleting.value!==null) return
 if(!await deletion.ask({title:'Izbrišem osebo?',message:`${person.name || person.email} bo odstranjena iz osebja. Dostop in povezave za čiščenje se prekličejo. Zgodovina potrjenih čiščenj z imenom in časom ostane ohranjena.`,confirmLabel:'Izbriši osebo'})) return
 deleting.value=person.id;deleteError.value=''
 try{await $fetch(`/api/admin/users/${person.id}`,{method:'DELETE'});if(editing.value===person.id)open.value=false;await refresh()}
 catch(e:any){deleteError.value=e?.data?.statusMessage||'Brisanje ni uspelo.'}
 finally{deleting.value=null}
}
const blank=()=>({name:'',email:'',role:'staff',guest_contact:false,portal_access:false,notifications_enabled:true,staff_manager:false,notify_housekeeper:false,notify_checkin:false,whatsapp_phone:'',active:true})
const form=ref(blank()),editing=ref<number|null>(null),open=ref(false),busy=ref(false),error=ref(''),activation=ref('')
function edit(p?:Person){editing.value=p?.id??null;form.value=p?{name:p.name||p.email,email:p.email.endsWith('@staff.invalid')?'':p.email,role:p.role,guest_contact:!!p.guest_contact,portal_access:!!p.portal_access,notifications_enabled:p.notifications_enabled!==0,staff_manager:!!p.staff_manager,notify_housekeeper:!!p.notify_housekeeper,notify_checkin:!!p.notify_checkin,whatsapp_phone:p.whatsapp_phone||'',active:!!p.active}:blank();error.value='';open.value=true}
async function save(){busy.value=true;error.value='';try{const result=await $fetch<{activationUrl?:string|null}>(editing.value?`/api/admin/users/${editing.value}`:'/api/admin/users',{method:editing.value?'PATCH':'POST',body:form.value});activation.value=result.activationUrl||'';await refresh();open.value=false}catch(e:any){error.value=e?.data?.statusMessage||'Shranjevanje ni uspelo.'}finally{busy.value=false}}
function roles(p:Person){return [p.notify_housekeeper?'Čistilka':'',p.notify_checkin?'Sprejem':'',p.staff_manager?'Skrbnik':''].filter(Boolean).join(', ')||'Brez vloge'}
</script>
<template>
 <div><div class="flex justify-between items-center mb-5"><h1 class="text-xl font-semibold">Osebje</h1><button class="bg-pine-600 text-white p-2 rounded" @click="edit()">Dodaj osebo</button></div>
 <p class="text-sm text-stone-500 mb-5">Vloge določajo prejemnike obvestil. Dostop do portala vključite posebej. Čistilka s prijavo vidi samo koledar čiščenj.</p>
 <div v-if="activation" class="p-4 bg-pine-50 mb-5"><label>Aktivacijska povezava — posredujte jo osebi<input :value="activation" readonly class="border p-2 w-full" /></label></div>
 <p v-if="deleteError" role="alert" class="mb-4 text-red-600">{{ deleteError }}</p>
 <div class="space-y-3"><article v-for="p in people" :key="p.id" class="bg-white border rounded-xl p-4 flex justify-between gap-3"><div><h2 class="font-medium">{{ p.name || p.email }}</h2><p>{{ roles(p) }}</p><p class="text-sm text-stone-500">{{ p.whatsapp_phone || 'Brez WhatsApp številke' }} · {{ p.portal_access ? 'Dostop do portala' : 'Brez prijave' }} · {{ p.active ? 'Aktivna oseba' : 'Neaktivna oseba' }}</p></div><div class="flex gap-4 items-start"><button @click="edit(p)">Uredi</button><button v-if="currentUser?.role==='admin' && p.id!==currentUser.id" :disabled="deleting!==null" class="text-red-600 disabled:opacity-50" :aria-label="`Izbriši osebo ${p.name || p.email}`" @click="removePerson(p)">{{ deleting===p.id ? 'Brišem…' : 'Izbriši osebo' }}</button></div></article></div>
 <form v-if="open" class="mt-5 bg-white border rounded-xl p-5 space-y-4" @submit.prevent="save">
 <h2 class="font-semibold">{{ editing ? 'Uredi osebo' : 'Nova oseba' }}</h2>
 <label class="block">Ime<input v-model="form.name" required class="block border rounded p-2 w-full" /></label>
 <label class="block">WhatsApp številka<input v-model="form.whatsapp_phone" type="tel" placeholder="+386…" class="block border rounded p-2 w-full" /></label>
 <fieldset class="flex flex-wrap gap-5"><legend class="mb-2">Vloge za obvestila</legend><label><input v-model="form.notify_housekeeper" type="checkbox" /> Čistilka</label><label><input v-model="form.notify_checkin" type="checkbox" /> Sprejem</label><label><input v-model="form.staff_manager" type="checkbox" /> Skrbnik</label></fieldset>
 <label class="block"><input v-model="form.notifications_enabled" type="checkbox" /> Obveščanje</label>
 <label class="block"><input v-model="form.guest_contact" type="checkbox" /> Kontakt za goste — številka je vidna gostom</label>
 <label class="block"><input v-model="form.portal_access" type="checkbox" /> Dostop do portala</label>
 <template v-if="form.portal_access"><label class="block">Email za prijavo<input v-model="form.email" required type="email" class="block border rounded p-2 w-full" /></label><label class="block">Pravice v portalu<select v-model="form.role" class="block border rounded p-2"><option value="staff">Osebje — glede na vloge</option><option value="admin">Administrator — poln dostop</option></select></label></template>
 <label class="block"><input v-model="form.active" type="checkbox" /> Aktivna oseba</label>
 <p v-if="error" class="text-red-600">{{ error }}</p><div class="flex gap-4"><button :disabled="busy" class="bg-pine-600 text-white p-2 rounded">{{ busy ? 'Shranjujem…' : 'Shrani' }}</button><button type="button" @click="open=false">Prekliči</button></div>
 </form>
 <AdminConfirmDialog :open="deletion.open.value" :title="deletion.title.value" :message="deletion.message.value" :confirm-label="deletion.confirmLabel.value" @confirm="deletion.confirm" @cancel="deletion.cancel" />
 </div>
</template>
