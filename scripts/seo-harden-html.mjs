import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_ORIGIN = "https://kwartierwest.be";
const IGNORED_DIRS = new Set([".git", "node_modules", "_backups", "_screens", "_chrome-profile", ".vercel"]);

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

function escapeHtml(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeJson(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function attrValue(tag, attrName) {
  const pattern = new RegExp(`${attrName}\\s*=\\s*"([^"]*)"`, "i");
  return tag.match(pattern)?.[1]?.trim() || "";
}

function metaTagBy(html, attrName, attrValueText) {
  const escaped = attrValueText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attrName}\\s*=\\s*"${escaped}")([^>]*)>`, "i");
  return html.match(pattern)?.[0] || "";
}

function metaContent(html, attrName, attrValueText) {
  const tag = metaTagBy(html, attrName, attrValueText);
  return tag ? attrValue(tag, "content") : "";
}

function linkHref(html, relName) {
  const pattern = new RegExp(`<link\\b(?=[^>]*\\brel\\s*=\\s*"${relName}")([^>]*)>`, "i");
  const tag = html.match(pattern)?.[0] || "";
  return tag ? attrValue(tag, "href") : "";
}

function pageTitle(html) {
  return html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "Kwartier West";
}

function localPathFromUrl(url = "") {
  const clean = String(url || "").trim().split("?")[0];
  if (!clean.startsWith(SITE_ORIGIN)) return "";
  const relative = clean.slice(SITE_ORIGIN.length).replace(/^\/+/, "");
  return relative ? path.join(ROOT, relative) : "";
}

function imageTypeFromPath(file = "") {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "";
}

function jpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  return null;
}

function pngDimensions(buffer) {
  if (buffer.length < 24) return null;
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function webpDimensions(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }
  return null;
}

function imageDimensions(file = "") {
  if (!file || !fs.existsSync(file)) return null;
  const buffer = fs.readFileSync(file);
  return pngDimensions(buffer) || jpegDimensions(buffer) || webpDimensions(buffer);
}

function insertBeforeHeadClose(head, markup) {
  const clean = markup.filter(Boolean).join("\n  ");
  if (!clean) return head;
  return head.replace(/\s*$/u, `\n  ${clean}\n`);
}

function ensureMeta(head, attrName, attrValueText, content) {
  if (metaTagBy(head, attrName, attrValueText)) return head;
  return insertBeforeHeadClose(head, [`<meta ${attrName}="${escapeHtml(attrValueText)}" content="${escapeHtml(content)}">`]);
}

function ensureWebPageJsonLd(head, { title, description, canonical }) {
  if (/data-seo-jsonld="webpage"/i.test(head)) return head;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage: "nl-BE",
    isPartOf: {
      "@id": `${SITE_ORIGIN}/#website`
    },
    publisher: {
      "@id": `${SITE_ORIGIN}/#organization`
    }
  };

  return insertBeforeHeadClose(head, [
    `<script type="application/ld+json" data-seo-jsonld="webpage">${safeJson(jsonLd)}</script>`
  ]);
}

function hardenHead(head) {
  const robots = metaContent(head, "name", "robots");
  const isNoindex = robots.toLowerCase().split(",").map((part) => part.trim()).includes("noindex");
  const title = pageTitle(head);
  const description = metaContent(head, "name", "description");
  const canonical = linkHref(head, "canonical");
  const ogAlt = metaContent(head, "property", "og:image:alt") || "Kwartier West";
  const ogImage = metaContent(head, "property", "og:image");
  const imageFile = localPathFromUrl(ogImage);
  const dims = imageDimensions(imageFile);
  const type = imageTypeFromPath(imageFile);

  let next = head;
  if (!isNoindex) {
    next = ensureMeta(next, "name", "robots", robots || "index, follow, max-image-preview:large");
  }
  next = ensureMeta(next, "property", "og:locale", "nl_BE");
  next = ensureMeta(next, "name", "twitter:image:alt", ogAlt);
  if (type) next = ensureMeta(next, "property", "og:image:type", type);
  if (dims?.width) next = ensureMeta(next, "property", "og:image:width", String(dims.width));
  if (dims?.height) next = ensureMeta(next, "property", "og:image:height", String(dims.height));
  if (canonical && description) next = ensureWebPageJsonLd(next, { title, description, canonical });

  return next;
}

function hardenHtmlFile(file) {
  const html = fs.readFileSync(file, "utf8");
  const match = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!match) return false;

  const head = match[1];
  const hardened = hardenHead(head);
  if (hardened === head) return false;

  const nextHtml = html.replace(head, hardened);
  fs.writeFileSync(file, nextHtml, "utf8");
  return true;
}

const htmlFiles = [path.join(ROOT, "index.html"), ...walk(path.join(ROOT, "pages"), (file) => file.endsWith(".html"))];
let changed = 0;
for (const file of htmlFiles) {
  if (hardenHtmlFile(file)) changed += 1;
}

console.log(`SEO-hardened ${changed} HTML pages.`);
