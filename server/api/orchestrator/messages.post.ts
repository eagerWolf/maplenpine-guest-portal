import { getSettingValue } from '../../utils/secretSettings'
import { hasValidOrchestratorToken } from '../../utils/orchestrator'
import { acknowledgeWindowsMessage } from '../../utils/windowsMessages'

export default defineEventHandler(async (event) => {
  if (!hasValidOrchestratorToken(getSettingValue('orchestrator_api_key').trim(), getHeader(event, 'authorization'))) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  try { return acknowledgeWindowsMessage(await readBody(event)) }
  catch { throw createError({ statusCode: 400, statusMessage: 'Invalid message result or lease' }) }
})
