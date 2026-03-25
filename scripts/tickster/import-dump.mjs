import {getConfig} from './lib/config.mjs'
import {
  createSanityWriteClient,
  getSyncState,
  saveSyncError,
  saveSyncState,
  upsertEvents,
} from './lib/sanity.mjs'
import {
  downloadDumpJson,
  fetchLatestDumpDescriptor,
  filterDumpEventsByOrganizer,
  findOrganizerInDump,
} from './lib/tickster.mjs'
import {mapDumpEventToSanityDocument} from './lib/transformers.mjs'

async function main() {
  const config = getConfig()
  const sanityClient = createSanityWriteClient(config.sanity)
  const syncState = await getSyncState(sanityClient)
  const force = process.argv.includes('--force')

  const dumpDescriptor = await fetchLatestDumpDescriptor(config.tickster)

  if (!force && syncState?.latestDumpId === dumpDescriptor.id) {
    console.log(`Latest dump ${dumpDescriptor.id} already imported. Use --force to import again.`)
    return
  }

  const dump = await downloadDumpJson(dumpDescriptor.uri)
  const organizer = findOrganizerInDump(dump, config.tickster.organizerName)

  if (!organizer) {
    throw new Error(`Organizer "${config.tickster.organizerName}" was not found in the latest dump.`)
  }

  const timestamp = new Date().toISOString()
  const docs = filterDumpEventsByOrganizer(dump, organizer.id).map(({event, venue, organizer: eventOrganizer}) =>
    mapDumpEventToSanityDocument({
      event,
      venue,
      organizer: eventOrganizer,
      dumpId: dumpDescriptor.id,
      importedAt: timestamp,
    }),
  )

  await upsertEvents(sanityClient, docs)
  await saveSyncState(sanityClient, {
    organizerName: organizer.name,
    organizerId: organizer.id,
    latestDumpId: dumpDescriptor.id,
    latestDumpCreatedAt: dumpDescriptor.created,
    lastFullImportAt: timestamp,
    lastFullImportCount: docs.length,
    lastError: null,
  })

  console.log(`Imported ${docs.length} events for ${organizer.name} from dump ${dumpDescriptor.id}.`)
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
