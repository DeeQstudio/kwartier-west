export type EventLineupItem = {
  name: string;
  slot?: string;
  artistSlug?: string;
};

export type EventStream = {
  enabled: boolean;
  label: string;
  videoUrl: string;
  audioUrl: string;
  sourceUrl: string;
  timeZone: string;
  startDate: string;
  startTime: string;
  endTime: string;
};

export type EventRecord = {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  og: string;
  bodyClass: string;
  date: string;
  displayDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  region: string;
  status: "upcoming" | "past";
  poster: string;
  lineup: readonly EventLineupItem[];
  stream?: EventStream;
  schema: Record<string, unknown> | null;
};

export const events = [
  {
    slug: "teknorelics-eye-of-the-temple",
    title: "Teknorelics: Eye of the Temple | Kwartier West",
    description: "Teknorelics: Eye of the Temple op 28 maart 2026 in Het Entrepot, Brugge — Kwartier West Tekno-archief.",
    canonical: "https://kwartierwest.be/events/teknorelics-eye-of-the-temple",
    og: "https://kwartierwest.be/assets/og/teknorelics.jpg",
    date: "2026-03-28",
    displayDate: "28.03.2026",
    startTime: "22:00",
    endTime: "",
    venue: "Het Entrepot",
    region: "Brugge",
    status: "past",
    poster: "/assets/media/events/teknorelics-poster.webp",
    lineup: [
      { name: "Jenesaispas", artistSlug: "jenesaispas" },
      { name: "Albiovix" },
      { name: "Eli" },
      { name: "Kalki" },
      { name: "Ruffhouss" },
      { name: "23 Shayatin" },
      { name: "Sirius" },
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      "name": "Teknorelics: Eye of the Temple",
      "startDate": "2026-03-28T22:00:00+01:00",
      "eventStatus": "https://schema.org/EventCompleted",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Het Entrepot",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Brugge",
          "addressCountry": "BE"
        }
      },
      "image": [
        "https://kwartierwest.be/assets/media/archive/teknorelics-03.webp"
      ],
      "description": "Teknorelics: Eye of the Temple op 28 maart 2026 in Het Entrepot, Brugge — Kwartier West Tekno-archief.",
      "organizer": {
        "@id": "https://kwartierwest.be/#organization"
      },
      "url": "https://kwartierwest.be/events/teknorelics-eye-of-the-temple"
    },
    bodyClass: "event-detail relics-detail"
  },
  {
    slug: "villa-west-2026",
    title: "Villa West 21 augustus 2026 | Kwartier West x Villa Bota",
    description: "Laatste Villa West van zomer 2026 op vrijdag 21 augustus bij Villa Bota in Brugge. Thorre, Siga & Lefever en Wildcard, live van 22:00 tot 00:00.",
    canonical: "https://kwartierwest.be/events/villa-west-2026",
    og: "https://kwartierwest.be/assets/media/events/villa-west-2026-08-21.jpg",
    date: "2026-08-21",
    displayDate: "21.08.2026",
    startTime: "22:00",
    endTime: "00:00",
    venue: "Villa Bota",
    region: "Brugge",
    status: "past",
    poster: "/assets/media/events/villa-west-2026-08-21.jpg",
    lineup: [
      { name: "Thorre", slot: "22:00–23:00", artistSlug: "thorre" },
      { name: "Siga & Lefever", slot: "22:00–23:00" },
      { name: "Wildcard", slot: "23:00–00:00" },
    ],
    stream: {
      enabled: true,
      label: "Villa Bota livestream",
      videoUrl: "https://live.villabota.be/index-video-only.html",
      audioUrl: "https://caster04.streampakket.com/proxy/8186/stream",
      sourceUrl: "https://www.villabota.be",
      timeZone: "Europe/Brussels",
      startDate: "2026-08-21",
      startTime: "21:55",
      endTime: "00:05",
    },
    schema: {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      "name": "Villa West",
      "startDate": "2026-08-21T22:00:00+02:00",
      "endDate": "2026-08-22T00:00:00+02:00",
      "eventStatus": "https://schema.org/EventCompleted",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Villa Bota",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Brugge",
          "addressCountry": "BE"
        }
      },
      "image": [
        "https://kwartierwest.be/assets/media/events/villa-west-2026-08-21.jpg"
      ],
      "description": "Laatste Villa West van zomer 2026 op vrijdag 21 augustus bij Villa Bota in Brugge. Thorre, Siga & Lefever spelen van 22:00 tot 23:00; Wildcard van 23:00 tot 00:00.",
      "performer": [
        {
          "@type": "Person",
          "name": "Thorre",
          "url": "https://kwartierwest.be/artiesten/thorre"
        },
        {
          "@type": "MusicGroup",
          "name": "Siga & Lefever"
        },
        {
          "@type": "MusicGroup",
          "name": "Wildcard"
        }
      ],
      "organizer": {
        "@id": "https://kwartierwest.be/#organization"
      },
      "sameAs": "https://www.villabota.be",
      "url": "https://kwartierwest.be/events/villa-west-2026"
    },
    bodyClass: "event-detail villa-detail"
  }
] as const satisfies readonly EventRecord[];

export const eventBySlug = new Map<string, EventRecord>(events.map((event) => [event.slug, event]));
