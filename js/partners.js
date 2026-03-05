import { loadPartners } from "./core/content-api.js";
import { asArray, escapeHTML } from "./core/format.js";
import { t } from "./core/i18n.js";
import { renderSocialRail } from "./core/social-links.js";

function initials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "KW";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function renderTags(tags) {
  const list = asArray(tags).filter(Boolean).slice(0, 3);
  if (!list.length) return "";
  return `<div class="partner-card__tags">${list.map((tag) => `<span class="tag-pill">${escapeHTML(tag)}</span>`).join("")}</div>`;
}

function resolveAssetPath(path, baseDepth = 0) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  const relativePrefix = "../".repeat(Math.max(0, Number(baseDepth) || 0));
  return `${relativePrefix}${raw.replace(/^\.?\//, "")}`;
}

function renderPartnerMark(partner, baseDepth) {
  const logoSrc = resolveAssetPath(partner?.logo, baseDepth);
  if (!logoSrc) return `<div class="partner-card__mark" aria-hidden="true">${escapeHTML(initials(partner?.name || ""))}</div>`;
  const logoMode = String(partner?.logoMode || "").toLowerCase();
  let modeClass = "";
  if (logoMode === "wordmark") modeClass = " partner-card__mark--wordmark";
  if (logoMode === "wide") modeClass = " partner-card__mark--wide";

  return `
    <div class="partner-card__mark partner-card__mark--logo${modeClass}">
      <img src="${escapeHTML(logoSrc)}" alt="${escapeHTML(partner?.name || "Partner")} logo" loading="lazy" decoding="async">
    </div>
  `;
}

function firstExternalLink(partner) {
  const links = asArray(partner?.links);
  const item = links.find((link) => /^https?:\/\//i.test(String(link?.url || "")));
  return item ? String(item.url).trim() : "";
}

function partnerCard(partner, baseDepth) {
  const name = escapeHTML(partner?.name || "Partner");
  const type = escapeHTML(partner?.type || "");
  const region = escapeHTML(partner?.region || "");
  const links = renderSocialRail(partner?.links, {
    variant: "full",
    limit: 5,
    className: "partner-card__socials"
  });
  const externalUrl = firstExternalLink(partner);
  const hasExternal = Boolean(externalUrl);
  const safeUrl = escapeHTML(externalUrl);
  const titleMarkup = `
        <div class="partner-card__title">
          <h3>${name}</h3>
          ${type ? `<p class="muted">${type}</p>` : ""}
        </div>
      `;
  const headMark = renderPartnerMark(partner, baseDepth);

  return `
    <article class="tile-card tile-card--partner">
      <div class="partner-card__head">
        ${hasExternal ? `<a class="partner-card__logo-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer" aria-label="${name}">${headMark}</a>` : headMark}
        ${hasExternal ? `<a class="partner-card__title-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${titleMarkup}</a>` : titleMarkup}
      </div>

      ${region ? `<p class="partner-card__meta muted">${region}</p>` : ""}
      ${renderTags(partner?.tags)}

      <div class="partner-card__actions">
        ${links || `<span class="muted">${t("partners.linksPending")}</span>`}
      </div>
    </article>
  `;
}

export async function renderPartners({ baseDepth = 0 } = {}) {
  const mount = document.querySelector("[data-partners]");
  if (!mount) return;

  mount.innerHTML = `<p class="muted">${t("partners.loading")}</p>`;

  try {
    const data = await loadPartners({ baseDepth });
    const partners = asArray(data?.partners).filter((partner) => !partner?.internal);

    if (!partners.length) {
      mount.innerHTML = `<p class="muted">${t("partners.empty")}</p>`;
      return;
    }

    mount.innerHTML = `<div class="tile-grid tile-grid--partners">${partners.map((partner) => partnerCard(partner, baseDepth)).join("")}</div>`;
  } catch (error) {
    console.error(error);
    mount.innerHTML = `<p class="muted">${t("partners.error")}</p>`;
  }
}
