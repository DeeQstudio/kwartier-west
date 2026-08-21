import Link from "next/link";
import type { CSSProperties } from "react";
import type { Route } from "next";
import type { Artist } from "@/data/types";
import { artistMediaKind } from "@/lib/artist-media";

type Focus = { desktop: string; mobile?: string };

const artistFocus: Record<string, Focus> = {
  "de-kweker": { desktop: "50% 24%", mobile: "50% 18%" },
  bruce: { desktop: "58% 24%", mobile: "58% 18%" },
  duvve: { desktop: "50% 23%", mobile: "50% 18%" },
  jenesaispas: { desktop: "78% 24%", mobile: "78% 18%" },
  krank: { desktop: "68% 26%", mobile: "68% 20%" },
  masschie: { desktop: "64% 26%", mobile: "64% 20%" },
  mombietekk: { desktop: "48% 30%", mobile: "48% 24%" },
  noratn: { desktop: "57% 31%", mobile: "57% 23%" },
  thepanda: { desktop: "50% 25%", mobile: "50% 17%" },
  thorre: { desktop: "50% 21%", mobile: "50% 15%" },
  woebn: { desktop: "43% 27%", mobile: "43% 20%" },
};

function longestWordLength(text: string) {
  return Math.max(...text.split(/\s+/).map((word) => word.replace(/[^\p{L}\p{N}]/gu, "").length));
}

export function ArtistDetail({ artist }: { artist: Artist }) {
  const mediaKind = artistMediaKind(artist.slug);
  const focus = artistFocus[artist.slug] ?? { desktop: "50% 28%", mobile: "50% 20%" };
  const heroStyle = {
    "--artist-focus": focus.desktop,
    "--artist-focus-mobile": focus.mobile ?? focus.desktop,
  } as CSSProperties;
  const quoteWord = longestWordLength(artist.quote);
  const quoteSize = quoteWord >= 18 ? "artist-quote--xs" : quoteWord >= 14 ? "artist-quote--sm" : "";
  const titleSize = artist.name.length >= 12 ? "artist-title--sm" : artist.name.length >= 9 ? "artist-title--md" : "";
  const nextSize = artist.nextName.length >= 12 ? "next-artist--sm" : artist.nextName.length >= 9 ? "next-artist--md" : "";

  return (
    <>
      <section
        className="artist-hero"
        data-artist-hero
        data-artist-slug={artist.slug}
        data-media-kind={mediaKind}
        style={heroStyle}
      >
        <div className="artist-hero-photo"><img src={artist.image} alt={artist.name} /></div>
        <div className="artist-hero-red" />
        <div className={`artist-hero-title ${titleSize}`.trim()}>
          <span>{artist.scene === "tekno" ? "TEKNO" : "HIP HOP"} / KWARTIER WEST</span>
          <h1>{artist.name}</h1>
          <p>{artist.role}</p>
        </div>
        <div className="artist-hero-index">{artist.index}</div>
      </section>

      <section className={`artist-quote ${quoteSize}`.trim()}><blockquote>{artist.quote}</blockquote></section>

      <section className="artist-story section-pad">
        <div><span className="eyebrow">Profiel</span><h2>Over {artist.name}</h2></div>
        <div className="artist-story-copy">
          {artist.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {artist.bullets.length > 0 && (
            <ul>{artist.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
          )}
        </div>
      </section>

      {artist.links.length > 0 && (
        <section className="artist-links section-pad">
          <span className="eyebrow">Luister / volg</span>
          <div>
            {artist.links.map((link) => (
              <a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer">
                <span>{link.label}</span><b>{link.value}</b>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="artist-booking">
        <span>Booking / {artist.name}</span>
        <h2>Deze naam op jouw line-up?</h2>
        <Link href={`/booking?artist=${artist.slug}` as Route}>Start aanvraag</Link>
      </section>

      <Link className={`next-artist ${nextSize}`.trim()} href={`/artiesten/${artist.nextSlug}` as Route}>
        <small>Volgende / {artist.scene}</small><b>{artist.nextName}</b><span>→</span>
      </Link>
    </>
  );
}
