"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { artists } from "@/data/artists";
import type { BookingMode, BookingScene } from "@/data/types";

declare global {
  interface Window {
    turnstile?: {
      render: (
        target: Element,
        options: {
          sitekey: string;
          theme: "dark";
          action: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const modeLabels: Record<BookingMode, string> = {
  solo: "Solo",
  multiple: "Meerdere artiesten",
  scene: "Volledige scene",
  takeover: "Kwartier West takeover",
};

const sceneLabels: Record<BookingScene, string> = {
  tekno: "Tekno",
  hiphop: "Hip hop",
  both: "Beide / open",
};

const artistByScene = (slug: string, scene: Exclude<BookingScene, "both">) =>
  artists.some((artist) => artist.slug === slug && artist.scene === scene);

type BookingResponse = { message?: string };

export function BookingBuilder() {
  const [mode, setMode] = useState<BookingMode>("solo");
  const [scene, setScene] = useState<BookingScene>("both");
  const [selected, setSelected] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const slotRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);

  const visibleArtists = useMemo(
    () => artists.filter((artist) => scene === "both" || artist.scene === scene),
    [scene],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryScene = params.get("scene");
    if (queryScene === "tekno" || queryScene === "hiphop") setScene(queryScene);

    const artistSlug = params.get("artist");
    const artist = artists.find((item) => item.slug === artistSlug);
    if (artist) {
      setScene(artist.scene);
      setSelected([artist.slug]);
      setMode("solo");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupTurnstile() {
      const slot = slotRef.current;
      if (!slot) return;
      try {
        const response = await fetch("/api/public-config", {
          headers: { accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("config");
        const config = (await response.json()) as {
          bookingEnabled?: boolean;
          turnstileSiteKey?: string;
        };

        if (!config.bookingEnabled || !config.turnstileSiteKey) {
          slot.textContent = "Boekingsbeveiliging is nog niet geconfigureerd.";
          return;
        }

        const render = () => {
          if (cancelled || !slotRef.current || !window.turnstile) return;
          widgetIdRef.current = window.turnstile.render(slotRef.current, {
            sitekey: config.turnstileSiteKey!,
            theme: "dark",
            action: "booking",
            callback: (token) => setTurnstileToken(token),
            "expired-callback": () => setTurnstileToken(""),
            "error-callback": () => setTurnstileToken(""),
          });
        };

        if (window.turnstile) {
          render();
          return;
        }

        const existing = document.querySelector<HTMLScriptElement>('script[data-kw-turnstile]');
        if (existing) {
          existing.addEventListener("load", render, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.kwTurnstile = "true";
        script.addEventListener("load", render, { once: true });
        document.head.append(script);
      } catch {
        if (slotRef.current) slotRef.current.textContent = "Boekingsbeveiliging kon niet geladen worden.";
      }
    }

    setupTurnstile();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleArtist = (slug: string) => {
    setSelected((current) => {
      if (mode === "solo") return current.includes(slug) ? [] : [slug];
      return current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    });
  };

  const changeMode = (next: BookingMode) => {
    setMode(next);
    if (next === "solo" && selected.length > 1) setSelected(selected.slice(0, 1));
  };

  const changeScene = (next: BookingScene) => {
    setScene(next);
    if (next !== "both") {
      setSelected((current) =>
        current.filter((slug) => artistByScene(slug, next)),
      );
    }
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!turnstileToken) {
      setStatus("Voltooi eerst de anti-spamcontrole.");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      mode,
      scene,
      artists: selected,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      date: String(formData.get("date") ?? ""),
      location: String(formData.get("location") ?? ""),
      message: String(formData.get("message") ?? ""),
      company_website: String(formData.get("company_website") ?? ""),
      startedAt,
      turnstileToken,
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as BookingResponse;
      if (!response.ok) throw new Error(data.message || "Aanvraag kon niet verstuurd worden.");

      setStatus(data.message || "Controleer je mailbox om de aanvraag te bevestigen.");
      form.reset();
      setSelected([]);
      setTurnstileToken("");
      setStartedAt(Date.now());
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current); else window.turnstile?.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Er ging iets mis.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="booking-builder section-pad" data-booking>
      <div className="booking-modes">
        <span className="eyebrow">Stap 01 / Wat zoek je?</span>
        <div className="mode-grid" role="group" aria-label="Type boeking">
          {([
            ["solo", "01", "Solo", "één artiest"],
            ["multiple", "02", "Meerdere", "meer dan één naam"],
            ["scene", "03", "Scene", "Tekno of Hip hop"],
            ["takeover", "04", "Takeover", "Kwartier West-format"],
          ] as const).map(([value, index, label, helper]) => (
            <button
              key={value}
              type="button"
              data-mode={value}
              aria-pressed={mode === value}
              onClick={() => changeMode(value)}
            >
              <small>{index}</small><b>{label}</b><span>{helper}</span>
            </button>
          ))}
        </div>

        <div className="booking-scene">
          <span className="eyebrow">Stap 02 / Scene</span>
          <div>
            {(["tekno", "hiphop", "both"] as const).map((value) => (
              <button
                key={value}
                type="button"
                data-booking-side={value}
                aria-pressed={scene === value}
                onClick={() => changeScene(value)}
              >
                {sceneLabels[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-artists">
          <span className="eyebrow">Stap 03 / Namen</span>
          <div className="booking-artist-list">
            {visibleArtists.map((artist) => (
              <label key={artist.slug} data-booking-artist-row data-side={artist.scene}>
                <input
                  type="checkbox"
                  name="artists"
                  value={artist.slug}
                  checked={selected.includes(artist.slug)}
                  onChange={() => toggleArtist(artist.slug)}
                />
                <span>{artist.name}</span><small>{artist.role}</small>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="booking-form-wrap">
        <div className="booking-summary" aria-live="polite">
          <span>Jouw aanvraag</span>
          <b>{modeLabels[mode]}</b>
          <p>{sceneLabels[scene]}</p>
          <ul>
            {selected.length ? selected.map((slug) => {
              const artist = artists.find((item) => item.slug === slug);
              return <li key={slug}>{artist?.name ?? slug}</li>;
            }) : <li>Nog geen artiest gekozen</li>}
          </ul>
        </div>

        <form className="booking-form" noValidate onSubmit={onSubmit}>
          <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>Naam<input required name="name" maxLength={100} autoComplete="name" /></label>
          <label>E-mail<input required type="email" name="email" maxLength={160} autoComplete="email" /></label>
          <label>Organisatie <small>optioneel</small><input name="organization" maxLength={120} autoComplete="organization" /></label>
          <div className="form-two">
            <label>Gewenste datum <small>optioneel</small><input type="date" name="date" /></label>
            <label>Locatie <small>optioneel</small><input name="location" maxLength={120} autoComplete="address-level2" /></label>
          </div>
          <label>Vertel kort wat je plant<textarea required name="message" maxLength={2400} rows={7} /></label>
          <div className="turnstile-slot" ref={slotRef}><span>Anti-spamcontrole wordt geladen…</span></div>
          <button className="booking-submit" type="submit" disabled={!turnstileToken || submitting}>
            {submitting ? "Versturen…" : "Verstuur aanvraag"}
          </button>
          <p className="form-status" role="status">{status}</p>
          <small className="form-note">
            Een aanvraag is geen automatische bevestiging. Beschikbaarheid en praktische voorwaarden worden apart bevestigd.
          </small>
        </form>
      </div>
    </section>
  );
}
