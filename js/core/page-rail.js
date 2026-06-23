import { sideLabel } from "./format.js";
import { t } from "./i18n.js";

function laneLabel(sideKey) {
  if (sideKey === "tekno" || sideKey === "hiphop") return sideLabel(sideKey);
  return t("rail.lane.global");
}

function quickRoutes(sideKey) {
  if (sideKey === "tekno") {
    return [
      { href: "./index.html#artists", label: t("nav.teknoArtists") },
      { href: "./booking.html?type=collective_side", label: t("nav.bookTekno") }
    ];
  }

  if (sideKey === "hiphop") {
    return [
      { href: "./index.html#artists", label: t("nav.hiphopArtists") },
      { href: "./booking.html?type=collective_side", label: t("nav.bookHiphop") }
    ];
  }

  return [];
}

function canonicalPathname(pathname = "/") {
  const withLeadingSlash = String(pathname || "/").startsWith("/")
    ? String(pathname || "/")
    : `/${String(pathname || "/")}`;
  const withoutIndex = withLeadingSlash.replace(/\/index\.html$/i, "/");
  const compacted = withoutIndex.replace(/\/{2,}/g, "/");
  if (compacted !== "/" && compacted.endsWith("/")) return compacted.slice(0, -1).toLowerCase();
  return compacted.toLowerCase();
}

function filterCurrentRouteLinks(routes) {
  if (typeof window === "undefined") return routes;

  let currentUrl;
  try {
    currentUrl = new URL(window.location.href);
  } catch {
    return routes;
  }

  const currentPath = canonicalPathname(currentUrl.pathname);

  return routes.filter((route) => {
    try {
      const targetUrl = new URL(route?.href || "", currentUrl.href);
      const targetPath = canonicalPathname(targetUrl.pathname);
      return targetPath !== currentPath;
    } catch {
      return true;
    }
  });
}

function eventsHubHref(sideKey) {
  if (sideKey === "tekno" || sideKey === "hiphop") {
    return `../events/index.html?side=${encodeURIComponent(sideKey)}&scope=upcoming`;
  }
  return "../events/index.html";
}

export function mountPageRail({ sideKey = "global" } = {}) {
  const shell = document.querySelector(".page-shell");
  if (!shell) return;

  let main = shell.querySelector(":scope > .page-main");
  if (!main) {
    main = document.createElement("div");
    main.className = "page-main";

    const movable = Array.from(shell.children).filter(
      (node) => !(node instanceof HTMLElement && node.matches("[data-page-rail]"))
    );

    movable.forEach((node) => main.append(node));
    shell.prepend(main);
  }

  const showEventRail =
    (sideKey === "tekno" || sideKey === "hiphop") &&
    Boolean(document.querySelector("[data-artists]"));

  let rail = shell.querySelector("[data-page-rail]");
  if (!showEventRail) {
    rail?.remove();
    return;
  }

  if (!rail) {
    rail = document.createElement("aside");
    rail.className = "page-rail";
    rail.setAttribute("data-page-rail", "");
    shell.append(rail);
  }

  const quick = filterCurrentRouteLinks(quickRoutes(sideKey));
  const villaHref = "../events/detail/villa-west-radio-2026/";
  const quickHTML = quick.length
    ? `
      <section class="page-rail__panel" aria-label="${t("rail.quick.aria")}">
        <p class="eyebrow">${t("rail.quick.title")}</p>
        <div class="page-rail__quick-links">
          ${quick.map((item) => `<a class="page-rail__quick-link" href="${item.href}">${item.label}</a>`).join("")}
        </div>
      </section>
    `
    : "";

  rail.innerHTML = `
    <div class="page-rail__stack">
      <section class="page-rail__panel page-rail__panel--lane" aria-label="${t("rail.lane.aria")}">
        <p class="eyebrow">${t("rail.lane.title")}</p>
        <span class="page-rail__logo" aria-hidden="true"></span>
        <p class="page-rail__lane">${laneLabel(sideKey)}</p>
      </section>

      ${quickHTML}

      <section class="page-rail__panel page-rail__panel--villa" aria-label="Villa West">
        <a class="page-rail__villa" href="${villaHref}">
          <span class="page-rail__villa-media" aria-hidden="true"></span>
          <span class="page-rail__villa-kicker">Villa Bota / zomer 2026</span>
          <span class="page-rail__villa-title">Villa West</span>
          <span class="page-rail__villa-meta">Elke vrijdag / 22:00-00:00</span>
          <span class="page-rail__villa-line">Hiphop & acid tekno op de radio</span>
        </a>
      </section>

      <section class="page-rail__panel page-rail__panel--events" aria-label="${t("nav.events")}">
        <p class="eyebrow">${t("nav.events")}</p>
        <div class="page-rail__events" data-rail-events>
          <p class="muted">${t("events.loading")}</p>
        </div>
        <div class="page-rail__actions">
          <a class="page-rail__quick-link" href="${eventsHubHref(sideKey)}">${t("events.filter.allEvents")}</a>
        </div>
      </section>
    </div>
  `;
}
