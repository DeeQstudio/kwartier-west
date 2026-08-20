import { del, get, put } from "@vercel/blob";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { artistBySlug } from "@/data/artists";
import type { BookingMode, BookingScene } from "@/data/types";

const MAX_BODY_BYTES = 18_000;
const TOKEN_TTL_SECONDS = 20 * 60;
const MIN_FORM_FILL_MS = 2_800;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1_000;

type PendingBooking = {
  mode: BookingMode;
  scene: BookingScene;
  artists: string[];
  name: string;
  email: string;
  organization: string;
  date: string;
  location: string;
  message: string;
  startedAt: number;
};

type RawBooking = Partial<PendingBooking> & {
  company_website?: unknown;
  turnstileToken?: unknown;
  [key: string]: unknown;
};

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
};

const allowedKeys = new Set([
  "mode",
  "scene",
  "artists",
  "name",
  "email",
  "organization",
  "date",
  "location",
  "message",
  "company_website",
  "startedAt",
  "turnstileToken",
]);

const allowedModes = new Set<BookingMode>(["solo", "multiple", "scene", "takeover"]);
const allowedScenes = new Set<BookingScene>(["tekno", "hiphop", "both"]);

declare global {
  // eslint-disable-next-line no-var
  var __kwBookingRate: Map<string, number[]> | undefined;
}

const rateStore = globalThis.__kwBookingRate ?? new Map<string, number[]>();
globalThis.__kwBookingRate = rateStore;

export class BookingError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

const env = (name: string, fallback = "") => String(process.env[name] ?? fallback).trim();
const isProduction = () => process.env.VERCEL_ENV === "production";
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const clean = (value: unknown, max: number) =>
  String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, max);
const escapeHtml = (value: unknown) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function mailReady() {
  const resendReady = Boolean(env("RESEND_API_KEY") && validEmail(env("BOOKING_FROM_EMAIL")));
  const smtpReady = Boolean(env("BOOKING_SMTP_HOST") && env("BOOKING_SMTP_USER") && env("BOOKING_SMTP_PASS"));
  return resendReady || smtpReady;
}

export function bookingProductionReady() {
  return Boolean(
    env("TURNSTILE_SITE_KEY") &&
      env("TURNSTILE_SECRET_KEY") &&
      env("BOOKING_VERIFY_SECRET").length >= 32 &&
      env("BLOB_READ_WRITE_TOKEN") &&
      mailReady(),
  );
}

function clientIp(request: Request) {
  return (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return !isProduction();
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      (url.hostname === "kwartierwest.be" || url.hostname === "www.kwartierwest.be")
    );
  } catch {
    return false;
  }
}

export async function readJsonBody(request: Request): Promise<RawBooking> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    throw new BookingError("Gebruik application/json.", 415);
  }

  const raw = await request.arrayBuffer();
  if (raw.byteLength > MAX_BODY_BYTES) throw new BookingError("Payload te groot.", 413);

  try {
    const parsed = JSON.parse(new TextDecoder().decode(raw));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new BookingError("Ongeldige aanvraag.");
    }
    return parsed as RawBooking;
  } catch (error) {
    if (error instanceof BookingError) throw error;
    throw new BookingError("Ongeldige aanvraag.");
  }
}

export function validateBooking(raw: RawBooking): PendingBooking {
  if (Object.keys(raw).some((key) => !allowedKeys.has(key))) {
    throw new BookingError("Onverwachte velden in aanvraag.");
  }

  const mode = clean(raw.mode, 20) as BookingMode;
  const scene = clean(raw.scene, 20) as BookingScene;
  const artists = Array.isArray(raw.artists)
    ? [...new Set(raw.artists.map((value) => clean(value, 60)).filter(Boolean))].slice(0, 12)
    : [];

  const booking: PendingBooking = {
    mode,
    scene,
    artists,
    name: clean(raw.name, 100),
    email: clean(raw.email, 160).toLowerCase(),
    organization: clean(raw.organization, 120),
    date: clean(raw.date, 20),
    location: clean(raw.location, 120),
    message: clean(raw.message, 2400),
    startedAt: Number(raw.startedAt ?? 0),
  };

  // Honeypot: behave like a success to avoid training bots.
  if (clean(raw.company_website, 40)) {
    throw new BookingError("__HONEYPOT__", 200);
  }

  if (
    !allowedModes.has(booking.mode) ||
    !allowedScenes.has(booking.scene) ||
    booking.name.length < 2 ||
    !validEmail(booking.email) ||
    booking.message.length < 10
  ) {
    throw new BookingError("Vul de verplichte velden correct in.");
  }

  const invalidArtist = booking.artists.some((slug) => {
    const artist = artistBySlug.get(slug);
    return !artist || (booking.scene !== "both" && artist.scene !== booking.scene);
  });
  if (invalidArtist) throw new BookingError("De gekozen artiesten passen niet bij deze aanvraag.");

  if (booking.mode === "solo" && booking.artists.length !== 1) {
    throw new BookingError("Kies exact één artiest voor een solo-aanvraag.");
  }
  if (booking.mode === "multiple" && booking.artists.length < 2) {
    throw new BookingError("Kies minstens twee artiesten voor deze aanvraag.");
  }
  if (booking.date && !/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    throw new BookingError("Gebruik een geldige datum.");
  }

  const age = Date.now() - booking.startedAt;
  if (!Number.isFinite(booking.startedAt) || age < MIN_FORM_FILL_MS || age > MAX_FORM_AGE_MS) {
    throw new BookingError("Formuliercontrole mislukt. Herlaad de pagina en probeer opnieuw.");
  }

  return booking;
}

export function rateLimit(request: Request, email: string) {
  const now = Date.now();
  const key = createHash("sha256").update(`${clientIp(request)}|${email}`).digest("hex");
  const attempts = (rateStore.get(key) ?? []).filter((time) => now - time < 15 * 60 * 1_000);
  if (attempts.length >= 3) throw new BookingError("Te veel aanvragen. Probeer later opnieuw.", 429);
  attempts.push(now);
  rateStore.set(key, attempts);
}

export async function verifyTurnstile(request: Request, token: unknown) {
  const secret = env("TURNSTILE_SECRET_KEY");
  if (!secret) return !isProduction();

  const data = new URLSearchParams({
    secret,
    response: clean(token, 2200),
    remoteip: clientIp(request),
  });

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: data,
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;

  const result = (await response.json()) as TurnstileResponse;
  if (result.success !== true || result.action !== "booking") return false;
  if (
    isProduction() &&
    result.hostname !== "kwartierwest.be" &&
    result.hostname !== "www.kwartierwest.be"
  ) {
    return false;
  }
  return true;
}

function verificationSecret() {
  const secret = env("BOOKING_VERIFY_SECRET");
  if (isProduction() && secret.length < 32) {
    throw new Error("BOOKING_VERIFY_SECRET is niet veilig geconfigureerd.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", verificationSecret()).update(value).digest("base64url");
}

export function createVerificationToken(id: string) {
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const unsigned = `${id}.${expires}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function parseVerificationToken(token: string | null) {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 3) return null;
  const [id, expires, signature] = parts;
  if (!/^[a-f0-9]{40}$/.test(id) || !/^\d{10}$/.test(expires)) return null;

  const expected = Buffer.from(sign(`${id}.${expires}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  return id;
}

function smtpTransport() {
  const host = env("BOOKING_SMTP_HOST");
  const user = env("BOOKING_SMTP_USER");
  const pass = env("BOOKING_SMTP_PASS");
  const port = Number(env("BOOKING_SMTP_PORT", "587"));
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    requireTLS: port !== 465,
  });
}

export async function sendBookingMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const resendKey = env("RESEND_API_KEY");
  const from = env("BOOKING_FROM_EMAIL", resendKey ? "" : "Kwartier West <info@kwartierwest.be>");

  if (resendKey) {
    if (!validEmail(from)) throw new Error("BOOKING_FROM_EMAIL ontbreekt of is ongeldig.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, text: input.text, html: input.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Mail provider failed");
    return;
  }

  const transport = smtpTransport();
  if (!transport) throw new Error("Geen mailprovider geconfigureerd.");
  await transport.sendMail({ from, ...input });
}

async function streamToText(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) throw new Error("Blob stream ontbreekt.");
  return new Response(stream).text();
}

export async function storePendingBooking(booking: PendingBooking) {
  const id = randomBytes(20).toString("hex");
  const path = `booking-pending/${id}.json`;
  await put(path, JSON.stringify({ createdAt: new Date().toISOString(), booking }), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return { id, path };
}

export async function removePending(path: string) {
  await del(path);
}

export async function loadPendingBooking(id: string) {
  const path = `booking-pending/${id}.json`;
  const result = await get(path, { access: "private" });
  if (!result || result.statusCode !== 200) return null;

  const parsed = JSON.parse(await streamToText(result.stream)) as {
    booking?: PendingBooking;
  };
  if (!parsed.booking) return null;
  return { path, booking: parsed.booking };
}

export async function claimVerification(id: string) {
  const claimPath = `booking-consumed/${id}.txt`;
  await put(claimPath, new Date().toISOString(), {
    access: "private",
    addRandomSuffix: false,
    contentType: "text/plain",
  });
  return claimPath;
}

export async function releaseClaim(path: string) {
  await del(path);
}

export function verificationEmail(booking: PendingBooking, token: string) {
  const link = `https://kwartierwest.be/booking/verifieer?token=${encodeURIComponent(token)}`;
  return {
    to: booking.email,
    subject: "Bevestig je boekingsaanvraag — Kwartier West",
    text: `Bevestig je e-mailadres via deze link (20 minuten geldig): ${link}`,
    html: `<p>Hallo ${escapeHtml(booking.name)},</p><p>Bevestig je e-mailadres om je boekingsaanvraag door te sturen naar Kwartier West.</p><p><a href="${link}">Bevestig mijn aanvraag</a></p><p>Deze link is 20 minuten geldig.</p>`,
  };
}

export function teamBookingEmail(booking: PendingBooking) {
  const artists = booking.artists.join(", ") || "-";
  const to = env("BOOKING_TO_EMAIL", "info@kwartierwest.be");
  const text = `Nieuwe Kwartier West booking

Naam: ${booking.name}
E-mail: ${booking.email}
Organisatie: ${booking.organization || "-"}
Type: ${booking.mode}
Scene: ${booking.scene}
Artiesten: ${artists}
Datum: ${booking.date || "-"}
Locatie: ${booking.location || "-"}

${booking.message}`;

  const html = `<h2>Nieuwe Kwartier West booking</h2><p><b>Naam:</b> ${escapeHtml(booking.name)}<br><b>E-mail:</b> ${escapeHtml(booking.email)}<br><b>Organisatie:</b> ${escapeHtml(booking.organization || "-")}<br><b>Type:</b> ${escapeHtml(booking.mode)}<br><b>Scene:</b> ${escapeHtml(booking.scene)}<br><b>Artiesten:</b> ${escapeHtml(artists)}<br><b>Datum:</b> ${escapeHtml(booking.date || "-")}<br><b>Locatie:</b> ${escapeHtml(booking.location || "-")}</p><p>${escapeHtml(booking.message).replaceAll("\n", "<br>")}</p>`;

  return {
    to,
    subject: `Booking — ${booking.name} / ${booking.mode}`,
    text,
    html,
  };
}

export function confirmationEmail(booking: PendingBooking) {
  return {
    to: booking.email,
    subject: "Je aanvraag is doorgestuurd — Kwartier West",
    text: "Je e-mailadres is bevestigd en je boekingsaanvraag werd doorgestuurd. Kwartier West neemt contact op zodra de aanvraag bekeken is.",
    html: `<p>Hallo ${escapeHtml(booking.name)},</p><p>Je e-mailadres is bevestigd en je boekingsaanvraag werd doorgestuurd.</p><p>Kwartier West neemt contact op zodra de aanvraag bekeken is.</p>`,
  };
}
