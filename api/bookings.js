import nodemailer from "nodemailer";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DEFAULT_TO_EMAIL = "info@kwartierwest.be";
const DEFAULT_FROM_EMAIL_SMTP = "Kwartier West <info@kwartierwest.be>";
const DEFAULT_FROM_EMAIL_RESEND = "Kwartier West <onboarding@resend.dev>";
const DEFAULT_VERIFY_TTL_MINUTES = 20;
const DEFAULT_MIN_FILL_MS = 3500;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "trashmail.com",
  "yopmail.com",
  "dispostable.com",
  "maildrop.cc"
]);

const memoryRateState = globalThis.__kwBookingRateState || new Map();
globalThis.__kwBookingRateState = memoryRateState;

const memoryNonceState = globalThis.__kwBookingNonceState || new Map();
globalThis.__kwBookingNonceState = memoryNonceState;

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asText(value = "", fallback = "-") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function asRawText(value = "", fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function envString(name, fallback = "") {
  return String(process.env[name] ?? fallback).trim();
}

function envBool(name, fallback = false) {
  const raw = envString(name, fallback ? "true" : "false").toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

function bookingProviderPreference() {
  return envString("BOOKING_PROVIDER", "auto").toLowerCase();
}

function bookingVerifySecret() {
  return envString("BOOKING_VERIFY_SECRET");
}

function verificationTTLMinutes() {
  return Number(envString("BOOKING_VERIFY_TTL_MINUTES", String(DEFAULT_VERIFY_TTL_MINUTES))) || DEFAULT_VERIFY_TTL_MINUTES;
}

function minFillMs() {
  return Number(envString("BOOKING_MIN_FILL_MS", String(DEFAULT_MIN_FILL_MS))) || DEFAULT_MIN_FILL_MS;
}

function smtpSettings() {
  const host = envString("BOOKING_SMTP_HOST");
  const port = Number(envString("BOOKING_SMTP_PORT", "587")) || 587;
  const secure = envBool("BOOKING_SMTP_SECURE", port === 465);
  const user = envString("BOOKING_SMTP_USER");
  const pass = envString("BOOKING_SMTP_PASS");
  return { host, port, secure, user, pass };
}

function hasSmtpConfig() {
  const cfg = smtpSettings();
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

function resendApiKey() {
  return envString("RESEND_API_KEY") || envString("RESEND_KEY") || envString("RESEND_TOKEN");
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return req.socket?.remoteAddress || "";
}

function parseDisposableDomain(email = "") {
  const lower = String(email || "").trim().toLowerCase();
  const parts = lower.split("@");
  if (parts.length !== 2) return "";
  return parts[1];
}

function shouldBlockDisposableEmail() {
  return envBool("BOOKING_BLOCK_DISPOSABLE", true);
}

function sanitizeKeyPart(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, "_")
    .slice(0, 120);
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function base64urlEncode(input) {
  const source = typeof input === "string" ? input : JSON.stringify(input);
  return Buffer.from(source)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(input = "") {
  const normalized = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
}

function hmacSign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function signVerificationToken({ bookingPayload, ttlMinutes }) {
  const secret = bookingVerifySecret();
  if (!secret) {
    throw new Error("BOOKING_VERIFY_SECRET ontbreekt.");
  }

  const issuedAt = nowSeconds();
  const expiresAt = issuedAt + Math.max(1, Number(ttlMinutes || verificationTTLMinutes())) * 60;
  const nonce = randomBytes(12).toString("hex");
  const header = { alg: "HS256", typ: "KWBV1" };
  const body = {
    iat: issuedAt,
    exp: expiresAt,
    nonce,
    booking: bookingPayload
  };
  const encodedHeader = base64urlEncode(header);
  const encodedBody = base64urlEncode(body);
  const unsigned = `${encodedHeader}.${encodedBody}`;
  const signature = hmacSign(unsigned, secret);
  return `${unsigned}.${signature}`;
}

function verifyVerificationToken(token) {
  const secret = bookingVerifySecret();
  if (!secret) {
    return { ok: false, status: 500, message: "BOOKING_VERIFY_SECRET ontbreekt." };
  }

  const tokenText = String(token || "").trim();
  const parts = tokenText.split(".");
  if (parts.length !== 3) {
    return { ok: false, status: 400, message: "Ongeldige verificatietoken." };
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const unsigned = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = hmacSign(unsigned, secret);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, status: 401, message: "Verificatietoken ongeldig." };
  }

  let decodedHeader;
  let decodedBody;
  try {
    decodedHeader = JSON.parse(base64urlDecode(encodedHeader));
    decodedBody = JSON.parse(base64urlDecode(encodedBody));
  } catch {
    return { ok: false, status: 400, message: "Verificatietoken kon niet gelezen worden." };
  }

  if (decodedHeader?.typ !== "KWBV1" || decodedHeader?.alg !== "HS256") {
    return { ok: false, status: 400, message: "Verificatietoken type ongeldig." };
  }

  const timestamp = nowSeconds();
  if (!decodedBody?.exp || decodedBody.exp < timestamp) {
    return { ok: false, status: 410, message: "Verificatielink is verlopen." };
  }

  if (!decodedBody?.booking || typeof decodedBody.booking !== "object") {
    return { ok: false, status: 400, message: "Bookingdata ontbreekt in verificatietoken." };
  }

  return {
    ok: true,
    status: 200,
    body: decodedBody
  };
}

function cleanupExpiredMemoryNonce() {
  const now = Date.now();
  for (const [key, expiresAt] of memoryNonceState.entries()) {
    if (expiresAt <= now) memoryNonceState.delete(key);
  }
}

function nonceAlreadyUsed(nonce) {
  cleanupExpiredMemoryNonce();
  return memoryNonceState.has(nonce);
}

function markNonceUsed(nonce, ttlSeconds) {
  cleanupExpiredMemoryNonce();
  const expiresAt = Date.now() + Math.max(30, Number(ttlSeconds || 600)) * 1000;
  memoryNonceState.set(nonce, expiresAt);
}

function cleanupExpiredMemoryRate() {
  const now = Date.now();
  for (const [key, state] of memoryRateState.entries()) {
    if (!state?.resetAt || state.resetAt <= now) {
      memoryRateState.delete(key);
    }
  }
}

function memoryRateLimit({ key, limit, windowSeconds }) {
  cleanupExpiredMemoryRate();
  const rateKey = sanitizeKeyPart(key);
  const max = Math.max(1, Number(limit || 1));
  const windowMs = Math.max(1, Number(windowSeconds || 60)) * 1000;
  const now = Date.now();
  const current = memoryRateState.get(rateKey);

  if (!current || current.resetAt <= now) {
    memoryRateState.set(rateKey, { count: 1, resetAt: now + windowMs });
    return { ok: true, count: 1 };
  }

  current.count += 1;
  memoryRateState.set(rateKey, current);
  return { ok: current.count <= max, count: current.count };
}

function upstashConfig() {
  return {
    url: envString("UPSTASH_REDIS_REST_URL"),
    token: envString("UPSTASH_REDIS_REST_TOKEN")
  };
}

async function upstashRequest(path, method = "POST") {
  const cfg = upstashConfig();
  if (!cfg.url || !cfg.token) return null;
  const response = await fetch(`${cfg.url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`
    }
  });
  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  return data?.result ?? null;
}

async function applyRateLimit({ key, limit, windowSeconds }) {
  const cfg = upstashConfig();
  if (!cfg.url || !cfg.token) {
    return memoryRateLimit({ key, limit, windowSeconds });
  }

  const safeKey = sanitizeKeyPart(key);
  const counter = await upstashRequest(`/incr/${encodeURIComponent(safeKey)}`, "POST");
  const count = Number(counter || 0);

  if (count === 1) {
    await upstashRequest(`/expire/${encodeURIComponent(safeKey)}/${Math.max(1, Number(windowSeconds || 60))}`, "POST");
  }

  return { ok: count <= Math.max(1, Number(limit || 1)), count };
}

function normalizeBookingPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") return null;
  return {
    reference: asRawText(rawPayload.reference, ""),
    submittedAt: asRawText(rawPayload.submittedAt, new Date().toISOString()),
    source: asRawText(rawPayload.source, "kwartier-west-website"),
    bookingType: asRawText(rawPayload.bookingType, ""),
    side: asRawText(rawPayload.side, ""),
    artists: toArray(rawPayload.artists).map((entry) => asRawText(entry, "")).filter(Boolean),
    event: {
      name: asRawText(rawPayload?.event?.name, ""),
      date: asRawText(rawPayload?.event?.date, ""),
      time: asRawText(rawPayload?.event?.time, ""),
      city: asRawText(rawPayload?.event?.city, ""),
      venue: asRawText(rawPayload?.event?.venue, "")
    },
    budget: {
      amount: rawPayload?.budget?.amount == null ? null : Number(rawPayload.budget.amount) || null,
      currency: asRawText(rawPayload?.budget?.currency, "EUR")
    },
    contact: {
      name: asRawText(rawPayload?.contact?.name, ""),
      email: asRawText(rawPayload?.contact?.email, ""),
      phone: asRawText(rawPayload?.contact?.phone, ""),
      organisation: asRawText(rawPayload?.contact?.organisation, "")
    }
  };
}

function validateBookingPayload(payload) {
  const booking = normalizeBookingPayload(payload);
  if (!booking) {
    return { ok: false, status: 400, message: "Ongeldige booking payload." };
  }

  if (!booking.contact.name || !booking.contact.email || !booking.event.date || !booking.event.city) {
    return { ok: false, status: 422, message: "Verplichte velden ontbreken in booking payload." };
  }

  if (!isEmail(booking.contact.email)) {
    return { ok: false, status: 422, message: "Contact e-mail is ongeldig." };
  }

  if (shouldBlockDisposableEmail()) {
    const domain = parseDisposableDomain(booking.contact.email);
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return { ok: false, status: 422, message: "Gebruik een geldig e-mailadres (geen tijdelijk mailboxadres)." };
    }
  }

  return { ok: true, status: 200, booking };
}

function buildPublicBaseUrl(req) {
  const configured = envString("BOOKING_PUBLIC_BASE_URL");
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const host = asRawText(req.headers["x-forwarded-host"] || req.headers.host || "", "");
  const proto = asRawText(req.headers["x-forwarded-proto"] || "https", "https");
  if (!host) return "https://kwartierwest.be";
  return `${proto}://${host}`;
}

function buildVerificationLink(req, token) {
  const baseUrl = buildPublicBaseUrl(req);
  return `${baseUrl}/pages/booking/verify/index.html?token=${encodeURIComponent(token)}`;
}

function buildInternalBookingSubject(payload) {
  return `[Booking ${asText(payload?.reference, "zonder-ref")}] ${asText(payload?.bookingType)} - ${asText(payload?.event?.city)}`;
}

function buildEmailBody(payload) {
  const artists = toArray(payload?.artists).map((entry) => asText(entry)).filter(Boolean);
  const event = payload?.event || {};
  const contact = payload?.contact || {};
  const budget = payload?.budget || {};

  const lines = [
    `Referentie: ${asText(payload?.reference)}`,
    `Ingediend op: ${asText(payload?.submittedAt)}`,
    `Boekingstype: ${asText(payload?.bookingType)}`,
    `Collectief: ${asText(payload?.side)}`,
    `Artiesten: ${artists.length ? artists.join(", ") : "-"}`,
    "",
    "EVENEMENT",
    `Naam: ${asText(event?.name)}`,
    `Datum: ${asText(event?.date)}`,
    `Tijd: ${asText(event?.time)}`,
    `Stad: ${asText(event?.city)}`,
    `Locatie: ${asText(event?.venue)}`,
    "",
    "CONTACT",
    `Naam: ${asText(contact?.name)}`,
    `Email: ${asText(contact?.email)}`,
    `Telefoon: ${asText(contact?.phone)}`,
    `Organisatie: ${asText(contact?.organisation)}`,
    "",
    "BUDGET",
    `Bedrag: ${budget?.amount == null ? "-" : String(budget.amount)}`,
    `Munt: ${asText(budget?.currency, "EUR")}`
  ];

  return lines.join("\n");
}

function buildEmailHtml(payload) {
  const artists = toArray(payload?.artists)
    .map((entry) => `<li>${escapeHTML(asText(entry))}</li>`)
    .join("");

  const event = payload?.event || {};
  const contact = payload?.contact || {};
  const budget = payload?.budget || {};

  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Nieuwe bookingaanvraag</h2>
      <p style="margin:0 0 12px;"><strong>Referentie:</strong> ${escapeHTML(asText(payload?.reference))}</p>
      <p style="margin:0 0 12px;"><strong>Ingediend op:</strong> ${escapeHTML(asText(payload?.submittedAt))}</p>
      <p style="margin:0 0 12px;"><strong>Boekingstype:</strong> ${escapeHTML(asText(payload?.bookingType))}</p>
      <p style="margin:0 0 12px;"><strong>Collectief:</strong> ${escapeHTML(asText(payload?.side))}</p>

      <h3 style="margin:16px 0 8px;">Artiesten</h3>
      ${artists ? `<ul style="margin:0 0 12px 20px;padding:0;">${artists}</ul>` : "<p style=\"margin:0 0 12px;\">-</p>"}

      <h3 style="margin:16px 0 8px;">Evenement</h3>
      <p style="margin:0 0 4px;"><strong>Naam:</strong> ${escapeHTML(asText(event?.name))}</p>
      <p style="margin:0 0 4px;"><strong>Datum:</strong> ${escapeHTML(asText(event?.date))}</p>
      <p style="margin:0 0 4px;"><strong>Tijd:</strong> ${escapeHTML(asText(event?.time))}</p>
      <p style="margin:0 0 4px;"><strong>Stad:</strong> ${escapeHTML(asText(event?.city))}</p>
      <p style="margin:0 0 12px;"><strong>Locatie:</strong> ${escapeHTML(asText(event?.venue))}</p>

      <h3 style="margin:16px 0 8px;">Contact</h3>
      <p style="margin:0 0 4px;"><strong>Naam:</strong> ${escapeHTML(asText(contact?.name))}</p>
      <p style="margin:0 0 4px;"><strong>Email:</strong> ${escapeHTML(asText(contact?.email))}</p>
      <p style="margin:0 0 4px;"><strong>Telefoon:</strong> ${escapeHTML(asText(contact?.phone))}</p>
      <p style="margin:0 0 12px;"><strong>Organisatie:</strong> ${escapeHTML(asText(contact?.organisation))}</p>

      <h3 style="margin:16px 0 8px;">Budget</h3>
      <p style="margin:0 0 4px;"><strong>Bedrag:</strong> ${budget?.amount == null ? "-" : escapeHTML(String(budget.amount))}</p>
      <p style="margin:0;"><strong>Munt:</strong> ${escapeHTML(asText(budget?.currency, "EUR"))}</p>
    </div>
  `;
}

function buildVerifyEmailHtml({ payload, verificationLink, ttlMinutes }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Bevestig je bookingaanvraag</h2>
      <p style="margin:0 0 12px;">Je aanvraag voor <strong>${escapeHTML(asText(payload?.event?.city))}</strong> staat klaar.</p>
      <p style="margin:0 0 12px;">Klik op de knop hieronder om te bevestigen. Deze link blijft ${escapeHTML(String(ttlMinutes))} minuten geldig.</p>
      <p style="margin:16px 0;">
        <a href="${escapeHTML(verificationLink)}" style="display:inline-block;padding:10px 16px;background:#e30d0d;color:#fff;text-decoration:none;font-weight:700;">
          Bevestig booking
        </a>
      </p>
      <p style="margin:0 0 12px;">Werkt de knop niet? Kopieer deze link:</p>
      <p style="word-break:break-all;margin:0 0 12px;"><a href="${escapeHTML(verificationLink)}">${escapeHTML(verificationLink)}</a></p>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
      <p style="font-size:13px;color:#555;margin:0;">Referentie: ${escapeHTML(asText(payload?.reference))}</p>
    </div>
  `;
}

function buildVerifyEmailText({ payload, verificationLink, ttlMinutes }) {
  return [
    "Bevestig je bookingaanvraag",
    "",
    `Referentie: ${asText(payload?.reference)}`,
    `Stad: ${asText(payload?.event?.city)}`,
    `Datum: ${asText(payload?.event?.date)}`,
    "",
    `Klik op deze link om je booking te bevestigen (geldig ${ttlMinutes} min):`,
    verificationLink
  ].join("\n");
}

function buildReceiptEmailText(payload) {
  return [
    "Je bookingaanvraag is bevestigd.",
    "",
    `Referentie: ${asText(payload?.reference)}`,
    `Boekingstype: ${asText(payload?.bookingType)}`,
    `Collectief: ${asText(payload?.side)}`,
    `Stad: ${asText(payload?.event?.city)}`,
    `Datum: ${asText(payload?.event?.date)}`,
    "",
    "We nemen contact op via dit e-mailadres."
  ].join("\n");
}

function buildReceiptEmailHtml(payload) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Booking bevestigd</h2>
      <p style="margin:0 0 12px;">Je aanvraag is succesvol bevestigd en doorgestuurd naar het team van Kwartier West.</p>
      <p style="margin:0 0 4px;"><strong>Referentie:</strong> ${escapeHTML(asText(payload?.reference))}</p>
      <p style="margin:0 0 4px;"><strong>Boekingstype:</strong> ${escapeHTML(asText(payload?.bookingType))}</p>
      <p style="margin:0 0 4px;"><strong>Collectief:</strong> ${escapeHTML(asText(payload?.side))}</p>
      <p style="margin:0;"><strong>Evenement:</strong> ${escapeHTML(asText(payload?.event?.date))} - ${escapeHTML(asText(payload?.event?.city))}</p>
    </div>
  `;
}

async function sendViaResend(message) {
  const apiKey = resendApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      message: "Resend key ontbreekt. Zet RESEND_API_KEY (of RESEND_KEY / RESEND_TOKEN) in Vercel Environment Variables."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: message.from,
      to: toArray(message.to),
      reply_to: message.replyTo || undefined,
      subject: message.subject,
      text: message.text,
      html: message.html
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: data?.message || "Resend kon de mail niet versturen."
    };
  }

  return {
    ok: true,
    status: 200,
    message: "Mail verzonden.",
    providerId: data?.id || ""
  };
}

async function sendViaSmtp(message) {
  if (!hasSmtpConfig()) {
    return {
      ok: false,
      status: 503,
      message:
        "SMTP config ontbreekt. Zet BOOKING_SMTP_HOST, BOOKING_SMTP_PORT, BOOKING_SMTP_SECURE, BOOKING_SMTP_USER en BOOKING_SMTP_PASS in Vercel Environment Variables."
    };
  }

  const cfg = smtpSettings();
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass
      }
    });

    const info = await transporter.sendMail({
      from: message.from,
      to: toArray(message.to).join(","),
      replyTo: message.replyTo || undefined,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    return {
      ok: true,
      status: 200,
      message: "Mail verzonden.",
      providerId: info?.messageId || ""
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      message: `SMTP kon de mail niet versturen. ${asText(error?.message, "Onbekende fout.")}`
    };
  }
}

async function dispatchMail(message) {
  const preference = bookingProviderPreference();
  if (preference === "smtp") return sendViaSmtp(message);
  if (preference === "resend") return sendViaResend(message);

  if (hasSmtpConfig()) {
    const smtpResult = await sendViaSmtp(message);
    if (smtpResult.ok) return smtpResult;
    if (resendApiKey()) {
      const resendResult = await sendViaResend(message);
      if (resendResult.ok) return resendResult;
      return {
        ok: false,
        status: resendResult.status || smtpResult.status || 500,
        message: `${smtpResult.message} | Resend fallback: ${resendResult.message}`
      };
    }
    return smtpResult;
  }

  if (resendApiKey()) return sendViaResend(message);
  return {
    ok: false,
    status: 503,
    message: "Geen mailprovider geconfigureerd. Configureer SMTP (BOOKING_SMTP_*) of Resend (RESEND_API_KEY) in Vercel."
  };
}

async function sendBookingInternal(payload) {
  const to = envString("BOOKING_TO_EMAIL", DEFAULT_TO_EMAIL);
  const from = envString("BOOKING_FROM_EMAIL", DEFAULT_FROM_EMAIL_SMTP || DEFAULT_FROM_EMAIL_RESEND);
  return dispatchMail({
    to: [to],
    from,
    replyTo: asText(payload?.contact?.email, ""),
    subject: buildInternalBookingSubject(payload),
    text: buildEmailBody(payload),
    html: buildEmailHtml(payload)
  });
}

async function sendBookingVerification({ payload, verificationLink, ttlMinutes }) {
  const from = envString("BOOKING_FROM_EMAIL", DEFAULT_FROM_EMAIL_SMTP || DEFAULT_FROM_EMAIL_RESEND);
  return dispatchMail({
    to: [asText(payload?.contact?.email, "")],
    from,
    replyTo: envString("BOOKING_TO_EMAIL", DEFAULT_TO_EMAIL),
    subject: `[Kwartier West] Bevestig je booking (${asText(payload?.reference, "zonder-ref")})`,
    text: buildVerifyEmailText({ payload, verificationLink, ttlMinutes }),
    html: buildVerifyEmailHtml({ payload, verificationLink, ttlMinutes })
  });
}

async function sendBookingReceipt(payload) {
  if (!envBool("BOOKING_SEND_RECEIPT", true)) {
    return { ok: true, status: 200, message: "Receipt disabled." };
  }

  const from = envString("BOOKING_FROM_EMAIL", DEFAULT_FROM_EMAIL_SMTP || DEFAULT_FROM_EMAIL_RESEND);
  return dispatchMail({
    to: [asText(payload?.contact?.email, "")],
    from,
    replyTo: envString("BOOKING_TO_EMAIL", DEFAULT_TO_EMAIL),
    subject: `[Kwartier West] Booking ontvangen (${asText(payload?.reference, "zonder-ref")})`,
    text: buildReceiptEmailText(payload),
    html: buildReceiptEmailHtml(payload)
  });
}

async function verifyTurnstileToken(turnstileToken, req) {
  const secret = envString("TURNSTILE_SECRET_KEY");
  if (!secret) {
    return { ok: true, skipped: true };
  }

  const token = asRawText(turnstileToken, "");
  if (!token) {
    return { ok: false, status: 422, message: "Anti-bot verificatie ontbreekt." };
  }

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", token);
  const ip = getClientIp(req);
  if (ip) params.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    return {
      ok: false,
      status: 403,
      message: "Anti-bot verificatie mislukt."
    };
  }

  return { ok: true, skipped: false };
}

function validateHumanSignals(antiBot = {}) {
  const trap = asRawText(antiBot?.website, "");
  if (trap) {
    return { ok: false, status: 400, message: "Ongeldige invoer gedetecteerd." };
  }

  const elapsed = Number(antiBot?.elapsedMs || 0);
  if (elapsed > 0 && elapsed < minFillMs()) {
    return { ok: false, status: 429, message: "Aanvraag te snel ingevuld. Probeer opnieuw." };
  }

  return { ok: true, status: 200 };
}

async function applyBookingProtection({ booking, antiBot, req }) {
  const humanCheck = validateHumanSignals(antiBot);
  if (!humanCheck.ok) return humanCheck;

  const turnstileCheck = await verifyTurnstileToken(antiBot?.turnstileToken, req);
  if (!turnstileCheck.ok) return turnstileCheck;

  const ip = sanitizeKeyPart(getClientIp(req) || "unknown");
  const email = sanitizeKeyPart(booking?.contact?.email || "unknown");

  const ipWindow = await applyRateLimit({
    key: `booking:ip:${ip}`,
    limit: Number(envString("BOOKING_RATE_LIMIT_IP", "8")) || 8,
    windowSeconds: Number(envString("BOOKING_RATE_WINDOW_IP", "600")) || 600
  });
  if (!ipWindow.ok) {
    return { ok: false, status: 429, message: "Te veel aanvragen vanaf dit toestel. Probeer later opnieuw." };
  }

  const emailWindow = await applyRateLimit({
    key: `booking:email:${email}`,
    limit: Number(envString("BOOKING_RATE_LIMIT_EMAIL", "6")) || 6,
    windowSeconds: Number(envString("BOOKING_RATE_WINDOW_EMAIL", "3600")) || 3600
  });
  if (!emailWindow.ok) {
    return { ok: false, status: 429, message: "Te veel aanvragen voor dit e-mailadres. Probeer later opnieuw." };
  }

  return { ok: true, status: 200 };
}

async function handleVerificationRequest(req, res, payload) {
  const validation = validateBookingPayload(payload?.booking || payload);
  if (!validation.ok) {
    return res.status(validation.status).json({ ok: false, message: validation.message });
  }

  const booking = validation.booking;
  const protection = await applyBookingProtection({
    booking,
    antiBot: payload?.antiBot || {},
    req
  });
  if (!protection.ok) {
    return res.status(protection.status).json({ ok: false, message: protection.message });
  }

  let verificationToken;
  const ttlMinutes = verificationTTLMinutes();
  try {
    verificationToken = signVerificationToken({
      bookingPayload: booking,
      ttlMinutes
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: asText(error?.message, "Verificatietoken kon niet aangemaakt worden.") });
  }

  const verificationLink = buildVerificationLink(req, verificationToken);
  const mailResult = await sendBookingVerification({
    payload: booking,
    verificationLink,
    ttlMinutes
  });

  if (!mailResult.ok) {
    return res.status(mailResult.status || 500).json({
      ok: false,
      message: mailResult.message || "Verificatiemail kon niet verzonden worden."
    });
  }

  return res.status(200).json({
    ok: true,
    verificationSent: true,
    reference: booking.reference || null,
    expiresInMinutes: ttlMinutes
  });
}

async function handleVerificationConfirm(req, res, payload) {
  const token = asRawText(payload?.token || "", "");
  if (!token) {
    return res.status(400).json({ ok: false, message: "Verificatietoken ontbreekt." });
  }

  const verification = verifyVerificationToken(token);
  if (!verification.ok) {
    return res.status(verification.status).json({ ok: false, message: verification.message });
  }

  const body = verification.body;
  if (!body?.nonce) {
    return res.status(400).json({ ok: false, message: "Token nonce ontbreekt." });
  }

  if (nonceAlreadyUsed(body.nonce)) {
    return res.status(409).json({ ok: false, message: "Deze verificatielink werd al gebruikt." });
  }

  const booking = normalizeBookingPayload(body.booking);
  if (!booking) {
    return res.status(400).json({ ok: false, message: "Bookingdata kon niet gelezen worden." });
  }

  const protection = await applyRateLimit({
    key: `booking:confirm:${sanitizeKeyPart(getClientIp(req) || "unknown")}`,
    limit: Number(envString("BOOKING_CONFIRM_LIMIT_IP", "15")) || 15,
    windowSeconds: Number(envString("BOOKING_CONFIRM_WINDOW_IP", "900")) || 900
  });

  if (!protection.ok) {
    return res.status(429).json({ ok: false, message: "Te veel verificaties vanaf dit toestel. Probeer later opnieuw." });
  }

  const internalResult = await sendBookingInternal(booking);
  if (!internalResult.ok) {
    return res.status(internalResult.status || 500).json({
      ok: false,
      message: internalResult.message || "Booking kon niet doorgestuurd worden."
    });
  }

  markNonceUsed(body.nonce, Math.max(600, (body.exp - nowSeconds()) + 600));

  // Non-blocking receipt mail to user
  sendBookingReceipt(booking).catch(() => {});

  return res.status(200).json({
    ok: true,
    message: "Booking bevestigd en doorgestuurd.",
    reference: booking.reference || null,
    providerId: internalResult.providerId || null
  });
}

async function handleLegacySend(res, payload) {
  const validation = validateBookingPayload(payload);
  if (!validation.ok) {
    return res.status(validation.status).json({ ok: false, message: validation.message });
  }

  const result = await sendBookingInternal(validation.booking);
  if (!result.ok) {
    return res.status(result.status || 500).json({ ok: false, message: result.message || "Mail kon niet verstuurd worden." });
  }

  return res.status(200).json({
    ok: true,
    message: result.message,
    providerId: result.providerId || null
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const payload = parseBody(req);
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ ok: false, message: "Ongeldige payload." });
  }

  const action = asRawText(payload?.action || "", "").toLowerCase();
  if (action === "request_verification") {
    return handleVerificationRequest(req, res, payload);
  }

  if (action === "confirm_verification") {
    return handleVerificationConfirm(req, res, payload);
  }

  // Backward compatible route for older clients.
  return handleLegacySend(res, payload);
}
