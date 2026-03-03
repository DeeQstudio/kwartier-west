import { getCurrentLocale, t } from "./i18n.js";

const DATE_CACHE = new Map();
const HTML_ENTITY_MAP = Object.freeze({
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122"
});

function getDateFormatter(locale = "nl-BE", options = {}) {
  const key = `${locale}|${JSON.stringify(options)}`;
  if (!DATE_CACHE.has(key)) {
    DATE_CACHE.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return DATE_CACHE.get(key);
}

export function decodeHTMLEntities(value = "") {
  let output = String(value ?? "");
  const MAX_PASSES = 2;

  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const decoded = output.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, token) => {
      const normalized = String(token || "").toLowerCase();
      if (!normalized) return match;

      if (normalized.startsWith("#x")) {
        const codePoint = Number.parseInt(normalized.slice(2), 16);
        if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match;
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }

      if (normalized.startsWith("#")) {
        const codePoint = Number.parseInt(normalized.slice(1), 10);
        if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match;
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }

      return HTML_ENTITY_MAP[normalized] ?? match;
    });

    if (decoded === output) break;
    output = decoded;
  }

  return output;
}

export function escapeHTML(value = "") {
  return decodeHTMLEntities(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function parseISODate(dateISO) {
  if (typeof dateISO !== "string") return null;
  const trimmed = dateISO.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const timestamp = Date.parse(`${trimmed}T00:00:00`);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

export function formatDate(dateISO, locale = "") {
  const chosenLocale = locale || getCurrentLocale();
  const date = parseISODate(dateISO);
  if (!date) return t("common.datePending");
  return getDateFormatter(chosenLocale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(dateISO, time = "", locale = "") {
  const d = formatDate(dateISO, locale || getCurrentLocale());
  const t = typeof time === "string" && time.trim() ? time.trim() : null;
  return t ? `${d} - ${t}` : d;
}

export function sideLabel(sideKey) {
  if (sideKey === "tekno") return "Tekno";
  if (sideKey === "hiphop") return "Hip hop";
  return "Kwartier West";
}

export function sideShortLabel(sideKey) {
  if (sideKey === "tekno") return "TEK";
  if (sideKey === "hiphop") return "HIP HOP";
  return "KW";
}

export function sidePath(sideKey) {
  if (sideKey === "tekno" || sideKey === "hiphop") return sideKey;
  return "events";
}

function isLocalDevEnvironment() {
  if (typeof window === "undefined") return false;
  const host = String(window.location.hostname || "").toLowerCase();
  if (window.location.protocol === "file:") return true;
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
}

export function artistPath(sideKey, slug = "") {
  const side = sidePath(sideKey);
  if (side === "events") return "/pages/events/index.html";

  const normalized = normalizeSlug(slug);
  if (!normalized) return `/pages/${side}/artist.html`;
  const encoded = encodeURIComponent(normalized);

  // Local static servers (bv. VS Code Live Server) hebben geen rewrite rules.
  // Gebruik daar query-urls zodat links lokaal altijd werken.
  if (isLocalDevEnvironment()) {
    return `/pages/${side}/artist.html?slug=${encoded}`;
  }

  return `/pages/${side}/artist/${encoded}`;
}

export function normalizeEventSlug(value = "") {
  const normalized = normalizeSlug(value)
    .replace(/[^a-z0-9\-_.\s]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized;
}

export function eventPath(slug = "") {
  const normalized = normalizeEventSlug(slug);
  if (!normalized) return "/pages/events/index.html";
  return `/pages/events/detail/${encodeURIComponent(normalized)}`;
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

export function bookingReference() {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0")
  ].join("");

  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KW-${stamp}-${rand}`;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeSlug(value = "") {
  return String(value || "").trim().toLowerCase();
}
