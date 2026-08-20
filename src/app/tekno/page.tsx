import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { TeknoRoster } from "@/components/scene-rosters";
import { teknoRosterOrder } from "@/data/site";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Tekno | Kwartier West West-Vlaanderen",
  description: "Tekno bij Kwartier West: acid, tribe, hardtekk, live-sets, producers en soundsystemcultuur binnen het West-Vlaamse collectief.",
  canonical: "https://kwartierwest.be/tekno",
  og: "https://kwartierwest.be/assets/og/tekno.jpg",
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
        "name": "Tekno",
        "item": "https://kwartierwest.be/tekno"
      }
    ]
  }
] as const;

export default function TeknoPage() {
  return (
    <main id="main" className="scene-page tekno-page" data-page="tekno">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="tekno-hero" data-tekno-hero=""><div className="tekno-hero-photo"><img src="/assets/media/archive/teknorelics-06.webp" alt="Kwartier West Tekno tijdens Teknorelics in Het Entrepot, Brugge" /></div><div className="tekno-hero-grid"></div><div className="tekno-hero-title"><span>01 / SCENE / KWARTIER WEST</span><h1>TEKNO</h1><p>Acid / tribe / hardtekk / soundsystem</p></div><div className="tekno-hero-readout"><b>303</b><span>WEST-VLAAMS<br />PRESSURE</span></div><div className="chapter-scroll">scroll / pressure builds</div></section><section className="tekno-machine section-pad" data-tek-machine=""><div className="machine-left"><span className="eyebrow">Acid / tribe / hardtekk</span><h2>Machines aan.<br />Druk vooruit.</h2><p>Live hardware, DJ's, producers en soundsystems trekken de Tekno-side van Kwartier West van acid en tribe tot hardtekk.</p></div><div className="machine-dial" aria-hidden="true"><i></i><b>303</b><span>WEST<br />PRESSURE</span></div></section><section className="tekno-signature-break section-pad"><div><span className="eyebrow">Kwartier West / Tekno side</span><h2>Gebouwd voor de vloer.</h2><p>Sets die mogen duwen, systemen die je voelt en artiesten die van hardware, ritme en tempo hun eigen taal maken.</p></div><figure><img src="/assets/media/scenes/tekno-signature.webp" alt="Kwartier West Tekno side artwork" /></figure></section><TeknoRoster order={teknoRosterOrder} /><section className="tekno-archive-hit"><div className="archive-stack" data-archive-stack=""><img src="/assets/media/archive/teknorelics-02.webp" alt="Teknorelics in Het Entrepot" /><img src="/assets/media/archive/teknorelics-04.webp" alt="Teknorelics live" /><img src="/assets/media/archive/teknorelics-06.webp" alt="Teknorelics crowd en podium" /></div><div><span className="eyebrow">28.03.2026 / Het Entrepot</span><h2>Eye of<br />the Temple</h2><p>Op 28 maart 2026 bracht Teknorelics: Eye of the Temple een volledige Tekno-nacht naar Het Entrepot in Brugge.</p><Link className="arrow-link" href="/events/teknorelics-eye-of-the-temple">Open event <span>↗</span></Link></div></section><section className="scene-book"><span>Tekno / booking</span><h2>Een artiest, meerdere namen of de volledige scene.</h2><Link href="/booking?scene=tekno">Start een Tekno-aanvraag</Link></section>
    </main>
  );
}
