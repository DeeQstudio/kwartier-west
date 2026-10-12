import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { HiphopRoster } from "@/components/scene-rosters";
import { ArtistAnnouncements } from "@/components/artist-announcements";
import { hiphopArtists } from "@/data/artists";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Hip hop West-Vlaanderen | Kwartier West",
  description: "West-Vlaamse hip hop bij Kwartier West: artiesten, profielen, bookings en een TuffTracks-spotlight met Krank.",
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

      <HiphopRoster />

      <section className="artist-spotlight artist-spotlight--tufftracks section-pad" aria-labelledby="tufftracks-title">
        <div className="tufftracks-feature-inner">
          <header className="tufftracks-feature-header">
            <div>
              <span className="eyebrow">Uit de scene / TuffTracks 01</span>
              <h2 id="tufftracks-title">Krank bij<br />TuffTracks.</h2>
            </div>
            <a className="tufftracks-brand" href="https://www.instagram.com/tufftracks_/" target="_blank" rel="noopener noreferrer" aria-label="TuffTracks op Instagram"><img src="/assets/media/features/tufftracks-logo.png" alt="TuffTracks Live Sessions" loading="lazy" /></a>
          </header>
          <div className="tufftracks-feature-media">
            <img src="/assets/media/features/krank-tufftracks.png" alt="Krank aan de microfoon tijdens TuffTracks" loading="lazy" />
            <span>TuffTracks / live session 01</span>
          </div>
          <div className="tufftracks-feature-footer">
            <p>Krank is de eerste gast bij TuffTracks. Hij praat over zijn album De Statement en brengt tracks live in de studio.</p>
            <nav className="artist-spotlight-links" aria-label="Krank bij TuffTracks">
              <a href="https://www.instagram.com/p/DeTv1kFuI3z/" target="_blank" rel="noopener noreferrer">Bekijk op Instagram</a>
              <a href="https://www.youtube.com/watch?v=HO6qwdOh5XE" target="_blank" rel="noopener noreferrer">Volledige aflevering</a>
              <Link href="/artiesten/krank">Ontdek Krank</Link>
            </nav>
          </div>
        </div>
      </section>

      <ArtistAnnouncements compact />
      <section className="scene-book scene-book--light"><span>Hip hop / booking</span><h2>Live, productie of meerdere artiesten op één avond.</h2><Link href="/booking?scene=hiphop">Start een Hip hop-aanvraag</Link></section>
    </main>
  );
}
