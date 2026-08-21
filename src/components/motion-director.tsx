"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const progress = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return clamp((-rect.top) / Math.max(1, rect.height - window.innerHeight));
    };
    const q = <T extends Element = HTMLElement>(selector: string, context: ParentNode = document) =>
      context.querySelector<T>(selector);
    const qa = <T extends Element = HTMLElement>(selector: string, context: ParentNode = document) =>
      Array.from(context.querySelectorAll<T>(selector));

    // App Router swaps page content without remounting the root layout. Cache the
    // freshly committed page DOM once per pathname instead of querying it on every
    // scroll frame. This is noticeably smoother on mobile devices.
    const hero = q<HTMLElement>("[data-home-hero]");
    const sceneChapters = qa<HTMLElement>("[data-scene-chapter]");
    const banners = qa<HTMLElement>("[data-banner]");
    const tekno = q<HTMLElement>("[data-tekno-hero]");
    const hiphop = q<HTMLElement>("[data-hiphop-hero]");
    const dial = q<HTMLElement>("[data-tek-machine]");
    const broadcast = q<HTMLElement>("[data-hip-broadcast]");
    const archiveStack = q<HTMLElement>("[data-archive-stack]");
    const galleryTiles = qa<HTMLElement>(".relics-gallery figure,.archive-tile");
    const orbit = q<HTMLElement>("[data-partner-orbit]");
    const orbitNodes = orbit ? qa<HTMLElement>(".partner-node", orbit) : [];
    const manifestRows = qa<HTMLElement>("[data-manifest]>div");
    const footer = q<HTMLElement>(".footer-mark");

    const chapters = qa<HTMLElement>("main > section:not(:first-child)");
    chapters.forEach((section, index) => {
      section.classList.add("motion-chapter");
      section.dataset.motionIndex = String(index + 1).padStart(2, "0");
    });

    const tracked = [
      { el: q<HTMLElement>("[data-roster-hero]"), kind: "rotate" },
      { el: q<HTMLElement>("[data-events-hero]"), kind: "event" },
      { el: q<HTMLElement>("[data-archive-hero]"), kind: "archive" },
      { el: q<HTMLElement>("[data-partners-hero]"), kind: "partner" },
      { el: q<HTMLElement>("[data-booking-hero]"), kind: "booking" },
      { el: q<HTMLElement>("[data-contact-hero]"), kind: "contact" },
      { el: q<HTMLElement>("[data-manifest-hero]"), kind: "manifest" },
      { el: q<HTMLElement>("[data-artist-hero]"), kind: "artist" },
      { el: q<HTMLElement>("[data-villa-hero]"), kind: "villa" },
      { el: q<HTMLElement>("[data-relics-hero]"), kind: "relic" },
    ] as const;

    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -4%" },
    );
    qa("[data-reveal]").forEach((el) => revealObserver.observe(el));

    // Avoid forcing style recalculation when a rounded value did not actually change.
    const lastVars = new Map<string, string>();
    const setVar = (name: string, value: string) => {
      if (lastVars.get(name) === value) return;
      lastVars.set(name, value);
      root.style.setProperty(name, value);
    };
    const n = (value: number, digits = 4) => Number(value.toFixed(digits));

    let ticking = false;
    let frameId: number | null = null;
    let initFrameId: number | null = null;
    let introFrameId: number | null = null;
    let introBase = hero ? (reduce ? 0.58 : 0) : 0;
    const introTarget = 0.58;

    const update = () => {
      ticking = false;
      if (reduce && !hero) return;

      const compact = window.innerWidth <= 760;
      const motionScale = compact ? 0.55 : 1;

      if (hero) {
        // The opening composition now closes automatically on first paint. We do
        // not move the document itself: the visitor keeps full scroll control.
        // Once the prelude has completed, real scroll progress continues from
        // that visual state instead of jumping back to the old zero state.
        const raw = progress(hero);
        const p = clamp(introBase + raw * (1 - introBase));
        setVar("--hero-photos", String(n(clamp(p / 0.42))));
        setVar("--hero-logo", String(n(clamp((p - 0.12) / 0.45))));
        setVar("--hero-line", String(n(clamp((p - 0.2) / 0.35))));
        setVar("--hero-labels", String(n(clamp((p - 0.48) / 0.28))));
        setVar("--hero-red", String(n(clamp((p - 0.7) / 0.25) * 100, 2)));
      }

      if (reduce) return;

      sceneChapters.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVarFor(el, "--scene-y", `${n((p - 0.5) * -50 * motionScale, 2)}px`);
        setVarFor(el, "--scene-scale", String(n((compact ? 1.03 : 1.08) - p * (compact ? 0.018 : 0.05))));
      });

      banners.forEach((el) => {
        const p = progress(el);
        setVarFor(el, "--banner-scale", String(n((compact ? 1.04 : 1.08) - p * (compact ? 0.035 : 0.07))));
        setVarFor(el, "--banner-y", `${n(p * -28 * motionScale, 2)}px`);
        setVarFor(el, "--banner-line", String(n(clamp(p * 1.8))));
      });

      if (tekno) {
        const p = progress(tekno);
        setVar("--tek-hero-scale", String(n((compact ? 1.045 : 1.09) - p * (compact ? 0.035 : 0.07))));
        setVar("--tek-hero-y", `${n(p * -34 * motionScale, 2)}px`);
        setVar("--tek-title-x", `${n(p * 42 * motionScale, 2)}px`);
      }

      if (hiphop) {
        const p = clamp(window.scrollY / Math.max(1, hiphop.offsetHeight - window.innerHeight * 0.2));
        setVar("--hip-red", String(n(1 - p * 0.22)));
        setVar("--hip-title-y", `${n(p * -30 * motionScale, 2)}px`);
        setVar("--hip-card-y", `${n(p * 36 * motionScale, 2)}px`);
      }

      for (const { el, kind } of tracked) {
        if (!el) continue;
        const p = clamp(window.scrollY / Math.max(1, kind === "artist" || kind === "relic" ? window.innerHeight : el.offsetHeight));
        if (kind === "rotate") {
          setVar("--roster-sheet-r", `${n(-3 + p * 5 * motionScale, 2)}deg`);
          setVar("--roster-sheet-y", `${n(p * 35 * motionScale, 2)}px`);
        } else if (kind === "event") {
          setVar("--event-a-r", `${n(-5 + p * 6 * motionScale, 2)}deg`);
          setVar("--event-b-r", `${n(3 - p * 5 * motionScale, 2)}deg`);
          setVar("--event-a-y", `${n(p * 45 * motionScale, 2)}px`);
          setVar("--event-b-y", `${n(p * -32 * motionScale, 2)}px`);
        } else if (kind === "archive") {
          setVar("--archive-track-x", `${n(-8 - p * 38 * motionScale, 2)}vw`);
        } else if (kind === "partner") {
          setVar("--partner-hero-y", `${n((p - 0.4) * 34 * motionScale, 2)}px`);
        } else if (kind === "booking") {
          setVar("--booking-router-x", `${n(p * 24 * motionScale, 2)}px`);
        } else if (kind === "contact") {
          setVar("--contact-mail-x", `${n(p * -30 * motionScale, 2)}px`);
        } else if (kind === "manifest") {
          setVar("--manifest-mark-r", `${n(-3 + p * 7 * motionScale, 2)}deg`);
        } else if (kind === "artist") {
          setVar("--artist-hero-scale", String(n((compact ? 1.03 : 1.06) - p * (compact ? 0.025 : 0.05))));
          setVar("--artist-hero-y", `${n(p * 45 * motionScale, 2)}px`);
        } else if (kind === "villa") {
          setVar("--villa-r", `${n(-7 + p * 10 * motionScale, 2)}deg`);
          setVar("--villa-y", `${n(p * 45 * motionScale, 2)}px`);
        } else if (kind === "relic") {
          setVar("--relic-scale", String(n((compact ? 1.04 : 1.08) - p * (compact ? 0.03 : 0.06))));
        }
      }

      if (dial) {
        const rect = dial.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVar("--dial-r", `${n(p * 220 * motionScale, 2)}deg`);
      }

      if (broadcast) {
        const rect = broadcast.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVar("--broadcast-y", `${n((p - 0.5) * -55 * motionScale, 2)}px`);
        setVar("--ticker-x", `${n((p - 0.5) * -260 * motionScale, 2)}px`);
      }

      if (archiveStack) {
        const rect = archiveStack.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVar("--as1", `${n((p - 0.5) * -60 * motionScale, 2)}px`);
        setVar("--as2", `${n((p - 0.5) * 45 * motionScale, 2)}px`);
        setVar("--as3", `${n((p - 0.5) * -30 * motionScale, 2)}px`);
      }

      galleryTiles.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVarFor(el, index < 7 ? "--gallery-y" : "--archive-y", `${n((p - 0.5) * (index % 2 ? 30 : -30) * motionScale, 2)}px`);
      });

      if (orbit) {
        const rect = orbit.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVar("--orbit-core-r", `${n((p - 0.5) * 8 * motionScale, 2)}deg`);
        orbitNodes.forEach((node, index) =>
          setVarFor(node, "--node-y", `${n((p - 0.5) * (index % 2 ? 35 : -35) * motionScale, 2)}px`),
        );
      }

      manifestRows.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVarFor(el, "--manifest-x", `${n((p - 0.5) * (index % 2 ? -45 : 45) * motionScale, 2)}px`);
      });

      chapters.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        const signed = p - 0.5;
        setVarFor(section, "--chapter-p", String(n(p)));
        setVarFor(section, "--chapter-title-y", `${n(signed * -36 * motionScale, 2)}px`);
        setVarFor(section, "--chapter-title-rx", `${n(signed * 7 * motionScale, 2)}deg`);
        setVarFor(section, "--chapter-plate-y", `${n(signed * -52 * motionScale, 2)}px`);
        setVarFor(section, "--chapter-plate-rx", `${n(-13 + p * 24 * motionScale, 2)}deg`);
        setVarFor(section, "--chapter-plate-ry", `${n((index % 2 ? -1 : 1) * (-18 + p * 32 * motionScale), 2)}deg`);
        setVarFor(section, "--chapter-line", String(n(clamp((p - 0.05) / 0.45))));
      });

      if (footer) {
        const rect = footer.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        setVar("--footer-y", `${n((1 - p) * 38 * motionScale, 2)}px`);
      }
    };

    // Element-local variables are cached separately to prevent repeated style writes.
    const elementVarCache = new WeakMap<HTMLElement, Map<string, string>>();
    function setVarFor(el: HTMLElement, name: string, value: string) {
      let cache = elementVarCache.get(el);
      if (!cache) {
        cache = new Map<string, string>();
        elementVarCache.set(el, cache);
      }
      if (cache.get(name) === value) return;
      cache.set(name, value);
      el.style.setProperty(name, value);
    }

    const request = () => {
      if (!ticking) {
        ticking = true;
        frameId = window.requestAnimationFrame(update);
      }
    };

    if (hero && !reduce) {
      const startedAt = performance.now();
      const duration = window.innerWidth <= 760 ? 1250 : 1550;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const playIntro = (now: number) => {
        const t = clamp((now - startedAt) / duration);
        introBase = introTarget * easeOut(t);
        update();
        if (t < 1) introFrameId = window.requestAnimationFrame(playIntro);
      };
      introFrameId = window.requestAnimationFrame(playIntro);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });

    // Wait two frames for the new App Router page to commit and paint, then
    // initialise its scroll state. This also makes direct loads feel alive immediately.
    initFrameId = window.requestAnimationFrame(() => {
      initFrameId = window.requestAnimationFrame(update);
    });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (initFrameId !== null) window.cancelAnimationFrame(initFrameId);
      if (introFrameId !== null) window.cancelAnimationFrame(introFrameId);
    };
  }, [pathname]);

  return null;
}
