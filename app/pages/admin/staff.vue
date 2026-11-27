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
function edit(p?:Person){if(busy.value)return;if(open.value && editing.value===(p?.id??null)){open.value=false;return;}editing.value=p?.id??null;form.value=p?{name:p.name||p.email,email:p.email.endsWith('@staff.invalid')?'':p.email,role:p.role,guest_contact:!!p.guest_contact,portal_access:!!p.portal_access,notifications_enabled:p.notifications_enabled!==0,staff_manager:!!p.staff_manager,notify_housekeeper:!!p.notify_housekeeper,notify_checkin:!!p.notify_checkin,whatsapp_phone:p.whatsapp_phone||'',active:!!p.active}:blank();error.value='';open.value=true}
async function save(){busy.value=true;error.value='';try{const result=await $fetch<{activationUrl?:string|null}>(editing.value?`/api/admin/users/${editing.value}`:'/api/admin/users',{method:editing.value?'PATCH':'POST',body:form.value});activation.value=result.activationUrl||'';await refresh();open.value=false}catch(e:any){error.value=e?.data?.statusMessage||'Shranjevanje ni uspelo.'}finally{busy.value=false}}
function roles(p:Person){return [p.notify_housekeeper?'Čistilka':'',p.notify_checkin?'Sprejem':'',p.staff_manager?'Skrbnik':''].filter(Boolean)}
</script>
<template>
  <div class="staff-page">
    <header class="page-header">
      <div><h1>Osebje</h1><p>Kontakti, vloge in dostop do portala na enem mestu.</p></div>
      <button class="add-person" :disabled="busy" @click="edit()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Dodaj osebo</button>
    </header>
    <div v-if="activation" class="activation"><label>Aktivacijska povezava — posredujte jo osebi<input :value="activation" readonly /></label></div>
    <p v-if="deleteError" role="alert" class="delete-error">{{ deleteError }}</p>
    <article v-if="open && editing===null" class="person-card expanded new-person">
      <div class="new-header"><h2>Nova oseba</h2><p>Dodajte kontakt in izberite njegove vloge.</p></div>
      <StaffPersonForm v-model="form" :busy="busy" :error="error" creating @save="save" @cancel="open=false" />
    </article>
    <div class="people">
      <article v-for="p in people" :key="p.id" class="person-card" :class="{expanded:open && editing===p.id,inactive:!p.active}">
        <div class="card-header">
          <div class="avatar" aria-hidden="true">{{ (p.name || p.email).slice(0,1).toUpperCase() }}</div>
          <div class="person-info">
            <div class="name-row"><h2>{{ p.name || p.email }}</h2><span v-if="p.id===currentUser?.id" class="self">Vi</span><span v-if="!p.active" class="inactive-label">Neaktivna</span></div>
            <p class="phone">{{ p.whatsapp_phone || 'Telefonska številka ni vnesena' }}</p>
            <div class="badges"><span v-for="role in roles(p)" :key="role" class="role-badge">{{ role }}</span><span v-if="!roles(p).length" class="muted-badge">Brez vloge</span><span v-if="p.guest_contact" class="muted-badge">Kontakt za goste</span></div>
          </div>
          <div class="card-actions">
            <button class="icon-button" :class="{selected:open && editing===p.id}" :aria-label="`Uredi osebo ${p.name || p.email}`" :aria-expanded="open && editing===p.id" :title="open && editing===p.id ? 'Zapri urejanje' : 'Uredi osebo'" :disabled="busy" @click="edit(p)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 4 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z" /></svg></button>
            <button v-if="currentUser?.role==='admin' && p.id!==currentUser.id" class="icon-button delete-button" :disabled="deleting!==null || busy" :aria-label="`Izbriši osebo ${p.name || p.email}`" title="Izbriši osebo" @click="removePerson(p)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></svg></button>
          </div>
        </div>
        <div class="card-status"><span :class="{'status-off':!p.notifications_enabled}"><i :class="{on:p.notifications_enabled}" />{{ p.notifications_enabled ? 'Obveščanje vključeno' : 'Obveščanje izključeno' }}</span><span>{{ p.portal_access ? 'Dostop do portala' : 'Brez prijave' }}</span></div>
        <StaffPersonForm v-if="open && editing===p.id" v-model="form" :busy="busy" :error="error" @save="save" @cancel="open=false" />
      </article>
    </div>
    <AdminConfirmDialog :open="deletion.open.value" :title="deletion.title.value" :message="deletion.message.value" :confirm-label="deletion.confirmLabel.value" @confirm="deletion.confirm" @cancel="deletion.cancel" />
  </div>
</template>

<style scoped>
.page-header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px}.page-header h1{font-size:22px;font-weight:650;letter-spacing:-.4px;color:#292524}.page-header p,.new-header p{font-size:13px;color:#78716c;margin-top:5px}.add-person{display:inline-flex;align-items:center;gap:7px;flex-shrink:0;background:#3f5c45;color:white;font-size:13px;font-weight:600;border-radius:8px;padding:10px 14px}.add-person:hover{background:#304b36}.add-person svg{width:16px;height:16px}.people{display:grid;gap:14px}.person-card{background:white;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px #00000004}.person-card.expanded{border-color:#8ea38e;box-shadow:0 0 0 2px #e9eee7}.card-header{display:flex;align-items:flex-start;gap:14px;padding:20px 20px 14px}.avatar{width:42px;height:42px;background:#eff2eb;border:1px solid #e5e9df;color:#4b6247;border-radius:11px;display:grid;place-items:center;font-size:17px;font-weight:600;flex-shrink:0}.person-info{min-width:0;flex:1}.name-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.name-row h2{font-size:15px;font-weight:600;color:#292524;overflow-wrap:anywhere}.self,.inactive-label{font-size:10px;font-weight:600;border-radius:4px;padding:2px 6px;background:#f5f5f4;color:#78716c}.phone{font-size:13px;color:#78716c;margin-top:3px}.badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.role-badge,.muted-badge{font-size:11px;border-radius:5px;padding:2px 7px;line-height:1.6}.role-badge{background:#edf3eb;color:#456149}.muted-badge{background:#f5f5f4;color:#78716c}.card-actions{display:flex;gap:5px;flex-shrink:0}.icon-button{display:grid;place-items:center;width:36px;height:36px;border:1px solid #e7e5e4;border-radius:8px;color:#78716c;background:white}.icon-button svg{width:17px;height:17px}.icon-button:hover,.icon-button.selected{background:#eff3ed;border-color:#c0cdbb;color:#3f5c45}.delete-button:hover{background:#fef2f2;border-color:#fecaca;color:#b91c1c}.icon-button:focus-visible,.add-person:focus-visible{outline:2px solid #456149;outline-offset:3px}.card-status{display:flex;gap:18px;flex-wrap:wrap;margin:0 20px;padding:11px 0 14px;border-top:1px solid #f0efed;color:#78716c;font-size:11px}.card-status span{display:flex;align-items:center;gap:6px}.card-status i{width:6px;height:6px;border-radius:50%;background:#c4c0bb}.card-status i.on{background:#739067}.status-off{color:#a8a29e}.new-person{margin-bottom:18px}.new-header{padding:20px 24px}.new-header h2{font-size:16px;font-weight:600;color:#292524}.activation{padding:16px;background:#f0f5ef;border-radius:10px;font-size:13px;margin-bottom:18px}.activation input{display:block;margin-top:8px;border:1px solid #d6d3d1;border-radius:6px;padding:8px;width:100%;background:white}.delete-error{color:#b91c1c;font-size:13px;margin-bottom:16px}.inactive .avatar{background:#f5f5f4;color:#a8a29e}button:disabled{opacity:.5;cursor:wait}@media(max-width:640px){.page-header{align-items:flex-start}.page-header p{max-width:210px}.card-header{padding:16px;gap:10px}.avatar{width:34px;height:34px;border-radius:9px;font-size:14px}.card-status{margin:0 16px}.icon-button{width:34px;height:34px}.name-row h2{font-size:14px}.add-person{padding:10px;font-size:12px}.new-header{padding:18px}}
</style>
