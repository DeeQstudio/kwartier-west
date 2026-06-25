export const SITE_ORIGIN = "https://kwartierwest.be";
export const CSS_ASSET_VERSION = "20260625b";
export const ARTIST_DETAIL_VERSION = "20260625b";
export const OG_ASSET_VERSION = "20260226a";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/og/og-cover.png?v=${OG_ASSET_VERSION}`;

export const SIDE_OG_IMAGES = {
  global: DEFAULT_OG_IMAGE,
  tekno: `${SITE_ORIGIN}/assets/landing-tekno.jpg`,
  hiphop: `${SITE_ORIGIN}/assets/landing-hiphop.jpg`
};

export function escapeHtml(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function trimText(value = "", maxLength = 240) {
  const compact = String(value || "").replace(/\s+/g, " ").trim();
  if (!compact) return "";
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 3).trim()}...`;
}

export function normalizeSlug(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.\s]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizePlainSlug(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function toAbsoluteUrl(pathOrUrl = "") {
  const value = String(pathOrUrl || "").trim().replaceAll("\\", "/");
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SITE_ORIGIN}${value}`;
  return `${SITE_ORIGIN}/${value}`;
}

export function canonicalUrl(pathOrUrl = "/") {
  const value = String(pathOrUrl || "/").trim();
  if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, "");
  if (value === "/") return `${SITE_ORIGIN}/`;
  return toAbsoluteUrl(value).replace(/\/+$/, "");
}

export function sideLabel(sideKey) {
  if (sideKey === "global") return "Kwartier West";
  return sideKey === "tekno" ? "Tekno" : "Hip hop";
}

export function renderSeoHead({
  title,
  titleKey = "",
  description,
  descriptionKey = "",
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogAlt = "Kwartier West - Tekno- en Hip hop-evenementenplatform",
  ogType = "website",
  robots = "",
  imageType = "",
  imageWidth = "",
  imageHeight = "",
  extra = ""
} = {}) {
  const safeTitle = String(title || "Kwartier West").trim();
  const safeDescription = trimText(description || "Kwartier West: Tekno- en Hip hop-collectieven, evenementen en bookings.", 180);
  const safeCanonical = canonicalUrl(canonical || "/");
  const safeImage = toAbsoluteUrl(ogImage || DEFAULT_OG_IMAGE) || DEFAULT_OG_IMAGE;
  const imageMeta = [
    imageType ? `<meta property="og:image:type" content="${escapeHtml(imageType)}">` : "",
    imageWidth ? `<meta property="og:image:width" content="${escapeHtml(imageWidth)}">` : "",
    imageHeight ? `<meta property="og:image:height" content="${escapeHtml(imageHeight)}">` : ""
  ].filter(Boolean).join("\n  ");

  return [
    `<title${titleKey ? ` data-i18n-title="${escapeHtml(titleKey)}"` : ""}>${escapeHtml(safeTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(safeDescription)}"${descriptionKey ? ` data-i18n-content="${escapeHtml(descriptionKey)}"` : ""}>`,
    robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : "",
    `<meta property="og:type" content="${escapeHtml(ogType)}">`,
    `<meta property="og:site_name" content="Kwartier West">`,
    `<meta property="og:title" content="${escapeHtml(safeTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(safeDescription)}">`,
    `<meta property="og:url" content="${escapeHtml(safeCanonical)}">`,
    `<meta property="og:image" content="${escapeHtml(safeImage)}">`,
    `<meta property="og:image:secure_url" content="${escapeHtml(safeImage)}">`,
    imageMeta,
    `<meta property="og:image:alt" content="${escapeHtml(ogAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(safeTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(safeDescription)}">`,
    `<meta name="twitter:image" content="${escapeHtml(safeImage)}">`,
    `<link rel="canonical" href="${escapeHtml(safeCanonical)}">`,
    extra
  ].filter(Boolean).join("\n  ");
}

export function renderStylesheets(stylesheets = []) {
  return stylesheets
    .filter(Boolean)
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("\n  ");
}

export function renderModuleScript(source = "") {
  const code = String(source || "").replace(/^\s*\n/, "").replace(/\n\s*$/, "");
  if (!code) return "";
  const lines = code.split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^\s*/)?.[0]?.length || 0);
  const baseIndent = indents.length ? Math.min(...indents) : 0;
  const indented = code
    .split("\n")
    .map((line) => `    ${line.slice(baseIndent).trimEnd()}`)
    .join("\n");
  return `<script type="module">\n${indented}\n  </script>`;
}

export function renderHtmlDocument({
  head = "",
  stylesheets = [],
  bodyClass = "kw-page",
  main = "",
  moduleScript = "",
  nav = true,
  footer = true
} = {}) {
  const stylesheetMarkup = renderStylesheets(stylesheets);
  const scriptMarkup = renderModuleScript(moduleScript);
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${String(head || "").trim()}
  ${stylesheetMarkup}
</head>
<body class="${escapeHtml(bodyClass)}">
  ${nav ? "<div data-nav></div>" : ""}

  ${String(main || "").trim()}

  ${footer ? "<div data-footer></div>" : ""}

  ${scriptMarkup}
</body>
</html>
`;
}
