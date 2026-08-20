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

    const chapters = qa<HTMLElement>("main > section:not(:first-child)");
    chapters.forEach((section, index) => {
      section.classList.add("motion-chapter");
      section.dataset.motionIndex = String(index + 1).padStart(2, "0");
    });

    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -5%" },
    );
    qa("[data-reveal]").forEach((el) => revealObserver.observe(el));

    let ticking = false;
    let frameId: number | null = null;
    let initFrameId: number | null = null;

    const update = () => {
      ticking = false;
      if (reduce) return;

      const hero = q("[data-home-hero]");
      if (hero) {
        const p = progress(hero);
        root.style.setProperty("--hero-photos", String(clamp(p / 0.42)));
        root.style.setProperty("--hero-logo", String(clamp((p - 0.12) / 0.45)));
        root.style.setProperty("--hero-line", String(clamp((p - 0.2) / 0.35)));
        root.style.setProperty("--hero-labels", String(clamp((p - 0.48) / 0.28)));
        root.style.setProperty("--hero-red", String(clamp((p - 0.7) / 0.25) * 100));
      }

      qa<HTMLElement>("[data-scene-chapter]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        el.style.setProperty("--scene-y", `${(p - 0.5) * -50}px`);
        el.style.setProperty("--scene-scale", String(1.08 - p * 0.05));
      });

      qa<HTMLElement>("[data-banner]").forEach((el) => {
        const p = progress(el);
        el.style.setProperty("--banner-scale", String(1.08 - p * 0.07));
        el.style.setProperty("--banner-y", `${p * -28}px`);
        el.style.setProperty("--banner-line", String(clamp(p * 1.8)));
      });

      const tekno = q("[data-tekno-hero]");
      if (tekno) {
        const p = progress(tekno);
        root.style.setProperty("--tek-hero-scale", String(1.09 - p * 0.07));
        root.style.setProperty("--tek-hero-y", `${p * -34}px`);
        root.style.setProperty("--tek-title-x", `${p * 42}px`);
      }

      const hiphop = q<HTMLElement>("[data-hiphop-hero]");
      if (hiphop) {
        const p = clamp(window.scrollY / Math.max(1, hiphop.offsetHeight - window.innerHeight * 0.2));
        root.style.setProperty("--hip-red", String(1 - p * 0.22));
        root.style.setProperty("--hip-title-y", `${p * -30}px`);
        root.style.setProperty("--hip-card-y", `${p * 36}px`);
      }

      const variables: Array<[string, string, string]> = [
        ["[data-roster-hero]", "--roster-sheet-r", "rotate"],
        ["[data-events-hero]", "--event-a-r", "event"],
        ["[data-archive-hero]", "--archive-track-x", "archive"],
        ["[data-partners-hero]", "--partner-hero-y", "partner"],
        ["[data-booking-hero]", "--booking-router-x", "booking"],
        ["[data-contact-hero]", "--contact-mail-x", "contact"],
        ["[data-manifest-hero]", "--manifest-mark-r", "manifest"],
        ["[data-artist-hero]", "--artist-hero-scale", "artist"],
        ["[data-villa-hero]", "--villa-r", "villa"],
        ["[data-relics-hero]", "--relic-scale", "relic"],
      ];

      for (const [selector, , kind] of variables) {
        const el = q<HTMLElement>(selector);
        if (!el) continue;
        const p = clamp(window.scrollY / Math.max(1, kind === "artist" || kind === "relic" ? window.innerHeight : el.offsetHeight));
        if (kind === "rotate") {
          root.style.setProperty("--roster-sheet-r", `${-3 + p * 5}deg`);
          root.style.setProperty("--roster-sheet-y", `${p * 35}px`);
        } else if (kind === "event") {
          root.style.setProperty("--event-a-r", `${-5 + p * 6}deg`);
          root.style.setProperty("--event-b-r", `${3 - p * 5}deg`);
          root.style.setProperty("--event-a-y", `${p * 45}px`);
          root.style.setProperty("--event-b-y", `${p * -32}px`);
        } else if (kind === "archive") {
          root.style.setProperty("--archive-track-x", `${-8 - p * 38}vw`);
        } else if (kind === "partner") {
          root.style.setProperty("--partner-hero-y", `${(p - 0.4) * 34}px`);
        } else if (kind === "booking") {
          root.style.setProperty("--booking-router-x", `${p * 24}px`);
        } else if (kind === "contact") {
          root.style.setProperty("--contact-mail-x", `${p * -30}px`);
        } else if (kind === "manifest") {
          root.style.setProperty("--manifest-mark-r", `${-3 + p * 7}deg`);
        } else if (kind === "artist") {
          root.style.setProperty("--artist-hero-scale", String(1.06 - p * 0.05));
          root.style.setProperty("--artist-hero-y", `${p * 45}px`);
        } else if (kind === "villa") {
          root.style.setProperty("--villa-r", `${-7 + p * 10}deg`);
          root.style.setProperty("--villa-y", `${p * 45}px`);
        } else if (kind === "relic") {
          root.style.setProperty("--relic-scale", String(1.08 - p * 0.06));
        }
      }

      const dial = q("[data-tek-machine]");
      if (dial) {
        const rect = dial.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        root.style.setProperty("--dial-r", `${p * 220}deg`);
      }

      const broadcast = q("[data-hip-broadcast]");
      if (broadcast) {
        const rect = broadcast.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        root.style.setProperty("--broadcast-y", `${(p - 0.5) * -55}px`);
        root.style.setProperty("--ticker-x", `${(p - 0.5) * -260}px`);
      }

      const archiveStack = q("[data-archive-stack]");
      if (archiveStack) {
        const rect = archiveStack.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        root.style.setProperty("--as1", `${(p - 0.5) * -60}px`);
        root.style.setProperty("--as2", `${(p - 0.5) * 45}px`);
        root.style.setProperty("--as3", `${(p - 0.5) * -30}px`);
      }

      qa<HTMLElement>(".relics-gallery figure,.archive-tile").forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        el.style.setProperty(index < 7 ? "--gallery-y" : "--archive-y", `${(p - 0.5) * (index % 2 ? 30 : -30)}px`);
      });

      const orbit = q("[data-partner-orbit]");
      if (orbit) {
        const rect = orbit.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        root.style.setProperty("--orbit-core-r", `${(p - 0.5) * 8}deg`);
        qa<HTMLElement>(".partner-node", orbit).forEach((node, index) =>
          node.style.setProperty("--node-y", `${(p - 0.5) * (index % 2 ? 35 : -35)}px`),
        );
      }

      qa<HTMLElement>("[data-manifest]>div").forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        el.style.setProperty("--manifest-x", `${(p - 0.5) * (index % 2 ? -45 : 45)}px`);
      });

      chapters.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        const signed = p - 0.5;
        section.style.setProperty("--chapter-p", String(p));
        section.style.setProperty("--chapter-title-y", `${signed * -36}px`);
        section.style.setProperty("--chapter-title-rx", `${signed * 7}deg`);
        section.style.setProperty("--chapter-plate-y", `${signed * -52}px`);
        section.style.setProperty("--chapter-plate-rx", `${-13 + p * 24}deg`);
        section.style.setProperty("--chapter-plate-ry", `${(index % 2 ? -1 : 1) * (-18 + p * 32)}deg`);
        section.style.setProperty("--chapter-line", String(clamp((p - 0.05) / 0.45)));
      });

      const footer = q(".footer-mark");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        root.style.setProperty("--footer-y", `${(1 - p) * 38}px`);
      }
    };

    const request = () => {
      if (!ticking) {
        ticking = true;
        frameId = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });

    // App Router keeps this component mounted between pages. Wait one frame so
    // the newly navigated page has committed, then measure its DOM from scratch.
    initFrameId = window.requestAnimationFrame(() => {
      initFrameId = window.requestAnimationFrame(update);
    });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (initFrameId !== null) window.cancelAnimationFrame(initFrameId);
    };
  }, [pathname]);

  return null;
}
