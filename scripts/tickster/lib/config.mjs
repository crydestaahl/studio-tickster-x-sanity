import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import dotenv from 'dotenv'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const envCandidates = [
  path.resolve(currentDirectory, '../../../.env'),
  path.resolve(currentDirectory, '../../../../.env'),
]

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({path: envPath, override: false})
  }
}

function readRequired(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getConfig() {
  return {
    sanity: {
      projectId: readRequired('SANITY_PROJECT_ID'),
      dataset: readRequired('SANITY_DATASET'),
      apiVersion: process.env.SANITY_API_VERSION ?? '2025-03-01',
      token: readRequired('SANITY_API_TOKEN'),
    },
    tickster: {
      organizerName: readRequired('TICKSTER_ORGANIZER_NAME'),
      languageCode: process.env.TICKSTER_LANGUAGE_CODE ?? 'sv',
      dumpApiKey: readRequired('TICKSTER_DUMP_API_KEY'),
      eventApiBaseUrl: process.env.TICKSTER_EVENT_API_BASE_URL ?? 'https://event.api.tickster.com',
      dumpApiBaseUrl: process.env.TICKSTER_DUMP_API_BASE_URL ?? 'https://api.tickster.com',
      eventApiBearerToken: process.env.TICKSTER_EVENT_API_BEARER_TOKEN,
      eventApiHeaderName: process.env.TICKSTER_EVENT_API_HEADER_NAME,
      eventApiHeaderValue: process.env.TICKSTER_EVENT_API_HEADER_VALUE,
      eventApiKey: process.env.TICKSTER_EVENT_API_KEY,
      eventApiVersion: '1.0',
    },
  }
}

export function getEventApiHeaders(ticksterConfig) {
  if (ticksterConfig.eventApiHeaderName && ticksterConfig.eventApiHeaderValue) {
    return {[ticksterConfig.eventApiHeaderName]: ticksterConfig.eventApiHeaderValue}
  }

  if (ticksterConfig.eventApiBearerToken) {
    return {Authorization: `Bearer ${ticksterConfig.eventApiBearerToken}`}
  }

  if (ticksterConfig.eventApiKey) {
    return {'X-Api-Key': ticksterConfig.eventApiKey}
  }

  throw new Error(
    'Missing Event API authentication. Set TICKSTER_EVENT_API_BEARER_TOKEN, TICKSTER_EVENT_API_KEY, or TICKSTER_EVENT_API_HEADER_NAME + TICKSTER_EVENT_API_HEADER_VALUE.',
  )
}
