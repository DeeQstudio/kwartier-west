import { createHmac, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "../api/bookings.js";

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

function base64urlEncode(input) {
  const source = typeof input === "string" ? input : JSON.stringify(input);
  return Buffer.from(source)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function hmacSign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function signVerificationToken(booking) {
  const secret = cleanEnvValue(process.env.BOOKING_VERIFY_SECRET);
  if (!secret) throw new Error("BOOKING_VERIFY_SECRET ontbreekt.");

  const issuedAt = Math.floor(Date.now() / 1000);
  const ttlMinutes = Number(cleanEnvValue(process.env.BOOKING_VERIFY_TTL_MINUTES) || "20") || 20;
  const body = {
    iat: issuedAt,
    exp: issuedAt + ttlMinutes * 60,
    nonce: randomBytes(12).toString("hex"),
    booking
  };
  const encodedHeader = base64urlEncode({ alg: "HS256", typ: "KWBV1" });
  const encodedBody = base64urlEncode(body);
  const unsigned = `${encodedHeader}.${encodedBody}`;
  return `${unsigned}.${hmacSign(unsigned, secret)}`;
}

async function callBookingApi(body) {
  const req = {
    method: "POST",
    headers: {
      host: "localhost:5173",
      "x-forwarded-proto": "http",
      "x-forwarded-for": "127.0.0.1"
    },
    socket: { remoteAddress: "127.0.0.1" },
    body
  };
  const res = makeMockResponse();
  await handler(req, res);
  return res;
}

const reference = `KW-FLOW-${Date.now()}`;
const contactEmail = cleanEnvValue(process.env.BOOKING_TEST_REPLY_TO || process.env.BOOKING_TO_EMAIL || "info@kwartierwest.be");
const booking = {
  reference,
  submittedAt: new Date().toISOString(),
  source: "local-booking-flow-test",
  bookingType: "single",
  side: "hiphop",
  artists: ["de-kweker"],
  event: {
    name: "End-to-end testbooking - niet behandelen",
    date: "2026-08-08",
    time: "22:00",
    city: "Brugge",
    venue: "Villa Bota",
    attendance: 180,
    setLength: 60
  },
  budget: {
    amount: 500,
    currency: "EUR"
  },
  contact: {
    name: "Kwartier West Flow Test",
    email: contactEmail,
    phone: "+32 test",
    organisation: "Kwartier West local test"
  },
  productionNotes: "Lokale end-to-end test vanuit npm run booking-flow-test. Niet behandelen."
};

console.log("Booking verification flow test");
console.log(`Reference: ${reference}`);
console.log(`Verification recipient: ${contactEmail}`);
console.log(`Internal booking recipient: ${cleanEnvValue(process.env.BOOKING_TO_EMAIL || "info@kwartierwest.be")}`);

const verificationRequest = await callBookingApi({
  action: "request_verification",
  booking,
  antiBot: {
    website: "",
    elapsedMs: 5000,
    turnstileToken: ""
  }
});

console.log(
  JSON.stringify(
    {
      step: "request_verification",
      status: verificationRequest.statusCode,
      body: verificationRequest.body
    },
    null,
    2
  )
);

if (verificationRequest.statusCode < 200 || verificationRequest.statusCode >= 300 || !verificationRequest.body?.ok) {
  process.exitCode = 1;
  process.exit();
}

const confirmRequest = await callBookingApi({
  action: "confirm_verification",
  token: signVerificationToken(booking)
});

console.log(
  JSON.stringify(
    {
      step: "confirm_verification",
      status: confirmRequest.statusCode,
      body: confirmRequest.body
    },
    null,
    2
  )
);

if (confirmRequest.statusCode < 200 || confirmRequest.statusCode >= 300 || !confirmRequest.body?.ok) {
  process.exitCode = 1;
}
