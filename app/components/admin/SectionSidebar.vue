<script setup lang="ts">
const route = useRoute()
const section = computed(() => {
  if (route.path.startsWith('/admin/content') || route.path === '/admin/news') return 'content'
  if (route.path.startsWith('/admin/settings') || ['/admin/staff', '/admin/orchestrator'].includes(route.path)) return 'settings'
  return route.path === '/admin' ? 'calendar' : 'overview'
})
const groups = computed(() => section.value === 'calendar' ? [] : section.value === 'overview'
  ? [{ title: 'Pregled', links: [{ label: 'Log', to: '/admin/logs' }, { label: 'Obvestila', to: '/admin/notifications' }, { label: 'Prodaja', to: '/admin/sales' }] }]
  : section.value === 'content'
    ? [{ title: 'Vsebina', links: [{ label: 'Restavracije', to: '/admin/content/restaurants' }, { label: 'Predlogi', to: '/admin/content/suggestions' }, { label: 'FAQ', to: '/admin/content/faq' }, { label: 'Navodila', to: '/admin/content/how-to' }, { label: 'Hišni red', to: '/admin/content/house-rules' }, { label: 'Novice', to: '/admin/news' }] }]
    : [
        { title: 'Splošno', links: [{ label: 'Splošno', to: '/admin/settings/general' }, { label: 'Lokacije', to: '/admin/settings/locations' }, { label: 'Osebje', to: '/admin/staff' }, { label: 'Zajtrk', to: '/admin/settings/services/breakfast' }, { label: 'E-kolesa', to: '/admin/settings/services/ebikes' }] },
        { title: 'Platforma', links: [{ label: 'Bentral', to: '/admin/settings/integrations/bentral' }, { label: 'SumUp', to: '/admin/settings/integrations/sumup' }, { label: 'Sporočila', to: '/admin/settings/integrations/whatsapp' }, { label: 'Orchestrator', to: '/admin/orchestrator' }] },
      ])
function active(to: string) { return route.path === to }
</script>

<template>
  <aside v-if="groups.length" class="min-w-0 w-full lg:w-52 lg:flex-shrink-0">
    <nav class="mobile-section-nav flex gap-2 overflow-x-auto rounded-xl border border-stone-200 bg-white p-2 text-sm lg:block lg:overflow-hidden lg:py-2">
      <div v-for="(group, index) in groups" :key="group.title" class="flex flex-none items-center gap-2 lg:block" :class="{ 'lg:mt-2 lg:border-t lg:border-stone-100 lg:pt-2': index }">
        <p class="hidden px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 lg:block">{{ group.title }}</p>
        <NuxtLink v-for="link in group.links" :key="link.to" :to="link.to" class="block min-h-10 whitespace-nowrap rounded-lg px-3 py-2.5 font-medium transition-colors lg:rounded-none lg:px-4" :class="active(link.to) ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'">{{ link.label }}</NuxtLink>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.mobile-section-nav { scrollbar-width: thin; scrollbar-color: #a8a29e transparent; }
@media (max-width: 1023px) {
  .mobile-section-nav::after { width: 12px; flex: 0 0 12px; content: ''; }
}
</style>
