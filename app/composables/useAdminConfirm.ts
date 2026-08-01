export function useAdminConfirm() {
  const open = ref(false)
  const title = ref('Potrditev brisanja')
  const message = ref('Tega dejanja ni mogoče razveljaviti.')
  const confirmLabel = ref('Izbriši')
  let resolveRequest: ((confirmed: boolean) => void) | null = null

  function ask(options: { title?: string; message: string; confirmLabel?: string }) {
    if (resolveRequest) resolveRequest(false)
    title.value = options.title ?? 'Potrditev brisanja'
    message.value = options.message
    confirmLabel.value = options.confirmLabel ?? 'Izbriši'
    open.value = true
    return new Promise<boolean>(resolve => { resolveRequest = resolve })
  }

  function finish(confirmed: boolean) {
    open.value = false
    resolveRequest?.(confirmed)
    resolveRequest = null
  }

  onBeforeUnmount(() => finish(false))
  return { open, title, message, confirmLabel, ask, confirm: () => finish(true), cancel: () => finish(false) }
}
