import type { MetadataRoute } from "next";
import { artists } from "@/data/artists";
import { events } from "@/data/events";

const siteUrl = "https://kwartierwest.be";

const staticRoutes = [
  ["", "weekly", 1.0],
  ["/tekno", "weekly", 0.8],
  ["/hiphop", "weekly", 0.8],
  ["/artiesten", "weekly", 0.8],
  ["/events", "weekly", 0.8],
  ["/archive", "weekly", 0.8],
  ["/booking", "weekly", 0.8],
  ["/partners", "weekly", 0.8],
  ["/contact", "weekly", 0.8],
  ["/manifest", "weekly", 0.8],
  ["/privacy", "weekly", 0.8],
  ["/voorwaarden", "weekly", 0.8],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map(([path, changeFrequency, priority]) => ({
      url: `${siteUrl}${path}`,
      changeFrequency,
      priority,
    })),
    ...artists.map((artist) => ({
      url: artist.canonical,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${siteUrl}/events/${event.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
