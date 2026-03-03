import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const artistsFile = path.join(projectRoot, "data", "artists.json");
const outputRoot = path.join(projectRoot, "pages");

const SITE_ORIGIN = "https://kwartierwest.be";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/og/og-cover.png`;
const ASSET_VERSION = "20260303b";

function normalizeSlug(value = "") {
  return String(value || "").trim().toLowerCase();
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

function trimText(value = "", maxLength = 230) {
  const compact = String(value || "").replace(/\s+/g, " ").trim();
  if (!compact) return "";
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}…`;
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
      if (fsSync.existsSync(fallbackFsPath)) return toAbsolute(`/${candidate.replaceAll("\\", "/")}`);
    }

    if (fsSync.existsSync(path.join(projectRoot, relativeDir))) {
      const files = fsSync.readdirSync(path.join(projectRoot, relativeDir));
      const imageFallback = files.find((file) => /\.(png|jpe?g)$/i.test(file));
      if (imageFallback) {
        const candidate = path.join(relativeDir, imageFallback).replaceAll("\\", "/");
        return toAbsolute(`/${candidate}`);
      }
    }

    return DEFAULT_OG_IMAGE;
  }

  return toAbsolute(raw) || DEFAULT_OG_IMAGE;
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

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kwartier West">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">
  <meta property="og:image:alt" content="${escapeHtml(ogAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="stylesheet" href="/css/base.css?v=${ASSET_VERSION}">
</head>
<body class="kw-page kw-side-${escapeHtml(sideKey)} kw-page--artist">
  <div data-nav></div>

  <main id="main-content" class="page-shell">
    <header class="hero-surface hero-surface--lane hero-surface--lane-${escapeHtml(sideKey)} hero-surface--artist">
      <p class="eyebrow">${escapeHtml(eyebrowLabel(sideKey))}</p>
      <h1 data-artist-page-title>${escapeHtml(name)}</h1>
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
  </main>

  <div data-footer></div>

  <script type="module">
    import { initI18nPage } from "/js/core/i18n.js";
    import { renderNav } from "/partials/nav.js";
    import { renderFooter } from "/partials/footer.js";
    import { renderSideSwitch } from "/partials/side-switch.js";
    import { renderArtistDetail } from "/js/artist-detail.js?v=${ASSET_VERSION}";

    const pathname = String(window.location.pathname || "");
    const isIndexFileRoute = /\\/pages\\/(tekno|hiphop)\\/artist\\/[^/]+\\/index\\.html$/i.test(pathname);
    const baseDepth = isIndexFileRoute ? 4 : 3;

    initI18nPage();
    renderNav({ sideKey: "${escapeHtml(sideKey)}", baseDepth });
    renderFooter({ baseDepth });
    renderSideSwitch("${escapeHtml(sideKey)}");
    renderArtistDetail("${escapeHtml(sideKey)}", { baseDepth });
  </script>
</body>
</html>
`;
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
