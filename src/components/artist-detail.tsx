import Link from "next/link";
import type { Route } from "next";
import type { Artist } from "@/data/types";
import { artistMediaKind } from "@/lib/artist-media";

export function ArtistDetail({ artist }: { artist: Artist }) {
  return (
    <>
      <section className="artist-hero" data-artist-hero data-artist-slug={artist.slug} data-media-kind={artistMediaKind(artist.slug)}>
        <div className="artist-hero-photo"><img src={artist.image} alt={artist.name} /></div>
        <div className="artist-hero-red" />
        <div className="artist-hero-title">
          <span>{artist.scene === "tekno" ? "TEKNO" : "HIP HOP"} / KWARTIER WEST</span>
          <h1>{artist.name}</h1>
          <p>{artist.role}</p>
        </div>
        <div className="artist-hero-index">{artist.index}</div>
      </section>

      <section className="artist-quote"><blockquote>{artist.quote}</blockquote></section>

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

      <Link className="next-artist" href={`/artiesten/${artist.nextSlug}` as Route}>
        <small>Volgende / {artist.scene}</small><b>{artist.nextName}</b><span>→</span>
      </Link>
    </>
  );
}
