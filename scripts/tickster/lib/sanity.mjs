import {createClient} from '@sanity/client'

const SYNC_STATE_ID = 'tickster-sync-state'
const DRAFTS_PREFIX = 'drafts.'

export function createSanityWriteClient(config) {
  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token,
    useCdn: false,
  })
}

export function getEventDocumentId(eventId) {
  return `ticksterEvent-${eventId}`
}

export function getDraftDocumentId(documentId) {
  return `${DRAFTS_PREFIX}${documentId}`
}

export function getPublishedDocumentId(documentId) {
  return documentId.startsWith(DRAFTS_PREFIX) ? documentId.slice(DRAFTS_PREFIX.length) : documentId
}

export async function getSyncState(client) {
  return (
    (await client.fetch(
      `*[_id == $id][0]{
        _id,
        organizerName,
        organizerId,
        latestDumpId,
        latestDumpCreatedAt,
        lastFullImportAt,
        lastIncrementalSyncAt,
        lastRequestCount,
        lastDeferredCount
      }`,
      {id: SYNC_STATE_ID},
    )) ?? null
  )
}

export async function getExistingEventMetadata(client, organizerId) {
  const docs = await client.fetch(
    `*[_type == "ticksterEvent" && organizer.id == $organizerId]{
      _id,
      ticksterEventId,
      lastUpdatedUtc
    }`,
    {organizerId},
  )

  const byEventId = new Map()

  for (const doc of docs) {
    const current = byEventId.get(doc.ticksterEventId)
    const isDraft = typeof doc._id === 'string' && doc._id.startsWith(DRAFTS_PREFIX)

    if (!current || isDraft) {
      byEventId.set(doc.ticksterEventId, doc)
    }
  }

  return byEventId
}

export async function saveSyncState(client, fields) {
  const setFields = {...fields}
  const unset = []

  if (setFields.lastError === null) {
    delete setFields.lastError
    unset.push('lastError')
  }

  await client
    .transaction()
    .createIfNotExists({_id: SYNC_STATE_ID, _type: 'ticksterSyncState', title: 'Tickster Sync State'})
    .patch(SYNC_STATE_ID, {set: setFields, unset})
    .commit()
}

export async function saveSyncError(client, message) {
  await client
    .transaction()
    .createIfNotExists({_id: SYNC_STATE_ID, _type: 'ticksterSyncState', title: 'Tickster Sync State'})
    .patch(SYNC_STATE_ID, {
      set: {
        lastError: message,
      },
    })
    .commit()
}

export async function upsertEvents(client, docs) {
  if (docs.length === 0) {
    return
  }

  const docsWithImages = await attachEventImages(client, docs)

  const chunks = chunk(docsWithImages, 50)

  for (const currentChunk of chunks) {
    let transaction = client.transaction()

    for (const doc of currentChunk) {
      transaction = transaction
        .createIfNotExists({_id: doc._id, _type: 'ticksterEvent'})
        .patch(doc._id, {set: doc})
    }

    await transaction.commit()
  }
}

export async function archiveMissingEvents(client, organizerId, activeEventIds, timestamp) {
  const existingIds = await client.fetch(
    `*[_type == "ticksterEvent" && organizer.id == $organizerId && isActive == true && _id in path("drafts.**")]{
      _id,
      ticksterEventId
    }`,
    {organizerId},
  )

  const idsToArchive = existingIds
    .filter((item) => !activeEventIds.has(item.ticksterEventId))
    .map((item) => item._id)

  if (idsToArchive.length === 0) {
    return 0
  }

  for (const currentChunk of chunk(idsToArchive, 50)) {
    let transaction = client.transaction()

    for (const id of currentChunk) {
      transaction = transaction.patch(id, {
        set: {
          isActive: false,
          syncedAt: timestamp,
        },
      })
    }

    await transaction.commit()
  }

  return idsToArchive.length
}

export async function publishAllDraftEvents(client) {
  const drafts = await client.fetch(
    `*[_type == "ticksterEvent" && _id in path("drafts.**")]{
      _id,
      _type,
      title,
      ticksterEventId,
      organizerName,
      organizer,
      venue,
      descriptionMarkdown,
      descriptionHtml,
      startUtc,
      endUtc,
      doorsOpenUtc,
      curfewUtc,
      publishStartUtc,
      publishEndUtc,
      saleStartUtc,
      saleEndUtc,
      lastUpdatedUtc,
      state,
      stockLevel,
      ageLimit,
      duration,
      accessibilityInfo,
      eventHierarchyType,
      parentEventId,
      infoUrl,
      shopUrl,
      eventImage,
      imageUrl,
      localizedShopUrls,
      performers,
      spotifyArtists,
      webLinks,
      tags,
      products,
      childEvents,
      isActive,
      syncSource,
      sourceDumpId,
      importedAt,
      syncedAt
    }`,
  )

  if (!drafts.length) {
    return 0
  }

  for (const currentChunk of chunk(drafts, 25)) {
    let transaction = client.transaction()

    for (const draft of currentChunk) {
      const publishedId = getPublishedDocumentId(draft._id)
      transaction = transaction.createOrReplace({
        ...draft,
        _id: publishedId,
      })
    }

    await transaction.commit()
  }

  return drafts.length
}

export async function movePublishedEventsToDrafts(client) {
  const publishedEvents = await client.fetch(
    `*[_type == "ticksterEvent" && !(_id in path("drafts.**"))]{
      _id,
      _type,
      title,
      ticksterEventId,
      organizerName,
      organizer,
      venue,
      descriptionMarkdown,
      descriptionHtml,
      startUtc,
      endUtc,
      doorsOpenUtc,
      curfewUtc,
      publishStartUtc,
      publishEndUtc,
      saleStartUtc,
      saleEndUtc,
      lastUpdatedUtc,
      state,
      stockLevel,
      ageLimit,
      duration,
      accessibilityInfo,
      eventHierarchyType,
      parentEventId,
      infoUrl,
      shopUrl,
      eventImage,
      imageUrl,
      localizedShopUrls,
      performers,
      spotifyArtists,
      webLinks,
      tags,
      products,
      childEvents,
      isActive,
      syncSource,
      sourceDumpId,
      importedAt,
      syncedAt
    }`,
  )

  if (!publishedEvents.length) {
    return 0
  }

  for (const currentChunk of chunk(publishedEvents, 25)) {
    let transaction = client.transaction()

    for (const event of currentChunk) {
      const draftId = getDraftDocumentId(event._id)
      transaction = transaction.createOrReplace({...event, _id: draftId}).delete(event._id)
    }

    await transaction.commit()
  }

  return publishedEvents.length
}

function chunk(items, size) {
  const result = []

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size))
  }

  return result
}

async function attachEventImages(client, docs) {
  const publishedIds = docs.map((doc) => getPublishedDocumentId(doc._id))
  const existingDocs = await client.fetch(
    `*[_type == "ticksterEvent" && (ticksterEventId in $eventIds || _id in $publishedIds || _id in $draftIds)]{
      _id,
      ticksterEventId,
      imageUrl,
      eventImage
    }`,
    {
      eventIds: docs.map((doc) => doc.ticksterEventId),
      publishedIds,
      draftIds: docs.map((doc) => doc._id),
    },
  )

  const existingById = new Map()
  for (const doc of existingDocs) {
    existingById.set(doc._id, doc)
    if (doc.ticksterEventId) {
      existingById.set(doc.ticksterEventId, doc)
    }
  }
  const uploadedAssetRefsByUrl = new Map()
  const result = []

  for (const doc of docs) {
    const existingDoc = existingById.get(doc._id) ?? existingById.get(doc.ticksterEventId)

    if (!doc.imageUrl) {
      result.push({...doc, eventImage: null})
      continue
    }

    if (existingDoc?.imageUrl === doc.imageUrl && existingDoc?.eventImage?.asset?._ref) {
      result.push({
        ...doc,
        eventImage: existingDoc.eventImage,
      })
      continue
    }

    if (uploadedAssetRefsByUrl.has(doc.imageUrl)) {
      result.push({
        ...doc,
        eventImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedAssetRefsByUrl.get(doc.imageUrl),
          },
        },
      })
      continue
    }

    const assetRef = await uploadImageAsset(client, doc.imageUrl, doc.ticksterEventId)
    uploadedAssetRefsByUrl.set(doc.imageUrl, assetRef)

    result.push({
      ...doc,
      eventImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: assetRef,
        },
      },
    })
  }

  return result
}

async function uploadImageAsset(client, imageUrl, ticksterEventId) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Image download failed (${response.status} ${response.statusText}) for ${imageUrl}`)
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  const imageBuffer = Buffer.from(await response.arrayBuffer())
  const extension = contentType.split('/')[1]?.split(';')[0] ?? 'jpg'

  const asset = await client.assets.upload('image', imageBuffer, {
    contentType,
    filename: `tickster-${ticksterEventId}.${extension}`,
  })

  return asset._id
}
