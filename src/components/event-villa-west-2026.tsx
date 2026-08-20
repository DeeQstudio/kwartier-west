import Link from "next/link";
import type { Route } from "next";
import { eventBySlug } from "@/data/events";
import { VillaWestStatus } from "@/components/villa-west-status";
import { VillaWestStream } from "@/components/villa-west-stream";

export function VillaWest2026Content() {
  const event = eventBySlug.get("villa-west-2026");
  if (!event) return null;

  return (
    <>
      <section className="villa-hero villa-hero--current" data-villa-hero="">
        <div className="villa-red-room" />
        <figure><img src={event.poster} alt="Villa West — 21 augustus 2026" /></figure>
        <div className="villa-copy">
          <span>21.08.2026 / <VillaWestStatus stream={event.stream!} /></span>
          <h1>Villa<br />West</h1>
          <p>Laatste editie van zomer 2026 bij Villa Bota in Brugge.</p>
        </div>
        <a className="villa-live-jump" href="#villa-west-stream"><i /> livestream 21:55–00:05</a>
      </section>

      <section className="event-facts section-pad">
        <div><span>Datum</span><b>Vrijdag 21 augustus 2026</b></div>
        <div><span>Uur</span><b>22:00–00:00</b></div>
        <div><span>Locatie</span><b>Villa Bota / Brugge</b></div>
        <div><span>Status</span><b><VillaWestStatus stream={event.stream!} /></b></div>
      </section>

      <section className="event-editorial section-pad">
        <div>
          <span className="eyebrow">Laatste Villa West</span>
          <h2>Nog één vrijdag.<br />Nog één signaal.</h2>
        </div>
        <div>
          <p>Villa West sluit de zomerreeks af op vrijdag 21 augustus. Kwartier West neemt Villa Bota twee uur over met Thorre + Siga & Lefever, gevolgd door Wildcard.</p>
          <p>De uitzending is live te volgen van 21:55 tot 00:05, met vijf minuten marge voor en na de acts.</p>
        </div>
      </section>

      <section className="event-lineup event-lineup--current">
        <span>Line-up / tijdslot</span>
        <div className="villa-lineup-grid">
          {event.lineup.map((item, index) => {
            const content = (
              <>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <b>{item.name}</b>
                <em>{item.slot}</em>
              </>
            );
            return item.artistSlug ? (
              <Link key={item.name} href={`/artiesten/${item.artistSlug}` as Route}>{content}</Link>
            ) : (
              <div key={item.name}>{content}</div>
            );
          })}
        </div>
      </section>

      {event.stream && <VillaWestStream stream={event.stream} />}
    </>
  );
}
