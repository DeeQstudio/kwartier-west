"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { artists } from "@/data/artists";
import type { Scene } from "@/data/types";
import { artistMediaKind } from "@/lib/artist-media";

type Filter = "all" | Scene;

export function ArtistIndex() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeSlug, setActiveSlug] = useState<string>(artists[0].slug);
  const visible = artists.filter((artist) => filter === "all" || artist.scene === filter);
  const active = artists.find((artist) => artist.slug === activeSlug) ?? visible[0] ?? artists[0];

  return (
    <section className="artist-index section-pad" data-artist-index>
      <div className="artist-filter" role="group" aria-label="Filter artiesten">
        {([
          ["all", "Alles", artists.length],
          ["tekno", "Tekno", artists.filter((artist) => artist.scene === "tekno").length],
          ["hiphop", "Hip hop", artists.filter((artist) => artist.scene === "hiphop").length],
        ] as const).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            data-filter={value}
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              const first = artists.find((artist) => value === "all" || artist.scene === value);
              if (first) setActiveSlug(first.slug);
            }}
          >
            {label}<b>{count}</b>
          </button>
        ))}
      </div>
      <div className="artist-index-layout">
        <div className="artist-index-list">
          {visible.map((artist) => {
            const index = artists.findIndex((item) => item.slug === artist.slug) + 1;
            return (
              <Link
                className="artist-index-row"
                key={artist.slug}
                href={`/artiesten/${artist.slug}` as Route}
                data-name={artist.name}
                data-photo={artist.image}
                data-side={artist.scene}
                onMouseEnter={() => setActiveSlug(artist.slug)}
                onFocus={() => setActiveSlug(artist.slug)}
              >
                <small>{String(index).padStart(2, "0")}</small>
                <b>{artist.name}</b>
                <span>{artist.role}</span>
                <em>{artist.scene}</em>
              </Link>
            );
          })}
        </div>
        <figure className="artist-index-preview" data-artist-slug={active.slug} data-media-kind={artistMediaKind(active.slug)}>
          <div className="preview-red" />
          <img key={active.slug} alt="" data-index-preview src={active.image} />
          <figcaption data-index-caption>{active.name}</figcaption>
        </figure>
      </div>
    </section>
  );
}
