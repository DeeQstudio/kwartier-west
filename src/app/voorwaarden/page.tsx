import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Voorwaarden | Kwartier West",
  description: "Gebruiksvoorwaarden voor Kwartier West: websitegebruik, boekingen, eventinformatie, externe links en rechten op content.",
  canonical: "https://kwartierwest.be/voorwaarden",
  og: "https://kwartierwest.be/assets/og/contact.jpg",
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
        "name": "Voorwaarden",
        "item": "https://kwartierwest.be/voorwaarden"
      }
    ]
  }
] as const;

export default function VoorwaardenPage() {
  return (
    <main id="main" className="legal-page voorwaarden-page" data-page="voorwaarden">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="legal-hero"><span>Kwartier West / Info</span><h1>Voorwaarden</h1><p>Praktische afspraken voor websitegebruik, boekingen, eventinformatie en externe links.</p></section><section className="legal-content section-pad"><article><small>01</small><div><h2>Website</h2><p>Deze website bundelt informatie over Kwartier West, Tekno, Hip hop, artiesten, boekingen, events, partners en contactmogelijkheden.</p><p>We houden informatie zo correct mogelijk, maar praktische details zoals tijden, locaties, line-ups en externe ticketinformatie kunnen wijzigen. Bij externe events blijft de organisator of externe bron leidend.</p></div></article><article><small>02</small><div><h2>Boekingen</h2><p>Een aanvraag via de boekingsdesk is geen automatische bevestiging. Kwartier West of de betrokken artiest bevestigt beschikbaarheid, voorwaarden en praktische afspraken apart.</p><p>Misbruik, spam of foutieve gegevens kunnen geweigerd of verwijderd worden.</p></div></article><article><small>03</small><div><h2>Content</h2><p>Teksten, beelden, logo's, artiestprofielen en eventmateriaal op deze site horen bij Kwartier West, de betrokken artiesten, partners of externe organisatoren. Hergebruik vraagt toestemming van de rechthebbende.</p><p>Vragen over inhoud of correcties kunnen naar <a href="mailto:info@kwartierwest.be">info@kwartierwest.be</a>.</p></div></article></section>
    </main>
  );
}
