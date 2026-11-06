import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { getDb, now } from '../db/index'

const PREFIX = 'enc:v1:'
const SECRET_KEYS = new Set(['bentral_api_key','orchestrator_api_key','sendgrid_api_key','twilio_auth_token','sumup_api_key','sumup_webhook_secret','website_export_token','cloudflare_deploy_hook'])

function encryptionKey(): Buffer | null {
  const secret = process.env.NUXT_SETTINGS_ENCRYPTION_KEY?.trim()
  return secret && secret.length >= 32 ? createHash('sha256').update(secret).digest() : null
}

export function isSecretSetting(key: string): boolean {
  return SECRET_KEYS.has(key) || /^tv_(maple|pine)_(token|wifi_password)$/.test(key)
}

export function encodeSetting(key: string, value: string): string {
  if (!isSecretSetting(key) || !value || value.startsWith(PREFIX)) return value
  const keyBuffer = encryptionKey()
  if (!keyBuffer) throw new Error('NUXT_SETTINGS_ENCRYPTION_KEY must contain at least 32 characters before saving secrets')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return `${PREFIX}${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`
}

export function decodeSetting(key: string, value: string): string {
  if (!isSecretSetting(key) || !value.startsWith(PREFIX)) return value
  const keyBuffer = encryptionKey()
  if (!keyBuffer) throw new Error('NUXT_SETTINGS_ENCRYPTION_KEY is required to decrypt settings')
  const [iv, tag, encrypted] = value.slice(PREFIX.length).split(':')
  if (!iv || !tag || !encrypted) throw new Error(`Invalid encrypted setting: ${key}`)
  const decipher = createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8')
}

export function getSettingValue(key: string): string {
  const row = getDb().prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as { value: string } | undefined
  return row ? decodeSetting(key, row.value) : ''
}

export function encryptExistingSecretSettings(): number {
  if (!encryptionKey()) return 0
  const db = getDb()
  const rows = db.prepare('SELECT key, value FROM app_settings').all() as Array<{ key: string; value: string }>
  const update = db.prepare('UPDATE app_settings SET value = ?, updated_at = ? WHERE key = ?')
  let changed = 0
  db.transaction(() => {
    for (const row of rows) if (isSecretSetting(row.key) && row.value && !row.value.startsWith(PREFIX)) {
      update.run(encodeSetting(row.key, row.value), now(), row.key)
      changed += 1
    }
  })()
  return changed
}
