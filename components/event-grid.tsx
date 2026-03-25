import Image from 'next/image'
import {urlForImage} from '@/lib/sanity.image'
import type {TicksterEvent} from '@/lib/sanity.queries'

function formatEventDate(value?: string) {
  if (!value) {
    return 'Datum kommer snart'
  }

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(value))
}

function getDescription(markdown?: string) {
  if (!markdown) {
    return 'Mer information kommer snart.'
  }

  return markdown.replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 180)
}

export function EventGrid({events}: {events: TicksterEvent[]}) {
  if (!events.length) {
    return <div className="empty-state">Inga kommande event hittades.</div>
  }

  return (
    <div className="events-grid">
      {events.map((event) => {
        const eventImageUrl = event.eventImage
          ? urlForImage(event.eventImage).width(1200).height(900).fit('crop').url()
          : null

        return (
          <article className="event-card" key={event._id}>
            <div className="event-card-image">
              {eventImageUrl ? (
                <Image src={eventImageUrl} alt={event.title} fill sizes="(max-width: 900px) 100vw, 50vw" />
              ) : null}
            </div>
            <div className="event-card-copy">
              <div className="event-meta">
                <span>{formatEventDate(event.startUtc)}</span>
                {event.venue?.name ? <span>{event.venue.name}</span> : null}
                {event.organizerName ? <span>{event.organizerName}</span> : null}
              </div>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{getDescription(event.descriptionMarkdown)}</p>
              <div className="event-links">
                {event.infoUrl ? (
                  <a className="event-link" href={event.infoUrl} target="_blank" rel="noreferrer">
                    Läs mer
                  </a>
                ) : null}
                {event.shopUrl ? (
                  <a className="event-link" href={event.shopUrl} target="_blank" rel="noreferrer">
                    Köp biljett
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
