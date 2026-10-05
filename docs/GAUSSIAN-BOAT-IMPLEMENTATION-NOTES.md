# Illustrative boat replay

First implemented 2 October 2026; extended 5 October 2026 to cover the full police-briefing timeline and first/third-person views.

## Geometry and timing

`src/tangmo/boatRoute.js` stores 33 **authored** river control points (Rama V → Rama VIII), traced by visual inspection of [Esri World Imagery](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer) on 2 October 2026 (capture date unknown). This is presentation geometry, not historical GPS, a surveyed channel centreline or a bank polygon.

Each anchor below is placed at the **river point nearest its named landmark** (`riverStation()`), measured as distance along the authored line. Between anchors the boat moves at constant speed along the line.

| Clock | Reporting used for the time | Landmark used for the river point |
|---|---|---|
| 21:33:00 | [Naewna, 26 Apr 2022](https://www.naewna.com/local/649725): near Rama V | Rama V Bridge (Wikidata) |
| 21:36:00 | [Thai PBS, 26 Apr 2022](https://www.thaipbs.or.th/news/content/314905) (S2): Pibulsongkram 1 | Pibulsongkram 1 pier (Yellow Pages) |
| 21:54:00 | S2: camera near Thewet pier | Thewet N15 (OpenStreetMap) |
| 21:56:00 | S2: Rama VIII, photo comparison | Rama VIII Bridge (Wikidata) — southern turn |
| 22:18:00 | S2: camera at "Sang Hi" bridge | Krung Thon Bridge (Wikidata) |
| 22:21:00 | S2: behind Parliament | Sappaya-Sapasathan (OpenStreetMap centroid) |
| 22:33:51 | S2: Pibulsongkram 1 camera starts capturing the boat | Pibulsongkram 1 pier |
| 22:34:10 | S2: **police inference** from CCTV | *Extrapolated*: previous leg continued at the same speed for 19 s (~74 m). Not a reported location. |

Minute-precision times use :00 seconds. Implied leg speeds range from about 4 km/h (Rama VIII → Krung Thon, 22 minutes for 1.4 km of line) to about 46 km/h (Krung Thon → Parliament); they are artefacts of anchoring and constant-speed interpolation, not measured speeds, stops or turns. The 22:11 booking and other unlocated events appear as timed captions only. The replay ends at 22:34:10. **No person, fall, recovery or camera coverage is animated.**

## Model, water and cameras

`scripts/build-tangmo-boat.mjs` builds an original, deterministic generic GLB (~7.6 m, glTF Y-up, +Z bow); it is not a dimension claim about the case vessel. Cesium maps the bow to local +X, so heading is bearing − 90°.

- **Water level.** On ellipsoid basemaps the river is at height 0. On Google 3D tiles the surface is sampled with `sampleHeightMostDetailed` at three river points (median; ≈ −28.6 m, consistent with the local EGM96 geoid); −28 m is used until the sample returns. Boat, route, trail, anchors and the recovery ring are re-placed relative to that level.
- **Free view.** The model is enlarged (`minimumPixelSize` 56, `maximumScale` 20) so it can be seen from far away.
- **First person (บนเรือ).** Real scale; eye 2.05 m above the model origin, 0.7 m aft of centre, pitch −10°, near plane 0.15 m. Drag looks around.
- **Third person (ติดตามเรือ).** Real scale; `lookAt` 30 m behind at −12°. Drag orbits, wheel zooms (12–900 m).
- Camera heading eases toward the bow with a ~0.5 s time constant independent of frame rate. Keyboard flight or a viewpoint selection returns to the free view; dragging in first/third person does not.
- Far labels are hidden (beyond 1.6 km) in first/third person to keep the horizon readable.

Playback uses animation-frame time capped at 0.25 s per frame. It pauses when the 3D tab is left, when the photo or Gaussian dialog opens, and when the page is hidden.

## Verification

`boatRoute.test.mjs` checks anchor/event/source resolution, time formatting, that located anchors sit on the river within 700 m of their landmark, the short extrapolation, continuity at joins, the bow reversal at Rama VIII, bounded sampling and the replay-window mapping. `scripts/qa-tangmo-boat.mjs` checks the GLB fetch, movement, pause/seek/restart/end, anchors and captions, the return leg, the three perspectives with dragging, keyboard release, pausing rules and the mobile HUD. These validate the demo's behaviour, not historical accuracy.
