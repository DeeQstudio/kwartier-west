export type Scene = "tekno" | "hiphop";
export type BookingScene = Scene | "both";
export type BookingMode = "solo" | "multiple" | "scene" | "takeover";

export type ArtistLink = {
  label: string;
  value: string;
  href: string;
};

export type ArtistMediaKind = "photo" | "artwork" | "identity";
export type ArtistFocus = { desktop: string; mobile?: string };
export type ArtistAnnouncement = { eyebrow: string; title: string; body: string };

export type ArtistSource = {
  slug: string;
  name: string;
  role: string;
  scene: Scene;
  image: string;
  mediaKind: ArtistMediaKind;
  focus?: ArtistFocus;
  quote: string;
  paragraphs: readonly string[];
  bullets: readonly string[];
  links: readonly ArtistLink[];
  description: string;
  status?: "new" | "active";
  announcement?: ArtistAnnouncement;
};

export type Artist = ArtistSource & {
  variant: `artist-v${number}`;
  title: string;
  canonical: string;
  og: string;
  schema: Record<string, unknown>;
};
