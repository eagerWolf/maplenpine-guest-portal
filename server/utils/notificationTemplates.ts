import { getDb } from '../db/index'
import { notificationEvents, defaultNotificationTemplate, renderNotificationTemplate } from '../../shared/notificationTemplates'
export function formatStaffNotification(event: string, message: string) {
  if (!(event in notificationEvents)) return message
  const row = getDb().prepare('SELECT value FROM app_settings WHERE key=?').get(`notification_template_${event}`) as {value:string}|undefined
  return renderNotificationTemplate(row?.value || defaultNotificationTemplate, message, String(useRuntimeConfig().public.baseUrl))
}
