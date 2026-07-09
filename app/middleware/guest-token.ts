export default defineNuxtRouteMiddleware(async (to) => {
  const token = to.params.token as string
  if (!token) return

  const guestToken = useGuestToken()
  guestToken.value = token

  const { error } = await useFetch(`/api/guest/${token}`, { key: `guest-token-check-${token}` })
  if (error.value) {
    return navigateTo('/')
  }
})
