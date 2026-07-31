<script setup lang="ts">
const route=useRoute()
const section=computed(()=>{
  if(route.path.startsWith('/admin/content')||route.path==='/admin/news') return 'content'
  if(route.path.startsWith('/admin/settings')||['/admin/staff','/admin/orchestrator'].includes(route.path)) return 'settings'
  return route.path==='/admin'?'calendar':'overview'
})
const groups=computed(()=>section.value==='calendar'?[]:section.value==='overview'?[{title:'Pregled',links:[{label:'Log',to:'/admin/logs'},{label:'Obvestila',to:'/admin/notifications'},{label:'Prodaja',to:'/admin/sales'}]}]:section.value==='content'?[{title:'Vsebina',links:[{label:'Restavracije',to:'/admin/content/restaurants'},{label:'Predlogi',to:'/admin/content/suggestions'},{label:'FAQ',to:'/admin/content/faq'},{label:'Navodila za apartma',to:'/admin/content/how-to'},{label:'Hišni red',to:'/admin/content/house-rules'},{label:'Novice',to:'/admin/news'}]}]:[{title:'Splošno',links:[{label:'Splošne nastavitve',to:'/admin/settings/general'},{label:'Osebje',to:'/admin/staff'},{label:'Zajtrk',to:'/admin/settings/services/breakfast'}]},{title:'Platforma',links:[{label:'Bentral',to:'/admin/settings/integrations/bentral'},{label:'SumUp',to:'/admin/settings/integrations/sumup'},{label:'WhatsApp',to:'/admin/settings/integrations/whatsapp'},{label:'Orchestrator',to:'/admin/orchestrator'}]}])
function active(to:string){return to==='/admin'?route.path==='/admin':route.path===to}
</script>
<template><aside v-if="groups.length" class="w-52 flex-shrink-0"><nav class="overflow-hidden rounded-xl border border-stone-200 bg-white py-2 text-sm"><div v-for="(group,index) in groups" :key="group.title" :class="{'mt-2 border-t border-stone-100 pt-2':index}"><p class="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">{{group.title}}</p><NuxtLink v-for="link in group.links" :key="link.to" :to="link.to" class="block px-4 py-2.5 font-medium transition-colors" :class="active(link.to)?'bg-pine-50 text-pine-700':'text-stone-600 hover:bg-stone-50 hover:text-stone-900'">{{link.label}}</NuxtLink></div></nav></aside></template>
