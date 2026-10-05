# Gaussian splat feasibility for the Tangmo explorer

Checked 2026-10-02 (Asia/Bangkok). This note separates **renderer capability** from **availability of a scan of the case area**.

## Finding

A browser can render a real 3D Gaussian splat: [SparkJS](https://github.com/sparkjsdev/spark) is an MIT-licensed Three.js renderer whose maintainers document `.ply`, `.spz`, `.splat`, `.ksplat`, and `.sog` support. Its [loading guide](https://github.com/sparkjsdev/spark/blob/main/docs/docs/loading-splats.md) shows URL loading, and its [source API](https://github.com/sparkjsdev/spark/blob/main/src/PackedSplats.ts) accepts file bytes for local-file loading. The team's npm metadata check found `@sparkjsdev/spark@2.3.1` requires `three >=0.180.0`; `three@0.186.1` satisfies that peer range. The package versions are implementation dependencies, not evidence of a case-area scan.

**No publicly downloadable, provenance-verified Gaussian-splat asset for Pibulsongkram 1 Pier, Rama VII/VIII bridges, or the relevant Chao Phraya riverbank was found in this bounded search.** Queries checked combinations of those place names with “Gaussian splat”, “splat”, “PLY”, and “download”, plus targeted `site:poly.cam`, `site:scaniverse.com`, and `site:superspl.at` searches. Those targeted catalog searches returned no match. This is a search result, not proof that no such scan exists privately or in an unindexed collection. Because no candidate asset was verified, its capture date, creator, location, file format, redistribution rights, and licence are all **unknown**. Do not label a generic sample splat as this location.

Google Photorealistic 3D Tiles in the current Cesium view are a tiled geographic visualization, **not a Gaussian-splat scan**. A real splat viewer can be present and tested while the case-specific asset remains unavailable; the UI should state that distinction plainly.

## Minimal integration path

1. Keep Cesium as the geographic context. Open a separate SparkJS/Three.js panel only when the user selects a verified scan or supplies a local `.ply`, `.spz`, or `.splat` file. Spark's [loading documentation](https://github.com/sparkjsdev/spark/blob/main/docs/docs/loading-splats.md) describes the supported types and load progress. A local selection should remain on the device unless the user explicitly authorizes upload.
2. In the default state, display “No verified case-area Gaussian-splat scan available” with a local-file control. A renderer demo using Spark's [butterfly sample](https://github.com/sparkjsdev/spark) may confirm technical rendering, but must be clearly isolated from case geography and evidence.
3. Before identifying any future scan as a real landmark, record its creator, capture date, place/address, original URL, file hash, usage licence, and the method/uncertainty of georeferencing. An unregistered splat camera coordinate is a local model coordinate, not a latitude/longitude or calibrated CCTV viewpoint.

[PlayCanvas's engine tutorial](https://github.com/playcanvas/developer-site/blob/main/docs/user-manual/gaussian-splatting/building/your-first-app/engine.md) is another first-party browser-rendering option. [SuperSplat's import/export documentation](https://github.com/playcanvas/developer-site/blob/main/docs/user-manual/supersplat/editor/import-export.md) covers the distinct splat formats and cautions that a generic `.ply` mesh is not automatically a Gaussian splat. It can be used later to prepare an appropriately licensed asset; it does not provide a scan of this case area.
