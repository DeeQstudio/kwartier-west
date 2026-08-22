import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Events | Kwartier West",
  description: "Events en archief van Kwartier West, met Villa West bij Villa Bota en Teknorelics in Het Entrepot in Brugge.",
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
  return (
    <main id="main" className="events-page" data-page="events">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="events-hero events-hero--current" data-events-hero="">
        <div className="events-poster-a"><img src="/assets/media/events/villa-west-2026-08-21.jpg" alt="Villa West 21 augustus 2026" /></div>
        <div className="events-poster-b"><img src="/assets/media/archive/teknorelics-03.webp" alt="Teknorelics live" /></div>
        <div className="events-hero-title">
          <span>04 / EVENTS / ARCHIEF</span>
          <h1>EVENTS</h1>
          <p>Villa West sloot de zomer af op 21 augustus bij Villa Bota.</p>
        </div>
      </section>

      <section className="event-grid section-pad">
        <Link className="event-card event-card--poster event-card--main" href="/events/villa-west-2026">
          <figure><img src="/assets/media/events/villa-west-2026-08-21.jpg" alt="Villa West poster" /></figure>
          <div><span>21.08.2026 / Villa Bota / laatste editie</span><h2>Villa West</h2><p>Thorre + Siga & Lefever / Wildcard</p></div>
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
