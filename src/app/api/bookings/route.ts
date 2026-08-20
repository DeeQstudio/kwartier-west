import { NextResponse } from "next/server";
import {
  BookingError,
  bookingProductionReady,
  claimVerification,
  confirmationEmail,
  createVerificationToken,
  loadPendingBooking,
  parseVerificationToken,
  rateLimit,
  readJsonBody,
  releaseClaim,
  removePending,
  sameOrigin,
  sendBookingMail,
  storePendingBooking,
  teamBookingEmail,
  validateBooking,
  verificationEmail,
  verifyTurnstile,
} from "@/lib/booking-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: { message: string }) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    if (process.env.VERCEL_ENV === "production" && !bookingProductionReady()) {
      return json(503, { message: "Booking is tijdelijk niet beschikbaar." });
    }
    if (!sameOrigin(request)) return json(403, { message: "Origin geweigerd." });

    const raw = await readJsonBody(request);
    let booking;
    try {
      booking = validateBooking(raw);
    } catch (error) {
      if (error instanceof BookingError && error.message === "__HONEYPOT__") {
        return json(200, { message: "Controleer je mailbox om de aanvraag te bevestigen." });
      }
      throw error;
    }

    rateLimit(request, booking.email);

    const turnstileOk = await verifyTurnstile(request, raw.turnstileToken).catch(() => false);
    if (!turnstileOk) return json(400, { message: "Anti-spamcontrole mislukt. Probeer opnieuw." });

    let pending: Awaited<ReturnType<typeof storePendingBooking>>;
    try {
      pending = await storePendingBooking(booking);
    } catch {
      return json(503, { message: "Aanvraag kon veilig niet worden opgeslagen. Probeer later opnieuw." });
    }

    const token = createVerificationToken(pending.id);
    try {
      await sendBookingMail(verificationEmail(booking, token));
    } catch {
      await removePending(pending.path).catch(() => undefined);
      return json(503, { message: "De verificatiemail kon niet verstuurd worden. Probeer later opnieuw." });
    }

    return json(202, {
      message: "Controleer je mailbox en bevestig je e-mailadres. Daarna wordt de aanvraag doorgestuurd.",
    });
  } catch (error) {
    if (error instanceof BookingError) return json(error.status, { message: error.message });
    console.error("booking_post_error", error instanceof Error ? error.message : "unknown");
    return json(500, { message: "Interne fout. Probeer later opnieuw." });
  }
}

export async function GET(request: Request) {
  try {
    if (process.env.VERCEL_ENV === "production" && !bookingProductionReady()) {
      return json(503, { message: "Booking is tijdelijk niet beschikbaar." });
    }

    const token = new URL(request.url).searchParams.get("token");
    const id = parseVerificationToken(token);
    if (!id) return json(400, { message: "Verificatielink is ongeldig of verlopen." });

    const pending = await loadPendingBooking(id).catch(() => null);
    if (!pending) return json(410, { message: "Deze aanvraag bestaat niet meer of is al verwerkt." });

    let claimPath: string;
    try {
      claimPath = await claimVerification(id);
    } catch {
      return json(409, { message: "Deze verificatielink werd al gebruikt." });
    }

    try {
      await sendBookingMail(teamBookingEmail(pending.booking));
    } catch {
      await releaseClaim(claimPath).catch(() => undefined);
      return json(503, {
        message: "Je e-mailadres is bevestigd, maar het doorsturen lukte tijdelijk niet. Open dezelfde link later opnieuw.",
      });
    }

    await removePending(pending.path).catch(() => undefined);
    await sendBookingMail(confirmationEmail(pending.booking)).catch(() => undefined);

    return json(200, {
      message: "Je e-mailadres is bevestigd en de boekingsaanvraag is doorgestuurd.",
    });
  } catch (error) {
    console.error("booking_get_error", error instanceof Error ? error.message : "unknown");
    return json(500, { message: "Interne fout. Probeer later opnieuw." });
  }
}
