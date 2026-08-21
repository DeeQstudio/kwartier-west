# Kwartier West V6.3.2 consolidation patch

Overlay this patch on the current `kwartier-west` repository root and replace existing files.

This consolidates:
- 20-artist roster after former-member removal
- dynamic artist count (no hardcoded 21)
- regenerated artist banner and OG image with 20 / 13 Tekno / 07 Hip hop
- current home photographic intro + Tuffer Hip hop scene
- automatic cinematic intro prelude without auto-scrolling the page
- cached/rerouted motion lifecycle with lighter mobile transform ranges
- QA guard against reintroducing the removed former artist

After overlay:
1. Confirm no former-member files exist under `public/assets/media/artists` or `public/assets/og/artists`.
2. Run `npm run release`.
3. Commit/push only if release is green.
