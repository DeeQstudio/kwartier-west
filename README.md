# Kwartier West Website

Production-grade frontend for Kwartier West.

## Core goals
- Two artist lanes: Tekno and Hip hop.
- Booking flow for single artist, multiple artists, side collective, full label takeover.
- Event hub with official social source references.
- Villa West and current events as crawlable launch routes.
- Data contracts prepared for future app/webhook integration.
- International UX: language detection + persistent language switch across pages.

## Routes
- `/index.html`
- `/pages/tekno/index.html`
- `/pages/hiphop/index.html`
- `/pages/events/index.html`
- `/pages/booking/index.html`
- `/pages/partners/index.html`
- `/pages/contact/index.html`
- `/pages/manifest/index.html`

Parked/noindex future route:
- `/pages/shop/index.html`

## Data contracts
- `data/artists.json`
- `data/events.json`
- `data/partners.json`
- `data/integrations.json`

Parked future contract:
- `data/shop.json`

## Commands
- `npm run dev`
- `npm run validate`
- `npm run artist-pages`
- `npm run event-pages`
- `npm run seo-build`
- `npm run booking-mail-test`
- `npm run booking-flow-test`
- `npm run newsletter-flow-test`
- `npm run site-check`
- `npm run seo-check`
- `npm run visual-audit`
- `npm run check`

`npm run visual-audit` starts a temporary local static server, captures desktop and mobile screenshots for the main public routes, and writes the report to `_screens/visual-audit/`.

## Internationalization
- Base language: Dutch (nl-BE).
- Supported UI languages: Dutch (`nl`) and English (`en`).
- Page language follows the HTML `lang` attribute first, so clean browsers land on Dutch.
- More languages should only be documented after the dictionaries, checks and visual review are complete.

## Integration handoff
When backend/app is ready, connect:
1. `data/integrations.json.eventSync.endpoint`
2. `data/integrations.json.bookingWebhook.endpoint`

`data/integrations.json.shopApi.endpoint` is kept as a future module, but it is not part of the public launch surface.

The frontend already emits structured booking payloads and consumes normalized data contracts.
If `bookingWebhook.enabled=true`, booking submissions are POSTed automatically from the website.

## Booking email delivery (Vercel)
The project includes a server-side endpoint at `/api/bookings` for direct booking email delivery.

Supported providers:
- `smtp` (recommended if you already have a mailbox, e.g. one.com)
- `resend`
- `auto` (default): tries SMTP first, then Resend fallback

Set these environment variables in Vercel:
- `BOOKING_PROVIDER` = `auto` | `smtp` | `resend` (optional, default: `auto`)
- `BOOKING_TO_EMAIL` (optional, default: `info@kwartierwest.be`)
- `BOOKING_FROM_EMAIL` (optional; for SMTP default is `Kwartier West <info@kwartierwest.be>`, for Resend default is `Kwartier West <onboarding@resend.dev>`)

SMTP variables:
- `BOOKING_SMTP_HOST`
- `BOOKING_SMTP_PORT` (e.g. `587`)
- `BOOKING_SMTP_SECURE` (`true` for SSL/465, `false` for STARTTLS/587)
- `BOOKING_SMTP_USER`
- `BOOKING_SMTP_PASS`

Resend variables:
- `RESEND_API_KEY` (or `RESEND_KEY` / `RESEND_TOKEN`)

Without valid SMTP or Resend configuration, booking submissions return a clear configuration error.

## Uit Het Westen newsletter system (Vercel)
The project includes `/api/newsletter` for Uit Het Westen subscriptions.

What it does:
- validates email, consent, honeypot and minimum fill time
- rate-limits by IP and email
- stores subscribers when Upstash Redis is configured
- detects duplicate active subscriptions and updates the subscriber record
- sends an internal signup notification
- optionally sends a welcome mail with unsubscribe link
- exposes an admin export endpoint

Mail delivery reuses booking SMTP by default. Optional newsletter-specific overrides:
- `NEWSLETTER_PROVIDER` = `auto` | `smtp` | `resend`
- `NEWSLETTER_TO_EMAIL` (optional, default falls back to `BOOKING_TO_EMAIL`)
- `NEWSLETTER_FROM_EMAIL` (optional, default falls back to `BOOKING_FROM_EMAIL`)
- `NEWSLETTER_SMTP_HOST`
- `NEWSLETTER_SMTP_PORT`
- `NEWSLETTER_SMTP_SECURE`
- `NEWSLETTER_SMTP_USER`
- `NEWSLETTER_SMTP_PASS`
- `NEWSLETTER_RESEND_API_KEY`

Persistent subscriber storage:
- `NEWSLETTER_UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_URL`
- `NEWSLETTER_UPSTASH_REDIS_REST_TOKEN` or `UPSTASH_REDIS_REST_TOKEN`
- `NEWSLETTER_SECRET` (falls back to `BOOKING_VERIFY_SECRET` for unsubscribe tokens)
- `NEWSLETTER_REQUIRE_STORAGE=true` is recommended for production so the API refuses fake success when persistent storage is missing.

Admin export:
- Set `NEWSLETTER_ADMIN_SECRET` (falls back to `BOOKING_VERIFY_SECRET`).
- Request `GET /api/newsletter?action=export` with header `Authorization: Bearer <secret>`.

Local QA:
- `npm run newsletter-flow-test` sends a real Uit Het Westen test signup through the configured provider.
