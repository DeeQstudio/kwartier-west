import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARTIST_DETAIL_VERSION,
  CSS_ASSET_VERSION,
  DEFAULT_OG_IMAGE,
  SITE_ORIGIN,
  escapeHtml,
  normalizePlainSlug,
  renderHtmlDocument,
  renderSeoHead,
  toAbsoluteUrl,
  trimText
} from "./lib/site-meta.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const artistsFile = path.join(projectRoot, "data", "artists.json");
const outputRoot = path.join(projectRoot, "pages");

function normalizeSlug(value = "") {
  return normalizePlainSlug(value);
}

function sideLabel(sideKey) {
  return sideKey === "tekno" ? "Tekno" : "Hip hop";
}

function sideBookingLabel(sideKey) {
  return sideKey === "tekno" ? "Boek Tekno" : "Boek Hip hop";
}

function sideArtistLabel(sideKey) {
  return sideKey === "tekno" ? "Tekno artiesten" : "Hip hop artiesten";
}

function eyebrowLabel(sideKey) {
  return sideKey === "tekno" ? "Tekno / Artiestprofiel" : "Hip hop / Artiestprofiel";
}

function resolveOgImage(artist) {
  const raw = String(artist?.photo || "").trim();
  if (!raw) return DEFAULT_OG_IMAGE;

  const ext = path.extname(raw).toLowerCase();
  if (ext === ".webp") {
    const relative = raw.replace(/^\/+/, "");
    const withoutExt = relative.slice(0, -ext.length);
    const relativeDir = path.dirname(relative);
    const artistSlug = normalizeSlug(artist?.slug);

    const candidates = [];
    for (const fallbackExt of [".jpg", ".jpeg", ".png"]) {
      candidates.push(`${withoutExt}${fallbackExt}`);
      if (artistSlug) candidates.push(path.join(relativeDir, `${artistSlug}${fallbackExt}`));
    }

    for (const candidate of candidates) {
      const fallbackFsPath = path.join(projectRoot, candidate);
      if (fsSync.existsSync(fallbackFsPath)) return toAbsoluteUrl(`/${candidate.replaceAll("\\", "/")}`);
    }

    if (fsSync.existsSync(path.join(projectRoot, relativeDir))) {
      const files = fsSync.readdirSync(path.join(projectRoot, relativeDir));
      const imageFallback = files.find((file) => /\.(png|jpe?g)$/i.test(file));
      if (imageFallback) {
        const candidate = path.join(relativeDir, imageFallback).replaceAll("\\", "/");
        return toAbsoluteUrl(`/${candidate}`);
      }
    }

    return DEFAULT_OG_IMAGE;
  }

  return toAbsoluteUrl(raw) || DEFAULT_OG_IMAGE;
}

function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function socialUrls(artist) {
  const links = Array.isArray(artist?.links) ? artist.links : [];
  return links
    .map((link) => String(link?.url || "").trim())
    .filter((url) => /^https?:\/\//i.test(url));
}

function renderArtistJsonLd({ artist, sideKey, canonical, description, ogImage }) {
  const name = String(artist?.name || "").trim();
  if (!name || !canonical) return "";

  const city = trimText(artist?.city || "");
  const role = trimText(artist?.role || "");
  const tags = Array.isArray(artist?.tags) ? artist.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [];
  const genres = [...new Set([sideLabel(sideKey), ...tags].filter(Boolean))];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${canonical}#artist`,
    name,
    url: canonical,
    description,
    genre: genres,
    image: ogImage || undefined,
    sameAs: socialUrls(artist),
    memberOf: {
      "@type": "Organization",
      name: "Kwartier West",
      url: `${SITE_ORIGIN}/`
    },
    knowsAbout: role || undefined,
    homeLocation: city
      ? {
          "@type": "Place",
          name: city
        }
      : undefined
  };

  return `<script type="application/ld+json" data-artist-jsonld="true">${safeJsonLd(jsonLd)}</script>`;
}

function renderArtistPage(sideKey, artist) {
  const slug = normalizeSlug(artist?.slug);
  const name = String(artist?.name || "Artiest").trim();
  const headline = trimText(artist?.headline || artist?.bio || "");
  const role = trimText(artist?.role || "");
  const city = trimText(artist?.city || "");

  const descriptionParts = [headline, role, city].filter(Boolean);
  const description = trimText(
    descriptionParts.join(" ") || `${name} binnen ${sideLabel(sideKey)} van Kwartier West.`,
    240
  );

  const title = `${name} | Kwartier West`;
  const canonical = `${SITE_ORIGIN}/pages/${sideKey}/artist/${slug}`;
  const ogImage = resolveOgImage(artist);
  const ogAlt = `${name} - ${sideLabel(sideKey)} bij Kwartier West`;
  const artistJsonLd = renderArtistJsonLd({ artist, sideKey, canonical, description, ogImage });
  const head = renderSeoHead({
    title,
    description,
    canonical,
    ogImage,
    ogAlt,
    extra: artistJsonLd
  });

  const main = `
  <main id="main-content" class="page-shell">
    <header class="hero-surface hero-surface--lane hero-surface--lane-${escapeHtml(sideKey)} hero-surface--artist">
      <p class="eyebrow">${escapeHtml(eyebrowLabel(sideKey))}</p>
      <p class="artist-page-kicker" data-artist-page-title>${escapeHtml(name)}</p>
      <p class="lead" data-artist-page-lead>${escapeHtml(headline || description)}</p>
      <div class="inline-actions">
        <a class="chip-link" href="/pages/${escapeHtml(sideKey)}/index.html#artists">${escapeHtml(sideArtistLabel(sideKey))}</a>
        <a class="chip-link" href="/pages/${escapeHtml(sideKey)}/booking.html">${escapeHtml(sideBookingLabel(sideKey))}</a>
      </div>
    </header>

    <div data-sideswitch></div>

    <section class="surface surface--artist-detail">
      <div data-artist-root></div>
    </section>
  </main>`;

  const moduleScript = `
    import { initI18nPage } from "/js/core/i18n.js";
    import { renderNav } from "/partials/nav.js";
    import { renderFooter } from "/partials/footer.js";
    import { renderSideSwitch } from "/partials/side-switch.js";
    import { renderArtistDetail } from "/js/artist-detail.js?v=${ARTIST_DETAIL_VERSION}";

    const pathname = String(window.location.pathname || "");
    const isIndexFileRoute = /\\/pages\\/(tekno|hiphop)\\/artist\\/[^/]+\\/index\\.html$/i.test(pathname);
    const baseDepth = isIndexFileRoute ? 4 : 3;

    initI18nPage();
    renderNav({ sideKey: "${escapeHtml(sideKey)}", baseDepth });
    renderFooter({ baseDepth });
    renderSideSwitch("${escapeHtml(sideKey)}");
    renderArtistDetail("${escapeHtml(sideKey)}", { baseDepth });
  `;

  return renderHtmlDocument({
    head,
    stylesheets: [`/css/base.css?v=${CSS_ASSET_VERSION}`],
    bodyClass: `kw-page kw-side-${escapeHtml(sideKey)} kw-page--artist`,
    main,
    moduleScript
  });
}

async function writeArtistPagesForSide(artistsData, sideKey) {
  const artists = Array.isArray(artistsData?.[sideKey]) ? artistsData[sideKey] : [];
  let written = 0;

  for (const artist of artists) {
    const slug = normalizeSlug(artist?.slug);
    if (!slug) continue;

    const outDir = path.join(outputRoot, sideKey, "artist", slug);
    await fs.mkdir(outDir, { recursive: true });

    const html = renderArtistPage(sideKey, artist);
    const outFile = path.join(outDir, "index.html");
    await fs.writeFile(outFile, html, "utf8");
    written += 1;
  }

  return written;
}

async function main() {
  const raw = await fs.readFile(artistsFile, "utf8");
  const artistsData = JSON.parse(raw);

  const hiphopCount = await writeArtistPagesForSide(artistsData, "hiphop");
  const teknoCount = await writeArtistPagesForSide(artistsData, "tekno");
  const total = hiphopCount + teknoCount;

  console.log(`Generated ${total} artist pages (${hiphopCount} hiphop, ${teknoCount} tekno).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
