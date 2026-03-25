import {getConfig, getEventApiHeaders} from './lib/config.mjs'
import {
  archiveMissingEvents,
  createSanityWriteClient,
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

  const organizerEvents = await fetchOrganizerEvents(config.tickster, syncState.organizerId, headers)
  const timestamp = new Date().toISOString()
  const activeEventIds = new Set(organizerEvents.map((event) => event.id))

  const docs = []

  for (const organizerEvent of organizerEvents) {
    const eventDetails = await fetchEventDetails(config.tickster, organizerEvent.id, headers)
    docs.push(mapDetailEventToSanityDocument(eventDetails, timestamp))
  }

  await upsertEvents(sanityClient, docs)
  const archivedCount = await archiveMissingEvents(
    sanityClient,
    syncState.organizerId,
    activeEventIds,
    timestamp,
  )

  await saveSyncState(sanityClient, {
    organizerName: syncState.organizerName ?? config.tickster.organizerName,
    organizerId: syncState.organizerId,
    lastIncrementalSyncAt: timestamp,
    lastIncrementalSyncCount: docs.length,
    lastArchivedCount: archivedCount,
    lastError: null,
  })

  console.log(`Updated ${docs.length} events and archived ${archivedCount} events.`)
}

main().catch(async (error) => {
  console.error(error)

  try {
    const config = getConfig()
    const sanityClient = createSanityWriteClient(config.sanity)
    await saveSyncError(sanityClient, error instanceof Error ? error.message : String(error))
  } catch {
    // Ignore secondary failures while reporting the original error.
  }

  process.exitCode = 1
})
