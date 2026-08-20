# Release gate

A live Kwartier West release is allowed only when all of these are true:

- `npm run typecheck` passes.
- `npm run qa` passes.
- `npm run build` passes.
- Home, Tekno, Hip hop, artiestenindex, partners, both event details and booking are visually checked at desktop and mobile widths.
- Villa West main-event status is checked before 21:55, during 21:55–00:05 and after 00:05 Europe/Brussels.
- The Villa Bota iframe and audio fallback are confirmed under the production CSP.
- Artist portraits are checked for face-safe crops; official artwork is shown uncropped/recognisable where portrait photography is not available.
- Booking test reaches the verification-email stage with production-like environment variables.
- `/booking/verifieer` is tested with one valid and one invalid/expired token.
- The 35 indexed URLs in `sitemap.xml` are present.
- Legacy `/pages/...` routes return permanent redirects.
- No missing media, favicon, OG or partner assets.
- Vercel environment variables are set for Production.
- A generated `package-lock.json` is committed before production deployment.
