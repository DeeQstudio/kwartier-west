# Kwartier West V6.3.3 UX consolidation patch

Copy every item in this patch over the existing `clients/kwartier-west` repository root and choose merge/replace.

This patch consolidates:
- automatic home opening composition (no scroll input required for the opening movement)
- removal of the red intro signal line and instructional `SCROLL` / `OPEN KWARTIER WEST` copy
- professional mobile typography without automatic hyphenation
- adaptive artist quote/name sizing for long words
- per-artist photo focal points and identity-safe mobile artist framing
- 20-artist roster banner, cache-busted as `artists-banner-v2.webp`
- corrected 20-artist OG image
- artist hero title/image separation so headings do not cover faces
- QA guards for former-artist remnants, stale roster banner references and automatic hyphenation

After copying:

    npm run release

Then, only if green:

    git add .
    git commit -m "Polish mobile type, artist framing and home intro"
    git push
