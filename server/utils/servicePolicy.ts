// The current portal offers external recommendations, not order fulfilment.
// WhatsApp is retained for staff/admins; guest SendGrid delivery is off.
export function messagingEnabled(): boolean {
  return process.env.PORTAL_WHATSAPP_ENABLED !== 'false'
}

export function legacyServicePath(path: string, method: string): boolean {
  return /^\/api\/guest\/(breakfast|ebike)(\/|$)/.test(path)
    || (method !== 'GET' && /^\/api\/(partner\/(breakfast|ebike)|admin\/(breakfast|ebike))(\/|$)/.test(path))
}

// SendGrid is optional and disabled for the current recommendation-only portal.
export function emailEnabled(): boolean {
  return process.env.PORTAL_EMAIL_ENABLED === 'true'
}

// Bentral support supplied the message API contract by email (18 March 2026).
export function bentralGuestMessagesEnabled(): boolean {
  return process.env.BENTRAL_GUEST_MESSAGES_ENABLED !== 'false'
}

// Separate opt-in for infrastructure alerts; staff/guest sending stays unchanged.
export function workerAlertsEnabled(): boolean {
  return process.env.PORTAL_WORKER_ALERTS_ENABLED === 'true'
}
export function isWorkerAlert(event: string): boolean {
  return ['orchestrator_offline','orchestrator_recovered','orchestrator_reboot','orchestrator_recovery_failed'].includes(event)
}
