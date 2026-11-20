import { getSettingValue } from '../../utils/secretSettings'
import { hasValidOrchestratorToken } from '../../utils/orchestrator'
import { claimWindowsMessage } from '../../utils/windowsMessages'

export default defineEventHandler(async (event) => {
  if (!hasValidOrchestratorToken(getSettingValue('orchestrator_api_key').trim(), getHeader(event, 'authorization'))) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return { message: await claimWindowsMessage() }
})
