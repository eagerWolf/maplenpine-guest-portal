export default defineNuxtRouteMiddleware(async (to) => {
  const token = to.params.token as string
  if (!token) return

  useGuestToken().value = token

  const { data, error } = await useFetch<{adminPreview?:boolean; portalExpiresAt?:string}>(`/api/guest/${token}`)
  useGuestAccessBlocked().value = !!error.value
  useAdminGuestPreview().value = !!data.value?.adminPreview
  useGuestPortalExpiry().value = data.value?.portalExpiresAt ?? null
})
