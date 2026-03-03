import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const siteUrl = "https://kwartierwest.be";

const staticRoutes = [
  "/",
  "/pages/events/index.html",
  "/pages/tekno/index.html",
  "/pages/hiphop/index.html",
  "/pages/booking/index.html",
  "/pages/tekno/booking.html",
  "/pages/hiphop/booking.html",
  "/pages/tickets/index.html",
  "/pages/partners/index.html",
  "/pages/contact/index.html",
  "/pages/manifest/index.html"
];

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function routeToFilePath(route) {
  if (route === "/") return path.join(rootDir, "index.html");
  const plainRoute = route.split("?")[0].replace(/\/+$/, "");
  const artistMatch = plainRoute.match(/^\/pages\/(tekno|hiphop)\/artist\/[^/]+$/);
  if (artistMatch) {
    return path.join(rootDir, "pages", artistMatch[1], "artist.html");
  }
  const eventMatch = plainRoute.match(/^\/pages\/events\/detail\/([^/]+)$/);
  if (eventMatch?.[1]) {
    return path.join(rootDir, "pages", "events", "detail", decodeURIComponent(eventMatch[1]), "index.html");
  }
  return path.join(rootDir, plainRoute.replace(/^\//, ""));
}

async function getLastmod(route, fallbackDate) {
  try {
    const stats = await fs.stat(routeToFilePath(route));
    return normalizeDate(stats.mtime);
  } catch {
    return normalizeDate(fallbackDate);
  }
}

function buildPriority(route) {
  if (route === "/") return "1.0";
  if (route.includes("/events/")) return "0.9";
  if (route.includes("/artist/")) return "0.8";
  if (route.includes("/tekno/") || route.includes("/hiphop/")) return "0.8";
  return "0.6";
}

function buildChangefreq(route) {
  if (route === "/") return "weekly";
  if (route.includes("/events/")) return "daily";
  if (route.includes("/artist/")) return "weekly";
  return "monthly";
}

async function buildRoutes() {
  const [artistDataRaw, eventsDataRaw] = await Promise.all([
    fs.readFile(path.join(rootDir, "data", "artists.json"), "utf8"),
    fs.readFile(path.join(rootDir, "data", "events.json"), "utf8")
  ]);
  const artistData = JSON.parse(String(artistDataRaw || "").replace(/^\uFEFF/, ""));
  const eventsData = JSON.parse(String(eventsDataRaw || "").replace(/^\uFEFF/, ""));
  const updatedAt = normalizeDate(artistData?.updatedAt || new Date().toISOString());
  const routes = new Set(staticRoutes);

  for (const sideKey of ["tekno", "hiphop"]) {
    const artists = Array.isArray(artistData?.[sideKey]) ? artistData[sideKey] : [];
    for (const artist of artists) {
      const slug = String(artist?.slug || "").trim().toLowerCase();
      if (!slug) continue;
      routes.add(`/pages/${sideKey}/artist/${encodeURIComponent(slug)}`);
    }
  }

  const normalizeEventSlug = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-_.\s]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  for (const sideKey of ["tekno", "hiphop"]) {
    const events = Array.isArray(eventsData?.[sideKey]) ? eventsData[sideKey] : [];
    for (const eventItem of events) {
      const slug = normalizeEventSlug(eventItem?.id || eventItem?.title || "");
      if (!slug) continue;
      routes.add(`/pages/events/detail/${encodeURIComponent(slug)}`);
    }
  }

  const sortedRoutes = [...routes].sort((a, b) => a.localeCompare(b));
  const items = [];

  for (const route of sortedRoutes) {
    const loc = `${siteUrl}${route}`;
    const lastmod = await getLastmod(route, updatedAt);
    const changefreq = buildChangefreq(route);
    const priority = buildPriority(route);

    items.push(`
  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
    <changefreq>${xmlEscape(changefreq)}</changefreq>
    <priority>${xmlEscape(priority)}</priority>
  </url>`.trim());
  }

  return items;
}

async function main() {
  const routes = await buildRoutes();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.join("\n")}
</urlset>
`;

  const targetPath = path.join(rootDir, "sitemap.xml");
  await fs.writeFile(targetPath, xml, "utf8");
  console.log(`Generated sitemap.xml with ${routes.length} URLs`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
