import { encryptExistingSecretSettings } from '../utils/secretSettings'

export default defineNitroPlugin(() => {
  const changed = encryptExistingSecretSettings()
  if (changed) console.log(`[security] Encrypted ${changed} existing secret setting(s)`)
})
