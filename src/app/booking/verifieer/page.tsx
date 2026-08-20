import { JsonLd } from "@/components/json-ld";
import { VerifyBooking } from "@/components/verify-booking";
import { makeMetadata } from "@/lib/metadata";

export const metadata = makeMetadata({
  title: "Booking verifiëren | Kwartier West",
  description: "Bevestig het e-mailadres van je boekingsaanvraag.",
  canonical: "https://kwartierwest.be/booking/verifieer",
  og: "https://kwartierwest.be/assets/og/booking.jpg",
});

const schemas = [] as const;

export default function VerifyPage() {
  return (
    <main id="main" className="verify-page">
      {schemas.map((schema, index) => <JsonLd key={index} data={schema} />)}
      <VerifyBooking />
    </main>
  );
}
