import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Privacy | Kwartier West",
  description: "Privacy-informatie voor Kwartier West: contact, boekingen, events en basisgegevens die via deze website verwerkt worden.",
  canonical: "https://kwartierwest.be/privacy",
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
        "name": "Privacy",
        "item": "https://kwartierwest.be/privacy"
      }
    ]
  }
] as const;

export default function PrivacyPage() {
  return (
    <main id="main" className="legal-page privacy-page" data-page="privacy">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="legal-hero"><span>Kwartier West / Info</span><h1>Privacy</h1><p>Hoe we omgaan met contact-, boekings- en eventgegevens via kwartierwest.be.</p></section><section className="legal-content section-pad"><article><small>01</small><div><h2>Gegevens</h2><p>Kwartier West verwerkt enkel gegevens die nodig zijn om de website, boekingen, contactaanvragen, eventcommunicatie en praktische opvolging te laten werken.</p><p>Wanneer je een formulier gebruikt, kunnen naam, e-mailadres, telefoonnummer, organisatie, berichtinhoud, gekozen collectief, artiesten of eventcontext verwerkt worden. Bij technisch gebruik kunnen serverlogs zoals IP-adres, browserinformatie en tijdstip tijdelijk bewaard worden voor beveiliging en foutopvolging.</p></div></article><article><small>02</small><div><h2>Gebruik</h2><p>We gebruiken gegevens om aanvragen te beantwoorden, boekingen op te volgen, misbruik te beperken, de site stabiel te houden en communicatie rond Kwartier West correct te organiseren.</p><p>Gegevens worden niet verkocht. Externe links, zoals Villa Bota of social platforms, vallen onder het privacybeleid van die externe partijen.</p></div></article><article><small>03</small><div><h2>Contact</h2><p>Voor inzage, correctie of verwijdering van gegevens kan je mailen naar <a href="mailto:info@kwartierwest.be">info@kwartierwest.be</a>.</p></div></article><article><small>+</small><div><h2>Anti-spam & bookingbeveiliging</h2><p>Bij de boekingsdesk kan Cloudflare Turnstile gebruikt worden om geautomatiseerd misbruik te beperken. Daarbij kan Cloudflare technische gegevens verwerken die nodig zijn voor de controle. Niet-bevestigde boekingsgegevens worden tijdelijk server-side bewaard om e-mailverificatie mogelijk te maken.</p></div></article></section>
    </main>
  );
}
