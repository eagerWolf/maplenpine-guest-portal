export default defineNuxtRouteMiddleware(async () => {
  const { user, loggedIn, fetch } = useUserSession()
  await fetch()
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
  if (user.value?.role !== 'admin') {
    return navigateTo('/admin')
  }
})
