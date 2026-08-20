import Link from "next/link";
import type { Route } from "next";
import { artistBySlug } from "@/data/artists";
import { hiphopRosterOrder } from "@/data/site";
import { artistMediaKind } from "@/lib/artist-media";

export function TeknoRoster({ order }: { order: readonly string[] }) {
  const roster = order.map((slug) => artistBySlug.get(slug)).filter(Boolean);

  return (
    <section className="scene-roster section-pad">
      <header><span className="eyebrow">Tekno roster</span><h2>{roster.length} artiesten</h2></header>
      <div className="scene-roster-rail">
        {roster.map((artist, index) => artist && (
          <Link className="scene-artist" key={artist.slug} href={`/artiesten/${artist.slug}` as Route} data-artist-slug={artist.slug} data-media-kind={artistMediaKind(artist.slug)}>
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
  const roster = hiphopRosterOrder.map((slug) => artistBySlug.get(slug)).filter(Boolean);
  const ticker = `${roster.map((artist) => artist?.name.toUpperCase()).filter(Boolean).join(" / ")} /`;

  return (
    <section className="hiphop-names">
      <div className="name-ticker" aria-hidden="true"><span>{ticker}</span><span>{ticker}</span></div>
      <div className="hiphop-roster section-pad">
        {roster.map((artist, index) => artist && (
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
