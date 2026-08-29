import Link from "next/link";
import type { Route } from "next";
import { eventBySlug } from "@/data/events";

export function VillaWest2026Content() {
  const event = eventBySlug.get("villa-west-2026");
  if (!event) return null;

  return (
    <>
      <section className="villa-hero" data-villa-hero="">
        <div className="villa-red-room" />
        <figure><img src={event.poster} alt="Villa West Summer Recap 2026" width={1080} height={1080} /></figure>
        <div className="villa-copy">
          <span>28.08.2026 / VOORBIJ / ARCHIEF</span>
          <h1>Villa<br />West</h1>
          <p>Summer Recap 2026 bij Villa Bota in Brugge.</p>
        </div>
      </section>

      <section className="event-facts section-pad">
        <div><span>Datum</span><b>Vrijdag 28 augustus 2026</b></div>
        <div><span>Uur</span><b>22:00–00:00</b></div>
        <div><span>Locatie</span><b>Villa Bota / Brugge</b></div>
        <div><span>Status</span><b>Voorbij / archief</b></div>
      </section>

      <section className="event-editorial section-pad">
        <div>
          <span className="eyebrow">Villa West / Summer Recap 2026</span>
          <h2>De laatste vrijdag.<br />Het laatste signaal.</h2>
        </div>
        <div>
          <p>Villa West sloot de zomerreeks af op vrijdag 28 augustus. Natte23 opende met een Tekno-liveset van 22:00 tot 23:00, gevolgd door Alexer van 23:00 tot 00:00.</p>
          <p>De laatste editie bracht de line-up nog één keer samen bij Villa Bota in Brugge.</p>
        </div>
      </section>

      <section className="event-lineup event-lineup--archive">
        <span>Laatste editie / line-up / tijdslot</span>
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
    </>
  );
}
