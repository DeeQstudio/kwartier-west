import { escapeHTML, formatDateTime, sideLabel } from "./core/format.js";
import { t } from "./core/i18n.js";

const AUTO_ADVANCE_SECONDS = 10;
const AUTO_ADVANCE_MS = AUTO_ADVANCE_SECONDS * 1000;

const EDITIONS = [
  {
    id: "teknorelics-eye-of-the-temple",
    sideKey: "tekno",
    title: "Teknorelics: Eye of the Temple",
    date: "2026-03-28",
    time: "22:00",
    region: "Brugge",
    venue: "Het Entrepot",
    detailSlug: "tek-teknorelics-eye-of-the-temple-2026-03-28",
    summaryKey: "archive.edition.eye.summary",
    posterFile: "tek-eye-temple-poster.png",
    media: [
      { type: "image", file: "tek-eye-temple-poster.png", alt: "Officiele poster van Teknorelics: Eye of the Temple", caption: "Poster" },
      { type: "image", file: "tek-eye-temple-01.jpg", alt: "Sfeerbeeld 1 van Teknorelics: Eye of the Temple", caption: "Nacht 01" },
      { type: "image", file: "tek-eye-temple-02.jpg", alt: "Sfeerbeeld 2 van Teknorelics: Eye of the Temple", caption: "Nacht 02" },
      { type: "image", file: "tek-eye-temple-03.jpg", alt: "Sfeerbeeld 3 van Teknorelics: Eye of the Temple", caption: "Nacht 03" },
      { type: "image", file: "tek-eye-temple-04.jpg", alt: "Sfeerbeeld 4 van Teknorelics: Eye of the Temple", caption: "Nacht 04" },
      { type: "image", file: "tek-eye-temple-05.jpg", alt: "Sfeerbeeld 5 van Teknorelics: Eye of the Temple", caption: "Nacht 05" },
      { type: "image", file: "tek-eye-temple-06.jpg", alt: "Sfeerbeeld 6 van Teknorelics: Eye of the Temple", caption: "Nacht 06" },
      { type: "image", file: "tek-eye-temple-07.jpg", alt: "Sfeerbeeld 7 van Teknorelics: Eye of the Temple", caption: "Nacht 07" }
    ]
  }
];

function pathPrefix(baseDepth = 0) {
  return "../".repeat(Math.max(0, Number(baseDepth) || 0));
}

function mediaType(mediaItem) {
  return mediaItem?.type === "video" ? "video" : "photo";
}

function mediaBadgeLabel(type) {
  return type === "video" ? t("archive.media.video") : t("archive.media.photo");
}

function mediaSource(prefix, editionId, file) {
  return `${prefix}assets/img/archive/${editionId}/web/${file}`;
}

function normalizeEdition(value = "") {
  return String(value || "").trim().toLowerCase();
}

function readInitialEdition() {
  const params = new URLSearchParams(window.location.search || "");
  return normalizeEdition(params.get("edition") || "");
}

function syncEditionQuery(editionId, defaultEditionId) {
  if (!window.history?.replaceState) return;

  const params = new URLSearchParams(window.location.search || "");
  if (editionId && editionId !== defaultEditionId) params.set("edition", editionId);
  else params.delete("edition");

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function buildArchiveShell() {
  return `
    <div class="archive-layout">
      <section class="archive-profiles-wrap" id="archive-chooser">
        <h3>${escapeHTML(t("archive.profile.title"))}</h3>
        <div class="archive-profiles" data-archive-profiles></div>
      </section>
      <section class="archive-view" data-archive-view></section>
    </div>
  `;
}

function renderProfileCard(edition, isActive = false) {
  const dateLabel = formatDateTime(edition?.date, edition?.time);
  const location = [edition?.region, edition?.venue].filter(Boolean).join(" - ");
  const postCount = t("archive.profile.count", { count: edition?.media?.length || 0 });
  const aria = t("archive.profile.selectAria", { title: edition?.title || "" });
  const posterSrc = edition?.posterSrc || "";
  const posterAlt = edition?.title || "";

  return `
    <button
      class="archive-profile${isActive ? " is-active" : ""}"
      type="button"
      data-edition-select="${escapeHTML(edition?.id || "")}"
      aria-label="${escapeHTML(aria)}"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      <span class="archive-profile__media">
        <img loading="lazy" src="${escapeHTML(posterSrc)}" alt="${escapeHTML(posterAlt)}">
      </span>

      <span class="archive-profile__body">
        <span class="archive-profile__title">${escapeHTML(edition?.title || "")}</span>
        <span class="archive-profile__meta">${escapeHTML(dateLabel)}</span>
        <span class="archive-profile__meta">${escapeHTML(location)}</span>
        <span class="archive-profile__count">${escapeHTML(postCount)}</span>
      </span>
    </button>
  `;
}

function renderMediaCard(mediaItem, mediaIndex) {
  const type = mediaType(mediaItem);
  const badge = mediaBadgeLabel(type);
  const source = escapeHTML(mediaItem?.src || "");
  const caption = mediaItem?.caption || mediaItem?.alt || `Media ${mediaIndex + 1}`;

  if (type === "video") {
    const mime = escapeHTML(mediaItem?.mime || "video/mp4");
    return `
      <button class="archive-shot" type="button" data-media-index="${mediaIndex}" data-media-type="video">
        <span class="archive-shot__media">
          <video preload="metadata" muted playsinline aria-hidden="true">
            <source src="${source}" type="${mime}">
          </video>
        </span>
        <span class="archive-shot__badge">${escapeHTML(badge)}</span>
        <span class="archive-shot__caption">${escapeHTML(caption)}</span>
      </button>
    `;
  }

  return `
    <button class="archive-shot" type="button" data-media-index="${mediaIndex}" data-media-type="photo">
      <span class="archive-shot__media">
        <img loading="lazy" src="${source}" alt="${escapeHTML(mediaItem?.alt || caption)}">
      </span>
      <span class="archive-shot__badge">${escapeHTML(badge)}</span>
      <span class="archive-shot__caption">${escapeHTML(caption)}</span>
    </button>
  `;
}

function renderEditionView(edition, prefix) {
  const dateLabel = formatDateTime(edition?.date, edition?.time);
  const location = [edition?.region, edition?.venue].filter(Boolean).join(" - ");
  const detailHref = `${prefix}pages/events/detail/${encodeURIComponent(edition?.detailSlug || "")}`;
  const eventsHref = `${prefix}pages/events/index.html?scope=past`;
  const summary = edition?.summaryKey ? t(edition.summaryKey) : "";

  return `
    <article class="archive-edition" id="edition-${escapeHTML(edition?.id || "edition")}">
      <header class="archive-edition__header">
        <p class="archive-edition__badges">
          <span class="status-pill">${escapeHTML(sideLabel(edition?.sideKey))}</span>
          <span class="status-pill">${escapeHTML(t("archive.edition.statusPast"))}</span>
        </p>
        <h2>${escapeHTML(edition?.title || "")}</h2>
        <p class="archive-edition__meta">
          ${escapeHTML(dateLabel)}
          ${location ? `<span class="dot-sep"></span>${escapeHTML(location)}` : ""}
        </p>
        <p class="archive-edition__lead">${escapeHTML(summary)}</p>
        <div class="inline-actions">
          <a class="chip-link" href="${escapeHTML(detailHref)}">${escapeHTML(t("archive.edition.ctaEvent"))}</a>
          <a class="chip-link" href="${escapeHTML(eventsHref)}">${escapeHTML(t("archive.edition.ctaEvents"))}</a>
        </div>
      </header>

      <p class="muted archive-edition__count">${escapeHTML(t("archive.feed.count", { count: edition?.media?.length || 0 }))}</p>
      <div class="archive-feed" data-archive-feed>
        ${(edition?.media || []).map((mediaItem, mediaIndex) => renderMediaCard(mediaItem, mediaIndex)).join("")}
      </div>
    </article>
  `;
}

function lightboxShell() {
  const lightbox = document.createElement("div");
  lightbox.className = "archive-lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");

  lightbox.innerHTML = `
    <div class="archive-lightbox__dialog" role="dialog" aria-modal="true" aria-label="${escapeHTML(t("archive.lightbox.title"))}">
      <div class="archive-lightbox__top">
        <p class="archive-lightbox__title">${escapeHTML(t("archive.lightbox.title"))}</p>
        <button class="archive-lightbox__close" type="button" data-lightbox-close aria-label="${escapeHTML(t("archive.lightbox.close"))}">
          ${escapeHTML(t("archive.lightbox.close"))}
        </button>
      </div>

      <div class="archive-lightbox__media" data-lightbox-media></div>

      <div class="archive-lightbox__bottom">
        <button class="archive-lightbox__nav" type="button" data-lightbox-prev aria-label="${escapeHTML(t("archive.lightbox.prev"))}">
          ${escapeHTML(t("archive.lightbox.prev"))}
        </button>
        <div class="archive-lightbox__meta">
          <p class="archive-lightbox__counter" data-lightbox-counter></p>
          <p class="archive-lightbox__auto">${escapeHTML(t("archive.lightbox.auto", { seconds: AUTO_ADVANCE_SECONDS }))}</p>
        </div>
        <button class="archive-lightbox__nav" type="button" data-lightbox-next aria-label="${escapeHTML(t("archive.lightbox.next"))}">
          ${escapeHTML(t("archive.lightbox.next"))}
        </button>
      </div>

      <p class="archive-lightbox__caption muted" data-lightbox-caption></p>
    </div>
  `;

  document.body.append(lightbox);

  return {
    lightbox,
    mediaHost: lightbox.querySelector("[data-lightbox-media]"),
    closeButton: lightbox.querySelector("[data-lightbox-close]"),
    prevButton: lightbox.querySelector("[data-lightbox-prev]"),
    nextButton: lightbox.querySelector("[data-lightbox-next]"),
    counterNode: lightbox.querySelector("[data-lightbox-counter]"),
    captionNode: lightbox.querySelector("[data-lightbox-caption]")
  };
}

export function mountArchivePage({ baseDepth = 0 } = {}) {
  const root = document.querySelector("[data-archive-root]");
  if (!root) return;

  const prefix = pathPrefix(baseDepth);
  const editions = EDITIONS.map((edition) => ({
    ...edition,
    posterSrc: mediaSource(prefix, edition.id, edition.posterFile),
    media: (edition.media || []).map((mediaItem) => ({
      ...mediaItem,
      src: mediaSource(prefix, edition.id, mediaItem.file)
    }))
  }));

  if (!editions.length) {
    root.innerHTML = `<p class="muted">${escapeHTML(t("archive.profile.none"))}</p>`;
    return;
  }

  root.innerHTML = buildArchiveShell();

  const profilesHost = root.querySelector("[data-archive-profiles]");
  const viewHost = root.querySelector("[data-archive-view]");
  if (!profilesHost || !viewHost) return;

  const lightboxState = lightboxShell();
  if (
    !lightboxState.lightbox ||
    !lightboxState.mediaHost ||
    !lightboxState.closeButton ||
    !lightboxState.prevButton ||
    !lightboxState.nextButton ||
    !lightboxState.counterNode ||
    !lightboxState.captionNode
  ) {
    lightboxState.lightbox?.remove();
    return;
  }

  const defaultEditionId = editions[0].id;
  const initialEdition = readInitialEdition();

  let activeEditionId = editions.some((edition) => edition.id === initialEdition) ? initialEdition : defaultEditionId;
  let activeMediaIndex = -1;
  let autoplayTimer = null;
  let lastFocused = null;

  function activeEdition() {
    return editions.find((edition) => edition.id === activeEditionId) || editions[0];
  }

  function activeMediaList() {
    return activeEdition()?.media || [];
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    const media = activeMediaList();
    if (media.length <= 1) return;

    autoplayTimer = window.setInterval(() => {
      stepLightbox(1, { restartAutoplay: false });
    }, AUTO_ADVANCE_MS);
  }

  function mediaAtIndex() {
    const media = activeMediaList();
    if (activeMediaIndex < 0 || activeMediaIndex >= media.length) return null;
    return media[activeMediaIndex];
  }

  function renderLightboxFrame() {
    const item = mediaAtIndex();
    if (!item) return;

    const media = activeMediaList();
    lightboxState.mediaHost.innerHTML = "";

    if (mediaType(item) === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = item.src;
      if (item.poster) video.poster = item.poster;
      lightboxState.mediaHost.append(video);
    } else {
      const image = document.createElement("img");
      image.src = item.src;
      image.alt = item.alt || item.caption || activeEdition()?.title || "";
      image.loading = "eager";
      lightboxState.mediaHost.append(image);
    }

    lightboxState.captionNode.textContent = item.caption || item.alt || activeEdition()?.title || "";
    lightboxState.counterNode.textContent = t("archive.lightbox.counter", {
      current: activeMediaIndex + 1,
      total: media.length
    });

    const hasMultiple = media.length > 1;
    lightboxState.prevButton.disabled = !hasMultiple;
    lightboxState.nextButton.disabled = !hasMultiple;
  }

  function closeLightbox() {
    if (lightboxState.lightbox.hidden) return;
    stopAutoplay();
    lightboxState.mediaHost.innerHTML = "";
    lightboxState.lightbox.hidden = true;
    lightboxState.lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("archive-lightbox-open");

    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }

  function openLightbox(position) {
    const media = activeMediaList();
    if (position < 0 || position >= media.length) return;

    activeMediaIndex = position;
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    lightboxState.lightbox.hidden = false;
    lightboxState.lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("archive-lightbox-open");
    renderLightboxFrame();
    startAutoplay();
    lightboxState.closeButton.focus();
  }

  function stepLightbox(offset, { restartAutoplay = true } = {}) {
    const media = activeMediaList();
    if (!media.length) return;

    const total = media.length;
    activeMediaIndex = (activeMediaIndex + offset + total) % total;
    renderLightboxFrame();

    if (restartAutoplay) {
      startAutoplay();
    }
  }

  function renderProfiles() {
    profilesHost.innerHTML = editions.map((edition) => renderProfileCard(edition, edition.id === activeEditionId)).join("");
  }

  function renderActiveEdition() {
    const edition = activeEdition();
    viewHost.innerHTML = renderEditionView(edition, prefix);

    const feedNode = viewHost.querySelector("[data-archive-feed]");
    if (!feedNode) return;

    feedNode.addEventListener("click", (event) => {
      const trigger = event.target instanceof HTMLElement ? event.target.closest("[data-media-index]") : null;
      if (!(trigger instanceof HTMLElement)) return;

      const mediaIndex = Number.parseInt(trigger.getAttribute("data-media-index") || "", 10);
      if (!Number.isInteger(mediaIndex)) return;
      openLightbox(mediaIndex);
    });
  }

  function setActiveEdition(nextEditionId) {
    const normalized = normalizeEdition(nextEditionId);
    const exists = editions.some((edition) => edition.id === normalized);
    activeEditionId = exists ? normalized : defaultEditionId;
    activeMediaIndex = -1;
    closeLightbox();
    renderProfiles();
    renderActiveEdition();
    syncEditionQuery(activeEditionId, defaultEditionId);
  }

  profilesHost.addEventListener("click", (event) => {
    const trigger = event.target instanceof HTMLElement ? event.target.closest("[data-edition-select]") : null;
    if (!(trigger instanceof HTMLElement)) return;
    const nextEditionId = trigger.getAttribute("data-edition-select") || "";
    setActiveEdition(nextEditionId);
  });

  lightboxState.closeButton.addEventListener("click", closeLightbox);
  lightboxState.prevButton.addEventListener("click", () => stepLightbox(-1));
  lightboxState.nextButton.addEventListener("click", () => stepLightbox(1));
  lightboxState.lightbox.addEventListener("click", (event) => {
    if (event.target === lightboxState.lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (lightboxState.lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });

  setActiveEdition(activeEditionId);
}
