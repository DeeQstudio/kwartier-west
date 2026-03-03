import { loadArtists, loadIntegrations } from "./core/content-api.js";
import { asArray, bookingReference, escapeHTML, normalizeSlug, sideLabel } from "./core/format.js";
import { t } from "./core/i18n.js";
import { postJSONWithTimeout, resolveEndpoint } from "./core/integration-client.js";

const STORAGE_KEY = "kw.booking.last";

const TYPE_META = {
  single: {
    labelKey: "booking.type.single.label",
    hintKey: "booking.type.single.hint"
  },
  multiple: {
    labelKey: "booking.type.multiple.label",
    hintKey: "booking.type.multiple.hint"
  },
  collective_side: {
    labelKey: "booking.type.side.label",
    hintKey: "booking.type.side.hint"
  },
  collective_full: {
    labelKey: "booking.type.full.label",
    hintKey: "booking.type.full.hint"
  }
};

function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  const type = normalizeSlug(params.get("type") || "");
  const artists = (params.get("artists") || "")
    .split(",")
    .map((value) => normalizeSlug(value))
    .filter(Boolean);
  const side = normalizeSlug(params.get("side") || "");

  return { type, artists, side };
}

function validTypes(isGlobal) {
  return isGlobal ? ["single", "multiple", "collective_side", "collective_full"] : ["single", "multiple", "collective_side"];
}

function artistOption(sideKey, artist, selected = false) {
  const slug = escapeHTML(artist?.slug || "");
  const name = escapeHTML(artist?.name || t("artists.defaultName"));
  const role = escapeHTML(artist?.role || t("artists.defaultRole"));
  const marker = sideKey === "tekno" ? "TEK" : "HIP";

  return `
    <label class="artist-pick">
      <input type="checkbox" value="${slug}" data-artist-checkbox ${selected ? "checked" : ""}>
      <span>
        <strong>${name}</strong>
        <small>${escapeHTML(marker)} <span class="dot-sep"></span> ${role}</small>
      </span>
    </label>
  `;
}

function flattenArtistsBySide(data, sideMode) {
  const pick = [];

  if (sideMode === "tekno" || sideMode === "both") {
    for (const artist of asArray(data?.tekno)) pick.push({ ...artist, sideKey: "tekno" });
  }

  if (sideMode === "hiphop" || sideMode === "both") {
    for (const artist of asArray(data?.hiphop)) pick.push({ ...artist, sideKey: "hiphop" });
  }

  return pick;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function collectChecked(root) {
  return Array.from(root.querySelectorAll("[data-artist-checkbox]:checked")).map((el) => normalizeSlug(el.value));
}

function collectSideArtists(artistsData, side) {
  if (side === "tekno") return asArray(artistsData?.tekno).map((artist) => normalizeSlug(artist.slug));
  if (side === "hiphop") return asArray(artistsData?.hiphop).map((artist) => normalizeSlug(artist.slug));

  return [...asArray(artistsData?.tekno), ...asArray(artistsData?.hiphop)].map((artist) => normalizeSlug(artist.slug));
}

function formTemplate({ sideKey, prefilledType }) {
  const isGlobal = sideKey === "all";

  return `
    <form class="booking-form" novalidate aria-describedby="booking-type-hint booking-form-note">
      <section class="booking-section">
        <h3 class="booking-section__title">${t("booking.form.type")} / ${t("booking.form.collective")}</h3>

        <div class="form-grid">
          <label>
            <span>${t("booking.form.type")}</span>
            <select name="bookingType" data-booking-type aria-describedby="booking-type-hint">
              ${validTypes(isGlobal)
                .map(
                  (type) =>
                    `<option value="${type}" ${type === prefilledType ? "selected" : ""}>${t(TYPE_META[type].labelKey)}</option>`
                )
                .join("")}
            </select>
          </label>

          <label data-booking-side-wrap>
            <span>${t("booking.form.collective")}</span>
            ${isGlobal
              ? `<select name="side" data-booking-side aria-describedby="booking-type-hint">
                  <option value="tekno">${t("nav.tekno")}</option>
                  <option value="hiphop">${t("nav.hiphop")}</option>
                  <option value="both">${t("nav.tekno")} + ${t("nav.hiphop")}</option>
                </select>`
              : `<input type="text" value="${sideKey === "tekno" ? t("nav.tekno") : t("nav.hiphop")}" disabled>
                 <input type="hidden" name="side" value="${sideKey}">`}
          </label>
        </div>

        <p class="muted booking-hint" data-type-hint id="booking-type-hint"></p>

        <fieldset class="artist-picker" data-artist-picker>
          <legend>${t("booking.form.artistSelection")}</legend>
          <div class="artist-picker__list" data-artist-list></div>
        </fieldset>
      </section>

      <section class="booking-section">
        <h3 class="booking-section__title">${t("booking.summary.event")}</h3>

        <div class="form-grid">
          <label>
            <span>${t("booking.form.eventName")}</span>
            <input name="eventName" type="text" placeholder="${t("booking.form.placeholder.eventName")}">
          </label>

          <label>
            <span>${t("booking.form.eventDate")}</span>
            <input name="eventDate" type="date" required aria-required="true">
          </label>

          <label>
            <span>${t("booking.form.startTime")}</span>
            <input name="eventTime" type="time">
          </label>

          <label>
            <span>${t("booking.form.city")}</span>
            <input name="eventCity" type="text" placeholder="${t("booking.form.placeholder.city")}" required aria-required="true" autocomplete="address-level2">
          </label>

          <label>
            <span>${t("booking.form.venue")}</span>
            <input name="eventVenue" type="text" placeholder="${t("booking.form.placeholder.venue")}">
          </label>

          <label>
            <span>${t("booking.form.budget")}</span>
            <input name="budget" type="number" min="0" step="50" placeholder="${t("booking.form.placeholder.budget")}" inputmode="decimal">
          </label>
        </div>
      </section>

      <section class="booking-section">
        <h3 class="booking-section__title">${t("booking.summary.contact")}</h3>

        <div class="form-grid">
          <label>
            <span>${t("booking.form.contactName")}</span>
            <input name="contactName" type="text" required aria-required="true" placeholder="${t("booking.form.placeholder.contactName")}" autocomplete="name">
          </label>

          <label>
            <span>${t("booking.form.contactEmail")}</span>
            <input name="contactEmail" type="email" required aria-required="true" placeholder="${t("booking.form.placeholder.contactEmail")}" autocomplete="email">
          </label>

          <label>
            <span>${t("booking.form.phone")}</span>
            <input name="contactPhone" type="tel" placeholder="${t("booking.form.placeholder.phone")}" autocomplete="tel">
          </label>

          <label>
            <span>${t("booking.form.org")}</span>
            <input name="organisation" type="text" placeholder="${t("booking.form.placeholder.organisation")}" autocomplete="organization">
          </label>
        </div>
      </section>

      <div class="form-actions">
        <button type="submit" class="cta-btn" data-submit-btn>${t("booking.form.submit")}</button>
        <p class="muted" id="booking-form-note">${t("booking.form.helper")}</p>
      </div>
    </form>
  `;
}

function typeHint(type, side) {
  if (type === "collective_side") {
    if (side === "both") {
      return t("booking.form.chooseSide");
    }
    return t(TYPE_META[type].hintKey);
  }
  return t(TYPE_META[type]?.hintKey || "booking.type.single.hint");
}

function safeReadLastPayload() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function setField(form, name, value) {
  const field = form.querySelector(`[name="${name}"]`);
  if (!field) return;
  if (typeof value === "undefined" || value === null) return;
  field.value = String(value);
}

function prefillFromLastPayload(form, payload) {
  if (!payload || typeof payload !== "object") return;

  setField(form, "eventName", payload?.event?.name || "");
  setField(form, "eventDate", payload?.event?.date || "");
  setField(form, "eventTime", payload?.event?.time || "");
  setField(form, "eventCity", payload?.event?.city || "");
  setField(form, "eventVenue", payload?.event?.venue || "");
  setField(form, "budget", payload?.budget?.amount || "");
  setField(form, "contactName", payload?.contact?.name || "");
  setField(form, "contactEmail", payload?.contact?.email || "");
  setField(form, "contactPhone", payload?.contact?.phone || "");
  setField(form, "organisation", payload?.contact?.organisation || "");
}

async function pushBookingWebhook(payload, { baseDepth = 0 } = {}) {
  const integrations = await loadIntegrations({ baseDepth, revalidate: true });
  const webhook = integrations?.bookingWebhook || { enabled: false };

  if (!webhook.enabled || !webhook.endpoint) {
    return {
      attempted: false,
      ok: false,
      status: 0
    };
  }

  const endpoint = resolveEndpoint(webhook.endpoint, baseDepth);
  const headers = {};

  if (String(webhook.auth || "").toLowerCase() === "bearer-token" && webhook.authToken) {
    headers.Authorization = `Bearer ${webhook.authToken}`;
  }

  try {
    const result = await postJSONWithTimeout(endpoint, payload, {
      timeoutMs: Number(webhook.timeoutMs || 9000),
      headers
    });

    return {
      attempted: true,
      ok: result.ok,
      status: result.status
    };
  } catch (error) {
    console.error(error);
    return {
      attempted: true,
      ok: false,
      status: 0
    };
  }
}

function renderWebhookStatus(webhookResult) {
  if (!webhookResult?.attempted) {
    return `<p class="muted">${t("booking.result.webhookDisabled")}</p>`;
  }

  if (webhookResult.ok) {
    return `<p class="muted">${t("booking.result.webhookOk")}</p>`;
  }

  const detail = webhookResult?.status
    ? t("booking.result.webhookHttp", { status: webhookResult.status })
    : t("booking.result.webhookNetwork");

  return `<p class="error-text" role="alert">${t("booking.result.webhookFail")}: ${escapeHTML(detail)}</p>`;
}

function resetInvalidFields(form) {
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function showError(result, form, message, { fieldName = "", fallbackFocus } = {}) {
  result.innerHTML = `<p class="error-text" role="alert">${message}</p>`;

  if (fieldName) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field instanceof HTMLElement) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
      return;
    }
  }

  if (typeof fallbackFocus === "function") {
    fallbackFocus();
  }
}

export async function mountBookingDesk({ sideKey = "all", baseDepth = 0 } = {}) {
  const mount = document.querySelector("[data-booking-form]");
  const result = document.querySelector("[data-booking-result]");
  if (!mount || !result) return;

  result.setAttribute("aria-live", "polite");

  const isGlobal = sideKey === "all";
  const query = parseQuery();
  const types = validTypes(isGlobal);
  const initialType = types.includes(query.type) ? query.type : "single";

  mount.innerHTML = formTemplate({ sideKey, prefilledType: initialType });

  const form = mount.querySelector("form");
  const typeSelect = mount.querySelector("[data-booking-type]");
  const sideSelect = mount.querySelector("[data-booking-side]");
  const artistList = mount.querySelector("[data-artist-list]");
  const hint = mount.querySelector("[data-type-hint]");
  const submitButton = mount.querySelector("[data-submit-btn]");

  if (!form || !typeSelect || !artistList || !hint || !submitButton) return;

  const lastPayload = safeReadLastPayload();
  prefillFromLastPayload(form, lastPayload);

  let artistsData;
  try {
    artistsData = await loadArtists({ baseDepth });
  } catch {
    mount.innerHTML = `<p class="error-text">${t("booking.loadArtistsError")}</p>`;
    return;
  }

  if (sideSelect && ["tekno", "hiphop", "both"].includes(query.side)) {
    sideSelect.value = query.side;
  }

  function currentSide() {
    if (!isGlobal) return sideKey;
    return sideSelect?.value || "tekno";
  }

  function currentType() {
    return typeSelect.value;
  }

  function syncSideControl(type) {
    if (!isGlobal || !sideSelect) return;

    const sideWrap = sideSelect.closest("[data-booking-side-wrap]") || sideSelect.closest("label");
    if (!sideWrap) return;

    if (type === "collective_full") {
      sideSelect.value = "both";
      sideSelect.disabled = true;
      sideWrap.hidden = true;
      return;
    }

    sideSelect.disabled = false;
    sideWrap.hidden = false;

    if (type === "collective_side" && sideSelect.value === "both") {
      sideSelect.value = "tekno";
    }
  }

  function paintArtistOptions() {
    const type = currentType();
    syncSideControl(type);
    const side = currentSide();
    const artists = flattenArtistsBySide(artistsData, side).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    const selectedInUI = new Set(collectChecked(artistList));
    const selectedFromQuery = selectedInUI.size ? selectedInUI : new Set(query.artists);
    const hasSelectionMode = type === "single" || type === "multiple";

    const pickerFieldset = artistList.closest("fieldset");

    if (!hasSelectionMode) {
      artistList.innerHTML = `<p class="muted">${t("booking.form.artistNotNeeded")}</p>`;
      pickerFieldset?.setAttribute("aria-hidden", "true");
      pickerFieldset?.setAttribute("hidden", "hidden");
      hint.textContent = typeHint(type, side);
      return;
    }

    pickerFieldset?.setAttribute("aria-hidden", "false");
    pickerFieldset?.removeAttribute("hidden");
    hint.textContent = typeHint(type, side);

    artistList.innerHTML = artists
      .map((artist) => artistOption(artist.sideKey, artist, selectedFromQuery.has(normalizeSlug(artist.slug))))
      .join("");

    const checkboxes = artistList.querySelectorAll("[data-artist-checkbox]");

    if (type === "single") {
      let keptOne = false;
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked && !keptOne) {
          keptOne = true;
          return;
        }
        if (checkbox.checked) checkbox.checked = false;
      });
    }

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (currentType() !== "single" || !checkbox.checked) return;
        checkboxes.forEach((other) => {
          if (other !== checkbox) other.checked = false;
        });
      });
    });
  }

  typeSelect.addEventListener("change", () => {
    paintArtistOptions();
  });

  sideSelect?.addEventListener("change", () => {
    paintArtistOptions();
  });

  paintArtistOptions();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetInvalidFields(form);

    const formData = new FormData(form);
    const type = currentType();
    const side = currentSide();
    const effectiveSide = type === "collective_full" ? "both" : side;

    const selectedArtists = collectChecked(artistList);

    if (!formData.get("contactName")) {
      showError(result, form, t("booking.validate.name"), { fieldName: "contactName" });
      return;
    }

    if (!isEmail(formData.get("contactEmail"))) {
      showError(result, form, t("booking.validate.email"), { fieldName: "contactEmail" });
      return;
    }

    if (!formData.get("eventDate") || !formData.get("eventCity")) {
      const missingDate = !formData.get("eventDate");
      showError(result, form, t("booking.validate.event"), { fieldName: missingDate ? "eventDate" : "eventCity" });
      return;
    }

    if (type === "single" && selectedArtists.length !== 1) {
      showError(result, form, t("booking.validate.single"), {
        fallbackFocus: () => {
          const first = artistList.querySelector("[data-artist-checkbox]");
          if (first instanceof HTMLElement) first.focus();
        }
      });
      return;
    }

    if (type === "multiple" && selectedArtists.length < 2) {
      showError(result, form, t("booking.validate.multiple"), {
        fallbackFocus: () => {
          const first = artistList.querySelector("[data-artist-checkbox]");
          if (first instanceof HTMLElement) first.focus();
        }
      });
      return;
    }

    let artistPayload = selectedArtists;

    if (type === "collective_side") {
      if (effectiveSide === "both") {
        showError(result, form, t("booking.validate.side"), { fieldName: "side" });
        return;
      }
      artistPayload = collectSideArtists(artistsData, effectiveSide);
    }

    if (type === "collective_full") {
      artistPayload = collectSideArtists(artistsData, "both");
    }

    const payload = {
      reference: bookingReference(),
      submittedAt: new Date().toISOString(),
      source: "kwartier-west-website",
      bookingType: type,
      side: effectiveSide,
      artists: artistPayload,
      event: {
        name: String(formData.get("eventName") || "").trim(),
        date: String(formData.get("eventDate") || "").trim(),
        time: String(formData.get("eventTime") || "").trim(),
        city: String(formData.get("eventCity") || "").trim(),
        venue: String(formData.get("eventVenue") || "").trim()
      },
      budget: {
        amount: Number(formData.get("budget") || 0) || null,
        currency: "EUR"
      },
      contact: {
        name: String(formData.get("contactName") || "").trim(),
        email: String(formData.get("contactEmail") || "").trim(),
        phone: String(formData.get("contactPhone") || "").trim(),
        organisation: String(formData.get("organisation") || "").trim()
      }
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage issues
    }

    submitButton.disabled = true;
    submitButton.textContent = `${t("common.loading")}`;

    const webhookResult = await pushBookingWebhook(payload, { baseDepth });

    submitButton.disabled = false;
    submitButton.textContent = t("booking.form.submit");

    result.innerHTML = `
      <div class="surface success-panel">
        <h3 tabindex="-1" data-booking-result-title>${t("booking.result.title")}</h3>
        <p class="muted">${t("booking.result.reference")}: <strong>${escapeHTML(payload.reference)}</strong></p>

        ${renderWebhookStatus(webhookResult)}
      </div>
    `;

    const resultTitle = result.querySelector("[data-booking-result-title]");
    if (resultTitle instanceof HTMLElement) {
      resultTitle.focus();
    }
  });
}
