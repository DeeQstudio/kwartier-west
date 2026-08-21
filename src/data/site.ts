export const site = {
  name: "Kwartier West",
  url: "https://kwartierwest.be",
  email: "info@kwartierwest.be",
  locale: "nl_BE",
  description: "West-Vlaams collectief voor Tekno en Hip hop, artiesten, events en booking.",
  socials: {
    instagram: "https://www.instagram.com/kwtr_west/",
    facebook: "https://www.facebook.com/profile.php?id=61557994985369",
    soundcloud: "https://soundcloud.com/kwartier-west",
    linktree: "https://linktr.ee/kwartierwest",
  },
} as const;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://kwartierwest.be/#organization",
  name: "Kwartier West",
  url: "https://kwartierwest.be/",
  logo: "https://kwartierwest.be/assets/kw-wordmark.png",
  description: site.description,
  email: site.email,
  sameAs: Object.values(site.socials),
} as const;

export const homeRosterOrder = [
  "de-kweker",
  "onschuldig",
  "jenesaispas",
  "duvve",
  "alexer",
  "thepanda",
  "spoorloos",
  "creamz",
  "masschie",
] as const;

export const teknoRosterOrder = [
  "onschuldig",
  "hyperion",
  "woebn",
  "wildcrd",
  "noratn",
  "alexer",
  "spoorloos",
  "jenesaispas",
  "kulture",
  "kumatekz",
  "masschie",
  "mombietekk",
  "psamtek",
] as const;

export const hiphopRosterOrder = [
  "de-kweker",
  "thorre",
  "krank",
  "thepanda",
  "duvve",
  "bruce",
  "creamz",
] as const;
