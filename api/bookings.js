import nodemailer from "nodemailer";

const DEFAULT_TO_EMAIL = "info@kwartierwest.be";
const DEFAULT_FROM_EMAIL_SMTP = "Kwartier West <info@kwartierwest.be>";
const DEFAULT_FROM_EMAIL_RESEND = "Kwartier West <onboarding@resend.dev>";

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

async function sendViaResend(payload) {
  const apiKey = resendApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      message:
        "Resend key ontbreekt. Zet RESEND_API_KEY (of RESEND_KEY / RESEND_TOKEN) in Vercel Environment Variables."
    };
  }

  const to = envString("BOOKING_TO_EMAIL", DEFAULT_TO_EMAIL);
  const from = envString("BOOKING_FROM_EMAIL", DEFAULT_FROM_EMAIL_RESEND);
  const subject = `[Booking ${asText(payload?.reference, "zonder-ref")}] ${asText(payload?.bookingType)} - ${asText(payload?.event?.city)}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: asText(payload?.contact?.email, ""),
      subject,
      text: buildEmailBody(payload),
      html: buildEmailHtml(payload)
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

async function sendViaSmtp(payload) {
  if (!hasSmtpConfig()) {
    return {
      ok: false,
      status: 503,
      message:
        "SMTP config ontbreekt. Zet BOOKING_SMTP_HOST, BOOKING_SMTP_PORT, BOOKING_SMTP_SECURE, BOOKING_SMTP_USER en BOOKING_SMTP_PASS in Vercel Environment Variables."
    };
  }

  const cfg = smtpSettings();
  const to = envString("BOOKING_TO_EMAIL", DEFAULT_TO_EMAIL);
  const from = envString("BOOKING_FROM_EMAIL", DEFAULT_FROM_EMAIL_SMTP);
  const subject = `[Booking ${asText(payload?.reference, "zonder-ref")}] ${asText(payload?.bookingType)} - ${asText(payload?.event?.city)}`;

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
      from,
      to,
      replyTo: asText(payload?.contact?.email, ""),
      subject,
      text: buildEmailBody(payload),
      html: buildEmailHtml(payload)
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

async function dispatchBookingEmail(payload) {
  const preference = bookingProviderPreference();

  if (preference === "smtp") {
    return sendViaSmtp(payload);
  }

  if (preference === "resend") {
    return sendViaResend(payload);
  }

  // auto: probeer SMTP eerst, daarna Resend als fallback
  if (hasSmtpConfig()) {
    const smtpResult = await sendViaSmtp(payload);
    if (smtpResult.ok) return smtpResult;
    if (resendApiKey()) {
      const resendResult = await sendViaResend(payload);
      if (resendResult.ok) return resendResult;
      return {
        ok: false,
        status: resendResult.status || smtpResult.status || 500,
        message: `${smtpResult.message} | Resend fallback: ${resendResult.message}`
      };
    }
    return smtpResult;
  }

  if (resendApiKey()) {
    return sendViaResend(payload);
  }

  return {
    ok: false,
    status: 503,
    message:
      "Geen mailprovider geconfigureerd. Configureer SMTP (BOOKING_SMTP_*) of Resend (RESEND_API_KEY) in Vercel."
  };
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

  const contactName = asText(payload?.contact?.name, "");
  const contactEmail = asText(payload?.contact?.email, "");
  const eventDate = asText(payload?.event?.date, "");
  const eventCity = asText(payload?.event?.city, "");

  if (!contactName || !contactEmail || !eventDate || !eventCity) {
    return res.status(422).json({ ok: false, message: "Verplichte velden ontbreken in booking payload." });
  }

  const result = await dispatchBookingEmail(payload);
  if (!result.ok) {
    return res.status(result.status || 500).json({ ok: false, message: result.message || "Mail kon niet verstuurd worden." });
  }

  return res.status(200).json({
    ok: true,
    message: result.message,
    providerId: result.providerId || null
  });
}
