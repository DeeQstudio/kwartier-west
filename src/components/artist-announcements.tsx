import Link from "next/link";
import type { Route } from "next";
import { newArtists } from "@/data/artists";

export function ArtistAnnouncements({ compact = false }: { compact?: boolean }) {
  if (!newArtists.length) return null;

  return (
    <section className={`artist-announcements${compact ? " artist-announcements--compact" : ""}`} aria-label="Nieuwe artiesten">
      {newArtists.map((artist) => artist.announcement && (
        <article key={artist.slug}>
          <div className="artist-announcement-mark"><span>{artist.announcement.eyebrow}</span><b>{artist.name}</b></div>
          <div className="artist-announcement-copy">
            <h2>{artist.announcement.title}</h2>
            <p>{artist.announcement.body}</p>
            <Link href={`/artiesten/${artist.slug}` as Route}>Ontdek {artist.name}</Link>
          </div>
        </article>
      ))}
    </section>
  );
}
