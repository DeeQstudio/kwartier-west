"use client";

import { useEffect, useState } from "react";
import type { EventStream } from "@/data/events";
import { isZonedWindowActive } from "@/lib/time-window";

export function VillaWestStream({ stream }: { stream: EventStream }) {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setActive(isZonedWindowActive(stream));
      setReady(true);
    };
    sync();
    const timer = window.setInterval(sync, 30_000);
    return () => window.clearInterval(timer);
  }, [stream]);

  return (
    <section className={`event-stream-shell section-pad${active ? " is-live" : ""}`} id="villa-west-stream" aria-labelledby="villa-west-stream-title">
      <div className="event-stream-head">
        <div>
          <span className="eyebrow">Live vanuit Villa Bota</span>
          <h2 id="villa-west-stream-title">Kijk live mee</h2>
        </div>
        <p>Live vanuit Villa Bota van 21:55 tot 00:05, met vijf minuten marge rond de line-up.</p>
      </div>

      <div className="event-stream-status" role="status" aria-live="polite">
        <span>{active ? "Live" : ready ? "Streamvenster" : "Controleren"}</span>
        <b>{active ? "Villa West is nu live op kwartierwest.be" : `${stream.startTime}–${stream.endTime}`}</b>
      </div>

      {active ? (
        <div className="event-stream-live">
          <div className="event-stream-frame">
            <iframe
              src={stream.videoUrl}
              title={stream.label}
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="event-stream-controls">
            <div>
              <span>Audio fallback</span>
              <audio controls preload="none" src={stream.audioUrl} />
            </div>
            <a href={stream.sourceUrl} target="_blank" rel="noopener noreferrer">Open Villa Bota</a>
          </div>
        </div>
      ) : (
        <div className="event-stream-closed" aria-hidden="true">
          <div className="stream-scanline" />
          <span>KW / LIVE SIGNAL</span>
          <b>21 AUG / {stream.startTime} → {stream.endTime}</b>
        </div>
      )}
    </section>
  );
}
