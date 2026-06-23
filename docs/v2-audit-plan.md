# Kwartier West V2 Audit & Rebuild Plan

Status: live-prep checkpoint completed on 2026-06-22.

## Safety Checkpoint

- Current git branch: `main`
- Current git HEAD at audit start: `d6c19165ab730ef71e9b1dc633a20a8fae3253af`
- Local backup folder: `_backups/pre-v2-20260622-174849`
- Backup contents:
  - `tracked-changes.patch`: all tracked working-tree changes at checkpoint time.
  - `git-status.txt`: exact dirty worktree list.
  - `untracked-files.txt`: untracked files list.
  - `untracked/`: physical copy of untracked live-prep files.

The rebuild must not overwrite the current public site until a preview deployment has passed visual, functional, SEO and booking checks.

## Current Product Intent

Kwartier West is not a standard portfolio, label page, or social-media profile clone. It should feel like an underground portal with a clear operational purpose:

- First screen: choose Tekno, Hip hop, or Villa West.
- Desktop: showcase-grade, mysterious, sharp and immersive.
- Mobile: stable, fast, timeless and direct.
- Core business goal: artists can actually be booked through the site.
- Core discovery goal: events, artists, Villa West, OG images, sitemap and robots are crawlable and consistent.
- Content posture: human, local, concrete, not generic marketing copy.

## Current Architecture

The current site is a static/Vercel hybrid:

- Static HTML pages in `index.html` and `pages/**`.
- Shared CSS in `css/base.css`, plus smaller page bundles in `css/landing.css`, `css/events.css`, `css/archive.css`.
- Runtime JS modules in `js/**`.
- Shared client components in `partials/**`.
- Data contracts in `data/*.json`.
- Build/generator scripts in `scripts/**`.
- Vercel serverless functions in `api/**`.
- Live checks through:
  - `npm run validate`
  - `npm run i18n-check`
  - `npm run site-check`
  - `npm run check`

Measured at audit:

- HTML files: 40
- CSS: 142 KB
- JS/API/scripts: 307 KB
- Data: 89 KB
- Largest CSS file: `css/base.css` at 99 KB
- Largest JS files: `js/core/i18n.js`, `api/bookings.js`, `js/booking.js`

## What Is Strong Enough To Keep

- Data-driven artists and events are the right direction.
- Vercel serverless booking flow is working and tested.
- Event/artist page generation is a good SEO strategy.
- Sitemap/robots/legal pages are now moving in the right direction.
- Split landing concept is correct for the brand.
- Villa West as a central route belongs on the homepage and rail.
- The compact artist dossier direction is better than social-media banners.
- Existing validation scripts are valuable and should be expanded, not removed.

## Main Problems In Current Code

### 1. CSS Is Too Centralized

`css/base.css` contains global design tokens, navigation, footer, hero systems, rail, artists, booking, shop, responsive overrides and many page-specific decisions. This works, but it makes visual changes risky because unrelated screens share the same file and cascade.

V2 target:

- `tokens.css`
- `base.css`
- `layout.css`
- `components/*.css`
- `pages/*.css`
- strict component naming and no accidental page bleed.

### 2. HTML Shells Are Repeated

Many pages repeat similar head/nav/footer/script patterns. Generated artist and event pages also duplicate head structure and asset versions.

V2 target:

- One page shell generator.
- Page definitions as data/config.
- Consistent meta, OG, canonical and JSON-LD generation.
- No manual head drift between pages.

### 3. Runtime Rendering Uses A Lot Of `innerHTML`

The current modules escape user-facing content in many places, but rendering is still mostly string-template based. This is acceptable for controlled local JSON, but less ideal as future integrations grow.

V2 target:

- Keep templates for trusted static shells.
- Use small DOM helper functions for interactive/user-influenced parts.
- Centralize escape and URL sanitization.

### 4. i18n Is Too Large For Its Current Scope

The current implementation supports EN/NL, but older documentation claimed many languages. `js/core/i18n.js` is large and mixes dictionary, detection and DOM application.

V2 target:

- Keep NL as canonical.
- EN optional but clean.
- Separate dictionaries from i18n runtime.
- Documentation matches reality.

### 5. Shop Is Present But Strategically Confusing

Shop still exists in data/code/page styling, while Vercel redirects `/pages/shop` to `/`. This creates dead weight and mixed product intent.

V2 target:

- Either remove shop from public navigation and active docs until needed.
- Or make it a real hidden future module outside the live crawl surface.

### 6. Tests Are Good But Need Better Scope

Current checks catch data, i18n parity and broken links. They do not yet enforce visual contracts, booking E2E, SEO completeness, or accidental route contradictions.

V2 target:

- Add a route manifest.
- Add meta/OG validation.
- Add booking flow test command.
- Add screenshot audit scripts for desktop/mobile.
- Keep `_backups`, `_screens`, browser profiles and tooling artifacts ignored by site-check.

## V2 Architecture Proposal

V2 should be a controlled rebuild of the current idea, not a blind rewrite.

### Source Of Truth

- `data/artists.json`
- `data/events.json`
- `data/partners.json`
- `data/site.json` or `data/routes.json` for page-level meta/navigation.

### Build Layer

- One static page generator for all HTML shells.
- Artist pages and event pages generated through the same meta/layout helpers.
- Sitemap generated from the same route manifest.
- CSS asset version generated once, not manually copied.

### Frontend Runtime

- Small page modules only where interaction is needed:
  - landing portal
  - artist grid/detail enhancements
  - booking desk
  - event filters
  - archive lightbox
  - newsletter
- No runtime JS needed for static legal/contact copy except nav/footer.

### Visual System

- Desktop is the showcase.
- Mobile stays restrained and durable.
- No social-media-style artist banners.
- No nested cards.
- Hero sections use real imagery or strong full-bleed atmosphere.
- Components are tighter, denser and more dossier-like where appropriate.
- Animation rules:
  - Split landing: hover/pointer animation is allowed and should feel alive.
  - Artist cards: no hover circus; click/entry animation only.
  - Villa Bota neon: effect should be image/light based, not fake text glow.

### SEO Surface

Every public page must have:

- title
- description
- canonical
- OG title/description/image
- Twitter card
- sitemap entry
- crawlable route
- no contradiction between rail, events page and detail pages.

Event pages must additionally have valid MusicEvent JSON-LD.
Artist pages should have MusicGroup/Person-style JSON-LD where enough data exists.

## Migration Strategy

1. Freeze current version with checkpoint backup.
2. Keep current site operational while building V2 source/generator layer.
3. Recreate route manifest and shared shell.
4. Migrate homepage first because it defines the brand.
5. Migrate booking second because it is the business-critical flow.
6. Migrate events and Villa West third because they drive live launch.
7. Migrate artist index/detail pages fourth.
8. Migrate contact/legal/footer/navigation last.
9. Run local checks and screenshot audit.
10. Deploy to Vercel preview only.
11. Promote to production only after visual and booking approval.

## Immediate Next Implementation Steps

1. Add a route manifest and shell generator.
2. Move repeated meta generation into reusable helpers.
3. Split `base.css` into stable layers without changing visual output.
4. Create booking E2E scripts as permanent QA tooling.
5. Build a preview-only visual audit command.
6. Only then begin visual redesign where it is safe.

## V2 Foundation Started

Added on 2026-06-22:

- `data/routes.json`: central manifest for fixed public routes used by sitemap generation and route validation.
- `scripts/lib/site-meta.mjs`: shared origin, asset versions, escaping, canonical URL handling and SEO/OG/Twitter head generation.
- `scripts/seo-check.mjs`: hard gate for crawlable HTML pages, canonical URLs, OG/Twitter metadata, sitemap coverage, robots and event JSON-LD.
- `scripts/generate-sitemap.mjs`: now reads fixed public routes from `data/routes.json` and appends generated artist/event routes.
- `scripts/generate-artist-pages.mjs`: generated artist pages now use the shared SEO head helper.
- `scripts/generate-event-pages.mjs`: generated event pages now use the shared SEO head helper.
- `renderHtmlDocument()` in `scripts/lib/site-meta.mjs`: generated artist and event pages now share one document shell for doctype, html language, base head tags, stylesheet injection, nav/footer slots and module script formatting.
- `data/static-pages.json` and `scripts/generate-static-pages.mjs`: static pages (`privacy`, `voorwaarden`, `manifest`, `tickets`, `contact`, `partners`) now come from structured content and the shared document/SEO shell. Manifest and tickets keep their i18n hooks, lists and CTA structure. Contact keeps its runtime partner/social-link fallback through a named generator module. Partners keeps the existing `renderPartners()` data renderer while its shell, SEO head, hero and protocol section are generated.
- Artist detail pages now include static `MusicGroup` JSON-LD in the generated HTML, with canonical URL, image, sameAs links, member organization, role and location. `scripts/seo-check.mjs` now fails if generated artist detail pages lose this structured data.
- `scripts/visual-audit.mjs` and `npm run visual-audit`: Playwright-based local visual audit now captures 15 key routes plus landing hover states at desktop and mobile sizes, scrolls lazy media into view, checks broken images, horizontal overflow, empty interactive labels, console/page errors and failed requests, and stores output under `_screens/visual-audit/`.
- Homepage desktop route deck refined: Tekno, Villa West and Hip hop now share one clear route layer so Villa West reads as a central broadcast route instead of being pushed behind the split choices. Mobile keeps the stacked route order.
- Booking desk desktop layout refined into scan-friendly intake panels: booking type and artist selection first, event/contact side by side, production and submit flow below. Payload and submission logic are unchanged.
- Eventhub refined for launch reality: copy now presents it as the event hub with Villa West as current main programme, the featured card is visually stronger, event CTAs are i18n-driven, and mobile event overview cards have a specific one-column override.
- Desktop visual pass started after review: landing page has a stronger route atmosphere, collectieve pages have denser dossier-style artist cards, booking has clearer intake-step styling, partners use a cleaner network grid with corrected mobile stacking, manifest has stronger manifesto slabs, the right rail reads more like a launch/publication column, and homepage/event/booking copy no longer promises merch as part of the public launch surface.
- CSS asset cache version bumped to `20260623g` across generated and manually maintained pages so live visitors receive the latest base, landing and events styling after deploy.
- `npm run seo-build`: now regenerates static pages before artist pages, event pages and sitemap.
- Booking delivery verified locally on 2026-06-23 with `npm run booking-mail-test` and `npm run booking-flow-test`: SMTP configuration was present, verification mail was sent, and the confirmed booking mail was accepted by the API.

Current gate:

```txt
npm run check
validate: 0 errors, 0 warnings
i18n-check: passed
site-check: passed
seo-check: 40 HTML pages, 0 warnings
```
