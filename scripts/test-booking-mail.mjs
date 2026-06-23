import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "../api/bookings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

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

function cleanEnvValue(value) {
  return String(value ?? "")
    .replace(/^(?:\\r|\\n|\r|\n)+/g, "")
    .replace(/(?:\\r|\\n|\r|\n)+$/g, "")
    .trim();
}

for (const fileName of [".env.local", ".env"]) {
  loadEnvFile(fileName);
}

function hasSmtpConfig() {
  return Boolean(process.env.BOOKING_SMTP_HOST && process.env.BOOKING_SMTP_USER && process.env.BOOKING_SMTP_PASS);
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY || process.env.RESEND_KEY || process.env.RESEND_TOKEN);
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

const payload = {
  reference: `KW-TEST-${Date.now()}`,
  submittedAt: new Date().toISOString(),
  source: "local-booking-mail-test",
  bookingType: "single",
  side: "hiphop",
  artists: ["de-kweker"],
  event: {
    name: "Lokale testbooking - niet behandelen",
    date: "2026-08-01",
    time: "22:00",
    city: "Brugge",
    venue: "Villa Bota",
    attendance: 150,
    setLength: 60
  },
  budget: {
    amount: 500,
    currency: "EUR"
  },
  contact: {
    name: "Kwartier West Test",
    email: process.env.BOOKING_TEST_REPLY_TO || process.env.BOOKING_TO_EMAIL || "info@kwartierwest.be",
    phone: "+32 test",
    organisation: "Kwartier West local test"
  },
  productionNotes: "Lokale test vanuit npm run booking-mail-test. Niet behandelen."
};

const req = {
  method: "POST",
  headers: {
    host: "localhost:5173",
    "x-forwarded-proto": "http",
    "x-forwarded-for": "127.0.0.1"
  },
  socket: { remoteAddress: "127.0.0.1" },
  body: payload
};

console.log("Booking mail test");
console.log(`Provider preference: ${process.env.BOOKING_PROVIDER || "auto"}`);
console.log(`SMTP configured: ${hasSmtpConfig() ? "yes" : "no"}`);
console.log(`Resend configured: ${hasResendConfig() ? "yes" : "no"}`);
console.log(`Target inbox: ${process.env.BOOKING_TO_EMAIL || "info@kwartierwest.be"}`);
console.log(`Verification secret present: ${process.env.BOOKING_VERIFY_SECRET ? "yes" : "no"}`);

const res = makeMockResponse();
await handler(req, res);

console.log(JSON.stringify({ status: res.statusCode, body: res.body }, null, 2));

if (res.statusCode < 200 || res.statusCode >= 300 || !res.body?.ok) {
  process.exitCode = 1;
}
