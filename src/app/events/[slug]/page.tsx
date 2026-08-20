import { TeknorelicsEyeOfTheTempleContent } from "@/components/event-teknorelics-eye-of-the-temple";
import { VillaWest2026Content } from "@/components/event-villa-west-2026";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eventBySlug, events } from "@/data/events";
import { JsonLd } from "@/components/json-ld";
import { makeMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug.get(slug);
  if (!event) return {};
  return makeMetadata(event);
}

function EventContent({ slug }: { slug: string }) {
  if (slug === "teknorelics-eye-of-the-temple") return <TeknorelicsEyeOfTheTempleContent />;
  if (slug === "villa-west-2026") return <VillaWest2026Content />;
  return null;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = eventBySlug.get(slug);
  if (!event) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kwartierwest.be/" },
      { "@type": "ListItem", position: 2, name: "Events", item: "https://kwartierwest.be/events" },
      { "@type": "ListItem", position: 3, name: event.schema?.name ?? event.title, item: event.canonical },
    ],
  };

  return (
    <main id="main" className={event.bodyClass}>
      {event.schema && <JsonLd data={event.schema} />}
      <JsonLd data={breadcrumb} />
      <EventContent slug={event.slug} />
    </main>
  );
}
