import type {PortableTextBlock} from '@portabletext/types'
import {sanityClient} from './sanity.client'

export type HomePage = {
  eyebrow?: string
  heroTitle?: string
  heroLead?: string
  heroImage?: unknown
  primaryCta?: {label?: string; href?: string}
  secondaryCta?: {label?: string; href?: string}
  content?: PortableTextBlock[]
  eventsSectionTitle?: string
  eventsSectionLead?: string
}

export type TicksterEvent = {
  _id: string
  title: string
  startUtc?: string
  venue?: {name?: string; city?: string}
  organizerName?: string
  descriptionMarkdown?: string
  infoUrl?: string
  shopUrl?: string
  eventImage?: unknown
  imageUrl?: string
}

const homePageQuery = `*[_type == "homePage" && _id == "homePage"][0]{
  eyebrow,
  heroTitle,
  heroLead,
  heroImage,
  primaryCta,
  secondaryCta,
  content,
  eventsSectionTitle,
  eventsSectionLead
}`

const eventsQuery = `*[_type == "ticksterEvent" && isActive == true] | order(startUtc asc){
  _id,
  title,
  startUtc,
  venue,
  organizerName,
  descriptionMarkdown,
  infoUrl,
  shopUrl,
  eventImage,
  imageUrl
}`

export async function getHomePage() {
  return sanityClient.fetch<HomePage | null>(homePageQuery)
}

export async function getUpcomingEvents() {
  return sanityClient.fetch<TicksterEvent[]>(eventsQuery)
}
