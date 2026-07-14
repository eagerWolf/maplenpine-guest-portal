<script setup lang="ts">
const { loggedIn, fetch } = useUserSession()
await fetch()
if (loggedIn.value) {
  navigateTo('/admin')
} else {
  navigateTo('/login')
}
</script>
<template><div /></template>
