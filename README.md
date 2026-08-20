# Kwartier West Flagship V6.3

Production migration of the V5 visual/content source to **Next.js 16.3.1 + TypeScript + React 19.2.8**.

## Architecture

- `src/app` — App Router routes, metadata routes and API route handlers.
- `src/data/artists.ts` — one typed source of truth for all 21 artists; home, scene rosters, artist index, booking UI and artist pages derive from it.
- `src/data/events.ts` — typed event registry.
- `src/components` — shared navigation, footer, artist renderer, typed roster/index modules, booking UI and motion layer.
- `src/lib/booking-server.ts` — server-only booking validation, Turnstile, signed verification links, private Vercel Blob workflow and email delivery.
- `public/assets` — production visual assets migrated without changing their public URLs.
- `scripts/release-qa.mjs` — release contract for routes, assets, security markers and migration integrity.

The V5 design language and public route structure are intentionally preserved, with the V6.2 visual repair baseline and the V6.3 content/navigation repair layered on top.

## V6.3 live/event + visual/content hardening

- Villa West on **21 August 2026** remains the current main event until the final live window ends.
- Villa Bota video is loaded only from **21:55 to 00:05 Europe/Brussels**, with the existing audio fallback.
- CSP explicitly permits only the required Villa Bota video frame and stream host.
- The final Villa West poster, timetable and line-up are the current event source: Thorre + Siga & Lefever 22:00–23:00, Wildcard 23:00–00:00.
- Tekno now leads with authentic event photography plus recognisable Kwartier West scene artwork instead of the previous synthetic hero.
- Hip hop uses a general scene visual for the intro and puts De Kweker in the primary artist position.
- De Kweker has stronger metadata/structured data and a direct crawlable official-site link to `https://kwkr.be`.
- Artist media distinguishes face-led photography from official artwork so logos/artwork are not destructively cropped.
- Interior chapters receive a shared scroll-directed 3D/depth layer on top of their existing page-specific motion.
- Partner surfaces were rebuilt as dark glass/matte plates; the oversized white logo boxes are removed.
- Public-facing copy was rewritten to describe Kwartier West, its artists, scenes, events and bookings instead of explaining website templates, routes, image handling or archive mechanics.
- The artists-page navigation is now permanently high-contrast on a dark navigation surface, including over light hero sections.
- The duplicate oversized Kwartier West wordmark before the home booking CTA is removed; the footer remains the single large closing brand moment.
- The home booking close is now a direct booking proposition rather than a duplicate brand panel.

## Local setup

1. Use Node 22.
2. Copy `.env.example` to `.env.local` and fill the required secrets.
3. Run `npm install`.
4. Run `npm run release`.
5. Run `npm run dev` for local visual QA.

**Do not deploy before `npm run release` passes.** The generated package does not include `node_modules`.

## Required Vercel environment variables

Required in production:

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `BOOKING_VERIFY_SECRET` (minimum 32 characters)
- `BLOB_READ_WRITE_TOKEN`
- `BOOKING_TO_EMAIL`

Choose one mail path:

- Resend: `RESEND_API_KEY` + `BOOKING_FROM_EMAIL`
- SMTP: `BOOKING_SMTP_HOST`, `BOOKING_SMTP_PORT`, `BOOKING_SMTP_USER`, `BOOKING_SMTP_PASS`

## Booking flow

1. Client submits JSON only after Cloudflare Turnstile succeeds.
2. Server validates exact keys, sizes, scene/artist combinations and timing.
3. Request is stored in a **private** Vercel Blob.
4. The visitor receives a signed, 20-minute email verification link.
5. Verification atomically claims the request and forwards it to Kwartier West.
6. The pending request is removed after successful forwarding.

The in-process request throttle is intentionally a secondary guard. For a high-traffic production launch, also configure a Vercel Firewall rate-limit rule on `POST /api/bookings`; Turnstile and email verification remain the primary abuse controls.

## Security note

The site keeps the V5 security-header baseline. The CSP allows inline script/style execution because Next.js App Router injects framework bootstrap payloads. No user-supplied HTML is rendered; the only `dangerouslySetInnerHTML` use is static JSON-LD serialization. If you later choose nonce-based CSP, Next.js requires request-time rendering for nonce injection, which changes the caching/performance profile.

## Legacy URL preservation

Historical `/pages/...` routes and old artist/event paths redirect permanently through `next.config.ts`. Public asset URLs remain unchanged.

## Before replacing live

A clean release requires:

```bash
npm install
npm run release
```

Then deploy this project root to the existing Vercel project. Keep the current live site untouched until the build and visual QA both pass.
