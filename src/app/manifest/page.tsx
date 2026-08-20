import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Manifest | Kwartier West",
  description: "Waar Kwartier West voor staat: een West-Vlaams collectief dat Tekno en Hip hop samenbrengt rond artiesten, events en samenwerking.",
  canonical: "https://kwartierwest.be/manifest",
  og: "https://kwartierwest.be/assets/og/manifest.jpg",
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
        "name": "Manifest",
        "item": "https://kwartierwest.be/manifest"
      }
    ]
  }
] as const;

export default function ManifestPage() {
  return (
    <main id="main" className="manifest-page" data-page="manifest">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="manifest-hero" data-manifest-hero=""><div className="manifest-hero-mark"><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></div><div className="manifest-hero-copy"><span>09 / MANIFEST</span><h1>VAN'T<br />WESTEN.</h1><p>Kwartier West is West-Vlaams en brengt Tekno en Hip hop samen rond artiesten, events en samenwerkingen.</p></div></section><section className="manifest-lines" data-manifest=""><div><small>01</small><h2>Tekno en Hip hop.<br />Eén collectief,<br />twee scenes.</h2></div><div><small>02</small><h2>Ruimte voor<br />eigen artiesten<br />en eigen geluid.</h2></div><div><small>03</small><h2>Livesets,<br />events en<br />samenwerkingen.</h2></div><div><small>04</small><h2>Van solo-act<br />tot volledige<br />takeover.</h2></div><div><small>05</small><h2>West-Vlaams.<br />Van't<br />Westen.</h2></div></section><section className="manifest-end"><img src="/assets/kw-wordmark.png" alt="Kwartier West" /><p>Tekno / Hip hop / West-Vlaams</p></section>
    </main>
  );
}
