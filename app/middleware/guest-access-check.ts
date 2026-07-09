export default defineNuxtRouteMiddleware(async (to) => {
  const token = to.params.token as string
  if (!token) return

  useGuestToken().value = token

  const { error } = await useFetch(`/api/guest/${token}`)
  useGuestAccessBlocked().value = !!error.value
})
