import { processIntegrationOutbox } from '../../utils/integrationOutbox'
import { hasValidOrchestratorToken } from '../../utils/orchestrator'
import { getSettingValue } from '../../utils/secretSettings'
import { workerReasons, type WorkerReason } from '../../../shared/workerWatchdog'
import { reportWorkerHealth } from '../../utils/workerWatchdog'
export default defineEventHandler(async event => {
  if (!hasValidOrchestratorToken(getSettingValue('orchestrator_api_key').trim(),getHeader(event,'authorization'))) throw createError({statusCode:401,statusMessage:'Unauthorized'})
  const body=await readBody(event)
  if (!body || typeof body.ready!=='boolean' || !workerReasons.includes(body.reason) || body.ready!==['ready','dry_run'].includes(body.reason)) throw createError({statusCode:400,statusMessage:'Invalid worker health'})
  reportWorkerHealth(body.ready,body.reason as WorkerReason)
  void processIntegrationOutbox().catch(error=>console.error('[watchdog:alerts]',error instanceof Error ? error.message : 'Delivery failed'))
  return {ok:true}
})
