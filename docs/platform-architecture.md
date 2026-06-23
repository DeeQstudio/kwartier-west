# Kwartier West Platform Architecture

## Mission
One frontend platform for:
- Tekno and Hip hop collectives.
- Booking intake (single, multiple, side collective, full takeover).
- Event feed with source provenance.
- Villa West and launch events as first-class public routes.
- Parked merch/storefront contracts for a later phase.
- Future app integration on the same contracts.

## Core Boundaries
- `data/*.json`: source-of-truth content contracts.
- `js/core/content-api.js`: all content loading and normalization.
- `js/core/integration-client.js`: remote fetch/post + timeout logic.
- `js/core/i18n.js`: language detection, persistence, translation mapping.
- `js/core/format.js`: display formatting, escape, labels.
- `partials/*.js`: shared navigation and side switching.
- `js/*.js`: page-level mount/render modules.

## Rendering Model
- HTML pages remain thin shells with semantic landmarks.
- Each page mounts dynamic regions via dedicated JS module.
- UI strings come from i18n keys; avoid hardcoded runtime text.
- Components should be data-driven and stateless where possible.

## Accessibility Baseline
- Keyboard-first navigation (skip links, focus visibility, target sizing).
- Strong contrast defaults + `prefers-contrast` support.
- Motion respects `prefers-reduced-motion`.
- State communicated via ARIA attributes (`aria-current`, `aria-live`, labels).

## Quality Gates
- `npm run validate`: contract-level data validation.
- `npm run site-check`: route smoke checks.
- `npm run check`: required before deployment.

## Evolution Path
1. Connect remote APIs/webhooks through `data/integrations.json`.
2. Keep schema compatibility in `data/validate.mjs` when extending contracts.
3. Expand translations from EN/NL-first to full-locale parity.
4. Add E2E flow tests for booking, event filters, and language switching.
