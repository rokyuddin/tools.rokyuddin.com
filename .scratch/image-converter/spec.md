Status: ready-for-agent

# Spec: Image Converter

## Problem Statement

Users need to convert images between formats (JPG ↔ PNG ↔ WebP) with control over quality, resolution, and file size, without uploading personal photos to ad-heavy server tools. The repo has single-target converters (image-to-webp) but no universal any-to-any converter with per-file options.

## Solution

A 100% client-side Image Converter at `/tools/image-converter`. Users drop files into a queue; each row shows a from-format badge, an output-format picker, an Options button opening a per-file modal (quality, custom resolution with Aspect Ratio Lock, JPG background fill, target file size), per-file Download, and a bottom bar with batch ZIP download.

## User Stories

1. As a user, I want to convert JPG, PNG, WebP, GIF, BMP, and AVIF inputs to JPG, PNG, or WebP, so that any common conversion works.
2. As a user, I want a clear error for SVG and HEIC/HEIF files, so that I know browsers cannot decode them.
3. As a user, I want a per-file output format picker, so that mixed batches convert differently per file.
4. As a user, I want per-file Options for quality (JPG/WebP), so that sharpness vs size is tunable.
5. As a user, I want per-file resolution control (Original or Custom W×H with Aspect Ratio Lock), so that conversion and resizing happen in one step.
6. As a user converting transparency to JPG, I want a background fill color choice, so that transparent areas look intentional.
7. As a user, I want a per-file target file size (JPG/WebP), so that upload caps are hit automatically.
8. As a privacy-conscious user, I want EXIF metadata stripped on export, so that no camera or location data leaks.
9. As a user, I want per-file Download plus Download All ZIP, so that batches save quickly.

## Implementation Decisions

- **Single client-side pipeline**: reuses the image-resizer render pipeline (`renderResizedBlob`, `renderToTargetSize`) with a new `background` fill option (default white). Conversion always re-encodes, which strips EXIF.
- **One new feature module** reusing shared shell, dropzone, button/slider/badge/card/input/field/tabs primitives, the modal shell pattern, and existing ZIP dependency. Registered in the central tools registry under Images.
- **Format scope**: input JPG/PNG/WebP/GIF(first frame)/BMP/AVIF; output JPG/PNG/WebP (browser-encodable). SVG and HEIC/HEIF rejected with explicit messages.
- **Filenames**: `convertedFileName` swaps the extension for the target mime (`photo.jpg` → `photo.png`).
- **Batch model**: up to 10 files, 50 MB each, 12000px max side; instant re-render on option change (debounced).

## Testing Decisions

- **What makes a good test**: only observable inputs/outputs of pure helpers. No React lifecycle, no canvas assertions.
- **Modules tested**: `convertedFileName` and existing resize/render helpers, wired into `scripts/run-tests.mjs`.
- **Prior art**: same pattern as pad-engine, resize-engine tests.

## Out of Scope

- SVG vector conversion, HEIC/HEIF decoding, animated GIF/WebP export, AVIF output (no reliable browser encoder).
- Crop/rotate/flip editing (lives in image-resizer).
- Server-side conversion or preset conversion pairs as separate routes.

## Further Notes

- Vocabulary per `CONTEXT.md` (Original Dimensions, Target Dimensions, Export Format, Resized Image).
- Route slug: `image-converter`; related tools: image-to-webp, image-compressor, image-resizer.
