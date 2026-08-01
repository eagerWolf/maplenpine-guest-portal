<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
const route=useRoute()
const section=computed(()=>String(route.params.section))
const configs:any={
  restaurants:{title:'Restavracije',single:'restavracijo',titleField:'name',localized:['description']},
  suggestions:{title:'Suggestions',single:'predlog',titleField:'title',localized:['title','description']},
  faq:{title:'FAQ',single:'FAQ vnos',titleField:'title',localized:['title','description']},
  'how-to':{title:'Navodila za apartma',single:'navodilo',api:'howto',titleField:'title',localized:['title','description']},
  'house-rules':{title:'Hišni red',single:'pravilo',titleField:'text',localized:['text']},
}
const cfg=computed(()=>configs[section.value])
if(!cfg.value) throw createError({statusCode:404})
const api=computed(()=>`/api/admin/${cfg.value.api||section.value}`)
const emptyText=()=>({en:'',sl:'',de:'',hr:'',sr:''})
const makeForm=()=>({id:null as number|null,name:'',type:'casual',website:'',website_slug:'',youtube_url:'',location_id:null as number|null,title:emptyText(),description:emptyText(),text:emptyText(),links:[] as any[],buttons:[] as any[],active:true,sort_order:0,recurring:false,valid_from:'',valid_to:'',imagePath:null as string|null})
const form=ref(makeForm()); const editing=ref(false); const busy=ref(false); const error=ref('')
const deletion = useAdminConfirm()
const {data:items,refresh}=await useFetch<any[]>(api)
function label(item:any){const value=item[cfg.value.titleField]; return typeof value==='string'?value:(value?.sl||value?.en||'Brez naslova')}
function open(item?:any){form.value=makeForm(); if(item){const x=structuredClone(item); Object.assign(form.value,x,{active:!!x.active,recurring:!!x.recurring,valid_from:x.valid_from||'',valid_to:x.valid_to||''})} editing.value=true; error.value=''}
function addAction(){const key=section.value==='suggestions'?'buttons':'links';form.value[key].push({label:emptyText(),href:''})}
function removeAction(index:number){const key=section.value==='suggestions'?'buttons':'links';form.value[key].splice(index,1)}
async function save(){busy.value=true;error.value='';try{const body:any={active:form.value.active,sort_order:Number(form.value.sort_order)||0,recurring:form.value.recurring,valid_from:form.value.valid_from||null,valid_to:form.value.valid_to||null}; for(const f of cfg.value.localized) body[f]=(form.value as any)[f]; if(section.value==='restaurants') Object.assign(body,{name:form.value.name,type:form.value.type,website:form.value.website,website_slug:form.value.website_slug,location_id:form.value.location_id}); if(['faq','how-to'].includes(section.value)) body.links=form.value.links; if(section.value==='suggestions') Object.assign(body,{buttons:form.value.buttons,website_slug:form.value.website_slug,youtube_url:form.value.youtube_url}); await $fetch(form.value.id?`${api.value}/${form.value.id}`:api.value,{method:form.value.id?'PATCH':'POST',body}); editing.value=false;await refresh()}catch(e:any){error.value=e?.data?.statusMessage||e?.message||'Napaka pri shranjevanju'}finally{busy.value=false}}
function actionLocation(action:any,location:any){if(location?.google_maps_url)action.href=location.google_maps_url}
async function remove(item:any){if(!await deletion.ask({title:`Izbrišem ${cfg.value.single}?`,message:`»${label(item)}« bo trajno odstranjen iz portala.`}))return;await $fetch(`${api.value}/${item.id}`,{method:'DELETE'});await refresh()}
async function toggle(item:any){await $fetch(`${api.value}/${item.id}`,{method:'PATCH',body:{active:!item.active}});await refresh()}
async function imageUploaded(){await refresh(); const updated=items.value?.find(x=>x.id===form.value.id); if(updated) form.value.imagePath=updated.imagePath}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between"><h2 class="text-lg font-semibold text-stone-800">{{cfg.title}}</h2><button class="rounded-lg bg-pine-600 px-3 py-2 text-sm text-white" @click="open()">+ Dodaj</button></div>
    <div class="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
      <p v-if="!items?.length" class="p-6 text-center text-sm text-stone-400">Ni vnosov.</p>
      <div v-for="item in items" :key="item.id" class="flex flex-wrap items-center gap-3 p-4" :class="{'opacity-50':!item.active}">
        <div class="min-w-0 flex-1"><p class="truncate font-medium text-stone-800">{{label(item)}}</p><p v-if="item.valid_from||item.valid_to" class="mt-1 text-xs text-amber-700">{{item.recurring?'Vsako leto · ':''}}{{item.valid_from||'…'}} → {{item.valid_to||'…'}}</p></div>
        <button class="text-xs text-stone-500" @click="toggle(item)">{{item.active?'Skrij':'Prikaži'}}</button><button class="text-xs text-pine-700" @click="open(item)">Uredi</button><button class="text-xs text-red-600" @click="remove(item)">Izbriši</button>
      </div>
    </div>
    <Teleport to="body"><div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="editing=false"><form class="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6" @submit.prevent="save">
      <h3 class="font-semibold text-stone-800">{{form.id?'Uredi':'Dodaj'}} {{cfg.single}}</h3>
      <template v-if="section==='restaurants'"><label class="block text-sm font-medium text-stone-600">Ime<input v-model="form.name" class="mt-1 w-full rounded-lg border px-3 py-2" /></label><div class="grid grid-cols-2 gap-3"><select v-model="form.type" class="rounded-lg border px-3 py-2 text-sm"><option value="fineDining">Fine dining</option><option value="traditional">Tradicionalna</option><option value="casual">Casual</option></select><input v-model="form.website" placeholder="Spletna stran" class="rounded-lg border px-3 py-2 text-sm" /></div><AdminLocationPicker v-model="form.location_id" label="Lokacija restavracije"/></template>
      <div v-if="['restaurants','suggestions'].includes(section)" class="grid gap-3 sm:grid-cols-2"><label class="block text-sm font-medium text-stone-600">URL oznaka spletne strani<input v-model="form.website_slug" placeholder="npr. lake-bohinj" pattern="[a-z0-9-]*" class="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><label v-if="section==='suggestions'" class="block text-sm font-medium text-stone-600">YouTube embed URL<input v-model="form.youtube_url" type="url" placeholder="https://www.youtube.com/embed/..." class="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label></div>
      <AdminLocalizedInput v-for="field in cfg.localized" :key="field" v-model="(form as any)[field]" :label="field==='title'?'Naslov':field==='text'?'Besedilo':'Opis'" :multiline="field!=='title'" />
      <AdminImageUploader v-if="form.id && ['restaurants','suggestions','how-to'].includes(section)" :image-url="(form as any).imagePath" :upload-url="`${api}/${form.id}/image`" @uploaded="imageUploaded" />
      <p v-else-if="!form.id && ['restaurants','suggestions','how-to'].includes(section)" class="text-xs text-stone-400">Sliko lahko naložite po prvem shranjevanju vnosa.</p>
      <div v-if="['faq','how-to','suggestions'].includes(section)" class="space-y-3 rounded-xl border border-stone-200 p-4"><div class="flex items-center justify-between"><p class="text-sm font-medium text-stone-700">{{section==='suggestions'?'Gumbi':'Povezave'}}</p><button type="button" class="text-xs text-pine-700" @click="addAction">+ Dodaj</button></div><div v-for="(action,index) in (section==='suggestions'?form.buttons:form.links)" :key="index" class="space-y-2 rounded-lg bg-stone-50 p-3"><AdminLocalizedInput v-model="action.label" label="Besedilo gumba / povezave"/><AdminLocationPicker v-model="action.location_id" label="Lokacija (ustvari Google Maps povezavo)" @selected="actionLocation(action,$event)"/><div class="flex gap-2"><input v-model="action.href" type="url" placeholder="https://…" class="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"/><button type="button" class="text-xs text-red-600" @click="removeAction(index)">Odstrani</button></div></div></div>
      <AdminValidityFields v-model:recurring="form.recurring" v-model:valid-from="form.valid_from" v-model:valid-to="form.valid_to" />
      <div class="grid grid-cols-2 gap-3"><label class="text-sm text-stone-600">Vrstni red<input v-model.number="form.sort_order" type="number" class="mt-1 w-full rounded-lg border px-3 py-2" /></label><label class="mt-7 flex items-center gap-2 text-sm"><input v-model="form.active" type="checkbox" /> Aktivno</label></div>
      <p v-if="error" class="text-sm text-red-600">{{error}}</p><div class="flex gap-3"><button :disabled="busy" class="flex-1 rounded-lg bg-pine-600 py-2 text-sm text-white">{{busy?'Shranjujem…':'Shrani'}}</button><button type="button" class="flex-1 rounded-lg bg-stone-100 py-2 text-sm" @click="editing=false">Prekliči</button></div>
    </form></div></Teleport>
    <AdminConfirmDialog :open="deletion.open.value" :title="deletion.title.value" :message="deletion.message.value" :confirm-label="deletion.confirmLabel.value" @confirm="deletion.confirm" @cancel="deletion.cancel" />
  </div>
</template>
