import { processIntegrationOutbox } from '../../utils/integrationOutbox'
import { hasValidOrchestratorToken } from '../../utils/orchestrator'
import { getSettingValue } from '../../utils/secretSettings'
import { reportSystemWatchdog } from '../../utils/workerWatchdog'
export default defineEventHandler(async event => {
  // The configured Windows worker token is bound to this portal; no arbitrary remote commands.
  if (!hasValidOrchestratorToken(getSettingValue('orchestrator_api_key').trim(),getHeader(event,'authorization'))) throw createError({statusCode:401,statusMessage:'Unauthorized'})
  const body=await readBody(event)
  if (!body || typeof body.bootId!=='string' || !/^[0-9TZ:.+-]{10,64}$/.test(body.bootId) || typeof body.busy!=='boolean'
    || (body.action!==undefined && body.action!=='ack-reboot') || (body.incidentId!==undefined && (typeof body.incidentId!=='string' || !/^[a-f0-9-]{36}$/.test(body.incidentId)))) throw createError({statusCode:400,statusMessage:'Invalid watchdog report'})
  const response=reportSystemWatchdog(body)
  void processIntegrationOutbox().catch(error=>console.error('[watchdog:alerts]',error instanceof Error ? error.message : 'Delivery failed'))
  return response
})
