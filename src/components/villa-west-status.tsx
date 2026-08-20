"use client";

import { useEffect, useState } from "react";
import type { EventStream } from "@/data/events";
import { hasZonedWindowEnded } from "@/lib/time-window";

export function VillaWestStatus({ stream }: { stream: EventStream }) {
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const sync = () => setEnded(hasZonedWindowEnded(stream));
    sync();
    const timer = window.setInterval(sync, 60_000);
    return () => window.clearInterval(timer);
  }, [stream]);

  return <>{ended ? "Voorbij / archief" : "Main event / laatste editie"}</>;
}
