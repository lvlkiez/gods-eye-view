# Tangmo geography research

Checked 2026-10-02 (Asia/Bangkok). WGS84 values are **latitude, longitude** for named landmarks. They are database coordinates, not surveyed positions or evidence of where a vessel or person was at any time.

| Landmark | Coordinate | Source and interpretation |
|---|---:|---|
| Pibulsongkram 1 Pier (ท่าพิบูลสงคราม 1) | **13.81817, 100.50574** | [Thailand Yellow Pages place record](https://www.yellowpages.co.th/profile/%E0%B8%97%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%9E%E0%B8%B4%E0%B8%9A%E0%B8%B9%E0%B8%A5%E0%B8%AA%E0%B8%87%E0%B8%84%E0%B8%A3%E0%B8%B2%E0%B8%A1-1-nadHa8); the [Marine Department description](https://md.go.th/wp-content/uploads/2021/11/description_express_boat59.pdf?91=) identifies the pier. The pin is not a fall or recovery coordinate. |
| Rama VII Bridge (สะพานพระราม 7) | **13.8143889, 100.5142694** | [Wikidata Q4797664](https://www.wikidata.org/wiki/Q4797664), point for the named bridge. No sourced passage time is tied to this landmark in the event set. |
| Rama VIII Bridge (สะพานพระราม 8) | **13.7691694, 100.4968111** | [Wikidata Q1092231](https://www.wikidata.org/wiki/Q1092231), point for the named bridge. Not the position of a boat in the cited photograph. |
| Rama V Bridge (สะพานพระราม 5) | **13.8324961, 100.4953120** | [Wikidata Q6637699](https://www.wikidata.org/wiki/Q6637699), point for the named bridge. The reported passage time does not turn the bridge point into a vessel coordinate. |

### Added 5 October 2026 for the police-timeline anchors

The police timeline (S2) names three more places between Pibulsongkram 1 and Rama VIII. They were checked on 2026-10-05 and added as landmarks only:

| Landmark | Coordinate | Source and interpretation |
|---|---:|---|
| Thewet express-boat pier N15 (ท่าเรือเทเวศร์) | **13.7720432, 100.5000982** | [OpenStreetMap node 3542061069](https://www.openstreetmap.org/node/3542061069), tagged `ferry_terminal`, `ref=N15` (© OpenStreetMap contributors, ODbL). Wikidata's "Thewet Pier" item [Q131557237](https://www.wikidata.org/wiki/Q131557237) links to [node 8130294690](https://www.openstreetmap.org/node/8130294690) at 13.7685662, 100.5048108 — that is the **Khlong Phadung Krung Kasem canal pier**, about 700 m inland, and is deliberately not used. Not a camera position. |
| Krung Thon Bridge / "Sang Hi" (สะพานกรุงธน) | **13.781028, 100.502436** | [Wikidata Q1538356](https://www.wikidata.org/wiki/Q1538356); consistent with OSM bridge way 965041298. Not the police-cited camera position. |
| Parliament, Sappaya-Sapasathan (สัปปายะสภาสถาน) | **13.7959694, 100.5173266** | Centroid of [OSM way 665907390](https://www.openstreetmap.org/way/665907390) from Nominatim. Wikidata Q25543625 gives only ~0.009° precision, so OSM is used. "Behind Parliament" is the riverside; the boat anchor is the nearest river point, not the building. |

The replay ties each reported passage time to the **river point nearest the named landmark** on the authored river line (see [boat implementation](../GAUSSIAN-BOAT-IMPLEMENTATION-NOTES.md)). That is a presentation choice, not evidence of where the boat or a camera was.

**NBC Nonthaburi Boat Club / boat yard:** no independently verified map coordinate in the reviewed material. [Thai Rath](https://www.thairath.co.th/news/local/central/2331321) names the yard in case reporting but does not supply a usable point. Events referring to the yard therefore have no location pin.

## Geometry and basemaps

Attempts to fetch OpenStreetMap geometry through Overpass on 2026-10-02 returned HTTP 406/429 or timed out; **no vector geometry was downloaded or added to the app**. The scene uses provider imagery/tiles: Esri World Imagery by default, OpenStreetMap raster tiles as fallback/street view, and optionally Google Photorealistic 3D Tiles when configured. Provider tiles are geographic background, not a contemporaneous record of February 2022. OpenStreetMap attribution and terms: [openstreetmap.org/copyright](https://www.openstreetmap.org/copyright).

If river banks or a route are added in future, the geometry must have a traceable source and retrieval date. A river centreline cannot be treated as a bank polygon. No route can be inferred from the four landmark points. Do not render these coordinates as a fall point, recovery point, camera location, or vessel track.

**Implementation update, 2 October 2026:** a separate, explicitly illustrative boat mode now uses authored control points traced along an Esri imagery export viewed on this date. It does not infer geometry from the four landmark pins. Every boat position is authored, including the water points associated with reported passage times. See [boat geometry and timing provenance](../GAUSSIAN-BOAT-IMPLEMENTATION-NOTES.md); no raw boat GPS was obtained.

## Source video

[Thai PBS Evening News, “ปฏิกิริยาสื่อ กับการแถลงปิดสำนวนคดี ‘แตงโม’” (26 April 2022)](https://www.thaipbs.or.th/program/EveningNews/watch/EdqxRY) is the verified broadcaster landing page for the [linked video](https://www.youtube.com/watch?v=Xpv4U2xqLEM). It is a news report about the briefing and media response, **not** the entire police briefing or original CCTV. It cannot establish camera location, calibration, or a precise incident coordinate. Footage is linked or user-loaded from its source, not re-hosted.
