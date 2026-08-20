import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { VillaWestStatus } from "@/components/villa-west-status";
import { eventBySlug } from "@/data/events";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Events | Kwartier West",
  description: "Events van Kwartier West. Actueel: Villa West op 21 augustus 2026 bij Villa Bota in Brugge, plus het archief van eerdere producties.",
  canonical: "https://kwartierwest.be/events",
  og: "https://kwartierwest.be/assets/og/events.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kwartierwest.be/" },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": "https://kwartierwest.be/events" }
    ]
  }
] as const;

export default function EventsPage() {
  const villa = eventBySlug.get("villa-west-2026");

  return (
    <main id="main" className="events-page" data-page="events">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="events-hero events-hero--current" data-events-hero="">
        <div className="events-poster-a"><img src="/assets/media/events/villa-west-2026-08-21.jpg" alt="Villa West 21 augustus 2026" /></div>
        <div className="events-poster-b"><img src="/assets/media/archive/teknorelics-03.webp" alt="Teknorelics live" /></div>
        <div className="events-hero-title">
          <span>04 / EVENTS / LIVE</span>
          <h1>EVENTS</h1>
          <p>Villa West staat nog één keer op rood. Vrijdag 21 augustus, live vanuit Villa Bota.</p>
        </div>
      </section>

      <section className="event-status section-pad event-status--live">
        <div>
          <span className="eyebrow">Actueel / Villa West</span>
          <h2>Villa West<br />21.08.2026</h2>
        </div>
        <div className="event-status-live-copy">
          <p>Thorre en Siga & Lefever spelen van 22:00 tot 23:00. Wildcard neemt het laatste uur over tot middernacht.</p>
          <b>{villa?.stream ? <VillaWestStatus stream={villa.stream} /> : "Main event"}</b>
          <Link href="/events/villa-west-2026#villa-west-stream">Open event + livestream</Link>
        </div>
      </section>

      <section className="event-grid section-pad">
        <Link className="event-card event-card--poster event-card--main" href="/events/villa-west-2026">
          <figure><img src="/assets/media/events/villa-west-2026-08-21.jpg" alt="Villa West poster" /></figure>
          <div><span>21.08.2026 / Villa Bota / laatste editie</span><h2>Villa West</h2><p>Thorre + Siga & Lefever / Wildcard / livestream</p></div>
        </Link>
        <Link className="event-card event-card--photo" href="/events/teknorelics-eye-of-the-temple">
          <figure><img src="/assets/media/archive/teknorelics-03.webp" alt="Teknorelics Eye of the Temple" /></figure>
          <div><span>28.03.2026 / Het Entrepot</span><h2>Teknorelics:<br />Eye of the Temple</h2><p>Tekno / multi-artist night / Brugge</p></div>
        </Link>
      </section>

      <section className="archive-push">
        <div><span>Archief / Kwartier West</span><h2>Van Villa West tot Teknorelics: nachten, line-ups en beelden uit onze producties.</h2><Link href="/archive">Open het fotoarchief</Link></div>
      </section>
    </main>
  );
}
