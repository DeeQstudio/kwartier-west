import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const src = join(root, "src");
const publicDir = join(root, "public");
const errors = [];
const warnings = [];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ["node_modules", ".next", ".git"].includes(entry.name)) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = walk(root);
const sourceFiles = files.filter((file) => [".ts", ".tsx", ".css", ".mjs"].includes(extname(file)));
const sourceText = sourceFiles.map((file) => [relative(root, file).replaceAll("\\", "/"), readFileSync(file, "utf8")]);

const mustExist = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/artiesten/[slug]/page.tsx",
  "src/app/events/[slug]/page.tsx",
  "src/app/api/bookings/route.ts",
  "src/app/api/public-config/route.ts",
  "src/data/artists.ts",
  "src/data/events.ts",
  "src/components/booking-builder.tsx",
  "src/components/home-roster.tsx",
  "src/components/artist-index.tsx",
  "src/components/scene-rosters.tsx",
  "src/components/roster-board.tsx",
  "src/components/artist-announcements.tsx",
  "src/app/artiesten/opengraph-image.tsx",
  "src/components/villa-west-stream.tsx",
  "src/components/villa-west-status.tsx",
  "src/lib/time-window.ts",
  "src/lib/artist-media.ts",
  "next.config.ts",
  "tsconfig.json",
  "package.json",
];

for (const file of mustExist) {
  if (!existsSync(join(root, file))) errors.push(`missing required production file: ${file}`);
}

for (const legacy of ["vercel.json", "assets/site.js", "api/bookings.js", "api/public-config.js"]) {
  if (existsSync(join(root, legacy))) errors.push(`legacy runtime file should not exist: ${legacy}`);
}
if (files.some((file) => extname(file) === ".html")) errors.push("static .html documents remain in the Next.js production tree");

const artists = readFileSync(join(root, "src/data/artists.ts"), "utf8");
const artistSlugs = [...artists.matchAll(/"slug": "([^"]+)"/g)].map((match) => match[1]);
if (artistSlugs.length < 1) errors.push("artist dataset is empty");
if (new Set(artistSlugs).size !== artistSlugs.length) errors.push("duplicate artist slug found");

const forbiddenFormerArtist = "tubb" + "ie";
const forbiddenRefs = files.filter((file) => file.toLowerCase().includes(forbiddenFormerArtist));
if (forbiddenRefs.length) errors.push(`former artist files remain: ${forbiddenRefs.join(", ")}`);
for (const [name, text] of sourceText) {
  if (text.toLowerCase().includes(forbiddenFormerArtist)) errors.push(`${name}: former artist reference remains`);
}
const artistIndexPage = readFileSync(join(root, "src/app/artiesten/page.tsx"), "utf8");
if (!artistIndexPage.includes("{artists.length}")) errors.push("artist roster hero count is not derived from typed artist data");
if (!artistIndexPage.includes("<RosterBoard />")) errors.push("artist roster visual must render from typed artist data");
if (/artists-banner(?:-v\d+)?\.webp/.test(artistIndexPage)) errors.push("artist page still references a static roster-count image");
for (const slug of artistSlugs) {
  if (!existsSync(join(publicDir, `assets/media/artists/${slug}.webp`))) {
    errors.push(`artist asset missing: ${slug}.webp`);
  }
}
if (/"index"\s*:|"nextSlug"\s*:|"nextName"\s*:/.test(artists)) {
  errors.push("derived artist index/next navigation is hardcoded in the artist source");
}
const siteData = readFileSync(join(root, "src/data/site.ts"), "utf8");
if (/RosterOrder/.test(siteData)) errors.push("scene/home roster order is duplicated outside typed artist data");

for (const [page, marker] of [
  ["src/app/page.tsx", "<HomeRoster />"],
  ["src/app/artiesten/page.tsx", "<ArtistIndex />"],
  ["src/app/artiesten/page.tsx", "<RosterBoard />"],
  ["src/app/tekno/page.tsx", "<TeknoRoster />"],
  ["src/app/hiphop/page.tsx", "<HiphopRoster />"],
]) {
  const text = readFileSync(join(root, page), "utf8");
  if (!text.includes(marker)) errors.push(`${page}: typed roster component missing`);
}


const homePage = readFileSync(join(root, "src/app/page.tsx"), "utf8");
for (const marker of ["Open Kwartier West", "scroll-instruction", "introCue"]) {
  if (homePage.includes(marker)) errors.push(`home intro still contains deprecated instruction: ${marker}`);
}

const events = readFileSync(join(root, "src/data/events.ts"), "utf8");
const eventSlugs = [...events.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (eventSlugs.length !== 2) errors.push(`expected 2 typed event records, found ${eventSlugs.length}`);
for (const marker of [
  'date: "2026-08-21"',
  'startTime: "21:55"',
  'endTime: "00:05"',
  'https://live.villabota.be/index-video-only.html',
  'https://caster04.streampakket.com/proxy/8186/stream',
  'name: "Thorre"',
  'name: "Siga & Lefever"',
  'name: "Wildcard"',
]) {
  if (!events.includes(marker)) errors.push(`Villa West live contract missing: ${marker}`);
}

const staticRoutes = JSON.parse(readFileSync(join(root, "scripts/expected-routes.json"), "utf8"));
const expectedRoutes = [
  ...staticRoutes,
  ...artistSlugs.map((slug) => `/artiesten/${slug}`),
  ...eventSlugs.map((slug) => `/events/${slug}`),
];
const sitemap = readFileSync(join(root, "src/app/sitemap.ts"), "utf8");
for (const marker of ['import { artists }', 'import { events }', '...artists.map', '...events.map']) {
  if (!sitemap.includes(marker)) errors.push(`dynamic sitemap contract missing: ${marker}`);
}
const validRoutes = new Set([...expectedRoutes, "/booking/verifieer"]);
const internalHrefRe = /href=(?:"|{`)(\/[^"`}?#]*)(?:[^"`}]*)?(?:"|`})/g;
for (const [name, text] of sourceText.filter(([name]) => name.endsWith(".tsx"))) {
  for (const match of text.matchAll(internalHrefRe)) {
    const route = match[1] || "/";
    if (
      route.startsWith("/assets/") ||
      route.startsWith("/api/") ||
      route.startsWith("/favicon") ||
      route.startsWith("/site.webmanifest")
    ) continue;
    if (route.includes("${")) continue;
    if (!validRoutes.has(route)) errors.push(`${name}: unrecognized internal href ${route}`);
  }
}

const assetRe = /["'`](\/assets\/[^"'`?#${}:]+\.[A-Za-z0-9]+)["'`]/g;
for (const [name, text] of sourceText) {
  for (const match of text.matchAll(assetRe)) {
    const path = join(publicDir, match[1].slice(1));
    if (!existsSync(path)) errors.push(`${name}: missing referenced asset ${match[1]}`);
  }
}

for (const [name, text] of sourceText) {
  if (name === "scripts/release-qa.mjs") continue;
  if (/hyphens\s*:\s*auto/i.test(text)) errors.push(`${name}: automatic hyphenation is forbidden in production typography`);
  if (/\bTODO\b|\bFIXME\b|Lorem ipsum|example\.com/i.test(text)) errors.push(`${name}: unfinished/debug content remains`);
  if (/console\.log\(|debugger;|alert\(/.test(text)) errors.push(`${name}: debug statement remains`);
  if (text.includes("dangerouslySetInnerHTML") && name !== "src/components/json-ld.tsx") {
    errors.push(`${name}: unexpected dangerouslySetInnerHTML`);
  }
}

const booking = readFileSync(join(root, "src/lib/booking-server.ts"), "utf8");
for (const marker of [
  "timingSafeEqual",
  "booking-pending/",
  "booking-consumed/",
  'access: "private"',
  "MIN_FORM_FILL_MS",
  "sameOrigin",
  "verifyTurnstile",
  "allowedKeys",
  "artistBySlug",
]) {
  if (!booking.includes(marker)) errors.push(`booking hardening marker missing: ${marker}`);
}

const bookingRoute = readFileSync(join(root, "src/app/api/bookings/route.ts"), "utf8");
for (const marker of ["export async function POST", "export async function GET", 'runtime = "nodejs"', 'dynamic = "force-dynamic"']) {
  if (!bookingRoute.includes(marker)) errors.push(`booking route contract missing: ${marker}`);
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
for (const marker of [
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Content-Security-Policy",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "https://challenges.cloudflare.com",
  "https://live.villabota.be",
  "https://caster04.streampakket.com",
  "/pages/tekno/",
  "/pages/hiphop/",
  "/pages/tekno/artist/:slug",
  "/pages/hiphop/artist/:slug",
]) {
  if (!nextConfig.includes(marker)) errors.push(`next.config.ts contract missing: ${marker}`);
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (packageJson.engines?.node !== "22.x") errors.push("Node runtime must stay pinned to 22.x");
if (packageJson.dependencies?.next !== "16.3.1") errors.push("Next.js must stay pinned to reviewed 16.3.1 baseline");
if (packageJson.dependencies?.react !== "19.2.8") errors.push("React must stay pinned to reviewed 19.2.8 baseline");
if (!packageJson.scripts?.release?.includes("build")) errors.push("release script must include production build");

if (!existsSync(join(root, "package-lock.json"))) {
  warnings.push("package-lock.json is not present yet; run npm install once in a registry-enabled environment and commit the generated lockfile before live deployment");
}

const legacyJs = join(publicDir, "assets/site.js");
if (existsSync(legacyJs)) errors.push("legacy global site.js should not ship in public assets");

const total = files.reduce((sum, file) => sum + statSync(file).size, 0);
if (errors.length) {
  console.error(`\nKwartier West V6 release QA FAILED (${errors.length})\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Kwartier West V6 source QA PASS: ${artistSlugs.length} typed artists, ${eventSlugs.length} typed events, ${expectedRoutes.length} indexed routes, ${files.length} project files, ${(total / 1024 / 1024).toFixed(1)} MiB.`);
if (warnings.length) console.warn(`Warnings:\n- ${warnings.join("\n- ")}`);
