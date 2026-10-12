import Link from "next/link";
import type { Route } from "next";
import { hiphopArtists, teknoArtists } from "@/data/artists";
import { TeknoRosterCarousel } from "@/components/tekno-roster-carousel";

export function TeknoRoster() {
  return (
    <section className="scene-roster section-pad">
      <TeknoRosterCarousel artists={teknoArtists.map(({ slug, name, role, image, mediaKind }) => ({ slug, name, role, image, mediaKind }))} />
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
