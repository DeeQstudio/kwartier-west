import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CSS_ASSET_VERSION,
  escapeHtml,
  renderHtmlDocument,
  renderSeoHead
} from "./lib/site-meta.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataFile = path.join(projectRoot, "data", "static-pages.json");

function renderInlineMarkup(value = "") {
  const escaped = escapeHtml(value);
  return escaped.replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/g, (_, label, email) => {
    const safeEmail = String(email || "").trim();
    if (!safeEmail || /["<>\s]/.test(safeEmail)) return label;
    return `<a class="inline-link" href="mailto:${safeEmail}">${label}</a>`;
  });
}

function i18nAttr(key = "", attr = "data-i18n") {
  const clean = String(key || "").trim();
  return clean ? ` ${attr}="${escapeHtml(clean)}"` : "";
}

function renderText(tag, value = "", key = "", className = "") {
  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  return `<${tag}${classAttr}${i18nAttr(key)}>${renderInlineMarkup(value)}</${tag}>`;
}

function renderActions(actions = []) {
  if (!Array.isArray(actions) || !actions.length) return "";
  return `<div class="inline-actions">
        ${actions
          .map((action) => {
            const href = String(action.href || "#").trim();
            const className = String(action.className || "chip-link").trim();
            return `<a class="${escapeHtml(className)}" href="${escapeHtml(href)}"${i18nAttr(action.key)}>${escapeHtml(action.text || "")}</a>`;
          })
          .join("\n        ")}
      </div>`;
}

function renderContactCard(card = {}) {
  const actions = renderActions(card.actions);
  const socialsMount = card.socialsMount ? "\n          <div data-contact-socials></div>" : "";
  return `
        <article class="tile-card tile-card--contact">
          <div class="tile-card__head">
            <h3${i18nAttr(card.titleKey)}>${escapeHtml(card.title || "")}</h3>
            <span class="muted"${i18nAttr(card.metaKey)}>${escapeHtml(card.meta || "")}</span>
          </div>
          <p class="tile-card__body"${i18nAttr(card.bodyKey)}>${escapeHtml(card.body || "")}</p>
          ${actions}${socialsMount}
        </article>`;
}

function renderContactGrid(section = {}) {
  const cards = Array.isArray(section.cards) ? section.cards : [];
  return `
    <section class="surface surface--contact">
      <div class="tile-grid tile-grid--contact">
${cards.map(renderContactCard).join("\n")}
      </div>
    </section>`;
}

function renderMountSection(section = {}) {
  const sectionClass = String(section.className || "surface").trim();
  const attr = String(section.mountAttr || "").trim();
  const loading = String(section.loading || "").trim();
  const loadingKey = String(section.loadingKey || "").trim();

  if (!attr) return "";

  return `
    <section class="${escapeHtml(sectionClass)}">
      <div ${escapeHtml(attr)}>${loading ? `<p class="muted"${i18nAttr(loadingKey)}>${escapeHtml(loading)}</p>` : ""}</div>
    </section>`;
}

function renderPartnerProtocol(section = {}) {
  const title = String(section.title || "").trim();
  const titleKey = String(section.titleKey || "").trim();
  const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
  const actions = Array.isArray(section.actions) ? section.actions : [];
  const protocolActions = actions
    .map((action) => {
      const href = String(action.href || "#").trim();
      const className = String(action.className || "chip-link partner-protocol__cta").trim();
      return `<a class="${escapeHtml(className)}" href="${escapeHtml(href)}"${i18nAttr(action.key)}>${escapeHtml(action.text || "")}</a>`;
    })
    .join("\n        ");

  return `
    <section class="surface surface--partner-protocol">
      <div class="section-header">
        <h2${i18nAttr(titleKey)}>${escapeHtml(title)}</h2>
      </div>
      <div class="partner-protocol">
        ${paragraphs
          .map((paragraph) => `<p class="partner-protocol__line"${i18nAttr(paragraph?.key)}>${escapeHtml(paragraph?.text || "")}</p>`)
          .join("\n        ")}
        ${protocolActions}
      </div>
    </section>`;
}

function renderListItem(item) {
  if (typeof item === "string") return `<li>${renderInlineMarkup(item)}</li>`;
  if (item?.label || item?.body || item?.labelKey || item?.bodyKey) {
    return `<li><strong${i18nAttr(item.labelKey)}>${escapeHtml(item.label || "")}</strong> <span${i18nAttr(item.bodyKey)}>${escapeHtml(item.body || "")}</span></li>`;
  }
  return `<li${i18nAttr(item?.key)}>${renderInlineMarkup(item?.text || "")}</li>`;
}

function renderSection(section = {}) {
  if (section?.variant === "mount") return renderMountSection(section);
  if (section?.variant === "contact-grid") return renderContactGrid(section);
  if (section?.variant === "partner-protocol") return renderPartnerProtocol(section);

  const title = String(section.title || "").trim();
  const titleKey = String(section.titleKey || "").trim();
  const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
  const list = Array.isArray(section.list) ? section.list : [];
  const actions = Array.isArray(section.actions) ? section.actions : [];
  const muted = String(section.muted || "").trim();
  const variant = String(section.variant || "copy").trim();
  const sectionClass = String(section.className || (variant === "prose" ? "surface prose-block" : "surface")).trim();
  const body = [
    ...paragraphs.map((paragraph) =>
      typeof paragraph === "string"
        ? `<p>${renderInlineMarkup(paragraph)}</p>`
        : renderText("p", paragraph?.text || "", paragraph?.key || "")
    ),
    list.length ? `<ul>\n        ${list.map(renderListItem).join("\n        ")}\n      </ul>` : "",
    renderActions(actions),
    muted ? `<p class="muted">${escapeHtml(muted)}</p>` : ""
  ].filter(Boolean).join("\n        ");

  if (variant === "prose") {
    return `
    <section class="${escapeHtml(sectionClass)}">
      <h2${i18nAttr(titleKey)}>${escapeHtml(title)}</h2>
      ${body}
    </section>`;
  }

  return `
    <section class="${escapeHtml(sectionClass)}">
      <div class="section-header">
        <h2${i18nAttr(titleKey)}>${escapeHtml(title)}</h2>
      </div>
      <div class="copy-stack">
        ${body}
      </div>
    </section>`;
}

function extraModuleImports(modules = []) {
  const enabled = new Set(Array.isArray(modules) ? modules : []);
  const imports = [];
  if (enabled.has("contact-socials")) {
    imports.push(`
    import { loadPartners } from "../../js/core/content-api.js";
    import { renderSocialRail } from "../../js/core/social-links.js";
`);
  }
  if (enabled.has("partners-page")) {
    imports.push(`
    import { renderPartners } from "../../js/partners.js?v=${CSS_ASSET_VERSION}";
`);
  }
  return imports.join("\n");
}

function extraModuleCode(modules = []) {
  const enabled = new Set(Array.isArray(modules) ? modules : []);
  const chunks = [];

  if (enabled.has("contact-socials")) {
    chunks.push(`
    const socialMount = document.querySelector("[data-contact-socials]");
    if (socialMount) {
      const fallbackLinks = [
        { platform: "email", label: "Mail", url: "mailto:info@kwartierwest.be" },
        { platform: "instagram", label: "@kwtr_west", url: "https://www.instagram.com/kwtr_west/" },
        { platform: "facebook", label: "Kwartier West", url: "https://www.facebook.com/profile.php?id=61557994985369" },
        { platform: "soundcloud", label: "Kwartier West", url: "https://soundcloud.com/kwartier-west" }
      ];

      const mountSocials = (links) => {
        socialMount.innerHTML = renderSocialRail(links, { variant: "full" });
      };

      mountSocials(fallbackLinks);

      loadPartners({ baseDepth: 2 })
        .then((partnersData) => {
          const partners = Array.isArray(partnersData?.partners) ? partnersData.partners : [];
          const channels = partners.find((partner) => partner?.slug === "kwartier-west-channels");
          const links = [{ platform: "email", label: "Mail", url: "mailto:info@kwartierwest.be" }, ...(channels?.links || [])];
          if (links.length > 1) mountSocials(links);
        })
        .catch(() => {
          mountSocials(fallbackLinks);
        });
    }
`);
  }

  if (enabled.has("partners-page")) {
    chunks.push(`
    renderPartners({ baseDepth: 2 });
`);
  }

  return chunks.join("\n");
}

function renderPage(page = {}) {
  const head = renderSeoHead({
    title: page.title,
    titleKey: page.titleKey,
    description: page.description,
    descriptionKey: page.descriptionKey,
    canonical: page.canonical,
    ogImage: page.ogImage,
    ogAlt: page.ogAlt
  });

  const heroActions = renderActions(page.actions);
  const main = `
  <main id="main-content" class="page-shell">
    <header class="hero-surface hero-surface--lane hero-surface--lane-global">
      <p class="eyebrow"${i18nAttr(page.eyebrowKey)}>${escapeHtml(page.eyebrow)}</p>
      <h1${i18nAttr(page.heroTitleKey)}>${escapeHtml(page.heroTitle)}</h1>
      <p class="lead"${i18nAttr(page.leadKey)}>${escapeHtml(page.lead)}</p>${heroActions ? `\n      ${heroActions}` : ""}
    </header>
${(Array.isArray(page.sections) ? page.sections : []).map(renderSection).join("\n")}
  </main>`;

  const moduleScript = `
    import { initI18nPage } from "../../js/core/i18n.js";
    import { renderNav } from "../../partials/nav.js";
    import { renderFooter } from "../../partials/footer.js";
${extraModuleImports(page.extraModules)}

    initI18nPage();
    renderNav({ sideKey: "global", baseDepth: 2 });
    renderFooter({ baseDepth: 2 });
${extraModuleCode(page.extraModules)}
  `;

  return renderHtmlDocument({
    head,
    stylesheets: [`../../css/base.css?v=${CSS_ASSET_VERSION}`],
    bodyClass: page.bodyClass || "kw-page kw-side-global",
    main,
    moduleScript
  });
}

async function main() {
  const raw = await fs.readFile(dataFile, "utf8");
  const data = JSON.parse(String(raw || "").replace(/^\uFEFF/, ""));
  const pages = Array.isArray(data.pages) ? data.pages : [];
  let written = 0;

  for (const page of pages) {
    const output = String(page.output || "").trim();
    if (!output) continue;

    const target = path.join(projectRoot, output);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, renderPage(page), "utf8");
    written += 1;
  }

  console.log(`Generated ${written} static pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
