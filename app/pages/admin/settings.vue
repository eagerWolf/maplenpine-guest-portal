<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const route = useRoute()
if (route.path === '/admin/settings') {
  await navigateTo('/admin/settings/general', { replace: true })
}

const platformLinks = [
  { label: 'Bentral', to: '/admin/settings/integrations/bentral' },
  { label: 'SumUp', to: '/admin/settings/integrations/sumup' },
]
const propertyLinks = [
  { label: 'Splošno', to: '/admin/settings/general' },
]
const serviceLinks = [
  { label: 'Zajtrk', to: '/admin/settings/services/breakfast' },
]
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-stone-800 mb-6">Nastavitve</h1>
    <div class="flex gap-6 items-start">

      <!-- Sidebar -->
      <aside class="w-48 flex-shrink-0">
        <nav class="bg-white rounded-xl border border-stone-200 overflow-hidden text-sm">

          <div class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">Platforma</div>
          <NuxtLink
            v-for="l in platformLinks"
            :key="l.to"
            :to="l.to"
            class="flex items-center pl-6 pr-4 py-2.5 font-medium transition-colors"
            :class="route.path === l.to ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'"
          >{{ l.label }}</NuxtLink>

          <div class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-stone-400 border-t border-stone-100 mt-1">Nastanitev</div>
          <NuxtLink
            v-for="l in propertyLinks"
            :key="l.to"
            :to="l.to"
            class="flex items-center pl-6 pr-4 py-2.5 font-medium transition-colors"
            :class="route.path === l.to ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'"
          >{{ l.label }}</NuxtLink>

          <div class="pl-6 pr-4 pt-2 pb-0.5 text-xs font-medium text-stone-400">Storitve</div>
          <NuxtLink
            v-for="l in serviceLinks"
            :key="l.to"
            :to="l.to"
            class="flex items-center pl-8 pr-4 py-2.5 font-medium transition-colors"
            :class="route.path === l.to ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'"
          >{{ l.label }}</NuxtLink>

        </nav>
      </aside>

      <!-- Page content -->
      <div class="flex-1 min-w-0">
        <NuxtPage />
      </div>

    </div>
  </div>
</template>
