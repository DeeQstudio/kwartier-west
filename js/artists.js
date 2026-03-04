import { loadArtists, pickSideCollection } from "./core/content-api.js";
import { artistPath, asArray, escapeHTML, normalizeSlug } from "./core/format.js";
import { t } from "./core/i18n.js";
import { renderSocialRail } from "./core/social-links.js?v=20260304g";

function artistSort(a, b) {
  const aLead = Boolean(a?.lead);
  const bLead = Boolean(b?.lead);
  if (aLead !== bLead) return aLead ? -1 : 1;

  const aPriority = Number(a?.priority || 0);
  const bPriority = Number(b?.priority || 0);
  if (aPriority !== bPriority) return bPriority - aPriority;

  return String(a?.name || "").localeCompare(String(b?.name || ""));
}

function renderTags(tags) {
  const safeTags = asArray(tags).slice(0, 3).map((tag) => escapeHTML(tag));
  if (!safeTags.length) return "";

  return `<div class="artist-card__tags">${safeTags.map((tag) => `<span class="tag-pill">${tag}</span>`).join("")}</div>`;
}

function artistCard(artist, sideKey) {
  const slugValue = normalizeSlug(artist?.slug);
  const slug = encodeURIComponent(slugValue);
  const profileHref = escapeHTML(artistPath(sideKey, slugValue));
  const isLabelHead = slugValue === "onschuldig";
  const name = escapeHTML(artist?.name || t("artists.defaultName"));
  const role = escapeHTML(artist?.role || t("artists.defaultRole"));
  const city = escapeHTML(artist?.city || "");
  const language = escapeHTML(artist?.lang || "");
  const summary = escapeHTML(artist?.headline || artist?.bio || "");
  const photo = escapeHTML(artist?.photo || "");
  const socials = renderSocialRail(artist?.links, {
    variant: "icon",
    limit: 5,
    className: "artist-card__socials"
  });

  return `
    <article class="artist-card${artist?.lead ? " is-lead" : ""}${isLabelHead ? " is-label-head" : ""}" data-artist="${escapeHTML(slugValue)}">
      <a class="artist-card__hit" href="${profileHref}" aria-label="${t("common.profile")} ${name}"></a>

      <div class="artist-card__media${photo ? "" : " is-empty"}">
        ${photo ? `<img src="${photo}" alt="${name}" loading="lazy">` : `<span>${t("common.noPhoto")}</span>`}
      </div>

      <div class="artist-card__body">
        <div class="artist-card__head">
          <h3>${name}</h3>
          <span class="artist-card__role">${role}</span>
        </div>

        <p class="artist-card__meta">${city}${language ? ` <span class="dot-sep"></span> ${language}` : ""}</p>
        ${summary ? `<p class="artist-card__summary">${summary}</p>` : ""}
        ${renderTags(artist?.tags)}
        ${socials}

        <div class="inline-actions artist-card__actions">
          <a class="chip-link" href="${profileHref}">${t("artists.profile")}</a>
          <a class="chip-link" href="./booking.html?type=single&artists=${slug}">${t("artists.bookSolo")}</a>
        </div>
      </div>
    </article>
  `;
}

function iconColumnsByViewport() {
  if (window.matchMedia("(max-width: 360px)").matches) return 2;
  if (window.matchMedia("(max-width: 640px)").matches) return 3;
  if (window.matchMedia("(max-width: 980px)").matches) return 4;
  return 5;
}

function applyArtistCardSocialGrid(mount) {
  if (!mount) return;
  const columns = iconColumnsByViewport();
  const rails = mount.querySelectorAll(".artist-card__socials.social-links--icon");
  rails.forEach((rail) => {
    rail.style.display = "grid";
    rail.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 2.05rem))`;
    rail.style.gap = "0.34rem";
    rail.style.justifyContent = "flex-start";
    rail.style.alignContent = "start";
    rail.style.maxWidth = "100%";
    rail.style.overflow = "hidden";
  });
}

export async function renderArtists(sideKey, { baseDepth = 0 } = {}) {
  const mount = document.querySelector("[data-artists]");
  if (!mount) return;

  mount.innerHTML = `<p class="muted">${t("artists.loading")}</p>`;

  try {
    const artistsData = await loadArtists({ baseDepth });
    const list = pickSideCollection(artistsData, sideKey).slice().sort(artistSort);

    if (!list.length) {
      mount.innerHTML = `<p class="muted">${t("artists.empty")}</p>`;
      return;
    }

    mount.innerHTML = `<div class="artist-grid">${list.map((artist) => artistCard(artist, sideKey)).join("")}</div>`;
    applyArtistCardSocialGrid(mount);
    window.addEventListener("resize", () => applyArtistCardSocialGrid(mount), { passive: true });
  } catch (error) {
    console.error(error);
    mount.innerHTML = `<p class="muted">${t("artists.error")}</p>`;
  }
}
