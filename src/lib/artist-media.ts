const artworkSlugs = new Set([
  "alexer",
  "creamz",
  "hyperion",
  "kulture",
  "kumatekz",
  "onschuldig",
  "psamtek",
  "spoorloos",
  "wildcrd",
]);

export type ArtistMediaKind = "photo" | "artwork";

export function artistMediaKind(slug: string): ArtistMediaKind {
  return artworkSlugs.has(slug) ? "artwork" : "photo";
}
