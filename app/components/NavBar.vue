<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()

const route = useRoute()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/login')
}

const isAdmin = computed(() => user.value?.role === 'admin')
</script>

<template>
  <nav class="bg-white border-b border-stone-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center gap-6">
          <NuxtLink to="/staff" class="text-pine-700 font-semibold text-lg tracking-tight">
            Maple & Pine
          </NuxtLink>
          <div v-if="loggedIn" class="hidden sm:flex items-center gap-1">
            <NuxtLink
              to="/staff"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="route.path.startsWith('/staff') ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'"
            >
              Gostje
            </NuxtLink>
            <template v-if="isAdmin">
              <NuxtLink
                to="/admin"
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                :class="route.path === '/admin' ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'"
              >
                Nadzorna plošča
              </NuxtLink>
              <NuxtLink
                to="/admin/staff"
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                :class="route.path === '/admin/staff' ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'"
              >
                Osebje
              </NuxtLink>
              <NuxtLink
                to="/admin/logs"
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                :class="route.path === '/admin/logs' ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'"
              >
                Log
              </NuxtLink>
              <NuxtLink
                to="/admin/settings"
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                :class="route.path === '/admin/settings' ? 'bg-pine-50 text-pine-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'"
              >
                Nastavitve
              </NuxtLink>
            </template>
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
