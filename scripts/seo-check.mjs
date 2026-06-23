import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_ORIGIN = "https://kwartierwest.be";
const IGNORED_DIRS = new Set([".git", "node_modules", "_backups", "_screens", "_chrome-profile"]);
const REQUIRED_META_NAMES = ["description", "twitter:card", "twitter:title", "twitter:description", "twitter:image"];
const REQUIRED_META_PROPERTIES = ["og:type", "og:site_name", "og:title", "og:description", "og:url", "og:image"];

const failures = [];
const warnings = [];

function walk(dir, filter) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      out.push(...walk(absolute, filter));
      continue;
    }
    if (!filter || filter(absolute)) out.push(absolute);
  }

  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function attrValue(tag, attrName) {
  const pattern = new RegExp(`${attrName}\\s*=\\s*"([^"]*)"`, "i");
  return tag.match(pattern)?.[1]?.trim() || "";
}

function metaBy(html, attrName, attrValueText) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attrName}\\s*=\\s*"${attrValueText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}")([^>]*)>`, "i");
  const match = html.match(pattern);
  return match ? attrValue(match[0], "content") : "";
}

function linkByRel(html, relName) {
  const pattern = new RegExp(`<link\\b(?=[^>]*\\brel\\s*=\\s*"${relName}")([^>]*)>`, "i");
  const match = html.match(pattern);
  return match ? attrValue(match[0], "href") : "";
}

function localAssetExists(url) {
  if (!url.startsWith(SITE_ORIGIN)) return true;
  const clean = url.slice(SITE_ORIGIN.length).split("?")[0].replace(/^\/+/, "");
  if (!clean) return true;
  return fs.existsSync(path.join(ROOT, clean));
}

function isCanonicalUrl(value) {
  return value.startsWith(`${SITE_ORIGIN}/`) || value === `${SITE_ORIGIN}`;
}

function checkHtmlFile(file) {
  const html = fs.readFileSync(file, "utf8");
  const fileLabel = rel(file);
  const robots = metaBy(html, "name", "robots").toLowerCase();
  const noindex = robots.split(",").map((part) => part.trim()).includes("noindex");

  if (!/<html\b[^>]*\blang="nl"/i.test(html)) {
    failures.push(`${fileLabel}: html lang moet nl zijn.`);
  }

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  if (!title) failures.push(`${fileLabel}: ontbrekende <title>.`);
  if (title.length > 70) warnings.push(`${fileLabel}: title is lang (${title.length} tekens).`);

  if (!noindex) {
    for (const name of REQUIRED_META_NAMES) {
      const content = metaBy(html, "name", name);
      if (!content) failures.push(`${fileLabel}: ontbrekende meta name="${name}".`);
    }

    for (const property of REQUIRED_META_PROPERTIES) {
      const content = metaBy(html, "property", property);
      if (!content) failures.push(`${fileLabel}: ontbrekende meta property="${property}".`);
    }
  }

  const description = metaBy(html, "name", "description");
  if (description && description.length < 45) warnings.push(`${fileLabel}: meta description is kort (${description.length} tekens).`);
  if (description && description.length > 180) warnings.push(`${fileLabel}: meta description is lang (${description.length} tekens).`);

  const canonical = linkByRel(html, "canonical");
  if (!canonical) failures.push(`${fileLabel}: ontbrekende canonical.`);
  else if (!isCanonicalUrl(canonical)) failures.push(`${fileLabel}: canonical is geen kwartierwest.be URL (${canonical}).`);

  const ogUrl = metaBy(html, "property", "og:url");
  if (!noindex && ogUrl && canonical && ogUrl !== canonical) {
    warnings.push(`${fileLabel}: og:url wijkt af van canonical.`);
  }

  const ogImage = metaBy(html, "property", "og:image");
  if (ogImage && !localAssetExists(ogImage)) failures.push(`${fileLabel}: og:image asset ontbreekt (${ogImage}).`);

  const twitterImage = metaBy(html, "name", "twitter:image");
  if (twitterImage && !localAssetExists(twitterImage)) failures.push(`${fileLabel}: twitter:image asset ontbreekt (${twitterImage}).`);

  if (fileLabel.startsWith("pages/events/detail/") && !/<script\b[^>]*type="application\/ld\+json"/i.test(html)) {
    failures.push(`${fileLabel}: event detail mist JSON-LD.`);
  }

  if (/^pages\/(?:tekno|hiphop)\/artist\/[^/]+\/index\.html$/i.test(fileLabel) && !/<script\b[^>]*type="application\/ld\+json"[^>]*data-artist-jsonld="true"/i.test(html)) {
    failures.push(`${fileLabel}: artist detail mist JSON-LD.`);
  }
}

function parseSitemapUrls() {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) {
    failures.push("sitemap.xml ontbreekt.");
    return new Set();
  }
  const xml = fs.readFileSync(file, "utf8");
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()));
}

function htmlRouteForFile(file) {
  const relative = rel(file);
  if (relative === "index.html") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${relative}`;
}

function checkSitemapCoverage(htmlFiles) {
  const sitemapUrls = parseSitemapUrls();
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const robots = metaBy(html, "name", "robots").toLowerCase();
    const noindex = robots.split(",").map((part) => part.trim()).includes("noindex");
    if (noindex) continue;

    const route = htmlRouteForFile(file);
    const canonical = linkByRel(html, "canonical");
    const expected = canonical || route;
    if (!sitemapUrls.has(expected)) {
      failures.push(`${rel(file)}: canonical staat niet in sitemap.xml (${expected}).`);
    }
  }
}

function checkRobots() {
  const robotsPath = path.join(ROOT, "robots.txt");
  if (!fs.existsSync(robotsPath)) {
    failures.push("robots.txt ontbreekt.");
    return;
  }
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!/Sitemap:\s*https:\/\/kwartierwest\.be\/sitemap\.xml/i.test(robots)) {
    failures.push("robots.txt verwijst niet naar https://kwartierwest.be/sitemap.xml.");
  }
  if (/Disallow:\s*\/\s*$/im.test(robots)) {
    failures.push("robots.txt blokkeert de volledige site.");
  }
}

const htmlFiles = [path.join(ROOT, "index.html"), ...walk(path.join(ROOT, "pages"), (file) => file.endsWith(".html"))];
for (const file of htmlFiles) checkHtmlFile(file);
checkSitemapCoverage(htmlFiles);
checkRobots();

if (failures.length || warnings.length) {
  console.log("--- Kwartier West SEO check ---");
  console.log(`Errors:   ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log("");
}

if (failures.length) {
  console.error("ERRORS:");
  for (const message of failures) console.error(" - " + message);
  console.error("");
}

if (warnings.length) {
  console.warn("WARNINGS:");
  for (const message of warnings) console.warn(" - " + message);
  console.warn("");
}

if (failures.length) process.exit(1);
console.log(`seo-check passed (${htmlFiles.length} HTML pages, ${warnings.length} warning(s)).`);
