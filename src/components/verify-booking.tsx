"use client";

import { useEffect, useState } from "react";

export function VerifyBooking() {
  const [title, setTitle] = useState("Aanvraag controleren…");
  const [copy, setCopy] = useState("Even geduld terwijl we je verificatielink controleren.");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setTitle("Deze link mist een token.");
      setCopy("Open de volledige verificatielink uit je mailbox.");
      return;
    }

    const controller = new AbortController();
    fetch(`/api/bookings?token=${encodeURIComponent(token)}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        if (!response.ok) throw new Error(data.message || "Verificatie mislukt.");
        setTitle("E-mailadres bevestigd.");
        setCopy(data.message || "Je boekingsaanvraag is doorgestuurd naar Kwartier West.");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setTitle("Verificatie lukt niet.");
        setCopy(error instanceof Error ? error.message : "Er ging iets mis.");
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="verify-card verify-shell">
      <span className="eyebrow">Boekingsdesk / verificatie</span>
      <h1>{title}</h1>
      <p>{copy}</p>
      <a className="text-link" href="/booking">Terug naar boekingsdesk</a>
    </section>
  );
}
