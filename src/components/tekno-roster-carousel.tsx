"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Artist } from "@/data/types";

type RosterArtist = Pick<Artist, "slug" | "name" | "role" | "image" | "mediaKind">;

export function TeknoRosterCarousel({ artists }: { artists: RosterArtist[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ first: 1, progress: 0, canPrevious: false, canNext: artists.length > 1 });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => {
      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const card = rail.querySelector<HTMLElement>(".scene-artist");
      const step = card ? card.offsetWidth + (parseFloat(getComputedStyle(rail).columnGap) || 0) : rail.clientWidth;
      setPosition({
        first: Math.min(artists.length, Math.max(1, Math.round(rail.scrollLeft / Math.max(1, step)) + 1)),
        progress: maxScroll ? rail.scrollLeft / maxScroll : 1,
        canPrevious: rail.scrollLeft > 2,
        canNext: rail.scrollLeft < maxScroll - 2,
      });
    };

    const observer = new ResizeObserver(update);
    observer.observe(rail);
    rail.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", update);
    };
  }, [artists.length]);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(".scene-artist");
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (card.offsetWidth + gap) * 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <>
      <header className="scene-roster-header">
        <div><span className="eyebrow">Tekno roster</span><h2>{artists.length} artiesten</h2></div>
        <div className="scene-roster-controls" role="group" aria-label="Blader door de Tekno-artiesten">
          <span className="scene-roster-position">{String(position.first).padStart(2, "0")} <i>/</i> {String(artists.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => move(-1)} disabled={!position.canPrevious} aria-label="Vorige artiesten" aria-controls="tekno-roster-rail">←</button>
          <button type="button" onClick={() => move(1)} disabled={!position.canNext} aria-label="Volgende artiesten" aria-controls="tekno-roster-rail">→</button>
        </div>
      </header>
      <div
        id="tekno-roster-rail"
        ref={railRef}
        className="scene-roster-rail"
        style={{ "--scene-roster-count": artists.length } as CSSProperties}
        tabIndex={0}
        aria-label="Tekno-artiesten; gebruik de pijlen of veeg om verder te bladeren"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {artists.map((artist, index) => (
          <Link className="scene-artist" key={artist.slug} href={`/artiesten/${artist.slug}` as Route} data-artist-slug={artist.slug} data-media-kind={artist.mediaKind}>
            <div><img src={artist.image} alt={artist.name} loading="lazy" /></div>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <b>{artist.name}</b>
            <span>{artist.role}</span>
          </Link>
        ))}
      </div>
      <div className="scene-roster-progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(.04, position.progress)})` }} /></div>
    </>
  );
}
