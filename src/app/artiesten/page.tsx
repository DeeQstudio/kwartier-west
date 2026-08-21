import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { ArtistIndex } from "@/components/artist-index";
import { artists } from "@/data/artists";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Artiesten | Kwartier West",
  description: `Ontdek de ${artists.length} Tekno- en Hip hop-artiesten van Kwartier West: rappers, producers, DJ's en live-acts binnen het collectief.`,
  canonical: "https://kwartierwest.be/artiesten",
  og: "https://kwartierwest.be/assets/og/artiesten.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kwartier West artiesten",
    "itemListElement": artists.map((artist, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": artist.canonical,
      "name": artist.name,
    })),
  },
] as const;

export default function ArtiestenPage() {
  return (
    <main id="main" className="artists-page" data-page="artiesten">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="roster-hero" data-roster-hero=""><div className="roster-hero-count"><b>21</b><span>ARTIESTEN</span></div><div className="roster-hero-sheet"><img src="/assets/generated/artists-banner.webp" alt="Artiesten van Kwartier West" /></div><div className="roster-hero-copy"><span>03 / ROSTER</span><h1>Van machines<br />tot bars.</h1><p>Rappers, producers, DJ's en live-acts uit de Tekno- en Hip hopwerking van Kwartier West.</p></div></section><ArtistIndex />
    </main>
  );
}
