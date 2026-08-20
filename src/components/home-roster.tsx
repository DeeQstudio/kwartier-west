"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { artistBySlug } from "@/data/artists";
import { homeRosterOrder } from "@/data/site";
import { artistMediaKind } from "@/lib/artist-media";

export function HomeRoster() {
  const roster = useMemo(
    () => homeRosterOrder.map((slug) => artistBySlug.get(slug)).filter(Boolean),
    [],
  );
  const [activeSlug, setActiveSlug] = useState<string>(homeRosterOrder[0]);
  const active = artistBySlug.get(activeSlug) ?? roster[0];

  return (
    <section className="roster-home section-pad" data-roster>
      <header>
        <div><span className="eyebrow">03 / Roster</span><h2>21 artiesten.<br />Twee scenes.</h2></div>
        <Link className="text-link" href="/artiesten">Alle artiesten</Link>
      </header>
      <div className="roster-home-grid">
        <div className="roster-list">
          {roster.map((artist, index) => artist && (
            <Link
              className="roster-row"
              key={artist.slug}
              href={`/artiesten/${artist.slug}` as Route}
              data-preview={artist.image}
              onMouseEnter={() => setActiveSlug(artist.slug)}
              onFocus={() => setActiveSlug(artist.slug)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <b>{artist.name}</b>
              <span>{artist.role}</span>
              <em>{artist.scene}</em>
            </Link>
          ))}
        </div>
        {active && (
          <figure className="roster-live-preview" data-artist-slug={active.slug} data-media-kind={artistMediaKind(active.slug)}>
            <img key={active.slug} data-roster-preview src={active.image} alt="" />
            <figcaption data-roster-caption>{active.name} / {active.scene === "tekno" ? "Tekno" : "Hiphop"}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
