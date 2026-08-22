import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { artists, artistBySlug } from "@/data/artists";
import { ArtistDetail } from "@/components/artist-detail";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = artistBySlug.get(slug);
  if (!artist) return {};
  return makeMetadata({
    title: artist.title,
    description: artist.description,
    canonical: artist.canonical,
    og: artist.og,
  });
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = artistBySlug.get(slug);
  if (!artist) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kwartierwest.be/" },
      { "@type": "ListItem", position: 2, name: "Artiesten", item: "https://kwartierwest.be/artiesten" },
      { "@type": "ListItem", position: 3, name: artist.name, item: artist.canonical },
    ],
  };

  return (
    <main id="main" className={`artist-page artist-${artist.scene} artist-layout-split`}>
      {artist.schema && <JsonLd data={artist.schema} />}
      <JsonLd data={breadcrumb} />
      <ArtistDetail artist={artist} />
    </main>
  );
}
