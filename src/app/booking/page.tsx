import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { BookingBuilder } from "@/components/booking-builder";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Boekingsdesk | Kwartier West",
  description: "Boek een Kwartier West-artiest, meerdere artiesten, een volledige scene of een takeover via de centrale boekingsdesk.",
  canonical: "https://kwartierwest.be/booking",
  og: "https://kwartierwest.be/assets/og/booking.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kwartierwest.be/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Boekingsdesk",
        "item": "https://kwartierwest.be/booking"
      }
    ]
  }
] as const;

export default function BookingPage() {
  return (
    <main id="main" className="booking-page">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="booking-hero" data-booking-hero=""><div className="booking-hero-left"><span>07 / BOOKING</span><h1>Wie wil<br />je waar?</h1><p>Boek één artiest, meerdere namen, een volledige scene of een Kwartier West-takeover voor je event.</p></div><div className="booking-hero-router"><div><small>01</small><b>SOLO</b></div><div><small>02</small><b>MEERDERE</b></div><div><small>03</small><b>SCENE</b></div><div><small>04</small><b>TAKEOVER</b></div><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></div></section>
      <BookingBuilder />
    </main>
  );
}
