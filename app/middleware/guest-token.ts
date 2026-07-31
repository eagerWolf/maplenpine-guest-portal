export default defineNuxtRouteMiddleware(async (to) => {
  const token = to.params.token as string
  if (!token) return

  const guestToken = useGuestToken()
  guestToken.value = token

  const { data, error } = await useFetch<{adminPreview?:boolean}>(`/api/guest/${token}`, { key: `guest-token-check-${token}` })
  if (error.value) {
    return navigateTo('/')
  }
  useAdminGuestPreview().value = !!data.value?.adminPreview
})
