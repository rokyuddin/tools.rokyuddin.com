Status: ready-for-agent

# Spec: Image Resizer

## Problem Statement

Users need to resize any type of image to exact pixel dimensions for uploads, profiles, posts, and thumbnails, without uploading personal photos to a server. Existing server tools are ad-heavy, require signup, cap at 10 MB, and delete files after hours. The repo already has single-purpose tools (compress, social crop, print check) but no general By Size / By Percentage resizer with format conversion and batch download. Users want the familiar dark editor style from the references, with extra facilities, and no text-heavy marketing sections.

## Solution

A 100% client-side Image Resizer at `/tools/image-resizer` with a blue dropzone empty state and a dark two-pane editor (settings left, image cards right). The user drops images, picks a Resize Mode (By Size, By Percentage, Social Preset), adjusts Export Format and quality, optionally sets a Target File Size, and downloads each Resized Image individually or all as ZIP. All rendering happens on canvas; files never leave the device.

## User Stories

1. As a user, I want to drag-drop or browse images into a blue dropzone, so that I can start resizing without signup.
2. As a user, I want to paste an image from clipboard with Ctrl+V, so that screenshots resize instantly.
3. As a user, I want to upload JPG, PNG, WebP, AVIF, BMP, and static GIF, so that any common photo works.
4. As a user, I want a clear error for SVG or animated images, so that I know why it was rejected.
5. As a user, I want to resize up to 10 images at once, so that batches finish in one go.
6. As a user with By Size mode, I want to type Target Dimensions width and height in px, so that upload requirements are met exactly.
7. As a user, I want Aspect Ratio Lock on by default, so that changing width auto-updates height without distortion.
8. As a user, I want to toggle Aspect Ratio Lock off for free dimensions, so that non-proportional sizes are possible.
9. As a user, I want By Percentage mode with 25/50/75/100% presets plus custom input, so that quick scaling is one click.
10. As a user, I want Social Preset mode with 6 presets (IG Square 1080x1080, IG Portrait 1080x1350, IG Story 1080x1920, FB Cover 820x312, X Post 1200x675, YT Thumbnail 1280x720), so that common posts are correct without lookup.
11. As a user, I want Fit choice per Social Preset (Crop-fill default, Blur-fill, Stretch), so that portrait photos fill landscape frames cleanly.
12. As a user, I want each card to show Original Dimensions → Target Dimensions (e.g. 393x844 → 800x800), so that the change is visible at a glance.
13. As a user, I want per-card Crop with free rect, so that framing is fixed before resize.
14. As a user, I want per-card Rotate 90° clockwise, so that orientation is corrected.
15. As a user, I want per-card Flip H/V, so that mirrored images are fixed.
16. As a user, I want per-card Info showing Original Dimensions, type, and byte size, so that I can verify inputs.
17. As a user, I want per-card Remove, plus top-bar add / clear-all, so that the queue is manageable.
18. As a user, I want to choose Export Format (Original, JPG, PNG, WebP), so that conversion happens in the same step.
19. As a user, I want a quality slider defaulting to 90%, so that JPG/WebP sharpness vs size is tunable.
20. As a user, I want optional Target File Size (10–5000 KB) for JPG/WebP, so that upload caps are hit automatically.
21. As a user, I want Target File Size to binary-search quality and warn if unreachable, so that I know when to raise the target.
22. As a user, I want PNG export to ignore quality and Target File Size, so that behavior is predictable.
23. As a user, I want upscale allowed with a "larger than original" hint, so that small icons can still fill presets with eyes open.
24. As a user, I want animated GIF input to export as static image in the chosen Export Format, so that output never silently animates.
25. As a user, I want downloads named like `name-800x600.jpg`, so that outputs are identifiable.
26. As a user, I want per-file Download plus Download All as ZIP, so that batches save quickly.
27. As a user on mobile, I want sidebar stacked above cards, so that settings remain usable on small screens.
28. As a privacy-conscious user, I want zero server uploads with 50 MB per-file and 12000px max-side caps, so that the tab never crashes and photos stay local.

## Implementation Decisions

- **Single client-side pipeline**: decode via image bitmap, apply crop/rotate/flip on canvas, scale to Target Dimensions with high-quality smoothing, encode in Export Format. No server calls, consistent with repo privacy ADR.
- **One new feature module** with a pure calculation submodule plus a UI component reusing the shared shell, dropzone, button/slider/badge/card primitives, and existing ZIP dependency. Registration in the central tools registry under Images with minimal metadata (title, one-line description, 6 keywords max — no text-heavy FAQs/features grid on the page itself).
- **Resize Mode state machine**: By Size (explicit width/height + Aspect Ratio Lock), By Percentage (scale factor × Original Dimensions), Social Preset (preset dimensions + Fit). Switching modes recomputes Target Dimensions for all queued items; manual edits in By Size break preset linkage.
- **Dimension math rules**: px only; clamp 1–12000 per side; Aspect Ratio Lock derives the edited axis from Original Dimensions; percentage rounds to nearest integer ≥1; upscale permitted with hint flag.
- **Social Fit modes**: Crop-fill (center-cover), Blur-fill (blurred background + contain), Stretch (exact fill, may distort). Default Crop-fill.
- **Export rules**: Original preserves decoded type (GIF → PNG); JPG/WebP honor quality slider; PNG ignores quality; Target File Size only enabled for JPG/WebP and runs quality binary-search (~7 iterations) toward the byte target.
- **Batch model**: one shared settings panel drives all cards; each card holds its own transform (crop rect, rotation, flip) and computed Target Dimensions; add/remove updates queue without resetting settings.
- **Empty vs editor states**: empty shows title + blue dropzone + one-line hint only (no feature grid, max 50 MB note inline); non-empty shows settings sidebar + card grid + Export/Download bar.
- **Proposed test seam (single seam)**: the pure calculation submodule (dimension solving, percentage scaling, preset+fit resolution, filename generation, Target File Size validation). UI canvas encoding stays untested (browser-only), matching prior art where only pure utils are unit-tested.

## Testing Decisions

- **What makes a good test**: only observable inputs/outputs of pure math (given Original Dimensions + mode inputs → exact Target Dimensions; given filenames → exact output names; given byte targets → valid/invalid + iteration bounds). No React hook lifecycle, no canvas pixel assertions, no DOM snapshots.
- **Modules tested**: the new pure calculation submodule, wired into the existing `scripts/run-tests.mjs` runner.
- **Cases**: Aspect Ratio Lock width→height and height→width derivation; lock-off free dims; percentage 50% of 393x844; clamp of 0/negative/oversize sides; all 6 social presets resolve to documented pixels; filename `photo.png + 800x600 → photo-800x600.png`; Target File Size below current or above 5000 KB rejected; PNG + Target File Size flagged inapplicable.
- **Prior art**: same pattern as pad-engine, dpi-calculator, rename-engine, and icon-analyzer tests already in `scripts/run-tests.mjs`.

## Out of Scope

- Filters, beauty effects, background removal, text overlays (separate editor concerns).
- Full 15+ platform social suite (lives in social-resizer); only the 6 listed presets here.
- Server-side processing, account storage, share links, or history persistence.
- Print unit conversion (cm/inch/DPI) — lives in photo-print-size-checker; this tool is px only.
- Video resizing, SVG vector scaling, multi-frame animated WebP/GIF export.
- Text-heavy marketing grid, long FAQs, or how-it-works sections on the page.

## Further Notes

- Vocabulary per `CONTEXT.md`: Original Dimensions, Target Dimensions, Resize Mode, Aspect Ratio Lock, Resized Image, Export Format.
- References: two user-supplied screenshots (dropzone hero + dark editor) — style inspiration only, not pixel copies.
- Route slug: `image-resizer`; related tools: image-compressor, image-to-webp, social-resizer.
