import { loadIntegrations } from "./core/content-api.js";
import { t } from "./core/i18n.js";
import { postJSONWithTimeout, resolveEndpoint } from "./core/integration-client.js";

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderError(target, message) {
  target.innerHTML = `<p class="error-text" role="alert">${message}</p>`;
}

function renderLoading(target) {
  target.innerHTML = `
    <div class="surface success-panel verify-state verify-state--loading">
      <h2>${t("booking.verify.loadingTitle")}</h2>
      <p class="muted">${t("booking.verify.loadingBody")}</p>
    </div>
  `;
}

function renderSuccess(target, body) {
  const reference = String(body?.reference || "").trim();
  target.innerHTML = `
    <div class="surface success-panel verify-state verify-state--success">
      <h2>${t("booking.verify.successTitle")}</h2>
      <p>${t("booking.verify.successBody")}</p>
      ${reference ? `<p class="muted">${t("booking.result.reference")}: <strong>${escapeHTML(reference)}</strong></p>` : ""}
      <div class="inline-actions">
        <a class="chip-link" href="../index.html">${t("booking.verify.backToDesk")}</a>
        <a class="chip-link" href="../../events/index.html">${t("booking.verify.openEvents")}</a>
      </div>
    </div>
  `;
}

function parseTokenFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("token") || "").trim();
}

async function resolveBookingWebhook(baseDepth) {
  const integrations = await loadIntegrations({ baseDepth, revalidate: true }).catch(() => null);
  const webhook = integrations?.bookingWebhook;

  if (webhook?.enabled && webhook?.endpoint) {
    const headers = {};
    if (String(webhook.auth || "").toLowerCase() === "bearer-token" && webhook.authToken) {
      headers.Authorization = `Bearer ${webhook.authToken}`;
    }
    return {
      endpoint: resolveEndpoint(webhook.endpoint, baseDepth),
      timeoutMs: Number(webhook.timeoutMs || 9000),
      headers
    };
  }

  return {
    endpoint: resolveEndpoint("/api/bookings", baseDepth),
    timeoutMs: 9000,
    headers: {}
  };
}

export async function mountBookingVerification({ baseDepth = 0 } = {}) {
  const target = document.querySelector("[data-booking-verify]");
  if (!target) return;

  const token = parseTokenFromQuery();
  if (!token) {
    renderError(target, t("booking.verify.tokenMissing"));
    return;
  }

  renderLoading(target);

  const webhook = await resolveBookingWebhook(baseDepth);
  const response = await postJSONWithTimeout(
    webhook.endpoint,
    {
      action: "confirm_verification",
      token
    },
    {
      timeoutMs: webhook.timeoutMs,
      headers: webhook.headers
    }
  ).catch((error) => ({
    ok: false,
    status: 0,
    body: { message: String(error?.message || "") }
  }));

  if (!response?.ok) {
    const message =
      typeof response?.body?.message === "string" && response.body.message.trim()
        ? response.body.message.trim()
        : response?.status
          ? t("booking.result.webhookHttp", { status: response.status })
          : t("booking.result.webhookNetwork");
    renderError(target, `${t("booking.verify.errorTitle")}: ${escapeHTML(message)}`);
    return;
  }

  renderSuccess(target, response.body || {});
}
