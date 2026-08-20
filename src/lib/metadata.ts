import type { Metadata } from "next";

const SITE_URL = "https://kwartierwest.be";

export function makeMetadata(input: {
  title: string;
  description: string;
  canonical: string;
  og: string;
}): Metadata {
  const canonicalPath = input.canonical.startsWith(SITE_URL)
    ? input.canonical.slice(SITE_URL.length) || "/"
    : input.canonical;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      siteName: "Kwartier West",
      title: input.title,
      description: input.description,
      url: input.canonical,
      images: input.og ? [{ url: input.og, width: 1200, height: 630 }] : undefined,
      locale: "nl_BE",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.og ? [input.og] : undefined,
    },
  };
}
