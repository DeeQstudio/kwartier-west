# Kwartier West V6.3.4 — Zwoantje / data-first artist system

Deze patch vertrekt van de huidige V6.3.3-code.

## Wat verandert
- Zwoantje toegevoegd als Hip hop-artiest.
- 21 totaal / 13 Tekno / 8 Hip hop wordt volledig uit `src/data/artists.ts` afgeleid.
- Per-artiest index (`14 / 21`) wordt runtime afgeleid, niet opgeslagen.
- Volgende artiest wordt automatisch binnen dezelfde scene bepaald.
- Tekno-, Hip hop- en home-rosters lezen rechtstreeks uit dezelfde artiestendata.
- `/artiesten` gebruikt een echte HTML/CSS `RosterBoard` met alle artiesten; geen statische tellerposter meer.
- Sitemap maakt artiesten- en eventroutes automatisch uit typed data.
- Structured-data ItemLists gebruiken automatisch de actuele roster.
- Dynamische OG-afbeelding voor `/artiesten` gebruikt actuele aantallen.
- Nieuwe-artiest announcement op home en Hip hop-pagina wordt uit artist status/announcement data gevoed.
- Zwoantje gebruikt voorlopig een Kwartier West announcement-card, geen fictief portret.

## Toepassen
Kopieer de volledige inhoud van deze patch over de root van `clients/kwartier-west` en kies vervangen/samenvoegen.

Daarna:

```powershell
npm run release
```

Als groen:

```powershell
git add .
git commit -m "Add Zwoantje and make artist system data-driven"
git push
```
