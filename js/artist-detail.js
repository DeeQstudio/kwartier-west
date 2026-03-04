import { findArtistBySlug, loadArtists } from "./core/content-api.js";
import { artistPath, asArray, decodeHTMLEntities, escapeHTML, normalizeSlug, sideLabel } from "./core/format.js";
import { t } from "./core/i18n.js";
import { normalizeSocialLinks, renderSocialRail } from "./core/social-links.js?v=20260304f";

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  const querySlug = normalizeSlug(params.get("slug") || "");
  if (querySlug) return querySlug;

  const hashSlug = normalizeSlug(String(window.location.hash || "").replace(/^#slug=/i, ""));
  if (hashSlug) return hashSlug;

  const match = window.location.pathname.match(/\/pages\/(tekno|hiphop)\/artist\/([^/?#]+)/i);
  if (!match?.[2]) return "";

  try {
    return normalizeSlug(decodeURIComponent(match[2]));
  } catch {
    return normalizeSlug(match[2]);
  }
}

function redirectLegacyArtistUrl(sideKey) {
  const pathname = String(window.location.pathname || "");
  if (!/\/pages\/(?:tekno|hiphop)\/artist\.html$/i.test(pathname)) return false;

  const params = new URLSearchParams(window.location.search);
  const querySlug = normalizeSlug(params.get("slug") || "");
  const hashSlug = normalizeSlug(String(window.location.hash || "").replace(/^#slug=/i, ""));
  const slug = querySlug || hashSlug;
  if (!slug) return false;

  const safeSide = ["tekno", "hiphop"].includes(sideKey) ? sideKey : "hiphop";
  const destination = artistPath(safeSide, slug);
  const current = `${pathname}${window.location.search || ""}${window.location.hash || ""}`;

  if (!destination || current === destination) return false;
  window.location.replace(destination);
  return true;
}

function absoluteUrl(pathOrUrl) {
  const value = String(pathOrUrl || "").trim();
  if (!value) return "";
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return "";
  }
}

function setMetaByName(name, content) {
  if (!name || !content) return;
  const node = document.querySelector(`meta[name="${name}"]`);
  if (node) node.setAttribute("content", content);
}

function setMetaByProperty(property, content) {
  if (!property || !content) return;
  const node = document.querySelector(`meta[property="${property}"]`);
  if (node) node.setAttribute("content", content);
}

function setCanonical(url) {
  if (!url) return;
  let node = document.querySelector('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }
  node.setAttribute("href", url);
}

function clearArtistJsonLd() {
  document.querySelectorAll('script[data-artist-jsonld="true"]').forEach((node) => node.remove());
}

function bookingPath(sideKey, type, slug) {
  const safeSide = ["tekno", "hiphop"].includes(sideKey) ? sideKey : "hiphop";
  const safeType = normalizeSlug(type || "single") || "single";
  const params = new URLSearchParams();
  params.set("type", safeType);
  if (slug) params.set("artists", normalizeSlug(slug));
  return `/pages/${safeSide}/booking.html?${params.toString()}`;
}

function cleanText(value = "") {
  return decodeHTMLEntities(String(value || "").trim());
}

function uniqueParagraphs(values = []) {
  const seen = new Set();
  const result = [];

  for (const value of asArray(values)) {
    const raw = cleanText(value);
    if (!raw) continue;

    const chunks = raw
      .split(/\r?\n+/)
      .map((chunk) => chunk.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      const key = chunk.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(chunk);
    }
  }

  return result;
}

function truncateText(value = "", maxLength = 240) {
  const source = cleanText(value).replace(/\s+/g, " ").trim();
  if (!source || source.length <= maxLength) return source;

  const slice = source.slice(0, Math.max(1, maxLength - 1));
  const safeCut = slice.lastIndexOf(" ");
  const clipped = safeCut > 80 ? slice.slice(0, safeCut) : slice;
  return `${clipped.trim()}...`;
}

function applyHeroSocialGrid(root) {
  const rail = root?.querySelector?.(".artist-hero__socials.social-links--full");
  if (!rail) return;

  const columns = window.matchMedia("(max-width: 360px)").matches ? 1 : 2;
  rail.style.display = "grid";
  rail.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  rail.style.gap = "0.34rem 0.44rem";
  rail.style.width = "100%";

  rail.querySelectorAll(".social-link").forEach((node) => {
    node.style.display = "grid";
    node.style.gridTemplateColumns = "auto minmax(0, 1fr)";
    node.style.alignItems = "center";
    node.style.width = "100%";
    node.style.minWidth = "0";
    node.style.gap = "0.52rem";
  });
}

function applyArtistSeo(artist, sideKey, slug, links = []) {
  const artistName = String(artist?.name || "").trim();
  const sideName = sideLabel(sideKey) || sideKey;
  const summary = String(artist?.headline || artist?.bio || artist?.story || "").trim();
  const safeDescription = summary || `${artistName} binnen ${sideName} van Kwartier West.`;
  const baseUrl = window.location.origin;
  const canonicalUrl = absoluteUrl(artistPath(sideKey, slug));
  const photoUrl = absoluteUrl(artist?.photo);
  const title = artistName ? `${artistName} | Kwartier West` : "Kwartier West - Artiest";

  if (title) {
    document.title = title;
    setMetaByProperty("og:title", title);
    setMetaByName("twitter:title", title);
  }

  if (safeDescription) {
    setMetaByName("description", safeDescription);
    setMetaByProperty("og:description", safeDescription);
    setMetaByName("twitter:description", safeDescription);
  }

  if (canonicalUrl) {
    setCanonical(canonicalUrl);
    setMetaByProperty("og:url", canonicalUrl);
  }

  if (photoUrl) {
    setMetaByProperty("og:image", photoUrl);
    setMetaByProperty("og:image:secure_url", photoUrl);
    setMetaByName("twitter:image", photoUrl);
  }

  clearArtistJsonLd();
  if (!artistName || !canonicalUrl) return;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${canonicalUrl}#artist`,
    name: artistName,
    url: canonicalUrl,
    description: safeDescription,
    genre: [String(sideName || "").trim()].filter(Boolean),
    image: photoUrl || undefined,
    sameAs: links.map((entry) => String(entry?.url || "").trim()).filter(Boolean),
    memberOf: {
      "@type": "Organization",
      name: "Kwartier West",
      url: `${baseUrl}/`
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.artistJsonld = "true";
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

export async function renderArtistDetail(sideKey, { baseDepth = 0 } = {}) {
  const root = document.querySelector("[data-artist-root]");
  const heroTitle = document.querySelector("[data-artist-page-title]");
  const heroLead = document.querySelector("[data-artist-page-lead]");
  if (!root) return;

  if (redirectLegacyArtistUrl(sideKey)) {
    return;
  }

  function setHero(title = "", lead = "") {
    const cleanTitle = decodeHTMLEntities(title);
    const cleanLead = decodeHTMLEntities(lead);
    if (heroTitle && cleanTitle) heroTitle.textContent = cleanTitle;
    if (heroLead && cleanLead) heroLead.textContent = cleanLead;
  }

  root.innerHTML = `<p class="muted">${t("artist.loading")}</p>`;

  try {
    const artistsData = await loadArtists({ baseDepth });
    const requestedSlug = getSlug();
    let resolvedSlug = requestedSlug;

    if (!resolvedSlug) {
      const preferredSide = asArray(artistsData?.[sideKey]);
      const pool = preferredSide.length
        ? preferredSide
        : [...asArray(artistsData?.hiphop), ...asArray(artistsData?.tekno)];

      const fallback = pool
        .slice()
        .sort((a, b) => Number(b?.priority || 0) - Number(a?.priority || 0))[0];

      const fallbackSlug = normalizeSlug(fallback?.slug || "");
      if (fallbackSlug) {
        resolvedSlug = fallbackSlug;
        const fallbackSide = ["tekno", "hiphop"].includes(sideKey)
          ? sideKey
          : normalizeSlug(fallback?.collective || "hiphop");
        const nextUrl = artistPath(fallbackSide, fallbackSlug);
        window.history.replaceState({}, "", nextUrl);
      }
    }

    if (!resolvedSlug) {
      root.innerHTML = `<p class="muted">${t("artist.notSelected")}</p>`;
      setHero(t("artists.profile"), t("artist.notSelected"));
      return;
    }

    const found = findArtistBySlug(artistsData, resolvedSlug);

    if (!found) {
      root.innerHTML = `<p class="muted">${t("artist.notFound")}</p>`;
      setHero(t("artists.profile"), t("artist.notFound"));
      return;
    }

    const currentSide = found.sideKey;
    if (sideKey && ["tekno", "hiphop"].includes(sideKey) && sideKey !== currentSide) {
      const wrongSideBody = t("artist.wrongSideBody", {
        name: found.artist.name,
        side: sideLabel(currentSide)
      });
      const wrongSideBodySafe = t("artist.wrongSideBody", {
        name: escapeHTML(found.artist.name),
        side: escapeHTML(sideLabel(currentSide))
      });
      applyArtistSeo(found.artist, currentSide, resolvedSlug, normalizeSocialLinks(found.artist.links));
      setHero(t("artists.profile"), wrongSideBody);

      root.innerHTML = `
        <div class="surface">
          <h2>${t("artist.wrongSideTitle")}</h2>
          <p class="muted">${wrongSideBodySafe}</p>
          <div class="inline-actions">
            <a class="chip-link" href="${escapeHTML(artistPath(currentSide, resolvedSlug))}">${t("artist.openCorrect")}</a>
          </div>
        </div>
      `;
      return;
    }

    const artist = found.artist;
    const photo = escapeHTML(cleanText(artist.photo || ""));
    const nameText = cleanText(artist.name || t("artists.defaultName"));
    const roleText = cleanText(artist.role || t("artists.defaultRole"));
    const cityText = cleanText(artist.city || "");
    const langText = cleanText(artist.lang || "");
    const headlineText = cleanText(artist.headline || "");
    const bioText = cleanText(artist.bio || "");
    const storyText = cleanText(artist.story || "");
    const liveText = cleanText(artist.live || "");
    const summaryText = headlineText || bioText || storyText || liveText;
    const detailParagraphs = uniqueParagraphs([
      bioText && bioText !== summaryText ? bioText : "",
      storyText && storyText !== summaryText ? storyText : "",
      liveText && liveText !== summaryText ? liveText : ""
    ]);
    const previewText = truncateText(detailParagraphs[0] || "", 240);
    const hasFullBio = detailParagraphs.length > 0;
    const artistSlug = normalizeSlug(artist.slug || "");
    const panelId = `artist-full-bio-${artistSlug || "profile"}`;
    const fullBioTitle = t("artist.bio.fullTitle", { name: nameText || t("artists.defaultName") });
    const fullBioHtml = detailParagraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
    const name = escapeHTML(nameText);
    const role = escapeHTML(roleText);
    const city = escapeHTML(cityText);
    const lang = escapeHTML(langText);
    const summary = escapeHTML(summaryText);
    const preview = escapeHTML(previewText);
    const tags = asArray(artist.tags)
      .map((tag) => cleanText(tag))
      .filter(Boolean)
      .map((tag) => `<span class="tag-pill">${escapeHTML(tag)}</span>`)
      .join("");
    const signatureLine = escapeHTML(cleanText(artist.signatureLine || ""));
    const isSpotlightProfile =
      normalizeSlug(artist.profileStyle || "") === "spotlight" ||
      artistSlug === "de-kweker" ||
      artistSlug === "onschuldig";

    const links = normalizeSocialLinks(artist.links);
    const socialRail = renderSocialRail(links, {
      variant: "full",
      limit: 9,
      className: "artist-hero__socials"
    });
    applyArtistSeo(artist, currentSide, resolvedSlug, links);

    setHero(
      artist.name || t("artists.profile"),
      summaryText || `${roleText || t("artists.defaultRole")}${cityText ? ` - ${cityText}` : ""}`
    );

    root.innerHTML = `
      <section class="artist-hero${isSpotlightProfile ? " artist-hero--spotlight" : ""}" data-artist="${escapeHTML(artistSlug)}">
        <div class="artist-hero__media${photo ? "" : " is-empty"}">
          ${photo ? `<img src="${photo}" alt="${name}" loading="eager">` : `<span>${t("common.noPhoto")}</span>`}
        </div>

        <div class="artist-hero__body">
          <div class="artist-hero__intro">
            <p class="eyebrow">${escapeHTML(sideLabel(currentSide))} ${escapeHTML(t("artist.collectiveSuffix"))}</p>
            <h1>${name}</h1>
            <p class="artist-hero__meta">${role}${city ? ` <span class="dot-sep"></span> ${city}` : ""}${lang ? ` <span class="dot-sep"></span> ${lang}` : ""}</p>
            ${summary ? `<p class="artist-hero__summary">${summary}</p>` : ""}
            ${preview ? `<p class="artist-hero__preview">${preview}</p>` : ""}
            ${hasFullBio ? `<button type="button" class="chip-link artist-hero__bio-toggle" data-artist-bio-toggle aria-expanded="false" aria-controls="${panelId}">${escapeHTML(t("artist.bio.readMore"))}</button>` : ""}
            ${tags ? `<div class="artist-hero__tags">${tags}</div>` : ""}
          </div>

          <div class="artist-hero__lower">
            <div class="artist-hero__connect">
              <p class="eyebrow">${t("artist.section.channels")}</p>
              ${socialRail || `<p class="muted">${t("artist.linksEmpty")}</p>`}
            </div>

            <div class="artist-hero__booking">
              ${signatureLine ? `<p class="artist-hero__signature">${signatureLine}</p>` : ""}
              <div class="inline-actions artist-hero__actions">
                <a class="chip-link" href="${escapeHTML(bookingPath(currentSide, "single", resolvedSlug))}">${t("artist.bookSolo")}</a>
                <a class="chip-link" href="${escapeHTML(bookingPath(currentSide, "multiple", resolvedSlug))}">${t("artist.bookMultiple")}</a>
              </div>
            </div>
          </div>
        </div>

        ${
          hasFullBio
            ? `
              <div class="artist-bio-panel" id="${panelId}" data-artist-bio-panel hidden>
                <button type="button" class="artist-bio-panel__backdrop" data-artist-bio-close aria-label="${escapeHTML(t("artist.bio.close"))}"></button>
                <article class="artist-bio-panel__dialog" role="dialog" aria-modal="true" aria-labelledby="${panelId}-title">
                  <p class="eyebrow">${escapeHTML(sideLabel(currentSide))} ${escapeHTML(t("artist.collectiveSuffix"))}</p>
                  <h2 id="${panelId}-title">${escapeHTML(fullBioTitle)}</h2>
                  <div class="artist-bio-panel__content">${fullBioHtml}</div>
                  <div class="inline-actions artist-bio-panel__actions">
                    <button type="button" class="chip-link" data-artist-bio-close>${escapeHTML(t("artist.bio.close"))}</button>
                  </div>
                </article>
              </div>
            `
            : ""
        }
      </section>
    `;

    const bioToggle = root.querySelector("[data-artist-bio-toggle]");
    const bioPanel = root.querySelector("[data-artist-bio-panel]");
    if (bioToggle && bioPanel) {
      const closeTargets = Array.from(root.querySelectorAll("[data-artist-bio-close]"));
      const dialogCloseButton = closeTargets.find((node) => node.tagName.toLowerCase() === "button" && !node.classList.contains("artist-bio-panel__backdrop"));

      const closePanel = (restoreFocus = true) => {
        bioPanel.hidden = true;
        bioToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("artist-bio-open");
        if (restoreFocus) bioToggle.focus();
      };

      const openPanel = () => {
        bioPanel.hidden = false;
        bioToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("artist-bio-open");
        if (dialogCloseButton) dialogCloseButton.focus();
      };

      bioToggle.addEventListener("click", openPanel);
      closeTargets.forEach((node) =>
        node.addEventListener("click", (event) => {
          event.preventDefault();
          closePanel(true);
        })
      );

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !bioPanel.hidden) {
          event.preventDefault();
          closePanel(true);
        }
      });
    }

    applyHeroSocialGrid(root);
    window.addEventListener("resize", () => applyHeroSocialGrid(root), { passive: true });
  } catch (error) {
    console.error(error);
    root.innerHTML = `<p class="muted">${t("events.error")}</p>`;
    setHero(t("artists.profile"), t("events.error"));
  }
}
