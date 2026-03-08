import { t } from "./core/i18n.js";
import { postJSONWithTimeout, resolveEndpoint } from "./core/integration-client.js";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function formTemplate() {
  return `
    <form class="booking-form newsletter-form" novalidate>
      <section class="booking-section newsletter-form__section">
        <h3 class="booking-section__title">${t("newsletter.title")}</h3>
        <p class="muted newsletter-form__lead">${t("newsletter.lead")}</p>

        <div class="form-grid form-grid--inline">
          <label>
            <span>${t("newsletter.form.name")}</span>
            <input
              name="name"
              type="text"
              maxlength="80"
              autocomplete="name"
              placeholder="${t("newsletter.form.placeholder.name")}"
            >
          </label>

          <label>
            <span>${t("newsletter.form.email")}</span>
            <input
              name="email"
              type="email"
              required
              aria-required="true"
              autocomplete="email"
              placeholder="${t("newsletter.form.placeholder.email")}"
            >
          </label>
        </div>

        <label class="newsletter-consent">
          <input type="checkbox" name="consent" required aria-required="true">
          <span>${t("newsletter.form.consent")}</span>
        </label>

        <input type="text" name="website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true" data-newsletter-honeypot>

        <div class="form-actions">
          <button type="submit" class="cta-btn" data-newsletter-submit>${t("newsletter.form.submit")}</button>
          <p class="muted">${t("newsletter.form.helper")}</p>
        </div>
      </section>
    </form>
    <div data-newsletter-result aria-live="polite"></div>
  `;
}

function renderResult(node, type, message) {
  if (!node) return;
  node.className = "";
  node.textContent = "";
  if (!message) return;

  if (type === "success") {
    node.classList.add("success-panel", "newsletter-result");
  } else {
    node.classList.add("error-text", "newsletter-result");
  }
  node.textContent = message;
}

async function handleSubmit(form, resultNode, endpoint, source, mountTime) {
  const submitButton = form.querySelector("[data-newsletter-submit]");
  const emailInput = form.elements.email;
  const nameInput = form.elements.name;
  const consentInput = form.elements.consent;
  const honeypotInput = form.elements.website;

  const email = String(emailInput?.value || "").trim();
  const name = String(nameInput?.value || "").trim();
  const consent = Boolean(consentInput?.checked);
  const honey = String(honeypotInput?.value || "").trim();

  if (!isEmail(email)) {
    renderResult(resultNode, "error", t("newsletter.validate.email"));
    emailInput?.focus();
    return;
  }

  if (!consent) {
    renderResult(resultNode, "error", t("newsletter.validate.consent"));
    consentInput?.focus();
    return;
  }

  const previousText = submitButton?.textContent || "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = t("newsletter.state.sending");
  }

  const payload = {
    email,
    name,
    consent,
    source,
    antiBot: {
      website: honey,
      elapsedMs: Date.now() - mountTime
    }
  };

  try {
    const response = await postJSONWithTimeout(endpoint, payload, { timeoutMs: 12000 });
    if (!response.ok) {
      const bodyMessage =
        response.body && typeof response.body === "object"
          ? String(response.body.message || "")
          : "";
      const fallback = t("newsletter.result.serverStatus", { status: response.status });
      renderResult(resultNode, "error", `${t("newsletter.result.errorPrefix")}: ${bodyMessage || fallback}`);
      return;
    }

    const message =
      response.body && typeof response.body === "object" && response.body.message
        ? String(response.body.message)
        : t("newsletter.result.success");
    renderResult(resultNode, "success", message);
    form.reset();
  } catch {
    renderResult(resultNode, "error", `${t("newsletter.result.errorPrefix")}: ${t("newsletter.result.network")}`);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = previousText || t("newsletter.form.submit");
    }
  }
}

function mountSingle(root, { endpoint, source }) {
  root.innerHTML = formTemplate();
  const form = root.querySelector("form");
  const resultNode = root.querySelector("[data-newsletter-result]");
  if (!form) return;

  const mountTime = Date.now();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSubmit(form, resultNode, endpoint, source, mountTime);
  });
}

export function mountNewsletterForm({ baseDepth = 0, source = "website", endpoint = "" } = {}) {
  const nodes = Array.from(document.querySelectorAll("[data-newsletter-form]"));
  if (!nodes.length) return;

  const resolvedEndpoint = resolveEndpoint(endpoint || "/api/newsletter", baseDepth);

  for (const node of nodes) {
    const nodeSource = String(node.getAttribute("data-newsletter-source") || source || "website").trim();
    mountSingle(node, {
      endpoint: resolvedEndpoint,
      source: nodeSource || "website"
    });
  }
}

