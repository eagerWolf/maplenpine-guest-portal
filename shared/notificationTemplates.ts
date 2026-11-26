export const notificationEvents = {
  arrival_today: 'Današnji prihod', reservation_changed: 'Sprememba rezervacije',
  reservation_cancelled: 'Odpoved rezervacije', cleaning_reminder: 'Opomnik za čiščenje',
  cleaning_completed: 'Čiščenje potrjeno', job_failed: 'Napaka eKey',
  pin_send_failed: 'Napaka dostave', sync_error: 'Napaka Bentral sinhronizacije',
  orchestrator_offline: 'Windows worker ni dosegljiv', orchestrator_recovered: 'Windows worker ponovno deluje',
  issue_recovered: 'Težava odpravljena', backup_failed: 'Napaka varnostne kopije',
} as const
export type EditableNotificationEvent = keyof typeof notificationEvents
export const defaultNotificationTemplate = '{title}\n{details}\n{link}'
export function renderNotificationTemplate(template: string, message: string, fallbackUrl: string) {
  const lines = message.split('\n').filter(Boolean)
  const link = lines.find(line => /^https?:\/\//.test(line)) || fallbackUrl
  const values: Record<string,string> = { title: lines[0] || 'Obvestilo', details: lines.slice(1).filter(line => line !== link).join('\n'), link }
  return template.replace(/\{(title|details|link)\}/g, (_, key) => values[key] || '')
}
export function validateNotificationTemplate(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 1500 && value.trim().length > 0
    && value.includes('{title}') && value.includes('{details}') && value.includes('{link}')
    && !/\{(?!title\}|details\}|link\})[^}]*\}/.test(value)
}
export const notificationSamples: Record<EditableNotificationEvent,string> = {
  arrival_today: 'Danes prihajajo gostje\nPine · Testni Gost · 26.11.2026–30.11.2026 · oseb: 2',
  reservation_changed: 'Sprememba rezervacije\nPine · Testni Gost · oseb: 2\nOdhod: 30.11.2026 → 01.12.2026',
  reservation_cancelled: 'Rezervacija je odpovedana\nPine · Testni Gost · 26.11.2026–30.11.2026 · oseb: 2',
  cleaning_reminder: 'Jutri čiščenje: Pine (27.11.2026).\nOdhod gostov ob 11:00.\nNaslednji prihod: 27.11.2026 (menjava isti dan).\nKo je apartma pospravljen, odprite povezavo in potrdite:',
  cleaning_completed: 'Pine je pospravljen in pripravljen za prihod gostov.\nPotrjeno: 26.11.2026 12:30\nPredviden začetek veljavnosti PIN-a za naslednji prihod je ob 13:00; preverite stanje dostopa v portalu.',
  job_failed: 'Napaka eKey opravila\nSinhronizacija naprav ni potrjena. Preverite dnevnik opravil.',
  pin_send_failed: 'Napaka dostave\nSporočilo ni bilo uspešno dostavljeno. Preverite dnevnik obvestil.',
  sync_error: 'Napaka Bentral sinhronizacije\nUvoz rezervacij ni uspel. Preverite povezavo z Bentralom.',
  orchestrator_offline: 'Windows worker ni dosegljiv\nWorker se ni javil več kot 15 minut. Preverite Windows računalnik.',
  orchestrator_recovered: 'Windows worker ponovno deluje\nPovezava z workerjem je obnovljena.',
  issue_recovered: 'Težava odpravljena\nIntegracija ponovno deluje.',
  backup_failed: 'Napaka varnostne kopije\nVarnostna kopija ni uspela. Preverite prostor in dnevnik varnostnih kopij.',
}
