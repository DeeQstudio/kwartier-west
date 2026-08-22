"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { artists } from "@/data/artists";

export function HomeRoster() {
  const [activeSlug, setActiveSlug] = useState<string>(artists[0]?.slug ?? "");
  const active = artists.find((artist) => artist.slug === activeSlug) ?? artists[0];

  return (
    <section className="roster-home section-pad" data-roster>
      <header>
        <div><span className="eyebrow">03 / Roster</span><h2>{artists.length} artiesten.<br />Twee scenes.</h2></div>
        <Link className="text-link" href="/artiesten">Alle artiesten</Link>
      </header>
      <div className="roster-home-grid">
        <div className="roster-list">
          {artists.map((artist, index) => (
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
          <figure className="roster-live-preview" data-artist-slug={active.slug} data-media-kind={active.mediaKind}>
            <img key={active.slug} data-roster-preview src={active.image} alt="" />
            <figcaption data-roster-caption>{active.name} / {active.scene === "tekno" ? "Tekno" : "Hiphop"}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
