# Release gate

A live Kwartier West release is allowed only when all of these are true:

- `npm run typecheck` passes.
- `npm run qa` passes.
- `npm run build` passes.
- Home, Tekno, Hip hop, artiestenindex, partners, both event details and booking are visually checked at desktop and mobile widths.
- Villa West is shown consistently as a completed archive event on home, events, archive and event detail routes.
- The versioned Summer Recap 2026 artwork loads without crop or horizontal overflow, and no retired livestream origin remains in the production source or CSP.
- Artist portraits are checked for face-safe crops; official artwork is shown uncropped/recognisable where portrait photography is not available.
- Booking test reaches the verification-email stage with production-like environment variables.
- `/booking/verifieer` is tested with one valid and one invalid/expired token.
- Every route derived by the typed artist and event registries is present in `sitemap.xml`.
- Legacy `/pages/...` routes return permanent redirects.
- No missing media, favicon, OG or partner assets.
- Vercel environment variables are set for Production.
- A generated `package-lock.json` is committed before production deployment.
