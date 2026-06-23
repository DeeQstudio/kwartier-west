import { createHmac } from "node:crypto";
import { get, list, put } from "@vercel/blob";

const memorySubscribers = globalThis.__kwNewsletterSubscribers || new Map();
globalThis.__kwNewsletterSubscribers = memorySubscribers;
const BLOB_SUBSCRIBER_PREFIX = "newsletter/subscribers/";

function cleanEnvValue(value) {
  return String(value ?? "")
    .replace(/^(?:\\r|\\n|\r|\n)+/g, "")
    .replace(/(?:\\r|\\n|\r|\n)+$/g, "")
    .trim();
}

function envString(name, fallback = "") {
  return cleanEnvValue(process.env[name] ?? fallback);
}

function envBool(name, fallback = false) {
  const raw = envString(name, fallback ? "true" : "false").toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

function upstashConfig() {
  return {
    url: envString("NEWSLETTER_UPSTASH_REDIS_REST_URL", envString("UPSTASH_REDIS_REST_URL")),
    token: envString("NEWSLETTER_UPSTASH_REDIS_REST_TOKEN", envString("UPSTASH_REDIS_REST_TOKEN"))
  };
}

function hasBlobStorage() {
  return Boolean(
    storageSecret() &&
      (envString("BLOB_READ_WRITE_TOKEN") || (envString("BLOB_STORE_ID") && envString("VERCEL_OIDC_TOKEN")))
  );
}

function storageSecret() {
  return envString("NEWSLETTER_SECRET", envString("BOOKING_VERIFY_SECRET"));
}

function normalizeEmail(email = "") {
  return String(email || "").trim().toLowerCase();
}

function subscriberKey(email = "") {
  return `newsletter:subscriber:${normalizeEmail(email)}`;
}

function blobSubscriberPath(email = "") {
  return `${BLOB_SUBSCRIBER_PREFIX}${encodeURIComponent(normalizeEmail(email))}.json`;
}

function tokenForEmail(email = "") {
  const secret = storageSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(normalizeEmail(email)).digest("base64url");
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeSubscriber(input = {}) {
  const email = normalizeEmail(input.email);
  const timestamp = nowIso();
  const existingCreatedAt = String(input.createdAt || "").trim();
  const token = String(input.unsubscribeToken || "").trim() || tokenForEmail(email);

  return {
    email,
    name: String(input.name || "").trim(),
    source: String(input.source || "website").trim() || "website",
    status: String(input.status || "subscribed").trim() || "subscribed",
    consentAt: String(input.consentAt || timestamp).trim(),
    createdAt: existingCreatedAt || timestamp,
    updatedAt: timestamp,
    unsubscribeToken: token
  };
}

function parseHashArray(value) {
  if (!Array.isArray(value)) return null;
  const out = {};
  for (let index = 0; index < value.length; index += 2) {
    out[String(value[index] || "")] = String(value[index + 1] || "");
  }
  return out;
}

function encodePart(value) {
  return encodeURIComponent(String(value ?? ""));
}

async function upstashRequest(command, args = []) {
  const cfg = upstashConfig();
  if (!cfg.url || !cfg.token) return null;

  const path = [command, ...args].map(encodePart).join("/");
  const response = await fetch(`${cfg.url.replace(/\/+$/, "")}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`
    }
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Newsletter storage failed (${response.status}) ${message}`.trim());
  }

  const data = await response.json().catch(() => ({}));
  return data?.result ?? null;
}

function isBlobNotFound(error) {
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  return name.includes("NotFound") || message.includes("not found") || message.includes("404");
}

async function streamToText(stream) {
  if (!stream) return "";
  return await new Response(stream).text();
}

async function readBlobPath(pathname) {
  try {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    const text = await streamToText(result.stream);
    return JSON.parse(text);
  } catch (error) {
    if (isBlobNotFound(error)) return null;
    throw error;
  }
}

async function readBlobSubscriber(email) {
  return readBlobPath(blobSubscriberPath(email));
}

async function writeBlobSubscriber(subscriber) {
  await put(blobSubscriberPath(subscriber.email), JSON.stringify(subscriber, null, 2), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60
  });
}

export function hasPersistentNewsletterStorage() {
  const cfg = upstashConfig();
  return hasBlobStorage() || Boolean(cfg.url && cfg.token && storageSecret());
}

export function newsletterStorageMode() {
  if (hasBlobStorage()) return "blob";
  const cfg = upstashConfig();
  return cfg.url && cfg.token && storageSecret() ? "upstash" : "memory";
}

export function newsletterStorageRequired() {
  return envBool("NEWSLETTER_REQUIRE_STORAGE", false);
}

export function buildUnsubscribeUrl(req, email) {
  const token = tokenForEmail(email);
  if (!token) return "";

  const configured = envString("NEWSLETTER_PUBLIC_BASE_URL", envString("BOOKING_PUBLIC_BASE_URL"));
  const base = configured
    ? configured.replace(/\/+$/, "")
    : `${String(req?.headers?.["x-forwarded-proto"] || "https")}://${String(req?.headers?.["x-forwarded-host"] || req?.headers?.host || "kwartierwest.be")}`;

  return `${base}/api/newsletter?action=unsubscribe&email=${encodeURIComponent(normalizeEmail(email))}&token=${encodeURIComponent(token)}`;
}

export async function getNewsletterSubscriber(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  if (hasBlobStorage()) {
    return readBlobSubscriber(normalized);
  }

  if (newsletterStorageMode() === "memory") {
    return memorySubscribers.get(normalized) || null;
  }

  const data = await upstashRequest("hgetall", [subscriberKey(normalized)]);
  return parseHashArray(data);
}

export async function saveNewsletterSubscriber(input = {}) {
  const normalized = normalizeEmail(input.email);
  if (!normalized) {
    return { ok: false, status: 422, message: "E-mailadres ontbreekt." };
  }

  if (newsletterStorageRequired() && !hasPersistentNewsletterStorage()) {
    return {
      ok: false,
      status: 503,
      message: "Nieuwsbriefopslag ontbreekt. Configureer Vercel Blob of Upstash Redis en NEWSLETTER_SECRET."
    };
  }

  const existing = await getNewsletterSubscriber(normalized);
  const subscriber = normalizeSubscriber({
    ...existing,
    ...input,
    email: normalized,
    status: "subscribed",
    createdAt: existing?.createdAt || input.createdAt
  });
  const isDuplicate = existing?.status === "subscribed";

  if (hasBlobStorage()) {
    await writeBlobSubscriber(subscriber);
    return { ok: true, subscriber, duplicate: isDuplicate, storage: "blob" };
  }

  if (newsletterStorageMode() === "memory") {
    memorySubscribers.set(normalized, subscriber);
    return { ok: true, subscriber, duplicate: isDuplicate, storage: "memory" };
  }

  const fields = Object.entries(subscriber).flatMap(([key, value]) => [key, value]);
  await upstashRequest("hmset", [subscriberKey(normalized), ...fields]);
  await upstashRequest("sadd", ["newsletter:subscribers", normalized]);
  await upstashRequest("zadd", ["newsletter:subscribers:created", String(Date.parse(subscriber.createdAt) || Date.now()), normalized]);

  return { ok: true, subscriber, duplicate: isDuplicate, storage: "upstash" };
}

export async function unsubscribeNewsletterSubscriber(email, token) {
  const normalized = normalizeEmail(email);
  if (!normalized || !token) {
    return { ok: false, status: 400, message: "Uitschrijflink is ongeldig." };
  }

  const expected = tokenForEmail(normalized);
  if (!expected || token !== expected) {
    return { ok: false, status: 401, message: "Uitschrijflink is ongeldig." };
  }

  const existing = await getNewsletterSubscriber(normalized);
  if (!existing) {
    return { ok: true, status: 200, message: "Dit e-mailadres staat niet actief op de Uit Het Westen-lijst." };
  }

  const subscriber = normalizeSubscriber({
    ...existing,
    email: normalized,
    status: "unsubscribed",
    updatedAt: nowIso()
  });

  if (hasBlobStorage()) {
    await writeBlobSubscriber(subscriber);
    return { ok: true, status: 200, message: "Je bent uitgeschreven van Uit Het Westen." };
  }

  if (newsletterStorageMode() === "memory") {
    memorySubscribers.set(normalized, subscriber);
    return { ok: true, status: 200, message: "Je bent uitgeschreven van Uit Het Westen." };
  }

  const fields = Object.entries(subscriber).flatMap(([key, value]) => [key, value]);
  await upstashRequest("hmset", [subscriberKey(normalized), ...fields]);
  await upstashRequest("srem", ["newsletter:subscribers", normalized]);
  return { ok: true, status: 200, message: "Je bent uitgeschreven van Uit Het Westen." };
}

export async function exportNewsletterSubscribers({ includeUnsubscribed = false } = {}) {
  if (hasBlobStorage()) {
    let cursor;
    let hasMore = true;
    const blobs = [];

    while (hasMore) {
      const result = await list({ prefix: BLOB_SUBSCRIBER_PREFIX, limit: 1000, cursor });
      blobs.push(...(result.blobs || []));
      cursor = result.cursor;
      hasMore = Boolean(result.hasMore && cursor);
    }

    const subscribers = [];

    for (const blob of blobs) {
      const subscriber = await readBlobPath(blob.pathname);
      if (subscriber && (includeUnsubscribed || subscriber.status === "subscribed")) {
        subscribers.push(subscriber);
      }
    }

    return { ok: true, storage: "blob", subscribers };
  }

  if (newsletterStorageMode() === "memory") {
    const values = Array.from(memorySubscribers.values());
    return {
      ok: true,
      storage: "memory",
      subscribers: includeUnsubscribed ? values : values.filter((entry) => entry.status === "subscribed")
    };
  }

  const emails = await upstashRequest("smembers", ["newsletter:subscribers"]);
  const list = Array.isArray(emails) ? emails : [];
  const subscribers = [];

  for (const email of list) {
    const subscriber = await getNewsletterSubscriber(email);
    if (subscriber && (includeUnsubscribed || subscriber.status === "subscribed")) {
      subscribers.push(subscriber);
    }
  }

  return { ok: true, storage: "upstash", subscribers };
}
