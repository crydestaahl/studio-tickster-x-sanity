import {getDraftDocumentId, getEventDocumentId} from './sanity.mjs'

export function mapDumpEventToSanityDocument({event, venue, organizer, dumpId, importedAt}) {
  return {
    _id: getDraftDocumentId(getEventDocumentId(event.id)),
    title: event.name,
    ticksterEventId: event.id,
    organizerName: organizer?.name ?? null,
    organizer: organizer
      ? {
          id: organizer.id,
          name: organizer.name,
          country: organizer.country ?? null,
        }
      : null,
    venue: mapVenue(venue),
    descriptionMarkdown: event.description ?? null,
    descriptionHtml: null,
    startUtc: toUtcString(event.start),
    endUtc: toUtcString(event.end),
    doorsOpenUtc: toUtcString(event.doorsOpen),
    curfewUtc: null,
    publishStartUtc: null,
    publishEndUtc: null,
    saleStartUtc: null,
    saleEndUtc: null,
    lastUpdatedUtc: toUtcString(event.lastUpdated),
    state: event.published ? 'published' : 'unpublished',
    stockLevel: null,
    ageLimit: null,
    duration: null,
    accessibilityInfo: null,
    eventHierarchyType: event.hierarchyType ?? null,
    parentEventId: event.productionParentId ?? null,
    infoUrl: event.infoUri ?? null,
    shopUrl: event.shopUri ?? null,
    imageUrl: event.imageUrl ?? null,
    localizedShopUrls: null,
    performers: event.performers ?? [],
    spotifyArtists: [],
    webLinks: (event.links ?? []).map((link) => ({
      text: link.text ?? null,
      url: link.uri ?? null,
    })),
    tags: event.tags ?? [],
    products: (event.goods ?? []).map((product) => ({
      name: product.name ?? null,
      productType: product.type ?? null,
      description: product.description ?? null,
      mainImageUrl: product.images?.large ?? product.images?.small ?? null,
      price: product.price
        ? {
            amount: normalizeNumber(product.price.includingVat),
            currency: product.price.currency ?? null,
          }
        : null,
      variants: [],
    })),
    childEvents: (event.childEvents ?? []).map((childEvent) => ({
      id: childEvent.id,
      name: childEvent.name ?? null,
      startUtc: toUtcString(childEvent.start),
      endUtc: toUtcString(childEvent.end),
      state: childEvent.published ? 'published' : 'unpublished',
    })),
    isActive: true,
    syncSource: 'dump',
    sourceDumpId: dumpId,
    importedAt,
    syncedAt: importedAt,
  }
}

export function mapDetailEventToSanityDocument(event, syncedAt) {
  return {
    _id: getDraftDocumentId(getEventDocumentId(event.id)),
    title: event.name,
    ticksterEventId: event.id,
    organizerName: event.organizer?.name ?? null,
    organizer: event.organizer
      ? {
          id: event.organizer.id,
          name: event.organizer.name,
          website: event.organizer.website ?? null,
          email: event.organizer.email ?? null,
          country: event.organizer.country ?? null,
        }
      : null,
    venue: mapVenue(event.venue),
    descriptionMarkdown: event.description?.markdown ?? null,
    descriptionHtml: event.description?.html ?? null,
    startUtc: event.startUtc ?? null,
    endUtc: event.endUtc ?? null,
    doorsOpenUtc: event.doorsOpenUtc ?? null,
    curfewUtc: event.curfewUtc ?? null,
    publishStartUtc: event.publishStartUtc ?? null,
    publishEndUtc: event.publishEndUtc ?? null,
    saleStartUtc: event.saleStartUtc ?? null,
    saleEndUtc: event.saleEndUtc ?? null,
    lastUpdatedUtc: event.lastUpdatedUtc ?? null,
    state: event.state ?? null,
    stockLevel: event.stockLevel ?? null,
    ageLimit: event.ageLimit ?? null,
    duration: event.duration ?? null,
    accessibilityInfo: event.accessibilityInfo ?? null,
    eventHierarchyType: event.eventHierarchyType ?? null,
    parentEventId: event.parentEventId ?? null,
    infoUrl: event.infoUrl ?? null,
    shopUrl: event.shopUrl ?? null,
    imageUrl: event.imageUrl ?? null,
    localizedShopUrls: event.localizedShopUrls ?? null,
    performers: event.performers ?? [],
    spotifyArtists: (event.spotifyArtists ?? []).map((artist) => ({
      name: artist.name ?? null,
      id: artist.id ?? null,
    })),
    webLinks: (event.webLinks ?? []).map((link) => ({
      text: link.text ?? null,
      url: link.url ?? null,
    })),
    tags: event.tags ?? [],
    products: (event.products ?? []).map((product) => ({
      name: product.name ?? null,
      productType: product.productType ?? null,
      description: product.description ?? null,
      mainImageUrl: product.mainImageUrl ?? null,
      price: product.price
        ? {
            amount: normalizeNumber(product.price.amount),
            currency: product.price.currency ?? null,
          }
        : null,
      variants: (product.variants ?? []).map((variant) => ({
        name: variant.name ?? null,
        price: variant.price
          ? {
              amount: normalizeNumber(variant.price.amount),
              currency: variant.price.currency ?? null,
            }
          : null,
      })),
    })),
    childEvents: (event.childEvents ?? []).map((childEvent) => ({
      id: childEvent.id,
      name: childEvent.name ?? null,
      startUtc: childEvent.startUtc ?? null,
      endUtc: childEvent.endUtc ?? null,
      state: childEvent.state ?? null,
    })),
    isActive: true,
    syncSource: 'event-api',
    syncedAt,
  }
}

function mapVenue(venue) {
  if (!venue) {
    return null
  }

  return {
    id: venue.id ?? null,
    name: venue.name ?? null,
    address: venue.address ?? null,
    zipCode: venue.zipCode ?? null,
    city: venue.city ?? null,
    country: venue.country ?? null,
    geo: venue.geo
      ? {
          latitude: normalizeNumber(venue.geo.latitude),
          longitude: normalizeNumber(venue.geo.longitude),
        }
      : null,
  }
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function toUtcString(value) {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}
