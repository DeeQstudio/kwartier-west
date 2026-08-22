import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { hiphopArtists, teknoArtists } from "@/data/artists";

export function TeknoRoster() {
  return (
    <section className="scene-roster section-pad">
      <header><span className="eyebrow">Tekno roster</span><h2>{teknoArtists.length} artiesten</h2></header>
      <div className="scene-roster-rail" style={{ "--scene-roster-count": teknoArtists.length } as CSSProperties}>
        {teknoArtists.map((artist, index) => (
          <Link className="scene-artist" key={artist.slug} href={`/artiesten/${artist.slug}` as Route} data-artist-slug={artist.slug} data-media-kind={artist.mediaKind}>
            <div><img src={artist.image} alt={artist.name} loading="lazy" /></div>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <b>{artist.name}</b>
            <span>{artist.role}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HiphopRoster() {
  const ticker = `${hiphopArtists.map((artist) => artist.name.toUpperCase()).join(" / ")} /`;

  return (
    <section className="hiphop-names">
      <div className="name-ticker" aria-hidden="true"><span>{ticker}</span><span>{ticker}</span></div>
      <div className="hiphop-roster section-pad">
        {hiphopArtists.map((artist, index) => (
          <Link key={artist.slug} href={`/artiesten/${artist.slug}` as Route}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <b>{artist.name}</b>
            <span>{artist.role}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
