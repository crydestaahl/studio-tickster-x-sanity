import {gunzipSync} from 'node:zlib'

export async function fetchLatestDumpDescriptor(config) {
  const url = new URL(
    `/${config.languageCode}/api/${config.eventApiVersion}/events/dump/upcoming`,
    config.dumpApiBaseUrl,
  )
  url.searchParams.set('key', config.dumpApiKey)

  return fetchJson(url, {headers: {Accept: 'application/json'}})
}

export async function downloadDumpJson(uri) {
  const response = await fetch(uri, {headers: {Accept: 'application/json'}})
  if (!response.ok) {
    throw new Error(`Tickster dump download failed (${response.status} ${response.statusText})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  try {
    return JSON.parse(buffer.toString('utf8'))
  } catch {
    return JSON.parse(gunzipSync(buffer).toString('utf8'))
  }
}

export function findOrganizerInDump(dump, organizerName) {
  return dump.organizers.find(
    (organizer) => organizer.name?.trim().toLowerCase() === organizerName.trim().toLowerCase(),
  )
}

export function filterDumpEventsByOrganizer(dump, organizerId) {
  const venuesById = new Map(dump.venues.map((venue) => [venue.id, venue]))
  const organizersById = new Map(dump.organizers.map((organizer) => [organizer.id, organizer]))

  return dump.events
    .filter((event) => event.organizerId === organizerId)
    .map((event) => ({
      event,
      venue: venuesById.get(event.venueId) ?? null,
      organizer: organizersById.get(event.organizerId) ?? null,
    }))
}

export async function fetchOrganizerEvents(config, organizerId, headers) {
  const items = []
  let skip = 0
  let requestCount = 0

  while (true) {
    const url = new URL(
      `/api/v${config.eventApiVersion}/${config.languageCode}/organizers/${organizerId}/events`,
      config.eventApiBaseUrl,
    )
    url.searchParams.set('take', '100')
    url.searchParams.set('skip', String(skip))

    const payload = await fetchJson(url, {headers})
    requestCount += 1
    items.push(...payload.items)

    if (items.length >= payload.totalItems || payload.items.length === 0) {
      break
    }

    skip += payload.items.length
  }

  return {items, requestCount}
}

export async function fetchEventDetails(config, eventId, headers) {
  const url = new URL(
    `/api/v${config.eventApiVersion}/${config.languageCode}/events/${eventId}`,
    config.eventApiBaseUrl,
  )

  return fetchJson(url, {headers})
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body = await safeReadBody(response)
    throw new Error(
      `Tickster request failed (${response.status} ${response.statusText}) for ${url.toString()}\n${body}`,
    )
  }

  return response.json()
}

async function safeReadBody(response) {
  try {
    return await response.text()
  } catch {
    return '<unable to read response body>'
  }
}
