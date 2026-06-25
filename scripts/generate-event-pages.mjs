import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CSS_ASSET_VERSION,
  DEFAULT_OG_IMAGE,
  SIDE_OG_IMAGES,
  SIDE_OG_META,
  SITE_ORIGIN,
  escapeHtml,
  normalizeSlug,
  renderHtmlDocument,
  renderSeoHead,
  sideLabel,
  toAbsoluteUrl,
  trimText
} from "./lib/site-meta.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const eventsFile = path.join(projectRoot, "data", "events.json");
const artistsFile = path.join(projectRoot, "data", "artists.json");
const outputRoot = path.join(projectRoot, "pages", "events", "detail");

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

function formatDateTimeRange(eventItem) {
  const start = formatDate(eventItem?.date, eventItem?.time);
  const endTime = String(eventItem?.endTime || "").trim();
  return endTime ? `${start}-${endTime}` : start;
}

function eventDateTimeISO(dateValue = "", timeValue = "") {
  const date = String(dateValue || "").trim();
  const time = String(timeValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  if (!/^\d{2}:\d{2}$/.test(time)) return date;
  return `${date}T${time}:00`;
}

function eventEndDateTimeISO(eventItem) {
  const startDate = String(eventItem?.date || "").trim();
  const startTime = String(eventItem?.time || "").trim();
  const endTime = String(eventItem?.endTime || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{2}:\d{2}$/.test(endTime)) return "";

  const [year, month, day] = startDate.split("-").map(Number);
  const endDate = new Date(Date.UTC(year, month - 1, day));
  if (/^\d{2}:\d{2}$/.test(startTime) && endTime <= startTime) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
  }

  return `${endDate.toISOString().slice(0, 10)}T${endTime}:00`;
}

function parseEventDay(dateValue = "") {
  const date = String(dateValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isPastEvent(eventItem, now = new Date()) {
  const eventDay = parseEventDay(eventItem?.date);
  if (!eventDay) return false;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return eventDay.getTime() < today.getTime();
}

function normalizedStatusLabel(eventItem, isPastByDate = false) {
  if (isPastByDate) return "Voorbij";

  const raw = String(eventItem?.status || "").trim().toLowerCase();
  if (raw === "completed" || raw === "past" || raw === "voorbij" || raw === "voorbije") return "Voorbij";
  if (raw === "upcoming" || raw === "komend") return "Komend";

  const original = String(eventItem?.status || "").trim();
  return original || "Komend";
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

function bookingMarkup(sideKey) {
  if (sideKey === "global") {
    return '<a class="chip-link" href="/pages/contact/index.html">Contact productie</a>';
  }

  return `<a class="chip-link" href="/pages/${escapeHtml(sideKey)}/booking.html?type=collective_side">Boek ${escapeHtml(sideLabel(sideKey))}</a>`;
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

function toJsonLd(eventItem, sideKey, canonical, imageUrl, artistMap, { isPastByDate = false } = {}) {
  const locationName = [eventItem?.region, eventItem?.venue].filter(Boolean).join(" - ");
  const isoStart = eventDateTimeISO(eventItem?.date, eventItem?.time);
  const isoEnd = eventEndDateTimeISO(eventItem);

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
    endDate: isoEnd || undefined,
    eventStatus: isPastByDate ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
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
    sameAs: eventItem?.source?.url ? String(eventItem.source.url) : undefined,
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
  const poster = String(eventItem?.poster || "").trim();
  const posterUrl = poster ? toAbsoluteUrl(poster) : "";
  const posterType = String(eventItem?.posterType || "").trim();
  const posterWidth = Number(eventItem?.posterWidth || 0);
  const posterHeight = Number(eventItem?.posterHeight || 0);
  const ogImage = posterUrl || SIDE_OG_IMAGES[sideKey] || DEFAULT_OG_IMAGE;
  const sideOgMeta = SIDE_OG_META[sideKey] || {};
  const description = eventDescription(eventItem, sideKey);
  const metaDescription = trimText(description, 170);
  const eventDate = formatDateTimeRange(eventItem);
  const location = [eventItem?.region, eventItem?.venue].filter(Boolean).join(" - ");
  const isPastByDate = isPastEvent(eventItem);
  const status = normalizedStatusLabel(eventItem, isPastByDate);
  const notes = String(eventItem?.notes || "").trim();
  const schedule = String(eventItem?.schedule || "").trim();

  const headline = schedule || notes || description;
  const lineup = lineupMarkup(eventItem, artistMap, sideKey);
  const ticket = ticketMarkup(eventItem);
  const source = sourceMarkup(eventItem);
  const booking = bookingMarkup(sideKey);
  const jsonLd = toJsonLd(eventItem, sideKey, canonical, ogImage, artistMap, { isPastByDate });
  const sideClass = sideKey === "global" ? "global" : sideKey;
  const head = renderSeoHead({
    title: `${title} | Kwartier West`,
    description: metaDescription,
    canonical,
    ogImage,
    ogAlt: `${title} - ${sideLabel(sideKey)}`,
    imageType: posterUrl ? posterType : sideOgMeta.type,
    imageWidth: posterUrl && posterWidth > 0 ? String(posterWidth) : sideOgMeta.width,
    imageHeight: posterUrl && posterHeight > 0 ? String(posterHeight) : sideOgMeta.height,
    extra: `<script type="application/ld+json">${jsonLd}</script>`
  });
  const posterMarkup = poster
    ? `
        <figure class="event-detail-poster">
          <img src="${escapeHtml(poster)}" alt="${escapeHtml(title)} affiche">
        </figure>
      `
    : "";

  const main = `
  <main id="main-content" class="page-shell">
    <header class="hero-surface hero-surface--lane hero-surface--lane-${escapeHtml(sideClass)} hero-surface--events${poster ? " hero-surface--event-poster" : ""}"${poster ? ` style="--event-poster: url('${escapeHtml(poster)}')"` : ""}>
      <p class="eyebrow">${escapeHtml(sideLabel(sideKey))} / Eventdetail</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(headline)}</p>
      <div class="inline-actions">
        <a class="chip-link" href="/pages/events/index.html#${slug === "villa-west-radio-2026" ? "villa-west" : ""}">Alle events</a>
        ${booking}
      </div>
    </header>

    <section class="surface surface--event-detail">
      <div class="event-detail-grid${poster ? " event-detail-grid--poster" : ""}">
        ${posterMarkup}
        <article class="event-detail-card">
          <h2>Event info</h2>
          <dl class="event-detail-list">
            ${schedule ? `<div><dt>Reeks</dt><dd>${escapeHtml(schedule)}</dd></div>` : ""}
            <div><dt>${schedule ? "Start" : "Datum"}</dt><dd>${escapeHtml(eventDate)}</dd></div>
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
  </main>`;

  const moduleScript = `
    import { initI18nPage } from "/js/core/i18n.js";
    import { renderNav } from "/partials/nav.js";
    import { renderFooter } from "/partials/footer.js";

    const pathname = String(window.location.pathname || "");
    const isIndexFileRoute = /\\/pages\\/events\\/detail\\/[^/]+\\/index\\.html$/i.test(pathname);
    const baseDepth = isIndexFileRoute ? 4 : 3;

    initI18nPage();
    renderNav({ sideKey: "${escapeHtml(sideClass)}", baseDepth });
    renderFooter({ baseDepth });
  `;

  return renderHtmlDocument({
    head,
    stylesheets: [`/css/base.css?v=${CSS_ASSET_VERSION}`, `/css/events.css?v=${CSS_ASSET_VERSION}`],
    bodyClass: `kw-page events-page kw-side-${escapeHtml(sideClass)}`,
    main,
    moduleScript
  });
}

async function main() {
  const [eventsRaw, artistsRaw] = await Promise.all([
    fs.readFile(eventsFile, "utf8"),
    fs.readFile(artistsFile, "utf8")
  ]);

  const eventsData = JSON.parse(String(eventsRaw || "").replace(/^\uFEFF/, ""));
  const artistsData = JSON.parse(String(artistsRaw || "").replace(/^\uFEFF/, ""));
  const artistMap = buildArtistMap(artistsData);

  const entries = [];
  for (const sideKey of ["global", "tekno", "hiphop"]) {
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
