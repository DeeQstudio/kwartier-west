import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Archief | Kwartier West",
  description: "Fotoarchief van Kwartier West met beelden, line-ups en momenten uit voorbije events, waaronder Teknorelics: Eye of the Temple.",
  canonical: "https://kwartierwest.be/archive",
  og: "https://kwartierwest.be/assets/og/archive.jpg",
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
        "name": "Archief",
        "item": "https://kwartierwest.be/archive"
      }
    ]
  }
] as const;

export default function ArchivePage() {
  return (
    <main id="main" className="archive-page" data-page="archive">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="archive-hero" data-archive-hero=""><div className="archive-hero-track"><img src="/assets/media/archive/teknorelics-01.webp" alt="Teknorelics foto" /><img src="/assets/media/archive/teknorelics-03.webp" alt="Teknorelics foto" /><img src="/assets/media/archive/teknorelics-05.webp" alt="Teknorelics foto" /><img src="/assets/media/archive/teknorelics-07.webp" alt="Teknorelics foto" /></div><div className="archive-hero-type"><span>05 / ARCHIEF</span><h1>Wat blijft<br />na de nacht.</h1></div></section><section className="archive-intro section-pad"><h2>Nachten die<br />blijven hangen.</h2><p>Foto's, line-ups en momenten uit voorbije Kwartier West-producties, van Teknorelics tot Villa West.</p></section><section className="archive-wall" data-archive-wall=""><figure className="archive-tile archive-tile--0"><img src="/assets/media/archive/teknorelics-01.webp" alt="Teknorelics Eye of the Temple — foto 1" loading="lazy" /><figcaption>01 / 28.03.2026</figcaption></figure><figure className="archive-tile archive-tile--1"><img src="/assets/media/archive/teknorelics-02.webp" alt="Teknorelics Eye of the Temple — foto 2" loading="lazy" /><figcaption>02 / 28.03.2026</figcaption></figure><figure className="archive-tile archive-tile--2"><img src="/assets/media/archive/teknorelics-03.webp" alt="Teknorelics Eye of the Temple — foto 3" loading="lazy" /><figcaption>03 / 28.03.2026</figcaption></figure><figure className="archive-tile archive-tile--3"><img src="/assets/media/archive/teknorelics-04.webp" alt="Teknorelics Eye of the Temple — foto 4" loading="lazy" /><figcaption>04 / 28.03.2026</figcaption></figure><figure className="archive-tile archive-tile--0"><img src="/assets/media/archive/teknorelics-05.webp" alt="Teknorelics Eye of the Temple — foto 5" loading="lazy" /><figcaption>05 / 28.03.2026</figcaption></figure><figure className="archive-tile archive-tile--1"><img src="/assets/media/archive/teknorelics-06.webp" alt="Teknorelics Eye of the Temple — foto 6" loading="lazy" /><figcaption>06 / 28.03.2026</figcaption></figure><figure className="archive-tile archive-tile--2"><img src="/assets/media/archive/teknorelics-07.webp" alt="Teknorelics Eye of the Temple — foto 7" loading="lazy" /><figcaption>07 / 28.03.2026</figcaption></figure></section><Link className="archive-event-link" href="/events/teknorelics-eye-of-the-temple"><span>Volledig event</span><b>Teknorelics: Eye of the Temple</b><i>→</i></Link><Link className="archive-event-link" href="/events/villa-west-2026"><span>Volledig event</span><b>Villa West — 21.08.2026</b><i>→</i></Link>
    </main>
  );
}
