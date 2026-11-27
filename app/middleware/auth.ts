export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user, fetch } = useUserSession()
  await fetch()
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
  if(user.value?.cleaningOnly) return navigateTo('/cleaning-calendar')
})
