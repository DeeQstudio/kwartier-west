import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "../api/newsletter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function cleanEnvValue(value) {
  return String(value ?? "")
    .replace(/^(?:\\r|\\n|\r|\n)+/g, "")
    .replace(/(?:\\r|\\n|\r|\n)+$/g, "")
    .trim();
}

function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) return false;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = cleanEnvValue(value);
  }
  return true;
}

for (const fileName of [".env.local", ".env"]) {
  loadEnvFile(fileName);
}

function hasSmtpConfig() {
  return Boolean(
    (process.env.NEWSLETTER_SMTP_HOST || process.env.BOOKING_SMTP_HOST) &&
      (process.env.NEWSLETTER_SMTP_USER || process.env.BOOKING_SMTP_USER) &&
      (process.env.NEWSLETTER_SMTP_PASS || process.env.BOOKING_SMTP_PASS)
  );
}

function hasResendConfig() {
  return Boolean(
    process.env.NEWSLETTER_RESEND_API_KEY ||
      process.env.RESEND_API_KEY ||
      process.env.RESEND_KEY ||
      process.env.RESEND_TOKEN
  );
}

function makeMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

const target = process.env.NEWSLETTER_TO_EMAIL || process.env.BOOKING_TO_EMAIL || "info@kwartierwest.be";
const payload = {
  email: process.env.NEWSLETTER_TEST_EMAIL || target,
  name: "Uit Het Westen lokale test - niet behandelen",
  consent: true,
  source: "local-uit-het-westen-test",
  antiBot: {
    website: "",
    elapsedMs: 2400
  }
};

const req = {
  method: "POST",
  headers: {
    host: "localhost:5173",
    "x-forwarded-proto": "http",
    "x-forwarded-for": "127.0.0.1",
    "user-agent": "kwartier-west-local-newsletter-test"
  },
  socket: { remoteAddress: "127.0.0.1" },
  body: payload
};

console.log("Uit Het Westen newsletter test");
console.log(`Provider preference: ${process.env.NEWSLETTER_PROVIDER || process.env.BOOKING_PROVIDER || "auto"}`);
console.log(`SMTP configured: ${hasSmtpConfig() ? "yes" : "no"}`);
console.log(`Resend configured: ${hasResendConfig() ? "yes" : "no"}`);
console.log(`Target inbox: ${target}`);

const res = makeMockResponse();
await handler(req, res);

console.log(JSON.stringify({ status: res.statusCode, body: res.body }, null, 2));

if (res.statusCode < 200 || res.statusCode >= 300 || !res.body?.ok) {
  process.exitCode = 1;
}
