import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Partners | Kwartier West",
  description: "Partners en organisaties die aan Kwartier West verbonden zijn.",
  canonical: "https://kwartierwest.be/partners",
  og: "https://kwartierwest.be/assets/og/partners.jpg",
});

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kwartier West partners",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "All-Tek Soundsystem"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Absurd Soundsystem"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Imakari projects"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "TekTopia"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Acidelics"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "Spoorloos Soundsystem"
      },
      {
        "@type": "ListItem",
        "position": 7,
        "name": "DEEQSTUDIO"
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
        "name": "Partners",
        "item": "https://kwartierwest.be/partners"
      }
    ]
  }
] as const;

export default function PartnersPage() {
  return (
    <main id="main" className="partners-page" data-page="partners">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <section className="partners-hero" data-partners-hero=""><h1>Partners</h1><div className="partners-hero-core"><img src="/assets/kw-wordmark.png" alt="Kwartier West" /><span>06 / NETWERK</span></div><div className="partners-hero-logos"><div><img src="/assets/partners/all-tek-soundsystem.svg" alt="All-Tek Soundsystem" /></div><div><img src="/assets/partners/absurd-soundsystem.svg" alt="Absurd Soundsystem" /></div><div><img src="/assets/partners/imakari-projects.svg" alt="Imakari projects" /></div><div><img src="/assets/partners/tektopia.webp" alt="TekTopia" /></div><div><img src="/assets/partners/acidelics.webp" alt="Acidelics" /></div><div><img src="/assets/partners/spoorloos-soundsystem.webp" alt="Spoorloos Soundsystem" /></div><div><img src="/assets/partners/deeqstudio.svg" alt="DEEQSTUDIO" /></div></div><p>Partners en organisaties die aan Kwartier West verbonden zijn.</p></section><section className="partner-orbit section-pad" data-partner-orbit=""><div className="partner-core"><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></div><a id="all-tek-soundsystem" className="partner-node partner-node--0" href="#partner-all-tek-soundsystem"><img src="/assets/partners/all-tek-soundsystem.svg" alt="All-Tek Soundsystem" /><span>All-Tek Soundsystem</span></a><a id="absurd-soundsystem" className="partner-node partner-node--1" href="#partner-absurd-soundsystem"><img src="/assets/partners/absurd-soundsystem.svg" alt="Absurd Soundsystem" /><span>Absurd Soundsystem</span></a><a id="imakari-projects" className="partner-node partner-node--2" href="#partner-imakari-projects"><img src="/assets/partners/imakari-projects.svg" alt="Imakari projects" /><span>Imakari projects</span></a><a id="tektopia" className="partner-node partner-node--3" href="#partner-tektopia"><img src="/assets/partners/tektopia.webp" alt="TekTopia" /><span>TekTopia</span></a><a id="acidelics" className="partner-node partner-node--4" href="#partner-acidelics"><img src="/assets/partners/acidelics.webp" alt="Acidelics" /><span>Acidelics</span></a><a id="spoorloos-soundsystem" className="partner-node partner-node--5" href="#partner-spoorloos-soundsystem"><img src="/assets/partners/spoorloos-soundsystem.webp" alt="Spoorloos Soundsystem" /><span>Spoorloos Soundsystem</span></a><a id="deeqstudio" className="partner-node partner-node--6" href="#partner-deeqstudio"><img src="/assets/partners/deeqstudio.svg" alt="DEEQSTUDIO" /><span>DEEQSTUDIO</span></a></section><section className="partner-details section-pad"><article id="partner-all-tek-soundsystem"><small>01</small><div className="partner-detail-logo"><img src="/assets/partners/all-tek-soundsystem.svg" alt="All-Tek Soundsystem" /></div><div><span>Partner</span><h2>All-Tek Soundsystem</h2><p>Partner van Kwartier West.</p></div></article><article id="partner-absurd-soundsystem"><small>02</small><div className="partner-detail-logo"><img src="/assets/partners/absurd-soundsystem.svg" alt="Absurd Soundsystem" /></div><div><span>Partner</span><h2>Absurd Soundsystem</h2><p>Partner van Kwartier West.</p></div></article><article id="partner-imakari-projects"><small>03</small><div className="partner-detail-logo"><img src="/assets/partners/imakari-projects.svg" alt="Imakari projects" /></div><div><span>Partner</span><h2>Imakari projects</h2><p>Partner van Kwartier West.</p></div></article><article id="partner-tektopia"><small>04</small><div className="partner-detail-logo"><img src="/assets/partners/tektopia.webp" alt="TekTopia" /></div><div><span>Partner</span><h2>TekTopia</h2><p>Partner van Kwartier West.</p></div></article><article id="partner-acidelics"><small>05</small><div className="partner-detail-logo"><img src="/assets/partners/acidelics.webp" alt="Acidelics" /></div><div><span>Partner</span><h2>Acidelics</h2><p>Partner van Kwartier West.</p><a className="text-link" href="https://www.acidelics.be/" target="_blank" rel="noopener noreferrer">acidelics.be</a></div></article><article id="partner-spoorloos-soundsystem"><small>06</small><div className="partner-detail-logo"><img src="/assets/partners/spoorloos-soundsystem.webp" alt="Spoorloos Soundsystem" /></div><div><span>Partner</span><h2>Spoorloos Soundsystem</h2><p>Partner van Kwartier West.</p><a className="text-link" href="https://www.facebook.com/people/Spoorloos-Soundsystem/61574948081337/" target="_blank" rel="noopener noreferrer">Spoorloos Soundsystem</a><a className="text-link" href="https://www.instagram.com/spoorloos_soundsystem_/" target="_blank" rel="noopener noreferrer">@spoorloos_soundsystem_</a></div></article><article id="partner-deeqstudio"><small>07</small><div className="partner-detail-logo"><img src="/assets/partners/deeqstudio.svg" alt="DEEQSTUDIO" /></div><div><span>Webdevelopment / Design / Mediabeheer</span><h2>DEEQSTUDIO</h2><p>Digitale partner van Kwartier West voor webdevelopment, design en mediabeheer.</p><a className="text-link" href="https://www.deeqstudio.com/" target="_blank" rel="noopener noreferrer">deeqstudio.com</a><a className="text-link" href="mailto:info@deeqstudio.com" target="_blank" rel="noopener noreferrer">info@deeqstudio.com</a></div></article></section>
    </main>
  );
}
