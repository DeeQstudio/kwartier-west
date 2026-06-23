import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];
const warnings = [];

function readJSON(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`JSON parse error in ${relPath}: ${error.message}`);
  }
}

function err(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function isISODate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isISODateTime(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isTime(value) {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

function isUrlOrEmpty(value) {
  return value === "" || /^https?:\/\//i.test(value) || value.startsWith("../") || value.startsWith("/");
}

function validateArtists(artists) {
  if (!isObject(artists)) {
    err("artists.json moet een object zijn.");
    return { allSlugs: new Set(), sideLookup: { tekno: new Set(), hiphop: new Set() } };
  }

  if (artists.updatedAt && !isISODateTime(artists.updatedAt)) {
    warn("artists.json.updatedAt is geen geldige datetime.");
  }

  const allSlugs = new Set();
  const sideLookup = { tekno: new Set(), hiphop: new Set() };

  for (const side of ["tekno", "hiphop"]) {
    const list = artists[side];
    if (!Array.isArray(list)) {
      err(`artists.json: '${side}' moet een array zijn.`);
      continue;
    }

    for (const [index, artist] of list.entries()) {
      const where = `artists.json:${side}[${index}]`;
      if (!isObject(artist)) {
        err(`${where} moet een object zijn.`);
        continue;
      }

      if (typeof artist.slug !== "string" || !artist.slug.trim()) err(`${where}.slug ontbreekt of is ongeldig.`);
      if (typeof artist.name !== "string" || !artist.name.trim()) err(`${where}.name ontbreekt of is ongeldig.`);

      if (artist.slug) {
        if (sideLookup[side].has(artist.slug)) err(`${where}.slug '${artist.slug}' bestaat dubbel binnen ${side}.`);
        sideLookup[side].add(artist.slug);

        if (allSlugs.has(artist.slug)) warn(`${where}.slug '${artist.slug}' komt in meerdere sides voor.`);
        allSlugs.add(artist.slug);
      }

      if (artist.links && !Array.isArray(artist.links)) {
        err(`${where}.links moet een array zijn.`);
      }

      if (Array.isArray(artist.links)) {
        for (const [linkIndex, link] of artist.links.entries()) {
          const lwhere = `${where}.links[${linkIndex}]`;
          if (!isObject(link)) {
            err(`${lwhere} moet een object zijn.`);
            continue;
          }
          if (typeof link.label !== "string" || !link.label.trim()) warn(`${lwhere}.label ontbreekt.`);
          if (typeof link.url !== "string" || !link.url.trim()) warn(`${lwhere}.url ontbreekt.`);
        }
      }

      if (artist.booking && !isObject(artist.booking)) {
        err(`${where}.booking moet een object zijn.`);
      }

      if (artist.booking && isObject(artist.booking) && artist.booking.types && !Array.isArray(artist.booking.types)) {
        err(`${where}.booking.types moet een array zijn.`);
      }
    }
  }

  return { allSlugs, sideLookup };
}

function validateEvents(events, artistLookup) {
  if (!isObject(events)) {
    err("events.json moet een object zijn.");
    return;
  }

  if (events.updatedAt && !isISODateTime(events.updatedAt)) {
    warn("events.json.updatedAt is geen geldige datetime.");
  }

  const validModes = new Set(["external", "internal", "tba"]);

  if (events.sources) {
    if (!isObject(events.sources)) {
      err("events.json.sources moet een object zijn.");
    } else {
      for (const side of ["global", "tekno", "hiphop"]) {
        const sourceList = events.sources[side];
        if (sourceList && !Array.isArray(sourceList)) {
          err(`events.json.sources.${side} moet een array zijn.`);
          continue;
        }
        for (const [idx, source] of (sourceList || []).entries()) {
          const swhere = `events.json:sources.${side}[${idx}]`;
          if (!isObject(source)) {
            err(`${swhere} moet een object zijn.`);
            continue;
          }
          if (!source.platform) warn(`${swhere}.platform ontbreekt.`);
          if (source.url && !isUrlOrEmpty(source.url)) warn(`${swhere}.url lijkt ongeldig.`);
        }
      }
    }
  }

  const globalIds = new Set();
  const validSides = new Set(["tekno", "hiphop"]);

  for (const side of ["global", "tekno", "hiphop"]) {
    const list = events[side];
    if (side !== "global" && !Array.isArray(list)) {
      err(`events.json: '${side}' moet een array zijn.`);
      continue;
    }
    if (side === "global" && list == null) continue;
    if (!Array.isArray(list)) {
      err(`events.json: '${side}' moet een array zijn.`);
      continue;
    }

    const ids = new Set();

    for (const [index, event] of list.entries()) {
      const where = `events.json:${side}[${index}]`;
      if (!isObject(event)) {
        err(`${where} moet een object zijn.`);
        continue;
      }

      if (typeof event.id !== "string" || !event.id.trim()) err(`${where}.id ontbreekt.`);
      if (event.id && ids.has(event.id)) err(`${where}.id '${event.id}' is dubbel binnen ${side}.`);
      if (event.id) ids.add(event.id);
      if (event.id && globalIds.has(event.id)) err(`${where}.id '${event.id}' bestaat dubbel over meerdere eventlijsten.`);
      if (event.id) globalIds.add(event.id);

      if (typeof event.title !== "string" || !event.title.trim()) err(`${where}.title ontbreekt.`);
      if (!isISODate(event.date)) err(`${where}.date moet YYYY-MM-DD zijn.`);
      if (event.time && !isTime(event.time)) warn(`${where}.time lijkt niet op HH:MM.`);
      if (event.endTime && !isTime(event.endTime)) warn(`${where}.endTime lijkt niet op HH:MM.`);

      if (event.sides != null) {
        if (!Array.isArray(event.sides)) {
          err(`${where}.sides moet een array zijn.`);
        } else {
          for (const eventSide of event.sides) {
            if (!validSides.has(eventSide)) err(`${where}.sides bevat ongeldige kant '${eventSide}'.`);
          }
        }
      }

      if (event.poster && !isUrlOrEmpty(event.poster)) warn(`${where}.poster lijkt ongeldig.`);
      if (event.posterWidth != null && (!Number.isFinite(Number(event.posterWidth)) || Number(event.posterWidth) <= 0)) {
        warn(`${where}.posterWidth moet een positief getal zijn.`);
      }
      if (event.posterHeight != null && (!Number.isFinite(Number(event.posterHeight)) || Number(event.posterHeight) <= 0)) {
        warn(`${where}.posterHeight moet een positief getal zijn.`);
      }

      const mode = event?.tickets?.mode || "tba";
      if (!validModes.has(mode)) err(`${where}.tickets.mode moet external, internal of tba zijn.`);
      if (mode === "external" && !event?.tickets?.url) warn(`${where}: external ticket zonder url.`);
      if (event?.tickets?.url && !isUrlOrEmpty(event.tickets.url)) warn(`${where}.tickets.url lijkt ongeldig.`);

      if (event.source?.url && !isUrlOrEmpty(event.source.url)) warn(`${where}.source.url lijkt ongeldig.`);

      if (event.lineup && !Array.isArray(event.lineup)) {
        err(`${where}.lineup moet een array zijn.`);
      }

      for (const [lineupIndex, lineupEntry] of (event.lineup || []).entries()) {
        const lwhere = `${where}.lineup[${lineupIndex}]`;
        if (!isObject(lineupEntry)) {
          err(`${lwhere} moet een object zijn.`);
          continue;
        }

        if (!lineupEntry.slug && !lineupEntry.name) {
          warn(`${lwhere} heeft geen slug of name.`);
          continue;
        }

        if (lineupEntry.slug && !artistLookup.allSlugs.has(lineupEntry.slug)) {
          warn(`${lwhere}.slug '${lineupEntry.slug}' bestaat niet in artists.json.`);
        }
      }
    }
  }
}

function validatePartners(partners) {
  if (!isObject(partners)) {
    err("partners.json moet een object zijn.");
    return;
  }

  const list = partners.partners;
  if (!Array.isArray(list)) {
    err("partners.json.partners moet een array zijn.");
    return;
  }

  for (const [index, partner] of list.entries()) {
    const where = `partners.json:partners[${index}]`;
    if (!isObject(partner)) {
      err(`${where} moet een object zijn.`);
      continue;
    }

    if (typeof partner.name !== "string" || !partner.name.trim()) err(`${where}.name ontbreekt.`);
    if (partner.links && !Array.isArray(partner.links)) err(`${where}.links moet een array zijn.`);
  }
}

function validateShop(shop, artistLookup) {
  if (!isObject(shop)) {
    err("shop.json moet een object zijn.");
    return;
  }

  if (shop.updatedAt && !isISODateTime(shop.updatedAt)) warn("shop.json.updatedAt is geen geldige datetime.");

  const items = shop.items;
  if (!Array.isArray(items)) {
    err("shop.json.items moet een array zijn.");
    return;
  }

  const validOwnerType = new Set(["label", "artists"]);
  const validStatus = new Set(["in_stock", "preorder", "sold_out", "coming_soon"]);
  const validSides = new Set(["global", "tekno", "hiphop"]);
  const ids = new Set();

  for (const [index, item] of items.entries()) {
    const where = `shop.json:items[${index}]`;
    if (!isObject(item)) {
      err(`${where} moet een object zijn.`);
      continue;
    }

    if (typeof item.id !== "string" || !item.id.trim()) err(`${where}.id ontbreekt.`);
    if (item.id && ids.has(item.id)) err(`${where}.id '${item.id}' is dubbel.`);
    if (item.id) ids.add(item.id);

    if (typeof item.title !== "string" || !item.title.trim()) err(`${where}.title ontbreekt.`);
    if (!validOwnerType.has(item.ownerType)) err(`${where}.ownerType moet label of artists zijn.`);
    if (!validStatus.has(item.status)) err(`${where}.status is ongeldig.`);
    if (!validSides.has(item.side)) err(`${where}.side moet global, tekno of hiphop zijn.`);

    if (item.ownerType === "artists") {
      if (!item.artistSlug) err(`${where}.artistSlug is verplicht voor artist merch.`);
      if (item.artistSlug && !artistLookup.allSlugs.has(item.artistSlug)) warn(`${where}.artistSlug '${item.artistSlug}' bestaat niet.`);
    }

    if (item.url && !isUrlOrEmpty(item.url)) warn(`${where}.url lijkt ongeldig.`);
    if (item.sizes && !Array.isArray(item.sizes)) err(`${where}.sizes moet een array zijn.`);
  }
}

function validateIntegrations(integrations) {
  if (!isObject(integrations)) {
    err("integrations.json moet een object zijn.");
    return;
  }

  const allowedMethods = new Set(["GET", "POST"]);

  for (const key of ["eventSync", "bookingWebhook", "shopApi"]) {
    if (!isObject(integrations[key])) {
      err(`integrations.json.${key} moet een object zijn.`);
      continue;
    }

    const section = integrations[key];
    const endpoint = section.endpoint;
    if (endpoint && !isUrlOrEmpty(endpoint)) {
      warn(`integrations.json.${key}.endpoint lijkt ongeldig.`);
    }

    const method = String(section.method || "").toUpperCase();
    if (method && !allowedMethods.has(method)) {
      err(`integrations.json.${key}.method moet GET of POST zijn.`);
    }

    if (section.timeoutMs != null) {
      const timeout = Number(section.timeoutMs);
      if (!Number.isFinite(timeout) || timeout <= 0) {
        err(`integrations.json.${key}.timeoutMs moet een positief getal zijn.`);
      }
    }
  }

  const webhook = integrations.bookingWebhook;
  if (isObject(webhook) && webhook.enabled) {
    if (String(webhook.method || "").toUpperCase() && String(webhook.method || "").toUpperCase() !== "POST") {
      err("integrations.json.bookingWebhook.method moet POST zijn wanneer enabled=true.");
    }

    const authMode = String(webhook.auth || "").toLowerCase();
    if (authMode === "bearer-token" && !String(webhook.authToken || "").trim()) {
      warn("integrations.json.bookingWebhook.authToken ontbreekt terwijl auth='bearer-token'.");
    }
  }
}

function validateRoutes(routes) {
  if (!isObject(routes)) {
    err("routes.json moet een object zijn.");
    return;
  }

  if (routes.updatedAt && !isISODateTime(routes.updatedAt)) warn("routes.json.updatedAt is geen geldige datetime.");
  if (routes.origin && !/^https:\/\/kwartierwest\.be$/i.test(String(routes.origin))) {
    warn("routes.json.origin wijkt af van https://kwartierwest.be.");
  }

  const list = routes.static;
  if (!Array.isArray(list)) {
    err("routes.json.static moet een array zijn.");
    return;
  }

  const seenPaths = new Set();
  const validChangefreq = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);

  for (const [index, route] of list.entries()) {
    const where = `routes.json:static[${index}]`;
    if (!isObject(route)) {
      err(`${where} moet een object zijn.`);
      continue;
    }

    const routePath = String(route.path || "").trim();
    const file = String(route.file || "").trim();

    if (!routePath.startsWith("/")) err(`${where}.path moet met / starten.`);
    if (routePath && seenPaths.has(routePath)) err(`${where}.path '${routePath}' bestaat dubbel.`);
    if (routePath) seenPaths.add(routePath);

    if (!file) {
      err(`${where}.file ontbreekt.`);
    } else if (!fs.existsSync(path.join(ROOT, file))) {
      err(`${where}.file bestaat niet: ${file}`);
    }

    const priority = Number(route.priority);
    if (!Number.isFinite(priority) || priority < 0 || priority > 1) {
      err(`${where}.priority moet tussen 0 en 1 liggen.`);
    }

    if (!validChangefreq.has(String(route.changefreq || ""))) {
      err(`${where}.changefreq is ongeldig.`);
    }
  }
}

function validateStaticPages(staticPages) {
  if (!isObject(staticPages)) {
    err("static-pages.json moet een object zijn.");
    return;
  }

  if (staticPages.updatedAt && !isISODateTime(staticPages.updatedAt)) {
    warn("static-pages.json.updatedAt is geen geldige datetime.");
  }

  const pages = staticPages.pages;
  if (!Array.isArray(pages)) {
    err("static-pages.json.pages moet een array zijn.");
    return;
  }

  const ids = new Set();
  const outputs = new Set();

  for (const [index, page] of pages.entries()) {
    const where = `static-pages.json:pages[${index}]`;
    if (!isObject(page)) {
      err(`${where} moet een object zijn.`);
      continue;
    }

    for (const key of ["id", "output", "canonical", "title", "description", "heroTitle", "lead"]) {
      if (typeof page[key] !== "string" || !page[key].trim()) err(`${where}.${key} ontbreekt.`);
    }

    if (page.id) {
      if (ids.has(page.id)) err(`${where}.id '${page.id}' bestaat dubbel.`);
      ids.add(page.id);
    }

    if (page.output) {
      if (outputs.has(page.output)) err(`${where}.output '${page.output}' bestaat dubbel.`);
      outputs.add(page.output);
      if (path.isAbsolute(page.output) || page.output.includes("..")) err(`${where}.output moet een veilige relatieve path zijn.`);
    }

    if (page.canonical && !String(page.canonical).startsWith("/")) err(`${where}.canonical moet met / starten.`);
    if (page.extraModules != null) {
      const allowedModules = new Set(["contact-socials", "partners-page"]);
      if (!Array.isArray(page.extraModules)) {
        err(`${where}.extraModules moet een array zijn.`);
      } else {
        for (const moduleName of page.extraModules) {
          if (!allowedModules.has(moduleName)) err(`${where}.extraModules bevat onbekende module '${moduleName}'.`);
        }
      }
    }

    if (!Array.isArray(page.sections) || !page.sections.length) {
      err(`${where}.sections moet een gevulde array zijn.`);
      continue;
    }

    for (const [sectionIndex, section] of page.sections.entries()) {
      const sw = `${where}.sections[${sectionIndex}]`;
      if (!isObject(section)) {
        err(`${sw} moet een object zijn.`);
        continue;
      }
      if (section.variant === "contact-grid") {
        if (!Array.isArray(section.cards) || !section.cards.length) {
          err(`${sw}.cards moet een gevulde array zijn.`);
          continue;
        }
        for (const [cardIndex, card] of section.cards.entries()) {
          const cw = `${sw}.cards[${cardIndex}]`;
          if (!isObject(card)) {
            err(`${cw} moet een object zijn.`);
            continue;
          }
          for (const key of ["title", "meta", "body"]) {
            if (typeof card[key] !== "string" || !card[key].trim()) err(`${cw}.${key} ontbreekt.`);
          }
          if (card.actions != null && !Array.isArray(card.actions)) err(`${cw}.actions moet een array zijn.`);
        }
        continue;
      }
      if (section.variant === "mount") {
        if (typeof section.mountAttr !== "string" || !section.mountAttr.trim()) err(`${sw}.mountAttr ontbreekt.`);
        if (!/^[a-z][a-z0-9-]*(\s+[a-z][a-z0-9-]*)*$/i.test(String(section.mountAttr || ""))) {
          err(`${sw}.mountAttr mag alleen eenvoudige data-attributen bevatten.`);
        }
        continue;
      }
      if (section.variant === "partner-protocol") {
        if (typeof section.title !== "string" || !section.title.trim()) err(`${sw}.title ontbreekt.`);
        const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
        if (!paragraphs.length) err(`${sw}.paragraphs moet een gevulde array zijn.`);
        if (section.actions != null && !Array.isArray(section.actions)) err(`${sw}.actions moet een array zijn.`);
        continue;
      }
      if (typeof section.title !== "string" || !section.title.trim()) err(`${sw}.title ontbreekt.`);
      const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
      const list = Array.isArray(section.list) ? section.list : [];
      if (!paragraphs.length && !list.length) {
        err(`${sw} moet paragraphs of list bevatten.`);
      }

      if (section.actions != null && !Array.isArray(section.actions)) {
        err(`${sw}.actions moet een array zijn.`);
      }
    }
  }
}

try {
  const artists = readJSON("data/artists.json");
  const events = readJSON("data/events.json");
  const partners = readJSON("data/partners.json");
  const shop = readJSON("data/shop.json");
  const integrations = readJSON("data/integrations.json");
  const routes = readJSON("data/routes.json");
  const staticPages = readJSON("data/static-pages.json");

  const artistLookup = validateArtists(artists);
  validateEvents(events, artistLookup);
  validatePartners(partners);
  validateShop(shop, artistLookup);
  validateIntegrations(integrations);
  validateRoutes(routes);
  validateStaticPages(staticPages);
} catch (error) {
  err(error.message);
}

console.log("--- Kwartier West data validation ---");
console.log(`Errors:   ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log("");

if (errors.length) {
  console.log("ERRORS:");
  for (const message of errors) console.log(" - " + message);
  console.log("");
}

if (warnings.length) {
  console.log("WARNINGS:");
  for (const message of warnings) console.log(" - " + message);
  console.log("");
}

process.exit(errors.length ? 1 : 0);
