import {getConfig, getEventApiHeaders} from './lib/config.mjs'
import {
  archiveMissingEvents,
  createSanityWriteClient,
  getExistingEventMetadata,
  getSyncState,
  saveSyncError,
  saveSyncState,
  upsertEvents,
} from './lib/sanity.mjs'
import {fetchEventDetails, fetchOrganizerEvents} from './lib/tickster.mjs'
import {mapDetailEventToSanityDocument} from './lib/transformers.mjs'

async function main() {
  const config = getConfig()
  const sanityClient = createSanityWriteClient(config.sanity)
  const syncState = await getSyncState(sanityClient)

  if (!syncState?.organizerId) {
    throw new Error(
      'Missing organizerId in sync state. Run "npm run tickster:import-dump" first so the organizer can be resolved from the dump.',
    )
  }

  const headers = {
    Accept: 'application/json',
    ...getEventApiHeaders(config.tickster),
  }

  console.log(
    `[tickster:sync-updates] Starting sync for organizer "${syncState.organizerName ?? config.tickster.organizerName}" (${syncState.organizerId}).`,
  )

  const {items: organizerEvents, requestCount: listRequestCount} = await fetchOrganizerEvents(
    config.tickster,
    syncState.organizerId,
    headers,
  )
  console.log(
    `[tickster:sync-updates] Fetched ${organizerEvents.length} organizer events using ${listRequestCount} list request(s).`,
  )

  const timestamp = new Date().toISOString()
  const activeEventIds = new Set(organizerEvents.map((event) => event.id))
  const existingEventMetadata = await getExistingEventMetadata(sanityClient, syncState.organizerId)
  const existingEvents = existingEventMetadata.byEventId
  const requestBudget = Math.max(config.tickster.eventApiRequestLimit - listRequestCount, 0)
  console.log(
    `[tickster:sync-updates] Existing Sanity event records: ${existingEvents.size} unique event ids (${existingEventMetadata.totalCount} documents total, ${existingEventMetadata.matchingOrganizerCount} with matching organizer id, ${existingEventMetadata.mismatchedOrganizerCount} with another organizer id, ${existingEventMetadata.missingOrganizerCount} missing organizer id). Detail request budget for this run: ${requestBudget}.`,
  )

  const docs = []
  let detailRequestCount = 0
  let deferredCount = 0
  const failedEvents = []
  let stoppedByRateLimit = false

  const changedOrNewEvents = organizerEvents.filter((organizerEvent) => {
    const existing = existingEvents.get(organizerEvent.id)
    return !existing || !isSameTimestamp(existing.lastUpdatedUtc, organizerEvent.lastUpdatedUtc)
  })
  console.log(
    `[tickster:sync-updates] ${changedOrNewEvents.length} event(s) are new or changed and may need details fetch.`,
  )

  if (changedOrNewEvents.length === 0) {
    console.log('[tickster:sync-updates] No changed events found. Skipping detail fetch.')
  }

  for (let index = 0; index < changedOrNewEvents.length; index += 1) {
    const organizerEvent = changedOrNewEvents[index]

    if (detailRequestCount >= requestBudget) {
      deferredCount += 1
      console.log(
        `[tickster:sync-updates] Deferred "${formatEventLabel(organizerEvent)}" because the request budget has been reached.`,
      )
      continue
    }

    console.log(
      `[tickster:sync-updates] Fetching details for "${formatEventLabel(organizerEvent)}" (${detailRequestCount + 1}/${requestBudget}).`,
    )

    try {
      const eventDetails = await fetchEventDetails(config.tickster, organizerEvent.id, headers)
      detailRequestCount += 1
      docs.push(mapDetailEventToSanityDocument(eventDetails, timestamp))
      console.log(
        `[tickster:sync-updates] Prepared update for "${eventDetails.name ?? organizerEvent.name ?? organizerEvent.id}" (${organizerEvent.id}).`,
      )
    } catch (error) {
      detailRequestCount += 1
      const message = error instanceof Error ? error.message : String(error)

      if (isRateLimitError(message)) {
        stoppedByRateLimit = true
        const remainingCount = changedOrNewEvents.length - index
        deferredCount += remainingCount
        console.error(
          `[tickster:sync-updates] Tickster rate limit reached while fetching "${formatEventLabel(organizerEvent)}". Deferring this and ${remainingCount - 1} remaining changed event(s) until the next run.`,
        )
        break
      }

      failedEvents.push({eventId: organizerEvent.id, name: organizerEvent.name ?? organizerEvent.id, message})
      console.error(
        `[tickster:sync-updates] Failed to fetch details for "${formatEventLabel(organizerEvent)}": ${message}`,
      )
    }
  }

  await upsertEvents(sanityClient, docs)
  console.log(`[tickster:sync-updates] Upserted ${docs.length} event draft(s) in Sanity.`)

  const archivedCount = await archiveMissingEvents(
    sanityClient,
    syncState.organizerId,
    activeEventIds,
    timestamp,
  )
  console.log(`[tickster:sync-updates] Archived ${archivedCount} event(s) no longer returned by Tickster.`)

  const errorSummary =
    failedEvents.length > 0 || stoppedByRateLimit
      ? [
          ...(stoppedByRateLimit
            ? ['Tickster rate limit reached during detail sync. Remaining changed events were deferred to the next run.']
            : []),
          ...failedEvents.map((item) => `${item.name} (${item.eventId}): ${item.message}`),
        ].join('\n')
      : null

  await saveSyncState(sanityClient, {
    organizerName: syncState.organizerName ?? config.tickster.organizerName,
    organizerId: syncState.organizerId,
    lastIncrementalSyncAt: timestamp,
    lastIncrementalSyncCount: docs.length,
    lastArchivedCount: archivedCount,
    lastRequestCount: listRequestCount + detailRequestCount,
    lastDeferredCount: deferredCount,
    lastError: errorSummary,
  })

  console.log(
    `[tickster:sync-updates] Completed. Updated ${docs.length} events, archived ${archivedCount} events, used ${listRequestCount + detailRequestCount} requests, deferred ${deferredCount} changed events, failed ${failedEvents.length}.`,
  )
}

function formatEventLabel(event) {
  const name = event.name ?? event.id
  const lastUpdatedUtc = event.lastUpdatedUtc ? `, lastUpdatedUtc=${event.lastUpdatedUtc}` : ''
  return `${name} (${event.id}${lastUpdatedUtc})`
}

function isSameTimestamp(left, right) {
  if (!left && !right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  const leftTime = Date.parse(left)
  const rightTime = Date.parse(right)

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return String(left).trim() === String(right).trim()
  }

  return leftTime === rightTime
}

function isRateLimitError(message) {
  return /\b429\b/.test(message) || /too many requests/i.test(message)
}

main().catch(async (error) => {
  console.error('[tickster:sync-updates] Fatal error:', error)

  try {
    const config = getConfig()
    const sanityClient = createSanityWriteClient(config.sanity)
    await saveSyncError(sanityClient, error instanceof Error ? error.message : String(error))
  } catch {
    // Ignore secondary failures while reporting the original error.
  }

  process.exitCode = 1
})
