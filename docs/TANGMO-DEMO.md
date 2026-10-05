# Tangmo — Scene Reconstruction (edition 03)

A standalone, Thai-language scene reconstruction of the night of 24 February 2022 on the Chao Phraya, laid out after the [Flight 7598 reconstruction](https://flight-7598-crash.bilawalsidhu.chatgpt.site/) and the "God's Eye View of Time" idea in [Bilawal Sidhu's video](https://www.youtube.com/watch?v=rVlRQakpOME). Those references shaped the presentation (3D scene + viewpoint gallery + replay + source video + annotated track), not any factual claim about this case. Case research snapshot: **2 October 2026**; landmark additions and redesign: **5 October 2026**. This is not a live case-status service and not a finding about the case.

```powershell
npm run dev -- --host localhost --port 4188
```

Open <http://localhost:4188/tangmo.html>. The original console remains at `/`. `npm run build` includes both HTML entries.

## What is on the page

| Area | Flight 7598 counterpart | What it shows here |
|---|---|---|
| **3D Reconstruction** tab | Gaussian-splat scene | Cesium with **Google Photorealistic 3D Tiles** of the real river (present-day provider mesh, *not* a Gaussian splat and *not* incident-night imagery). Falls back to Esri World Imagery, then OpenStreetMap. The river surface height is sampled from the mesh (≈ −28.6 m ellipsoid) so the boat sits on the water. |
| Toolbar | Fly / Photos / Top down / Overview | Viewpoint tour, location photographs (credited Commons/Esri), top-down, overview, **night grade**, labels, and the local **Gaussian splat** viewer for a user-supplied scan. |
| **Explore the scene** strip | Scene photo gallery | 10 viewpoints in journey order (Rama V 21:33 → Pibulsongkram 1 → Thewet → Rama VIII → Krung Thon → behind Parliament → pier at water level → reported recovery distance → Rama VII). Thumbnails are live top-down Esri exports; nothing is stored. ← → keys step through them. |
| Side panel **คืนเกิดเหตุ** | "The landing, reconstructed" | Illustrative boat replay 21:33:00–22:34:10 with **บนเรือ** (first person), **ติดตามเรือ** (third person, drag to orbit, wheel to zoom) and **มุมอิสระ** (free). 30×/60×/120× playback, anchor ticks, timed captions for each reported event, and the anchor list with sources. |
| Side panel **ลำดับเหตุการณ์** | — | All 18 sourced events. Events inside the replay window seek it; others fly to a viewpoint or the overview. |
| Side panel **แหล่งข้อมูล** | — | Sources, source discrepancies, later proceedings, method notes, limitations, credits and JSON export. |
| **วิดีโอต้นทาง** tab | Source video | Click-to-load Thai PBS news segment on the 26 Apr 2022 briefing (news coverage, not CCTV). |
| **เส้นทางเรือ** tab | Flight track | North-up annotated SVG over a live Esri export: southbound and northbound legs, the 8 time anchors, the 235–300 m reported-distance ring. Clicking a time opens that moment in the 3D replay. Works without WebGL. |

Keyboard: **WASD** move on the horizontal plane, **Q/E** down/up, **Shift** faster, **← →** viewpoints, **Space** play/pause, **Esc** collapse/stop tour. Double-click recentres on the picked point.

## Evidence boundary

- **Times** come from Thai PBS's [report of the 26 Apr 2022 police briefing](https://www.thaipbs.or.th/news/content/314905) (Naewna for 21:33 at Rama V) and contemporaneous Thai PBS reporting. They are not raw GPS, CCTV or court records.
- **Positions** are authored. Each reported passage is tied to the river point nearest the named landmark on an authored river line; between anchors the boat moves at constant speed. No speed, stop, turn or camera position is established. The implied leg speeds (4–46 km/h) are artefacts of that method.
- **22:34:10** is the police's *inference* from CCTV. The replay ends there, labels it as an inference, and places the boat by continuing the previous leg for 19 s. **No person and no fall is animated.**
- The **red ring** shows the reported recovery distance from Pibulsongkram 1 (S1: within 300 m; S2: 235 m). Direction was not reported, so no point is pinned.
- **Night mode** is a colour grade for atmosphere, not a measured lighting or visibility model.
- The 3D mesh, imagery and thumbnails are present-day provider data with unknown or unstated capture dates.
- The title says "Scene Reconstruction" (พื้นที่เกิดเหตุ). The first-instance court acquitted three defendants of negligent death (23 May 2025, per Thai PBS); later proceedings are listed with their caveats. The page does not assert a crime or identify anyone.

See [case research](research/TANGMO-CASE-RESEARCH.md), [geography research](research/TANGMO-GEOGRAPHY-RESEARCH.md), [photo research](research/TANGMO-LANDMARK-PHOTO-RESEARCH.md) and [boat implementation](GAUSSIAN-BOAT-IMPLEMENTATION-NOTES.md).

## Toward a true Gaussian-splat scene

Flight 7598's main view is a Gaussian splat trained from NTSB drone footage. No comparable footage or scan of the pier area with known provenance and rights was available here, so the Google mesh stands in. A real capture can be opened today in the Gaussian splat dialog (`.ply`, `.splat`, `.spz`, `.ksplat`, decoded locally). See [capture requirements](GAUSSIAN-SPLAT-CAPTURE.md) and [renderer research](research/TANGMO-SPLAT-RESEARCH.md).

## Files

- `tangmo.html` — Vite entry.
- `src/tangmo/main.js` — page layout and wiring; `style.css` — styles.
- `src/tangmo/scene.js` — Cesium scene: basemaps, water-height sampling, boat, route, anchors, ring, perspectives, night grade, keyboard flight.
- `src/tangmo/replay.js` — replay controls, HUD clock and captions.
- `src/tangmo/shots.js` — viewpoints and live thumbnail URLs.
- `src/tangmo/trackMap.js` — annotated track view.
- `src/tangmo/caseFile.js` — timeline, sources and method panels.
- `src/tangmo/boatRoute.js` — authored river line, anchors, sampling.
- `src/tangmo/caseData.js`, `researchContext.js` — sourced records.
- `src/tangmo/landmarkImages.js`, `landmarkPhotos.js`, `photos.css` — credited images and viewer.
- `src/tangmo/splatPanel.js`, `splatViewer.js`, `splatFile.js`, `splat.css` — local Gaussian viewer.

## Validation

```powershell
node --test src/tangmo/caseData.test.mjs src/tangmo/boatRoute.test.mjs src/tangmo/splatFile.test.mjs
npm run build
# In one terminal:
npm run preview -- --host localhost --port 4189
# In another terminal:
node scripts/qa-tangmo.mjs
node scripts/qa-tangmo-boat.mjs
node scripts/qa-tangmo-photos.mjs
node scripts/qa-tangmo-splat.mjs
```

The browser scripts use headless Chrome with SwiftShader; Google 3D tiles render slowly there, so allow several minutes. Screenshots go to the ignored `qa-shots/tangmo/`. These checks validate the page's behaviour and labelling, not the underlying evidence.
