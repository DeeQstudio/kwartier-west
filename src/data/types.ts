export type Scene = "tekno" | "hiphop";
export type BookingScene = Scene | "both";
export type BookingMode = "solo" | "multiple" | "scene" | "takeover";

export type ArtistLink = {
  label: string;
  value: string;
  href: string;
};

export type Artist = {
  slug: string;
  name: string;
  role: string;
  scene: Scene;
  variant: `artist-v${number}`;
  index: string;
  image: string;
  quote: string;
  paragraphs: readonly string[];
  bullets: readonly string[];
  links: readonly ArtistLink[];
  nextSlug: string;
  nextName: string;
  description: string;
  title: string;
  canonical: string;
  og: string;
  schema: Record<string, unknown> | null;
};
