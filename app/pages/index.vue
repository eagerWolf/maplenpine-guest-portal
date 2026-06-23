<script setup lang="ts">
const { loggedIn, user, fetch } = useUserSession()
await fetch()
if (loggedIn.value) {
  navigateTo(user.value?.role === 'admin' ? '/admin' : '/staff')
} else {
  navigateTo('/login')
}
</script>
<template><div /></template>
