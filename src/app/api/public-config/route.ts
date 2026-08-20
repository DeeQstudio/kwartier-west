import { NextResponse } from "next/server";
import { bookingProductionReady } from "@/lib/booking-server";

export const dynamic = "force-dynamic";

export function GET() {
  const key = String(process.env.TURNSTILE_SITE_KEY ?? "").trim();
  const production = process.env.VERCEL_ENV === "production";

  return NextResponse.json(
    {
      bookingEnabled: production ? Boolean(key && bookingProductionReady()) : Boolean(key),
      turnstileSiteKey: key,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
