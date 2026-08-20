"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const desktopLinks = [
  ["/tekno", "Tekno"],
  ["/hiphop", "Hip hop"],
  ["/artiesten", "Artiesten"],
  ["/events", "Events"],
  ["/partners", "Partners"],
] as const;

const mobileLinks = [
  ["/tekno", "Tekno"],
  ["/hiphop", "Hip hop"],
  ["/artiesten", "Artiesten"],
  ["/events", "Events"],
  ["/archive", "Archief"],
  ["/booking", "Booking"],
  ["/partners", "Partners"],
  ["/contact", "Contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("a,button,[tabindex]:not([tabindex='-1'])");
    window.setTimeout(() => first?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>("a,button,[tabindex]:not([tabindex='-1'])"),
      );
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className={`site-nav${scrolled ? " scrolled" : ""}`} data-nav>
        <Link className="brand" href="/" aria-label="Kwartier West home">
          <img src="/assets/kw-wordmark.png" width="903" height="216" alt="Kwartier West" />
        </Link>
        <nav className="desk-nav" aria-label="Hoofdnavigatie">
          {desktopLinks.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <Link className="booking-nav" href="/booking">Boekingsdesk</Link>
        <button
          ref={buttonRef}
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="menu-panel"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </header>

      <aside
        ref={panelRef}
        id="menu-panel"
        className={`menu-panel${open ? " open" : ""}`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="menu-word">
          <img src="/assets/kw-wordmark.png" alt="" aria-hidden="true" />
        </div>
        <nav aria-label="Mobiele navigatie">
          {mobileLinks.map(([href, label], index) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <small>{String(index + 1).padStart(2, "0")}</small>{label}
            </Link>
          ))}
        </nav>
        <p>Brugge / België<br />Tekno + Hip hop</p>
      </aside>
    </>
  );
}
