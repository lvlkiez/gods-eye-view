# Gaussian splat capture requirements

The Tangmo app now includes a separate Spark Gaussian splat renderer alongside the map and landmark reader. It has no real site scan and no calibrated incident reconstruction. The user confirmed on 2 October 2026 that they do not have a scan or a multi-view image folder. No case-area asset is bundled. The renderer accepts local Gaussian `.ply`, `.splat`, `.spz`, and `.ksplat` files; ordinary point clouds and meshes are not sufficient.

## Required input

A real site capture must be supplied by the user or an authorized contributor as a Gaussian splat asset (`.ply`, `.splat`, or `.spz`) together with its provenance. Capture should cover the physical site from multiple viewpoints with sufficient overlap and stable visual features. A fixed image count cannot guarantee a usable reconstruction: lighting, occlusion, motion, texture, camera calibration, and coverage determine quality.

The capture must document:

- place and the surveyed area;
- capture date and local time, plus whether conditions differ materially from the historical event;
- camera/device and capture method;
- contributor or survey organization;
- copyright, license, and permission to display or redistribute;
- coordinate reference and survey accuracy, if georeferenced.

Historical CCTV, news footage, and a multi-view site scan serve different purposes. A present-day scan can represent geometry and appearance of the site; it cannot recover the incident-night scene, prove a vessel position, or establish a fall location. CCTV and news reports must retain their own source, timestamp, camera-location, and rights records.

Google Photorealistic 3D Tiles are provider mesh tiles, not Gaussian splats. They provide geographic context in the existing Cesium scene and should not be described as a user-supplied scan or as incident evidence.

Until a usable site asset and provenance arrive, the map shows the existing sourced context and the splat panel states that the case-area scan is unavailable. No GPS inference, route reconstruction, camera calibration, or historical 4D claim should be derived from a splat, basemap, or landmark coordinate alone.

## Capture brief for a future site survey

1. Choose a bounded, stable part of the site: the pier structure and adjoining riverbank first. Record which pier/side, the capture date, and representative overview photographs.
2. Capture overlapping views while moving around that structure, keeping exposure/focus stable where possible. Cover occluded sides and connect wide views to close details. Moving water, boats, people, reflections and major lighting changes need separate treatment; a moving river surface is not a reliable static reconstruction target.
3. Preserve the original photographs/video and metadata. Train a Gaussian model using a reconstruction pipeline; renaming a mesh or point-cloud file does not create a trained scan. Check coverage and artifacts against held-out source views.
4. Export a supported Gaussian format and record the creator, capture method, rights and any control points used to align it. The viewer centers/scales the model for navigation only; that display transform is not geographic calibration.

Renderer and supported-format references: [Spark documentation](https://sparkjs.dev/docs/splat-mesh/) and [Spark project](https://github.com/sparkjsdev/spark). Capture quality depends on the source imagery; this brief does not guarantee a metrically accurate reconstruction.
