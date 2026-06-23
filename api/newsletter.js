import nodemailer from "nodemailer";
import {
  buildUnsubscribeUrl,
  exportNewsletterSubscribers,
  newsletterStorageMode,
  saveNewsletterSubscriber,
  unsubscribeNewsletterSubscriber
} from "./lib/newsletter-store.js";

const DEFAULT_TO_EMAIL = "info@kwartierwest.be";
const DEFAULT_FROM_EMAIL_SMTP = "Kwartier West <info@kwartierwest.be>";
const DEFAULT_FROM_EMAIL_RESEND = "Kwartier West <onboarding@resend.dev>";
const DEFAULT_MIN_FILL_MS = 1200;

const memoryRateState = globalThis.__kwNewsletterRateState || new Map();
globalThis.__kwNewsletterRateState = memoryRateState;

function envString(name, fallback = "") {
  return String(process.env[name] ?? fallback).trim();
}

function envBool(name, fallback = false) {
  const raw = envString(name, fallback ? "true" : "false").toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

function adminSecret() {
  return envString("NEWSLETTER_ADMIN_SECRET", envString("BOOKING_VERIFY_SECRET"));
}

function newsletterProviderPreference() {
  return envString("NEWSLETTER_PROVIDER", envString("BOOKING_PROVIDER", "auto")).toLowerCase();
}

function smtpSettings() {
  const host = envString("NEWSLETTER_SMTP_HOST") || envString("BOOKING_SMTP_HOST");
  const port = Number(envString("NEWSLETTER_SMTP_PORT", envString("BOOKING_SMTP_PORT", "587"))) || 587;
  const secure = envBool("NEWSLETTER_SMTP_SECURE", envBool("BOOKING_SMTP_SECURE", port === 465));
  const user = envString("NEWSLETTER_SMTP_USER") || envString("BOOKING_SMTP_USER");
  const pass = envString("NEWSLETTER_SMTP_PASS") || envString("BOOKING_SMTP_PASS");
  return { host, port, secure, user, pass };
}

function hasSmtpConfig() {
  const cfg = smtpSettings();
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

function resendApiKey() {
  return (
    envString("NEWSLETTER_RESEND_API_KEY") ||
    envString("RESEND_API_KEY") ||
    envString("RESEND_KEY") ||
    envString("RESEND_TOKEN")
  );
}

async function readRequestBody(req) {
  if (!req || typeof req !== "object") return "";
  if (typeof req[Symbol.asyncIterator] !== "function") {
    if (typeof req.on !== "function") return "";
    return await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      });
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      req.on("error", reject);
    });
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const raw = (await readRequestBody(req)).replace(/^\uFEFF/, "").trim();
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function parseUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "kwartierwest.be";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return new URL(req.url || "/api/newsletter", `${proto}://${host}`);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

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

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return req.socket?.remoteAddress || "";
}

function sanitizeKeyPart(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, "_")
    .slice(0, 120);
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

function minFillMs() {
  return Number(envString("NEWSLETTER_MIN_FILL_MS", String(DEFAULT_MIN_FILL_MS))) || DEFAULT_MIN_FILL_MS;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, status: 400, message: "Ongeldige payload." };
  }

  const email = asRawText(payload?.email, "");
  const name = asRawText(payload?.name, "");
  const source = asRawText(payload?.source, "website");
  const consent = Boolean(payload?.consent);
  const antiBot = payload?.antiBot || {};
  const honey = asRawText(antiBot?.website, "");
  const elapsedMs = Number(antiBot?.elapsedMs || 0);

  if (honey) {
    return { ok: false, status: 400, message: "Ongeldige invoer gedetecteerd." };
  }

  if (elapsedMs > 0 && elapsedMs < minFillMs()) {
    return { ok: false, status: 429, message: "Te snel ingestuurd. Probeer opnieuw." };
  }

  if (!isEmail(email)) {
    return { ok: false, status: 422, message: "Vul een geldig e-mailadres in." };
  }

  if (!consent) {
    return { ok: false, status: 422, message: "Bevestig dat je updates wil ontvangen." };
  }

  return {
    ok: true,
    status: 200,
    payload: {
      email,
      name,
      source,
      consent,
      submittedAt: new Date().toISOString()
    }
  };
}

function buildSubject(payload) {
  return `[Uit Het Westen] Nieuwe inschrijving (${asText(payload?.source, "website")})`;
}

function buildText(payload, req, { storage = "mail", duplicate = false } = {}) {
  const ua = asRawText(req.headers["user-agent"], "-");
  const ip = asText(getClientIp(req), "-");
  return [
    "Nieuwe nieuwsbriefinschrijving (Uit Het Westen)",
    "",
    `E-mail: ${asText(payload?.email)}`,
    `Naam: ${asText(payload?.name, "-")}`,
    `Bron: ${asText(payload?.source)}`,
    `Status: ${duplicate ? "Bestaande inschrijving bijgewerkt" : "Nieuw"}`,
    `Opslag: ${storage}`,
    `Toestemming: ${payload?.consent ? "Ja" : "Nee"}`,
    `Tijdstip: ${asText(payload?.submittedAt)}`,
    `IP: ${ip}`,
    `User-Agent: ${ua}`
  ].join("\n");
}

function buildHtml(payload, req, { storage = "mail", duplicate = false } = {}) {
  const ua = asRawText(req.headers["user-agent"], "-");
  const ip = asText(getClientIp(req), "-");
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Nieuwe Uit Het Westen-inschrijving</h2>
      <p style="margin:0 0 8px;"><strong>E-mail:</strong> ${escapeHTML(asText(payload?.email))}</p>
      <p style="margin:0 0 8px;"><strong>Naam:</strong> ${escapeHTML(asText(payload?.name, "-"))}</p>
      <p style="margin:0 0 8px;"><strong>Bron:</strong> ${escapeHTML(asText(payload?.source))}</p>
      <p style="margin:0 0 8px;"><strong>Status:</strong> ${duplicate ? "Bestaande inschrijving bijgewerkt" : "Nieuw"}</p>
      <p style="margin:0 0 8px;"><strong>Opslag:</strong> ${escapeHTML(storage)}</p>
      <p style="margin:0 0 8px;"><strong>Toestemming:</strong> ${payload?.consent ? "Ja" : "Nee"}</p>
      <p style="margin:0 0 8px;"><strong>Tijdstip:</strong> ${escapeHTML(asText(payload?.submittedAt))}</p>
      <p style="margin:0 0 8px;"><strong>IP:</strong> ${escapeHTML(ip)}</p>
      <p style="margin:0;"><strong>User-Agent:</strong> ${escapeHTML(ua)}</p>
    </div>
  `;
}

function buildWelcomeSubject(payload) {
  return `[Kwartier West] Welkom bij Uit Het Westen`;
}

function buildWelcomeText(payload, unsubscribeUrl) {
  return [
    "Je staat op de Uit Het Westen-lijst.",
    "",
    "We sturen alleen updates over Kwartier West: events, bookings en labelnieuws.",
    `Bron: ${asText(payload?.source, "website")}`,
    "",
    unsubscribeUrl ? `Uitschrijven: ${unsubscribeUrl}` : "Uitschrijven kan via info@kwartierwest.be."
  ].join("\n");
}

function buildWelcomeHtml(payload, unsubscribeUrl) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Welkom bij Uit Het Westen</h2>
      <p style="margin:0 0 12px;">Je staat op de Uit Het Westen-lijst van Kwartier West.</p>
      <p style="margin:0 0 12px;">We sturen alleen updates over events, bookings en labelnieuws.</p>
      <p style="margin:0 0 12px;"><strong>Bron:</strong> ${escapeHTML(asText(payload?.source, "website"))}</p>
      ${
        unsubscribeUrl
          ? `<p style="margin:16px 0 0;"><a href="${escapeHTML(unsubscribeUrl)}">Uitschrijven</a></p>`
          : `<p style="margin:16px 0 0;">Uitschrijven kan via <a href="mailto:info@kwartierwest.be">info@kwartierwest.be</a>.</p>`
      }
    </div>
  `;
}

async function sendViaResend(message) {
  const apiKey = resendApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      message: "Resend key ontbreekt."
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
      to: Array.isArray(message.to) ? message.to : [message.to],
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
      message: "SMTP config ontbreekt."
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
      to: Array.isArray(message.to) ? message.to.join(",") : message.to,
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

function adminAuthorized(req) {
  const secret = adminSecret();
  if (!secret) return false;
  const auth = String(req.headers.authorization || "").trim();
  if (auth === `Bearer ${secret}`) return true;

  try {
    const url = parseUrl(req);
    return url.searchParams.get("secret") === secret;
  } catch {
    return false;
  }
}

async function handleExport(req, res) {
  if (!adminAuthorized(req)) {
    return res.status(401).json({ ok: false, message: "Niet gemachtigd." });
  }

  const url = parseUrl(req);
  const includeUnsubscribed = ["1", "true", "yes"].includes(String(url.searchParams.get("includeUnsubscribed") || "").toLowerCase());
  const result = await exportNewsletterSubscribers({ includeUnsubscribed });
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    ok: true,
    storage: result.storage,
    count: result.subscribers.length,
    subscribers: result.subscribers
  });
}

async function handleUnsubscribe(req, res) {
  const url = parseUrl(req);
  const email = url.searchParams.get("email") || "";
  const token = url.searchParams.get("token") || "";
  const result = await unsubscribeNewsletterSubscriber(email, token);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const ok = result.ok;
  const title = ok ? "Uit Het Westen" : "Uit Het Westen fout";
  const message = result.message || (ok ? "Je bent uitgeschreven." : "Uitschrijven is mislukt.");
  return res.status(result.status || (ok ? 200 : 400)).send
    ? res.status(result.status || (ok ? 200 : 400)).send(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)}</title></head><body style="font-family:Arial,sans-serif;background:#080808;color:#f3f3f3;padding:32px;"><main style="max-width:680px;margin:auto;"><h1>${escapeHTML(title)}</h1><p>${escapeHTML(message)}</p><p><a style="color:#fff" href="/">Terug naar Kwartier West</a></p></main></body></html>`)
    : res.status(result.status || (ok ? 200 : 400)).json({ ok, message });
}

async function dispatchMail(message) {
  const preference = newsletterProviderPreference();
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
    message: "Geen mailprovider geconfigureerd."
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const url = parseUrl(req);
    const action = String(url.searchParams.get("action") || "").toLowerCase();
    if (action === "export") return handleExport(req, res);
    if (action === "unsubscribe") return handleUnsubscribe(req, res);
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const parsed = await parseBody(req);
  const validation = validatePayload(parsed);
  if (!validation.ok) {
    return res.status(validation.status).json({ ok: false, message: validation.message });
  }

  const payload = validation.payload;
  const ipKey = sanitizeKeyPart(getClientIp(req) || "unknown");
  const emailKey = sanitizeKeyPart(payload.email);

  const ipRate = memoryRateLimit({
    key: `newsletter:ip:${ipKey}`,
    limit: Number(envString("NEWSLETTER_RATE_LIMIT_IP", "12")) || 12,
    windowSeconds: Number(envString("NEWSLETTER_RATE_WINDOW_IP", "3600")) || 3600
  });

  if (!ipRate.ok) {
    return res.status(429).json({
      ok: false,
      message: "Te veel inschrijvingen vanaf dit toestel. Probeer later opnieuw."
    });
  }

  const emailRate = memoryRateLimit({
    key: `newsletter:email:${emailKey}`,
    limit: Number(envString("NEWSLETTER_RATE_LIMIT_EMAIL", "3")) || 3,
    windowSeconds: Number(envString("NEWSLETTER_RATE_WINDOW_EMAIL", "86400")) || 86400
  });

  if (!emailRate.ok) {
    return res.status(429).json({
      ok: false,
      message: "Dit e-mailadres is recent al ingeschreven."
    });
  }

  const storageResult = await saveNewsletterSubscriber(payload);
  if (!storageResult.ok) {
    return res.status(storageResult.status || 500).json({
      ok: false,
      message: storageResult.message || "Inschrijving kon niet opgeslagen worden."
    });
  }

  const to = envString("NEWSLETTER_TO_EMAIL", envString("BOOKING_TO_EMAIL", DEFAULT_TO_EMAIL));
  const from =
    envString("NEWSLETTER_FROM_EMAIL") ||
    envString("BOOKING_FROM_EMAIL") ||
    (hasSmtpConfig() ? DEFAULT_FROM_EMAIL_SMTP : DEFAULT_FROM_EMAIL_RESEND);

  const sendResult = await dispatchMail({
    to,
    from,
    replyTo: payload.email,
    subject: buildSubject(payload),
    text: buildText(payload, req, {
      storage: storageResult.storage || newsletterStorageMode(),
      duplicate: storageResult.duplicate
    }),
    html: buildHtml(payload, req, {
      storage: storageResult.storage || newsletterStorageMode(),
      duplicate: storageResult.duplicate
    })
  });

  if (!sendResult.ok) {
    return res.status(sendResult.status || 500).json({
      ok: false,
      message: sendResult.message || "Inschrijving kon niet verwerkt worden."
    });
  }

  const unsubscribeUrl = buildUnsubscribeUrl(req, payload.email);
  if (envBool("NEWSLETTER_SEND_WELCOME", true)) {
    dispatchMail({
      to: payload.email,
      from,
      replyTo: to,
      subject: buildWelcomeSubject(payload),
      text: buildWelcomeText(payload, unsubscribeUrl),
      html: buildWelcomeHtml(payload, unsubscribeUrl)
    }).catch(() => {});
  }

  return res.status(200).json({
    ok: true,
    message: storageResult.duplicate
      ? "Je stond al op de Uit Het Westen-lijst. Je gegevens zijn bijgewerkt."
      : "Je staat op de Uit Het Westen-lijst. We houden je op de hoogte.",
    storage: storageResult.storage || newsletterStorageMode(),
    duplicate: Boolean(storageResult.duplicate),
    providerId: sendResult.providerId || null
  });
}
