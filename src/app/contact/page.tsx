import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Contact | Kwartier West Brugge",
  description: "Contacteer Kwartier West voor algemene vragen, media, partners en boekingen. Voor bookings gebruik je de centrale boekingsdesk.",
  canonical: "https://kwartierwest.be/contact",
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
        "name": "Contact",
        "item": "https://kwartierwest.be/contact"
      }
    ]
  }
] as const;

export default function ContactPage() {
  return (
    <main id="main" className="contact-page" data-page="contact">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="contact-hero" data-contact-hero=""><div><span>08 / CONTACT / BRUGGE</span><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></div><h1><a href="mailto:info@kwartierwest.be">INFO@<br />KWARTIERWEST.BE</a></h1><p>Algemene vragen hier. Boekingen via de boekingsdesk.</p></section><section className="contact-stage section-pad" data-contact-stage=""><div className="contact-big"><span>Algemeen</span><a href="mailto:info@kwartierwest.be">info@kwartierwest.be</a></div><div className="contact-grid"><div><span>Boekingen</span><h2>Artiest, scene of takeover?</h2><Link className="arrow-link" href="/booking">Open boekingsdesk <span>↗</span></Link></div><div><span>Social</span><a href="https://www.instagram.com/kwtr_west/" target="_blank" rel="noopener noreferrer">Instagram / @kwtr_west</a><a href="https://www.facebook.com/profile.php?id=61557994985369" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://soundcloud.com/kwartier-west" target="_blank" rel="noopener noreferrer">SoundCloud</a></div><div><span>Regio</span><h2>Brugge<br />België</h2></div></div></section>
    </main>
  );
}
