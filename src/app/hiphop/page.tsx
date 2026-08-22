import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { HiphopRoster } from "@/components/scene-rosters";
import { ArtistAnnouncements } from "@/components/artist-announcements";
import { hiphopArtists } from "@/data/artists";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Hip hop West-Vlaanderen | De Kweker & Kwartier West",
  description: "West-Vlaamse hip hop bij Kwartier West, met De Kweker, rappers, producers en live-artiesten, profielen, bookings en officiële artiestenlinks.",
  canonical: "https://kwartierwest.be/hiphop",
  og: "https://kwartierwest.be/assets/og/hiphop.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kwartierwest.be/" },
      { "@type": "ListItem", "position": 2, "name": "Hip hop", "item": "https://kwartierwest.be/hiphop" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kwartier West hip hop artiesten",
    "numberOfItems": hiphopArtists.length,
    "itemListElement": hiphopArtists.map((artist, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": artist.name,
        "url": artist.canonical
      }
    }))
  }
] as const;

export default function HiphopPage() {
  return (
    <main id="main" className="scene-page hiphop-page" data-page="hiphop">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}

      <section className="hiphop-hero" data-hiphop-hero="">
        <div className="hiphop-hero-red" />
        <div className="hiphop-hero-copy"><span>02 / SCENE / KWARTIER WEST</span><h1>HIP<br />HOP</h1><p>Rappers / producers / live</p></div>
        <div className="hiphop-hero-cards">
          <figure className="hiphop-hero-card--kweker" data-artist-slug="de-kweker" data-media-kind="photo"><img src="/assets/media/artists/de-kweker-feature.webp" alt="De Kweker, rapper uit Brugge" /><figcaption>De Kweker</figcaption></figure>
          <figure data-artist-slug="thepanda" data-media-kind="photo"><img src="/assets/media/artists/thepanda.webp" alt="The P.A.N.D.A" /><figcaption>The P.A.N.D.A</figcaption></figure>
          <figure data-artist-slug="thorre" data-media-kind="photo"><img src="/assets/media/artists/thorre.webp" alt="Thorre live" /><figcaption>Thorre</figcaption></figure>
        </div>
        <div className="hiphop-signal">LOCAL SIGNAL / WEST-VLAANDEREN</div>
      </section>

      <section className="hiphop-broadcast section-pad" data-hip-broadcast="">
        <div className="broadcast-copy"><span className="eyebrow">Local signal / West-Vlaanderen</span><h2>Stemmen uit<br />het westen.</h2><p>Rappers, producers en live-acts brengen hun eigen bars, beats en verhalen samen onder Kwartier West.</p></div>
        <div className="broadcast-stack">
          <Link href="/artiesten/de-kweker" data-stack-index="0" data-artist-slug="de-kweker" data-media-kind="photo"><img src="/assets/media/artists/de-kweker-feature.webp" alt="De Kweker" /><span>De Kweker</span></Link>
          <Link href="/artiesten/thepanda" data-stack-index="1" data-artist-slug="thepanda" data-media-kind="photo"><img src="/assets/media/artists/thepanda.webp" alt="The P.A.N.D.A" /><span>The P.A.N.D.A</span></Link>
          <Link href="/artiesten/thorre" data-stack-index="2" data-artist-slug="thorre" data-media-kind="photo"><img src="/assets/media/artists/thorre.webp" alt="Thorre" /><span>Thorre</span></Link>
          <Link href="/artiesten/krank" data-stack-index="3" data-artist-slug="krank" data-media-kind="photo"><img src="/assets/media/artists/krank.webp" alt="Krank" /><span>Krank</span></Link>
        </div>
      </section>

      <section className="artist-spotlight artist-spotlight--kweker section-pad">
        <div className="artist-spotlight-photo" data-artist-slug="de-kweker" data-media-kind="photo"><img src="/assets/media/artists/de-kweker-feature.webp" alt="De Kweker uit Brugge" /></div>
        <div className="artist-spotlight-copy">
          <span className="eyebrow">Brugge / 8000 / spotlight</span>
          <h2>De Kweker</h2>
          <p>De Kweker is een rapper uit Brugge (8000). Hij schrijft over twijfel, trots, frustratie, vriendschap en de stad rondom hem, met sterke hooks en eerlijke bars in zijn eigen taal.</p>
          <div className="artist-spotlight-links">
            <Link href="/artiesten/de-kweker">Ontdek De Kweker</Link>
            <a href="https://kwkr.be">Muziek & video — kwkr.be</a>
          </div>
        </div>
      </section>

      <ArtistAnnouncements compact />
      <HiphopRoster />
      <section className="scene-book scene-book--light"><span>Hip hop / booking</span><h2>Live, productie of meerdere artiesten op één avond.</h2><Link href="/booking?scene=hiphop">Start een Hip hop-aanvraag</Link></section>
    </main>
  );
}
