import Link from 'next/link'
import Image from 'next/image'
import {EventGrid} from '@/components/event-grid'
import {RichText} from '@/components/portable-text'
import {getHomePage, getUpcomingEvents} from '@/lib/sanity.queries'
import {urlForImage} from '@/lib/sanity.image'

export default async function Page() {
  const [homePage, events] = await Promise.all([getHomePage(), getUpcomingEvents()])
  const featuredEvents = events.slice(0, 10)
  const heroImageUrl = homePage?.heroImage
    ? urlForImage(homePage.heroImage).width(1400).height(1500).fit('crop').url()
    : null

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="hero-card">
          <div className="hero-grid">
            <div className="hero-content">
              {homePage?.eyebrow ? <span className="eyebrow">{homePage.eyebrow}</span> : null}
              <div className="hero-content-body">
                <h1 className="hero-title">{homePage?.heroTitle ?? 'Pustervik i fokus'}</h1>
                <p className="hero-lead">
                  {homePage?.heroLead ??
                    'Bygg startsidan i Sanity och låt eventen från Tickster landa direkt under välkomstsektionen.'}
                </p>
                <div className="hero-actions">
                  {homePage?.primaryCta?.label && homePage.primaryCta.href ? (
                    <a className="button-primary" href={homePage.primaryCta.href}>
                      {homePage.primaryCta.label}
                    </a>
                  ) : null}
                  {homePage?.secondaryCta?.label && homePage.secondaryCta.href ? (
                    <a className="button-secondary" href={homePage.secondaryCta.href}>
                      {homePage.secondaryCta.label}
                    </a>
                  ) : null}
                </div>
                {homePage?.content?.length ? (
                  <div className="portable">
                    <RichText value={homePage.content} />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="hero-media">
              {heroImageUrl ? (
                <Image
                  src={heroImageUrl}
                  alt={homePage?.heroTitle ?? 'Startsidebild'}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 40vw"
                />
              ) : null}
            </div>
          </div>
        </section>

        <section className="events-card" id="events">
          <div className="section-head">
            <h2 className="section-title">{homePage?.eventsSectionTitle ?? 'Kommande event'}</h2>
            <p className="section-lead">
              {homePage?.eventsSectionLead ??
                'Listan uppdateras från Tickster och visar de kommande Pustervik-event som finns synkade i Sanity.'}
            </p>
            {events.length > 10 ? (
              <div className="section-actions">
                <Link className="button-secondary" href="/events">
                  Se alla event
                </Link>
              </div>
            ) : null}
          </div>
          <EventGrid events={featuredEvents} />
        </section>
      </div>
    </main>
  )
}
