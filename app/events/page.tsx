import Link from 'next/link'
import {EventGrid} from '@/components/event-grid'
import {getUpcomingEvents} from '@/lib/sanity.queries'

export default async function EventsPage() {
  const events = await getUpcomingEvents()

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="events-card">
          <div className="section-head">
            <div className="section-actions">
              <Link className="button-secondary" href="/">
                Tillbaka till startsidan
              </Link>
            </div>
            <h1 className="section-title">Alla kommande event</h1>
            <p className="section-lead">
              Samtliga synkade Pustervik-event, sorterade efter datum.
            </p>
          </div>
          <EventGrid events={events} />
        </section>
      </div>
    </main>
  )
}
