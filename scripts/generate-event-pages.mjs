import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const eventsFile = path.join(projectRoot, "data", "events.json");
const artistsFile = path.join(projectRoot, "data", "artists.json");
const outputRoot = path.join(projectRoot, "pages", "events", "detail");

const SITE_ORIGIN = "https://kwartierwest.be";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/og/og-cover.png`;
const SIDE_OG = {
  tekno: `${SITE_ORIGIN}/assets/landing-tekno.jpg`,
  hiphop: `${SITE_ORIGIN}/assets/landing-hiphop.jpg`
};
const ASSET_VERSION = "20260303c";

function normalizeSlug(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.\s]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toAbsolute(pathOrUrl = "") {
  const value = String(pathOrUrl || "").trim().replaceAll("\\", "/");
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SITE_ORIGIN}${value}`;
  return `${SITE_ORIGIN}/${value}`;
}

function sideLabel(sideKey) {
  return sideKey === "tekno" ? "Tekno" : "Hip hop";
}

function trimText(value = "", maxLength = 240) {
  const compact = String(value || "").replace(/\s+/g, " ").trim();
  if (!compact) return "";
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

function eventSlug(eventItem, fallback = "event") {
  const idSlug = normalizeSlug(eventItem?.id || "");
  if (idSlug) return idSlug;

  const date = normalizeSlug(eventItem?.date || "");
  const title = normalizeSlug(eventItem?.title || "");
  const merged = normalizeSlug(`${date}-${title}`) || normalizeSlug(fallback);
  return merged || "event";
}

function formatDate(dateValue = "", timeValue = "") {
  const date = String(dateValue || "").trim();
  const time = String(timeValue || "").trim();
  if (!date && !time) return "Nog te bevestigen";
  if (!date) return time;

  const parsed = new Date(`${date}T00:00:00`);
  const humanDate = Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("nl-BE", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(parsed);

  if (!time) return humanDate;
  return `${humanDate} - ${time}`;
}

function buildArtistMap(artistsData) {
  const out = new Map();
  for (const sideKey of ["tekno", "hiphop"]) {
    const sideArtists = Array.isArray(artistsData?.[sideKey]) ? artistsData[sideKey] : [];
    for (const artist of sideArtists) {
      const slug = normalizeSlug(artist?.slug || "");
      if (!slug) continue;
      out.set(slug, {
        sideKey,
        name: String(artist?.name || slug).trim() || slug
      });
    }
  }
  return out;
}

function lineupMarkup(eventItem, artistMap, fallbackSideKey) {
  const entries = Array.isArray(eventItem?.lineup) ? eventItem.lineup : [];
  if (!entries.length) return '<span class="muted">Line-up volgt.</span>';

  const rendered = entries.map((entry) => {
    const slug = normalizeSlug(entry?.slug || "");
    if (slug && artistMap.has(slug)) {
      const artist = artistMap.get(slug);
      const href = `/pages/${artist.sideKey || fallbackSideKey}/artist/${encodeURIComponent(slug)}`;
      return `<a class="inline-link" href="${escapeHtml(href)}">${escapeHtml(artist.name)}</a>`;
    }

    const name = String(entry?.name || slug || "").trim();
    if (!name) return null;
    return `<span>${escapeHtml(name)}</span>`;
  });

  return rendered.filter(Boolean).join('<span class="dot-sep"></span>') || '<span class="muted">Line-up volgt.</span>';
}

function ticketMarkup(eventItem) {
  const mode = String(eventItem?.tickets?.mode || "").trim().toLowerCase();
  const url = String(eventItem?.tickets?.url || "").trim();
  const label = String(eventItem?.tickets?.label || "").trim() || "Tickets";

  if (mode === "external" && url) {
    return `<a class="chip-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }

  if (mode === "internal") {
    return '<a class="chip-link" href="/pages/tickets/index.html">Vraag toegang</a>';
  }

  return '<span class="muted">Tickets volgen.</span>';
}

function sourceMarkup(eventItem) {
  const url = String(eventItem?.source?.url || "").trim();
  if (!url) return '<span class="muted">Bron volgt.</span>';
  const platform = String(eventItem?.source?.platform || "").trim() || "Social";
  return `<a class="inline-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(platform)}</a>`;
}

function eventDescription(eventItem, sideKey) {
  const title = String(eventItem?.title || "").trim();
  const region = String(eventItem?.region || "").trim();
  const venue = String(eventItem?.venue || "").trim();
  const notes = String(eventItem?.notes || "").trim();

  const location = [region, venue].filter(Boolean).join(" - ");
  const base = [title, location, notes].filter(Boolean).join(". ");

  return trimText(base || `${sideLabel(sideKey)} event van Kwartier West.`);
}

function toJsonLd(eventItem, sideKey, canonical, imageUrl, artistMap) {
  const locationName = [eventItem?.region, eventItem?.venue].filter(Boolean).join(" - ");
  const startDate = String(eventItem?.date || "").trim();
  const startTime = String(eventItem?.time || "").trim();
  const isoStart = startDate ? `${startDate}T${startTime || "20:00"}:00` : "";

  const performers = (Array.isArray(eventItem?.lineup) ? eventItem.lineup : [])
    .map((entry) => {
      const slug = normalizeSlug(entry?.slug || "");
      if (slug && artistMap.has(slug)) {
        const artist = artistMap.get(slug);
        return {
          "@type": "MusicGroup",
          name: artist.name,
          url: `${SITE_ORIGIN}/pages/${artist.sideKey}/artist/${encodeURIComponent(slug)}`
        };
      }
      const name = String(entry?.name || "").trim();
      if (!name) return null;
      return {
        "@type": "MusicGroup",
        name
      };
    })
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "@id": `${canonical}#event`,
    name: String(eventItem?.title || "Kwartier West Event"),
    url: canonical,
    startDate: isoStart || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    image: imageUrl || DEFAULT_OG_IMAGE,
    description: eventDescription(eventItem, sideKey),
    location: locationName
      ? {
          "@type": "Place",
          name: locationName,
          address: String(eventItem?.region || "").trim() || undefined
        }
      : undefined,
    performer: performers.length ? performers : undefined,
    organizer: {
      "@type": "Organization",
      name: "Kwartier West",
      url: `${SITE_ORIGIN}/`
    }
  };

  return JSON.stringify(jsonLd);
}

function renderEventPage(eventItem, sideKey, artistMap) {
  const slug = eventSlug(eventItem, `${sideKey}-event`);
  const title = String(eventItem?.title || "Kwartier West Event").trim();
  const canonical = `${SITE_ORIGIN}/pages/events/detail/${encodeURIComponent(slug)}`;
  const ogImage = SIDE_OG[sideKey] || DEFAULT_OG_IMAGE;
  const description = eventDescription(eventItem, sideKey);
  const eventDate = formatDate(eventItem?.date, eventItem?.time);
  const location = [eventItem?.region, eventItem?.venue].filter(Boolean).join(" - ");
  const status = String(eventItem?.status || "Komend").trim() || "Komend";
  const notes = String(eventItem?.notes || "").trim();

  const headline = notes || description;
  const lineup = lineupMarkup(eventItem, artistMap, sideKey);
  const ticket = ticketMarkup(eventItem);
  const source = sourceMarkup(eventItem);
  const jsonLd = toJsonLd(eventItem, sideKey, canonical, ogImage, artistMap);

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Kwartier West</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kwartier West">
  <meta property="og:title" content="${escapeHtml(title)} | Kwartier West">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">
  <meta property="og:image:alt" content="${escapeHtml(title)} - ${escapeHtml(sideLabel(sideKey))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} | Kwartier West">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <script type="application/ld+json">${jsonLd}</script>
  <link rel="stylesheet" href="/css/base.css?v=${ASSET_VERSION}">
  <link rel="stylesheet" href="/css/events.css?v=${ASSET_VERSION}">
</head>
<body class="kw-page events-page kw-side-${escapeHtml(sideKey)}">
  <div data-nav></div>

  <main id="main-content" class="page-shell">
    <header class="hero-surface hero-surface--lane hero-surface--lane-${escapeHtml(sideKey)} hero-surface--events">
      <p class="eyebrow">${escapeHtml(sideLabel(sideKey))} / Eventdetail</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(headline)}</p>
      <div class="inline-actions">
        <a class="chip-link" href="/pages/events/index.html?side=${escapeHtml(sideKey)}&scope=all">Alle ${escapeHtml(sideLabel(sideKey))}-events</a>
        <a class="chip-link" href="/pages/${escapeHtml(sideKey)}/booking.html?type=collective_side">Boek ${escapeHtml(sideLabel(sideKey))}</a>
      </div>
    </header>

    <section class="surface surface--event-detail">
      <div class="event-detail-grid">
        <article class="event-detail-card">
          <h2>Event info</h2>
          <dl class="event-detail-list">
            <div><dt>Datum</dt><dd>${escapeHtml(eventDate)}</dd></div>
            <div><dt>Locatie</dt><dd>${escapeHtml(location || "Wordt bevestigd")}</dd></div>
            <div><dt>Status</dt><dd>${escapeHtml(status)}</dd></div>
            <div><dt>Tickets</dt><dd>${ticket}</dd></div>
            <div><dt>Officiele bron</dt><dd>${source}</dd></div>
          </dl>
        </article>

        <article class="event-detail-card">
          <h2>Line-up</h2>
          <p class="event-detail-lineup">${lineup}</p>
          ${notes ? `<p class="event-detail-notes">${escapeHtml(notes)}</p>` : ""}
        </article>
      </div>
    </section>
  </main>

  <div data-footer></div>

  <script type="module">
    import { initI18nPage } from "/js/core/i18n.js";
    import { renderNav } from "/partials/nav.js";
    import { renderFooter } from "/partials/footer.js";

    const pathname = String(window.location.pathname || "");
    const isIndexFileRoute = /\\/pages\\/events\\/detail\\/[^/]+\\/index\\.html$/i.test(pathname);
    const baseDepth = isIndexFileRoute ? 4 : 3;

    initI18nPage();
    renderNav({ sideKey: "${escapeHtml(sideKey)}", baseDepth });
    renderFooter({ baseDepth });
  </script>
</body>
</html>
`;
}

async function main() {
  const [eventsRaw, artistsRaw] = await Promise.all([
    fs.readFile(eventsFile, "utf8"),
    fs.readFile(artistsFile, "utf8")
  ]);

  const eventsData = JSON.parse(eventsRaw);
  const artistsData = JSON.parse(artistsRaw);
  const artistMap = buildArtistMap(artistsData);

  const entries = [];
  for (const sideKey of ["tekno", "hiphop"]) {
    const sideEvents = Array.isArray(eventsData?.[sideKey]) ? eventsData[sideKey] : [];
    for (const eventItem of sideEvents) {
      entries.push({ sideKey, eventItem });
    }
  }

  let written = 0;
  for (const entry of entries) {
    const slug = eventSlug(entry.eventItem, `${entry.sideKey}-event-${written + 1}`);
    if (!slug) continue;

    const outDir = path.join(outputRoot, slug);
    await fs.mkdir(outDir, { recursive: true });
    const html = renderEventPage(entry.eventItem, entry.sideKey, artistMap);
    await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
    written += 1;
  }

  console.log(`Generated ${written} event detail pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
