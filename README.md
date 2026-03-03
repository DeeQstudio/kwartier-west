# Kwartier West Website

Production-grade frontend for Kwartier West.

## Core goals
- Two artist lanes: Tekno and Hip hop.
- Booking flow for single artist, multiple artists, side collective, full label takeover.
- Event hub with official social source references.
- Shared storefront for Kwartier West merch + artist merch.
- Data contracts prepared for future app/webhook integration.
- International UX: language detection + persistent language switch across pages.

## Routes
- `/index.html`
- `/pages/tekno/index.html`
- `/pages/hiphop/index.html`
- `/pages/events/index.html`
- `/pages/booking/index.html`
- `/pages/shop/index.html`
- `/pages/partners/index.html`
- `/pages/contact/index.html`
- `/pages/manifest/index.html`

## Data contracts
- `data/artists.json`
- `data/events.json`
- `data/shop.json`
- `data/partners.json`
- `data/integrations.json`

## Commands
- `npm run dev`
- `npm run validate`
- `npm run artist-pages`
- `npm run event-pages`
- `npm run seo-build`
- `npm run site-check`
- `npm run check`

## Internationalization
- Base language: Dutch (nl-BE).
- Language switch is available globally in the navigation and on the landing page.
- Language preference is saved in local storage and also synced via `?lang=<code>` in the URL.
- Core UI translations are provided for: `en`, `nl`, `fr`, `de`, `es`, `pt`, `it`, `pl`, `ru`, `tr`, `ar`, `zh`.

## Integration handoff
When backend/app is ready, connect:
1. `data/integrations.json.eventSync.endpoint`
2. `data/integrations.json.bookingWebhook.endpoint`
3. `data/integrations.json.shopApi.endpoint`

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
