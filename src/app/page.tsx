import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { HomeRoster } from "@/components/home-roster";
import { makeMetadata } from "@/lib/metadata";
import { eventBySlug } from "@/data/events";
import { VillaWestStatus } from "@/components/villa-west-status";

export const metadata = makeMetadata({
  title: "Kwartier West | West-Vlaams Tekno & Hip hop collectief",
  description: "Kwartier West is een West-Vlaams collectief voor Tekno en Hip hop, met artiesten, events, samenwerkingen en een centrale boekingsdesk.",
  canonical: "https://kwartierwest.be/",
  og: "https://kwartierwest.be/assets/og/home.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://kwartierwest.be/#website",
    "url": "https://kwartierwest.be/",
    "name": "Kwartier West",
    "publisher": {
      "@id": "https://kwartierwest.be/#organization"
    },
    "inLanguage": "nl-BE"
  }
] as const;

export default function HomePage() {
  const villa = eventBySlug.get("villa-west-2026");

  return (
    <main id="main" className="home" data-page="home">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="home-hero" data-home-hero=""><div className="home-sticky"><div className="hero-red-field"></div><div className="hero-photo hero-photo--l"><img src="/assets/media/archive/teknorelics-06.webp" alt="Tekno-event van Kwartier West in Brugge" /></div><div className="hero-photo hero-photo--r"><img src="/assets/media/scenes/hiphop-crowd.jpg" alt="Hip hop publiek en performers tijdens een liveshow" /></div><div className="hero-cross"></div><div className="hero-kicker">West-Vlaams / Tekno + Hip hop</div><div className="hero-logo"><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></div><div className="hero-side-label hero-side-label--l">TEKNO</div><div className="hero-side-label hero-side-label--r">HIP HOP</div><div className="scroll-instruction"><span>Scroll</span><i></i><small>Tekno / Hip hop / live</small></div></div></section><section className="statement section-pad"><div className="statement-index">00 / Kwartier West</div><h1>Twee scenes.<br />Eén collectief.</h1><div className="statement-copy"><p data-reveal="">Kwartier West brengt Tekno en Hip hop samen in een West-Vlaams collectief rond artiesten, events, samenwerkingen en bookings.</p><Link className="text-link" href="/manifest">Waar we voor staan</Link></div></section><section className="home-scene home-scene--tek" data-scene-chapter=""><Link href="/tekno" className="scene-image scene-image--tekno-photo"><img src="/assets/media/archive/teknorelics-04.webp" alt="Soundsystem tijdens Teknorelics van Kwartier West in Brugge" /></Link><div className="scene-info"><span>01 / Scene</span><h2>Tekno</h2><p>Acid, tribe, hardtekk, live hardware, DJ-sets en soundsystems. Gebouwd voor donkere zalen, zware systemen en lange nachten.</p><Link className="arrow-link" href="/tekno">Open Tekno <span>↗</span></Link></div></section><section className="home-scene home-scene--hip" data-scene-chapter=""><div className="scene-info"><span>02 / Scene</span><h2>Hip hop</h2><p>Rappers, producers en live-acts binnen de West-Vlaamse hiphopscene. Bars, beats en samenwerkingen met een eigen stem.</p><Link className="arrow-link" href="/hiphop">Open Hip hop <span>↗</span></Link></div><Link href="/hiphop" className="scene-image scene-image--hiphop-photo"><img src="/assets/media/scenes/hiphop-crowd.jpg" alt="Hip hop liveshow met publiek en performers" /></Link></section><HomeRoster /><section className="event-home event-home--live"><div className="event-home-poster" data-reveal="left"><img src="/assets/media/events/villa-west-2026-08-21.jpg" alt="Villa West — laatste editie op 21 augustus 2026" /></div><div className="event-home-copy"><span className="eyebrow">04 / Villa West</span><h2>Villa West<br />21.08.2026</h2><p>Vrijdag 21 augustus sluit Villa West de zomer af bij Villa Bota. Thorre en Siga & Lefever openen van 22:00 tot 23:00; Wildcard neemt over tot middernacht. Live volgen kan vanaf 21:55.</p><dl><div><dt>Locatie</dt><dd>Villa Bota / Brugge</dd></div><div><dt>Uur</dt><dd>22:00–00:00</dd></div><div><dt>Status</dt><dd>{villa?.stream ? <VillaWestStatus stream={villa.stream} /> : "Main event"}</dd></div></dl><Link className="arrow-link" href="/events/villa-west-2026#villa-west-stream">Main event + livestream <span>↗</span></Link></div></section><section className="network-home section-pad"><div><span className="eyebrow">05 / Netwerk</span><h2>Partners en organisaties rond Kwartier West.</h2></div><div className="network-logo-line"><Link href="/partners#all-tek-soundsystem"><img src="/assets/partners/all-tek-soundsystem.svg" alt="All-Tek Soundsystem" loading="lazy" /></Link><Link href="/partners#absurd-soundsystem"><img src="/assets/partners/absurd-soundsystem.svg" alt="Absurd Soundsystem" loading="lazy" /></Link><Link href="/partners#imakari-projects"><img src="/assets/partners/imakari-projects.svg" alt="Imakari projects" loading="lazy" /></Link><Link href="/partners#tektopia"><img src="/assets/partners/tektopia.webp" alt="TekTopia" loading="lazy" /></Link><Link href="/partners#acidelics"><img src="/assets/partners/acidelics.webp" alt="Acidelics" loading="lazy" /></Link><Link href="/partners#spoorloos-soundsystem"><img src="/assets/partners/spoorloos-soundsystem.webp" alt="Spoorloos Soundsystem" loading="lazy" /></Link><Link href="/partners#deeqstudio"><img src="/assets/partners/deeqstudio.svg" alt="DEEQSTUDIO" loading="lazy" /></Link></div><Link className="text-link" href="/partners">Partners & netwerk</Link></section><section className="home-close home-booking-close"><div className="home-booking-close-copy"><span>06 / Booking</span><h2>Van één artiest tot een volledige takeover.</h2><p>Boek een solo-act, meerdere artiesten, de Tekno- of Hip hopscene, of een volledige Kwartier West-programmatie.</p></div><Link href="/booking">Open boekingsdesk <span>↗</span></Link></section>
    </main>
  );
}
