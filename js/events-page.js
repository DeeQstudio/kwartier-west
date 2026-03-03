import {
  flattenEvents,
  loadArtists,
  loadEvents,
  normalizeLineup,
  splitEventsByDate
} from "./core/content-api.js";
import { artistPath, escapeHTML, eventPath, formatDateTime, sideLabel, sideShortLabel } from "./core/format.js";
import { t } from "./core/i18n.js";

function localizedEventStatus(eventItem) {
  const raw = String(eventItem?.status || "").trim().toLowerCase();
  if (raw === "completed" || raw === "past" || raw === "voorbij" || raw === "voorbije") {
    return t("events.filter.past");
  }
  if (raw === "upcoming" || raw === "komend") {
    return t("events.filter.upcoming");
  }
  if (eventItem?.__isPast) return t("events.filter.past");
  return eventItem?.status ? String(eventItem.status) : t("events.filter.upcoming");
}

function listLineup(eventItem, artistsData) {
  const lineup = normalizeLineup(eventItem?.lineup, artistsData, eventItem?.sideKey);
  if (!lineup.length) return `<span class="muted">${t("events.lineupPending")}</span>`;

  return lineup
    .map((entry) => {
      const path = artistPath(entry.sideKey, entry.slug || "");
      const label = escapeHTML(entry.name || t("artists.defaultName"));
      if (!entry.slug) return `<span>${label}</span>`;
      return `<a class="inline-link" href="${escapeHTML(path)}">${label}</a>`;
    })
    .join('<span class="dot-sep"></span>');
}

function ticketCTA(eventItem) {
  const mode = eventItem?.tickets?.mode || "tba";
  const url = eventItem?.tickets?.url || "";
  const label = eventItem?.tickets?.label || t("events.ticketsLabel");

  if (mode === "external" && url) {
    return `<a class="chip-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`;
  }
  if (mode === "internal") {
    return `<a class="chip-link" href="../tickets/index.html">${escapeHTML(eventItem?.tickets?.label || t("events.ticketRequest"))}</a>`;
  }
  return `<span class="muted">${t("events.ticketsTba")}</span>`;
}

function sourceMarkup(eventItem) {
  const source = eventItem?.source;
  if (!source?.url) return "";
  const platform = source?.platform || t("events.sourceDefault");
  return `<a class="chip-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${t("events.source")}: ${escapeHTML(platform)}</a>`;
}

function featuredCard(eventItem, artistsData) {
  const title = escapeHTML(eventItem?.title || t("events.untitled"));
  const detailHref = escapeHTML(eventPath(eventItem?.id || ""));
  const meta = escapeHTML(formatDateTime(eventItem?.date, eventItem?.time));
  const location = [eventItem?.region, eventItem?.venue].filter(Boolean).map(escapeHTML).join(" - ");

  return `
    <article class="feature-card">
      <div class="feature-card__top">
        <span class="status-pill">${escapeHTML(sideShortLabel(eventItem?.sideKey))}</span>
        <span class="status-pill">${escapeHTML(localizedEventStatus(eventItem))}</span>
      </div>

      <h3><a class="inline-link" href="${detailHref}">${title}</a></h3>
      <p class="feature-card__meta">${meta}${location ? ` <span class="dot-sep"></span> ${location}` : ""}</p>

      <p class="feature-card__lineup"><span class="muted">${t("events.lineup")}:</span> ${listLineup(eventItem, artistsData)}</p>

      <div class="inline-actions">
        <a class="chip-link" href="${detailHref}">Bekijk event</a>
        ${ticketCTA(eventItem)}
        <a class="chip-link" href="../${escapeHTML(eventItem.sideKey)}/booking.html?type=collective_side">${t("events.bookSide", { side: escapeHTML(sideLabel(eventItem.sideKey)) })}</a>
        ${sourceMarkup(eventItem)}
      </div>
    </article>
  `;
}

function listItem(eventItem, artistsData) {
  const detailHref = escapeHTML(eventPath(eventItem?.id || ""));
  const dateLabel = escapeHTML(formatDateTime(eventItem?.date, eventItem?.time));
  const location = [eventItem?.region, eventItem?.venue].filter(Boolean).map(escapeHTML).join(" - ");
  const sideChip = `<span class="status-pill">${escapeHTML(sideShortLabel(eventItem.sideKey))}</span>`;
  const statusChip = `<span class="status-pill">${escapeHTML(localizedEventStatus(eventItem))}</span>`;
  const source = sourceMarkup(eventItem);

  return `
    <article class="event-card" data-side="${escapeHTML(eventItem.sideKey)}" data-scope="${eventItem.__isPast ? "past" : "upcoming"}">
      <div class="event-card__main">
        <h3 class="event-card__title"><a class="inline-link" href="${detailHref}">${escapeHTML(eventItem?.title || t("events.untitled"))}</a></h3>
        <p class="event-card__meta">${dateLabel}${location ? ` <span class="dot-sep"></span> ${location}` : ""}</p>
        <p class="event-card__lineup"><span class="event-card__label">${t("events.lineup")}:</span> ${listLineup(eventItem, artistsData)}</p>
        ${source ? `<p class="event-card__source">${source}</p>` : ""}
      </div>

      <div class="event-card__actions">
        <div class="event-card__badges">${sideChip}${statusChip}</div>
        <div class="event-card__cta-group">
          <div class="event-card__cta">
            <a class="chip-link" href="${detailHref}">Bekijk event</a>
          </div>
          <div class="event-card__cta">${ticketCTA(eventItem)}</div>
          <div class="event-card__cta">
            <a class="chip-link" href="../${escapeHTML(eventItem.sideKey)}/booking.html?type=collective_side">${t("events.bookSide", {
              side: escapeHTML(sideLabel(eventItem.sideKey))
            })}</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function filterEvents(events, { side = "all", scope = "upcoming" } = {}) {
  return events.filter((eventItem) => {
    const sideMatch = side === "all" || eventItem.sideKey === side;
    const scopeKey = eventItem.__isPast ? "past" : "upcoming";
    const scopeMatch = scope === "all" || scope === scopeKey;
    return sideMatch && scopeMatch;
  });
}

function renderEventBlock(scopeKey, events, artistsData) {
  if (!events.length) return "";

  const title = scopeKey === "past" ? t("events.filter.past") : t("events.filter.upcoming");

  return `
    <section class="event-block event-block--${scopeKey}" data-block-scope="${scopeKey}">
      <header class="event-block__head">
        <h3>${escapeHTML(title)}</h3>
        <span class="event-block__count">${escapeHTML(t("events.total", { count: events.length }))}</span>
      </header>
      <div class="event-list">
        ${events.map((eventItem) => listItem(eventItem, artistsData)).join("")}
      </div>
    </section>
  `;
}

function renderEventsOverview(events, artistsData, { scope = "upcoming" } = {}) {
  if (!events.length) {
    return `<p class="muted">${t("events.none")}</p>`;
  }

  const upcoming = events.filter((eventItem) => !eventItem.__isPast);
  const past = events.filter((eventItem) => eventItem.__isPast);
  const blocks = [];

  if (scope !== "past") {
    blocks.push(renderEventBlock("upcoming", upcoming, artistsData));
  }
  if (scope !== "upcoming") {
    blocks.push(renderEventBlock("past", past, artistsData));
  }

  const content = blocks.filter(Boolean).join("");
  if (!content) {
    return `<p class="muted">${t("events.none")}</p>`;
  }

  return `<div class="event-stream">${content}</div>`;
}

function syncFilterQuery({ side = "all", scope = "upcoming" } = {}) {
  if (!window.history?.replaceState) return;

  const params = new URLSearchParams(window.location.search || "");
  if (side === "all") params.delete("side");
  else params.set("side", side);

  if (scope === "upcoming") params.delete("scope");
  else params.set("scope", scope);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function readInitialFilters() {
  const params = new URLSearchParams(window.location.search || "");
  const sideRaw = String(params.get("side") || "").toLowerCase();
  const scopeRaw = String(params.get("scope") || "").toLowerCase();

  const side = ["all", "tekno", "hiphop"].includes(sideRaw) ? sideRaw : "all";
  const scope = ["upcoming", "all", "past"].includes(scopeRaw) ? scopeRaw : "upcoming";

  return { side, scope };
}

function setupFilterButtons({
  initialSide = "all",
  initialScope = "upcoming",
  onChange = () => {}
} = {}) {
  let side = initialSide;
  let scope = initialScope;

  const sideButtons = document.querySelectorAll("[data-filter-side]");
  const scopeButtons = document.querySelectorAll("[data-filter-scope]");

  function paint() {
    sideButtons.forEach((button) => {
      const active = button.getAttribute("data-filter-side") === side;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    scopeButtons.forEach((button) => {
      const active = button.getAttribute("data-filter-scope") === scope;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    onChange({ side, scope });
  }

  sideButtons.forEach((button) => {
    button.addEventListener("click", () => {
      side = button.getAttribute("data-filter-side") || "all";
      paint();
    });
  });

  scopeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scope = button.getAttribute("data-filter-scope") || "upcoming";
      paint();
    });
  });

  paint();
}

export async function mountEventsPage({ baseDepth = 0 } = {}) {
  const listRoot = document.querySelector("[data-events-page]");
  const featuredRoot = document.querySelector("[data-featured]");
  const totalNode = document.querySelector("[data-count]");
  const visibleNode = document.querySelector("[data-visible-count]");

  if (!listRoot || !featuredRoot) return;

  listRoot.innerHTML = `<p class="muted">${t("events.loading")}</p>`;

  try {
    const [eventsData, artistsData] = await Promise.all([
      loadEvents({ baseDepth }),
      loadArtists({ baseDepth })
    ]);

    const initial = readInitialFilters();

    const merged = flattenEvents(eventsData);
    const { upcoming, past } = splitEventsByDate(merged);
    const ordered = [...upcoming, ...past.slice().reverse()].map((eventItem) => ({
      ...eventItem,
      __isPast: past.includes(eventItem)
    }));

    if (totalNode) {
      totalNode.textContent = t("events.total", { count: merged.length });
    }

    if (!ordered.length) {
      featuredRoot.innerHTML = `<p class="muted">${t("events.none")}</p>`;
      listRoot.innerHTML = `<p class="muted">${t("events.none")}</p>`;
      return;
    }

    const renderByFilter = ({ side, scope }) => {
      const visible = filterEvents(ordered, { side, scope });
      if (visible.length) {
        featuredRoot.innerHTML = featuredCard(visible[0], artistsData);
      } else {
        featuredRoot.innerHTML = `<p class="muted">${t("events.none")}</p>`;
      }
      listRoot.innerHTML = renderEventsOverview(visible, artistsData, { scope });

      if (visibleNode) {
        visibleNode.textContent = t("events.visible", { count: visible.length });
      }

      syncFilterQuery({ side, scope });
    };

    setupFilterButtons({
      initialSide: initial.side,
      initialScope: initial.scope,
      onChange: renderByFilter
    });
  } catch (error) {
    console.error(error);
    featuredRoot.innerHTML = `<p class="muted">${t("events.error")}</p>`;
    listRoot.innerHTML = `<p class="muted">${t("events.error")}</p>`;
  }
}
