<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()

const route = useRoute()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/login')
}

const isAdmin = computed(() => user.value?.role === 'admin')
const overviewActive = computed(() => ['/admin/logs', '/admin/notifications', '/admin/sales'].includes(route.path))
const contentActive = computed(() => route.path.startsWith('/admin/content') || route.path === '/admin/news')
const settingsActive = computed(() => route.path.startsWith('/admin/settings') || ['/admin/staff', '/admin/orchestrator'].includes(route.path))
const mobileOpen = ref(false)
watch(() => route.path, () => { mobileOpen.value = false })

const primaryLinks = computed(() => isAdmin.value ? [
  { label: 'Koledar', to: '/admin', active: route.path === '/admin' },
  { label: 'Pregled', to: '/admin/logs', active: overviewActive.value },
  { label: 'Vsebina', to: '/admin/content', active: contentActive.value },
  { label: 'Nastavitve', to: '/admin/settings/general', active: settingsActive.value },
] : [{ label: 'Koledar', to: '/admin', active: true }])
</script>

<template>
  <nav class="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center gap-6">
          <NuxtLink to="/admin" class="text-pine-700 font-semibold text-lg tracking-tight">
            Maple & Pine
          </NuxtLink>
          <div v-if="loggedIn" class="hidden sm:flex items-center gap-1">
            <template v-if="isAdmin">
              <NuxtLink to="/admin" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors" :class="route.path==='/admin'?'bg-pine-50 text-pine-700':'text-stone-600 hover:bg-stone-100'">Koledar</NuxtLink>
              <NuxtLink to="/admin/logs" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors" :class="overviewActive?'bg-pine-50 text-pine-700':'text-stone-600 hover:bg-stone-100'">Pregled</NuxtLink>
              <NuxtLink to="/admin/content" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors" :class="contentActive?'bg-pine-50 text-pine-700':'text-stone-600 hover:bg-stone-100'">Vsebina</NuxtLink>
              <NuxtLink to="/admin/settings/general" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors" :class="settingsActive?'bg-pine-50 text-pine-700':'text-stone-600 hover:bg-stone-100'">Nastavitve</NuxtLink>
            </template>
            <NuxtLink v-else to="/admin" class="px-3 py-1.5 rounded-md text-sm font-medium text-stone-600">Koledar</NuxtLink>
          </div>
        </div>
        <div v-if="loggedIn" class="hidden items-center gap-3 sm:flex">
          <span class="text-xs text-stone-400 hidden sm:block">{{ user?.email }}</span>
          <span
            class="px-2 py-0.5 rounded text-xs font-medium"
            :class="isAdmin ? 'bg-pine-100 text-pine-700' : 'bg-stone-100 text-stone-600'"
          >
            {{ isAdmin ? 'Admin' : 'Osebje' }}
          </span>
          <button
            class="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            @click="logout"
          >
            Odjava
          </button>
        </div>
        <button v-if="loggedIn" type="button" class="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 sm:hidden" :aria-expanded="mobileOpen" aria-label="Odpri navigacijo" @click="mobileOpen = !mobileOpen">
          <span class="sr-only">Meni</span>
          <svg v-if="!mobileOpen" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <svg v-else viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div v-if="loggedIn && mobileOpen" class="border-t border-stone-100 pb-4 pt-3 sm:hidden">
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink v-for="link in primaryLinks" :key="link.to" :to="link.to" class="rounded-lg px-3 py-3 text-center text-sm font-medium" :class="link.active ? 'bg-pine-50 text-pine-700' : 'bg-stone-50 text-stone-600'">{{ link.label }}</NuxtLink>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
          <div class="min-w-0"><p class="truncate text-xs text-stone-500">{{ user?.email }}</p><p class="mt-0.5 text-xs font-medium text-pine-700">{{ isAdmin ? 'Admin' : 'Osebje' }}</p></div>
          <button class="min-h-10 rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-600" @click="logout">Odjava</button>
        </div>
      </div>
    </div>
  </nav>
</template>
