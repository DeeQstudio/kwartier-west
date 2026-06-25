import { asArray, escapeHTML, normalizeSlug } from "./format.js";

const PLATFORM_META = {
  instagram: { label: "Instagram" },
  facebook: { label: "Facebook" },
  tiktok: { label: "TikTok" },
  youtube: { label: "YouTube" },
  applemusic: { label: "Apple Music" },
  soundcloud: { label: "SoundCloud" },
  spotify: { label: "Spotify" },
  linktree: { label: "Linktree" },
  email: { label: "Email" },
  website: { label: "Website" }
};

function iconMarkup(platform) {
  switch (platform) {
    case "instagram":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.6" y="4.6" width="14.8" height="14.8" rx="4.2"></rect><circle cx="12" cy="12" r="3.4"></circle><circle cx="17.25" cy="6.75" r="1"></circle></svg>';
    case "facebook":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.1 20v-6.4h2.5l.4-3h-2.9V8.7c0-.9.26-1.5 1.54-1.5h1.54V4.56c-.64-.1-1.3-.16-1.96-.16-2.9 0-4.78 1.76-4.78 4.96v1.24H8v3h2.36V20z"></path></svg>';
    case "tiktok":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 4.2c.54 1.54 1.66 2.72 3.1 3.26v2.6a7.52 7.52 0 0 1-3.14-1V14.7c0 3.24-2.62 5.86-5.86 5.86A5.86 5.86 0 0 1 6.2 9.54a5.89 5.89 0 0 1 2.98-.81v2.64a3.28 3.28 0 0 0-1.16 6.36 3.28 3.28 0 0 0 4.06-3.18V4.2z"></path></svg>';
    case "youtube":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.4" y="6.2" width="17.2" height="11.6" rx="3"></rect><path d="M10 9.6l5.1 2.4L10 14.4z"></path></svg>';
    case "applemusic":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.6 7.1c-.7.1-1.4-.3-1.8-.8-.4-.5-.6-1.2-.5-1.9.7 0 1.4.3 1.8.8.4.5.6 1.1.5 1.9z"></path><path d="M17.3 15c-.3.8-.7 1.5-1.2 2.2-.7.9-1.4 1.8-2.4 1.8s-1.3-.6-2.4-.6-1.5.6-2.4.6-1.7-.8-2.4-1.8c-1.4-1.9-2.5-5.4-1-7.8.7-1.2 2-2 3.3-2 1 0 1.9.6 2.5.6s1.6-.7 2.8-.7c.4 0 1.7.2 2.5 1.4-.1.1-1.6.9-1.6 2.7 0 2.2 1.9 2.9 1.9 2.9z"></path><path d="M19.2 7.6v7.1a2.2 2.2 0 1 1-1.3-2V8.4l-4.2 1V16a2.2 2.2 0 1 1-1.3-2V8.3c0-.4.2-.7.6-.8l5.6-1.4c.4-.1.6.2.6.5z"></path></svg>';
    case "soundcloud":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 17.2h9.7a3.1 3.1 0 0 0 .16-6.2 5 5 0 0 0-9.8-1.08"></path><path d="M5.2 16.6V9.5M6.3 16.9V8.9M7.4 17.1V8.5"></path></svg>';
    case "spotify":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"></circle><path d="M8.1 10.1c2.8-1 5.8-.8 8.4.64M8.8 12.6c2.2-.72 4.54-.58 6.56.44M9.8 14.9c1.66-.5 3.4-.4 4.88.32"></path></svg>';
    case "linktree":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8v14.8"></path><path d="M8.1 7.6l3.9-3.8 3.9 3.8"></path><path d="M8.1 12l3.9-3.8 3.9 3.8"></path><path d="M8.1 16.5l3.9-3.8 3.9 3.8"></path><path d="M10.1 18.6h3.8"></path></svg>';
    case "email":
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.8" y="6.2" width="16.4" height="11.6" rx="2"></rect><path d="M4.4 7.4L12 13l7.6-5.6"></path></svg>';
    default:
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"></circle><path d="M3.8 12h16.4M12 3.8c2.1 2.18 3.28 5.07 3.28 8.2 0 3.12-1.18 6.02-3.28 8.2-2.1-2.18-3.28-5.08-3.28-8.2 0-3.13 1.18-6.02 3.28-8.2z"></path></svg>';
  }
}

function inferFromDomain(url = "") {
  const lower = String(url || "").toLowerCase();
  if (lower.startsWith("mailto:")) return "email";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com")) return "facebook";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("music.apple.com")) return "applemusic";
  if (lower.includes("soundcloud.com")) return "soundcloud";
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("linktr.ee")) return "linktree";
  return "";
}

function inferFromLabel(label = "") {
  const compact = normalizeSlug(label);
  if (!compact) return "";
  if (compact.includes("instagram") || compact === "ig") return "instagram";
  if (compact.includes("facebook") || compact === "fb") return "facebook";
  if (compact.includes("tiktok")) return "tiktok";
  if (compact.includes("youtube")) return "youtube";
  if (compact.includes("applemusic") || compact.includes("apple-music")) return "applemusic";
  if (compact.includes("soundcloud")) return "soundcloud";
  if (compact.includes("spotify")) return "spotify";
  if (compact.includes("linktree")) return "linktree";
  if (compact.includes("mail")) return "email";
  if (compact.includes("site") || compact.includes("web")) return "website";
  return "";
}

function pickPlatform(link) {
  const explicit = normalizeSlug(link?.platform || "");
  if (PLATFORM_META[explicit] && explicit !== "website") return explicit;
  if (explicit === "website") {
    return inferFromDomain(link?.url) || inferFromLabel(link?.label) || "website";
  }
  return inferFromDomain(link?.url) || inferFromLabel(link?.label) || "website";
}

function inferHandle(url = "", platform = "website") {
  const safe = String(url || "").trim();
  if (!safe) return "";

  if (platform === "email") return safe.replace(/^mailto:/i, "").trim();

  try {
    const parsed = new URL(safe);
    const host = parsed.host.replace(/^www\./i, "");
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (platform === "website") return host;
    if (!parts.length) return host;

    const first = String(parts[0] || "").replace(/^@/, "");
    if (!first) return host;

    if (platform === "facebook") {
      if (first.toLowerCase() === "p" && parts[1]) return "";
      if (first.toLowerCase() === "profile.php") return "";
    }

    if (platform === "spotify" && first.toLowerCase() === "artist") return "";
    if (platform === "youtube" && ["channel", "watch", "playlist"].includes(first.toLowerCase())) return "";

    if (["instagram", "tiktok"].includes(platform)) return `@${first}`;
    if (platform === "youtube") return first.startsWith("@") ? first : `@${first}`;
    if (platform === "linktree") return `@${first}`;
    if (["facebook", "soundcloud", "spotify"].includes(platform)) return first;
    return host;
  } catch {
    return safe;
  }
}

export function normalizeSocialLinks(rawLinks) {
  const dedupe = new Set();
  const links = [];

  for (const link of asArray(rawLinks)) {
    const url = String(link?.url || "").trim();
    if (!url) continue;

    const platform = pickPlatform(link);
    const label = String(link?.label || "").trim() || PLATFORM_META[platform]?.label || "Link";
    const explicitHandle = String(link?.handle || "").trim();
    const handle = explicitHandle || (String(link?.label || "").trim() ? "" : inferHandle(url, platform));
    const key = `${platform}|${url.toLowerCase()}`;
    if (dedupe.has(key)) continue;
    dedupe.add(key);

    links.push({
      platform,
      platformLabel: PLATFORM_META[platform]?.label || "Website",
      label,
      handle,
      url,
      external: /^https?:\/\//i.test(url)
    });
  }

  return links;
}

function anchorAttributes(link) {
  const href = `href="${escapeHTML(link.url)}"`;
  if (!link.external) return href;
  return `${href} target="_blank" rel="noopener noreferrer"`;
}

function fullLinkMarkup(link) {
  const className = `social-link social-link--full is-${link.platform}`;
  const ariaLabel = `${link.platformLabel}: ${link.handle || link.label}`;
  const visible = escapeHTML(link.handle || link.label);

  return `
    <a class="${className}" ${anchorAttributes(link)} aria-label="${escapeHTML(ariaLabel)}">
      <span class="social-link__icon" aria-hidden="true">${iconMarkup(link.platform)}</span>
      <span class="social-link__meta">
        <span class="social-link__platform">${escapeHTML(link.platformLabel)}</span>
        <span class="social-link__label">${visible}</span>
      </span>
    </a>
  `;
}

function iconLinkMarkup(link) {
  const className = `social-link social-link--icon is-${link.platform}`;
  const ariaLabel = `${link.platformLabel}: ${link.handle || link.label}`;

  return `
    <a class="${className}" ${anchorAttributes(link)} aria-label="${escapeHTML(ariaLabel)}" title="${escapeHTML(link.platformLabel)}">
      <span class="social-link__icon" aria-hidden="true">${iconMarkup(link.platform)}</span>
      <span class="sr-only">${escapeHTML(link.platformLabel)}</span>
    </a>
  `;
}

export function renderSocialRail(rawLinks, { variant = "full", limit = 6, className = "" } = {}) {
  const items = normalizeSocialLinks(rawLinks).slice(0, Math.max(1, Number(limit) || 6));
  if (!items.length) return "";

  const baseClass = variant === "icon" ? "social-links social-links--icon" : "social-links social-links--full";
  const classes = `${baseClass}${className ? ` ${className}` : ""}`;

  const markup = items
    .map((item) => (variant === "icon" ? iconLinkMarkup(item) : fullLinkMarkup(item)))
    .join("");

  return `<div class="${classes}">${markup}</div>`;
}
