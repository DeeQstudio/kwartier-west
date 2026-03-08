import nodemailer from "nodemailer";

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
  return `[Westpost] Nieuwe inschrijving (${asText(payload?.source, "website")})`;
}

function buildText(payload, req) {
  const ua = asRawText(req.headers["user-agent"], "-");
  const ip = asText(getClientIp(req), "-");
  return [
    "Nieuwe nieuwsbriefinschrijving (Westpost)",
    "",
    `E-mail: ${asText(payload?.email)}`,
    `Naam: ${asText(payload?.name, "-")}`,
    `Bron: ${asText(payload?.source)}`,
    `Toestemming: ${payload?.consent ? "Ja" : "Nee"}`,
    `Tijdstip: ${asText(payload?.submittedAt)}`,
    `IP: ${ip}`,
    `User-Agent: ${ua}`
  ].join("\n");
}

function buildHtml(payload, req) {
  const ua = asRawText(req.headers["user-agent"], "-");
  const ip = asText(getClientIp(req), "-");
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Nieuwe Westpost-inschrijving</h2>
      <p style="margin:0 0 8px;"><strong>E-mail:</strong> ${escapeHTML(asText(payload?.email))}</p>
      <p style="margin:0 0 8px;"><strong>Naam:</strong> ${escapeHTML(asText(payload?.name, "-"))}</p>
      <p style="margin:0 0 8px;"><strong>Bron:</strong> ${escapeHTML(asText(payload?.source))}</p>
      <p style="margin:0 0 8px;"><strong>Toestemming:</strong> ${payload?.consent ? "Ja" : "Nee"}</p>
      <p style="margin:0 0 8px;"><strong>Tijdstip:</strong> ${escapeHTML(asText(payload?.submittedAt))}</p>
      <p style="margin:0 0 8px;"><strong>IP:</strong> ${escapeHTML(ip)}</p>
      <p style="margin:0;"><strong>User-Agent:</strong> ${escapeHTML(ua)}</p>
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
      to: [message.to],
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
      to: message.to,
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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const parsed = parseBody(req);
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
    text: buildText(payload, req),
    html: buildHtml(payload, req)
  });

  if (!sendResult.ok) {
    return res.status(sendResult.status || 500).json({
      ok: false,
      message: sendResult.message || "Inschrijving kon niet verwerkt worden."
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Je staat op de Westpost-lijst. We houden je op de hoogte.",
    providerId: sendResult.providerId || null
  });
}

