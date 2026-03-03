import { loadArtists, loadEvents, normalizeLineup, pickSideCollection, splitEventsByDate } from "./core/content-api.js";
import { artistPath, escapeHTML, eventPath, formatDateTime, sideShortLabel } from "./core/format.js";
import { t } from "./core/i18n.js";

function localizedEventStatus(eventItem) {
  const raw = String(eventItem?.status || "").trim().toLowerCase();
  if (raw === "completed" || raw === "past" || raw === "voorbij" || raw === "voorbije") {
    return t("events.filter.past");
  }
  if (raw === "upcoming" || raw === "komend") {
    return t("events.filter.upcoming");
  }
  return eventItem?.status ? String(eventItem.status) : t("events.filter.upcoming");
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

function lineupHTML(eventItem, artistsData, sideKey) {
  const lineup = normalizeLineup(eventItem?.lineup, artistsData, sideKey);
  if (!lineup.length) return `<span class="muted">${t("events.lineupPending")}</span>`;

  const items = lineup.map((entry) => {
    const slug = String(entry?.slug || "");
    const name = escapeHTML(entry?.name || t("artists.defaultName"));
    if (!slug) return `<span>${name}</span>`;

    return `<a class="inline-link" href="${escapeHTML(artistPath(entry?.sideKey || sideKey, slug))}">${name}</a>`;
  });

  return `<span class="muted">${t("events.lineup")}:</span> ${items.join('<span class="dot-sep"></span>')}`;
}

function eventCard(eventItem, artistsData, sideKey) {
  const detailHref = escapeHTML(eventPath(eventItem?.id || ""));
  const dateLabel = formatDateTime(eventItem?.date, eventItem?.time);
  const location = [eventItem?.region, eventItem?.venue].filter(Boolean).map(escapeHTML).join(" - ");
  const sourceLink = eventItem?.source?.url
    ? `<a class="inline-link" href="${escapeHTML(eventItem.source.url)}" target="_blank" rel="noopener noreferrer">${t("events.source")}: ${escapeHTML(eventItem?.source?.platform || t("events.sourceDefault"))}</a>`
    : "";

  return `
    <article class="event-card">
      <div class="event-card__main">
        <div class="event-card__title-row">
          <h3><a class="inline-link" href="${detailHref}">${escapeHTML(eventItem?.title || t("events.untitled"))}</a></h3>
          <span class="status-pill">${escapeHTML(localizedEventStatus(eventItem))}</span>
        </div>

        <p class="event-card__meta">${escapeHTML(dateLabel)}${location ? ` <span class="dot-sep"></span> ${location}` : ""}</p>
        <p class="event-card__lineup">${lineupHTML(eventItem, artistsData, sideKey)}</p>
        ${sourceLink ? `<p class="event-card__source">${sourceLink}</p>` : ""}
      </div>

      <div class="event-card__actions">
        <a class="chip-link" href="${detailHref}">Bekijk event</a>
        ${ticketCTA(eventItem)}
        <a class="chip-link" href="./booking.html?type=collective_side">${t("events.bookSide", { side: escapeHTML(sideShortLabel(sideKey)) })}</a>
      </div>
    </article>
  `;
}

function renderRailEvents(sideEvents, sideKey) {
  const mount = document.querySelector("[data-rail-events]");
  if (!mount) return;

  const { upcoming, past } = splitEventsByDate(sideEvents);
  const ordered = upcoming.length ? upcoming : past.slice().reverse();
  const limited = ordered.slice(0, 3);

  if (!limited.length) {
    mount.innerHTML = `<p class="muted">${t("events.none")}</p>`;
    return;
  }

  mount.innerHTML = `
    <div class="page-rail__event-list">
      ${limited
        .map((eventItem) => {
          const dateLabel = formatDateTime(eventItem?.date, eventItem?.time);
          const location = [eventItem?.region, eventItem?.venue].filter(Boolean).map(escapeHTML).join(" - ");
          const status = escapeHTML(localizedEventStatus(eventItem));
          const title = escapeHTML(eventItem?.title || t("events.untitled"));
          const href = escapeHTML(eventPath(eventItem?.id || ""));
          const label = "Bekijk event";

          return `
            <article class="page-rail__event">
              <a class="page-rail__event-main" href="${href}">
                <div class="page-rail__event-top">
                  <p class="page-rail__event-status">${status}</p>
                </div>
                <h4>${title}</h4>
                <p class="page-rail__event-meta">${escapeHTML(dateLabel)}${location ? ` <span class="dot-sep"></span> ${location}` : ""}</p>
                <p class="page-rail__event-hint">${label}</p>
              </a>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

export async function renderEvents(sideKey, { baseDepth = 0 } = {}) {
  const mount = document.querySelector("[data-events]");
  if (mount) {
    mount.innerHTML = `<p class="muted">${t("events.loading")}</p>`;
  }

  try {
    const [eventsData, artistsData] = await Promise.all([
      loadEvents({ baseDepth }),
      loadArtists({ baseDepth })
    ]);

    const sideEvents = pickSideCollection(eventsData, sideKey).slice();
    sideEvents.sort((a, b) => String(a?.date || "").localeCompare(String(b?.date || "")));

    renderRailEvents(sideEvents, sideKey);

    if (!sideEvents.length) {
      if (mount) {
        mount.innerHTML = `<p class="muted">${t("events.none")}</p>`;
      }
      return;
    }

    const { upcoming, past } = splitEventsByDate(sideEvents);
    const ordered = [...upcoming, ...past.reverse()];

    if (mount) {
      mount.innerHTML = `
        <div class="event-list">
          ${ordered.map((eventItem) => eventCard(eventItem, artistsData, sideKey)).join("")}
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
    if (mount) {
      mount.innerHTML = `<p class="muted">${t("events.error")}</p>`;
    }
    renderRailEvents([], sideKey);
  }
}
