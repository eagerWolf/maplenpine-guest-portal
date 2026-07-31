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
</script>

<template>
  <nav class="bg-white border-b border-stone-200 shadow-sm">
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
        <div v-if="loggedIn" class="flex items-center gap-3">
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
      </div>
    </div>
  </nav>
</template>
