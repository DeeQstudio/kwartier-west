import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { ArtistIndex } from "@/components/artist-index";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Artiesten | Kwartier West",
  description: "Ontdek de 21 Tekno- en Hip hop-artiesten van Kwartier West: rappers, producers, DJ's en live-acts binnen het collectief.",
  canonical: "https://kwartierwest.be/artiesten",
  og: "https://kwartierwest.be/assets/og/artiesten.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kwartier West artiesten",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://kwartierwest.be/artiesten/de-kweker",
        "name": "De Kweker"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://kwartierwest.be/artiesten/thorre",
        "name": "Thorre"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "url": "https://kwartierwest.be/artiesten/krank",
        "name": "Krank"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "url": "https://kwartierwest.be/artiesten/mc-tubbie",
        "name": "MC Tubbie"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "url": "https://kwartierwest.be/artiesten/thepanda",
        "name": "The P.A.N.D.A"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "url": "https://kwartierwest.be/artiesten/duvve",
        "name": "Duvve"
      },
      {
        "@type": "ListItem",
        "position": 7,
        "url": "https://kwartierwest.be/artiesten/bruce",
        "name": "Bruce"
      },
      {
        "@type": "ListItem",
        "position": 8,
        "url": "https://kwartierwest.be/artiesten/creamz",
        "name": "Creamz"
      },
      {
        "@type": "ListItem",
        "position": 9,
        "url": "https://kwartierwest.be/artiesten/onschuldig",
        "name": "Onschuldig"
      },
      {
        "@type": "ListItem",
        "position": 10,
        "url": "https://kwartierwest.be/artiesten/hyperion",
        "name": "Hyperion"
      },
      {
        "@type": "ListItem",
        "position": 11,
        "url": "https://kwartierwest.be/artiesten/woebn",
        "name": "Woebn"
      },
      {
        "@type": "ListItem",
        "position": 12,
        "url": "https://kwartierwest.be/artiesten/wildcrd",
        "name": "W!LD.CRD"
      },
      {
        "@type": "ListItem",
        "position": 13,
        "url": "https://kwartierwest.be/artiesten/noratn",
        "name": "NORATN"
      },
      {
        "@type": "ListItem",
        "position": 14,
        "url": "https://kwartierwest.be/artiesten/alexer",
        "name": "Alexer"
      },
      {
        "@type": "ListItem",
        "position": 15,
        "url": "https://kwartierwest.be/artiesten/spoorloos",
        "name": "Spoorloos"
      },
      {
        "@type": "ListItem",
        "position": 16,
        "url": "https://kwartierwest.be/artiesten/jenesaispas",
        "name": "Jenesaispas"
      },
      {
        "@type": "ListItem",
        "position": 17,
        "url": "https://kwartierwest.be/artiesten/kulture",
        "name": "Kulture"
      },
      {
        "@type": "ListItem",
        "position": 18,
        "url": "https://kwartierwest.be/artiesten/kumatekz",
        "name": "Kumatekz"
      },
      {
        "@type": "ListItem",
        "position": 19,
        "url": "https://kwartierwest.be/artiesten/masschie",
        "name": "Masschie"
      },
      {
        "@type": "ListItem",
        "position": 20,
        "url": "https://kwartierwest.be/artiesten/mombietekk",
        "name": "Mombietekk"
      },
      {
        "@type": "ListItem",
        "position": 21,
        "url": "https://kwartierwest.be/artiesten/psamtek",
        "name": "Psamtek"
      }
    ]
  },
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
        "name": "Artiesten",
        "item": "https://kwartierwest.be/artiesten"
      }
    ]
  }
] as const;

export default function ArtiestenPage() {
  return (
    <main id="main" className="artists-page" data-page="artiesten">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="roster-hero" data-roster-hero=""><div className="roster-hero-count"><b>21</b><span>ARTIESTEN</span></div><div className="roster-hero-sheet"><img src="/assets/generated/artists-banner.webp" alt="Artiesten van Kwartier West" /></div><div className="roster-hero-copy"><span>03 / ROSTER</span><h1>Van machines<br />tot bars.</h1><p>Rappers, producers, DJ's en live-acts uit de Tekno- en Hip hopwerking van Kwartier West.</p></div></section><ArtistIndex />
    </main>
  );
}
