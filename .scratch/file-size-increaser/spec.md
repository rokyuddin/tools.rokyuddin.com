Status: ready-for-agent

# Spec: File Size Increaser & Image Padder

## Problem Statement

Users frequently encounter upload forms (such as job portals, government verification sites, passport agencies, or university admissions) with strict *minimum* file size requirements (e.g., "Image must be at least 500 KB" or "Document must be between 1 MB and 5 MB"). When a user's scanned photo or document is only 10 KB or 50 KB, they have no simple, privacy-safe way to increase its size to meet the threshold without either arbitrarily degrading quality through re-encoding or uploading sensitive personal documents to third-party ad-heavy server backends.

## Solution

A high-performance, 100% in-browser client-side tool (`/tools/file-size-increaser`) that accepts any image or file and pads it to an exact byte-accurate target file size (e.g., from 10 KB to 1 MB). 

The interaction is crafted cleanly without generic AI slop:
1. **Initial Upload & Automatic Modal**: When the user drops or selects a file, a focused modal dialog immediately opens asking for the target size, with smart defaults and quick-pick presets (e.g., `100 KB`, `500 KB`, `1 MB`, `2 MB`, `5 MB`).
2. **Immediate Workbench Transition**: Once confirmed, the modal dismisses and reveals a clean workbench showing file details, image thumbnail (or document type badge), live comparison stats (original vs padded), and a one-click download.
3. **Frictionless Inline Re-adjustments**: Users do not need to reopen the modal for subsequent edits—an inline target size input and preset pills allow live adjustments with instant download updates.

## User Stories

1. As a user with a 15 KB passport photo, I want to increase its file size to 100 KB without changing the image dimensions or visual clarity, so that the visa application system accepts it.
2. As a user uploading a file for the first time, I want a prompt modal to immediately ask what target size I need, so that I can set my desired size in one step without hunting through settings.
3. As a user who already set a target size in the initial popup, I want an easily accessible inline input field in the main interface, so that I can quickly tweak the size to 1.5 MB without reopening a popup.
4. As a user with a document (PDF, TXT, DOCX), I want to inflate its file size just as easily as an image, so that arbitrary file upload validation rules can be satisfied.
5. As an applicant submitting a government form with a minimum 1 MB rule, I want one-click quick preset buttons (like 500 KB, 1 MB, 2 MB), so that I don't have to calculate byte conversions manually.
6. As a privacy-conscious user, I want all processing to happen purely client-side in my browser, so that my personal photos or sensitive documents are never uploaded to an external server.
7. As a user, I want instant validation when entering a target size smaller than the source file, so that I understand a file cannot be padded below its existing weight.
8. As a user on a mobile device or laptop, I want a safe maximum target size (100 MB), so that the application never freezes my browser tab with excessive memory allocations.
9. As a user, I want the downloaded file to have an informative name like `myphoto-1MB.jpg`, so that I can immediately identify the padded file among my downloads.
10. As a user who wants to process another document, I want a clear "Upload another file" action, so that I can restart the flow cleanly.
11. As a keyboard and screen-reader user, I want the initial target size modal to trap focus properly, autofocus the primary numeric input, and allow submission via Enter or Escape dismissal.

## Implementation Decisions

- **Client-Side Binary Trailer Padding**:
  - The padding operation appends standard null bytes (`0x00`) to the original file data using browser `Blob([originalFile, paddingBuffer], { type: file.type })`.
  - This avoids lossy re-encoding, preserves pixel fidelity, runs in sub-millisecond time, and works identically across all file formats. (Recorded in `docs/adr/0001-client-side-binary-padding.md`).
- **Single-File Modal-First Flow**:
  - Primary interaction model operates on a single file at a time.
  - On first file upload: automatically opens the `TargetSizeModal` pre-populated with a recommended size (e.g. next whole MB or 1 MB).
  - On confirm: dismisses modal, sets active session, and enables live inline editing on the main workbench. (Recorded in `docs/adr/0002-single-file-workflow-and-modal-flow.md`).
- **Safety Bounds and Number Precision**:
  - Minimum allowed target size: `currentFileSizeBytes + 1 byte`.
  - Maximum allowed target size: `100 MB` (104,857,600 bytes).
  - Unit scaling uses standard binary multiplier (1 KB = 1,024 Bytes, 1 MB = 1,048,576 Bytes). (Recorded in `docs/adr/0003-file-size-limits-and-naming.md`).
- **Anti-UI-Slop Interface Execution**:
  - Follows existing `tools.rokyuddin.com` design system tokens (Tailwind CSS, Base UI, Lucide icons, dark/light theme aware).
  - Clear visual hierarchy: Upload dropzone -> Target Size Modal -> Workbench (File card + visual preview thumbnail, real-time stats badge grid, inline size bar with quick pills, primary action button).
  - Empty, loading, error, and success states properly accounted for without generic unstyled cards.
- **Route and Tool Metadata**:
  - Slug: `file-size-increaser` at `/tools/file-size-increaser`.
  - Category: `Images` & `Documents`.
  - Integrated into `src/config/tools.ts` with complete FAQs, features, and step-by-step instructions.

## Testing Decisions

- **What makes a good test**: Only test observable inputs and outputs (pure calculation, string/byte formatting, edge case bounds validation, blob construction), not internal React hook lifecycles.
- **Modules tested**:
  - `src/features/file-size-increaser/lib/pad-engine.ts` (tested directly in `scripts/run-tests.mjs`).
  - Tests covering:
    - Calculation of exact padding byte count.
    - Zero/negative padding rejection.
    - Maximum boundary (100 MB) enforcement.
    - KB and MB parsing to exact byte values.
    - File extension and output name preservation.
    - Blob byte length verification.
- **Prior art**: Follows existing unit tests in `scripts/run-tests.mjs` for other utilities (e.g., batch-renamer, dpi-calculator, text-cleaner).

## Out of Scope

- Lossy compression or downscaling (handled separately by `/tools/image-compressor`).
- In-place pixel upscaling or image resolution resizing (handled separately by `/tools/social-resizer`).
- Server-side multi-gigabyte video or binary inflating.
- Batch multi-file simultaneous zipper (focus is single-file high-clarity flow).

## Further Notes

- References:
  - `CONTEXT.md` (Domain glossary)
  - `docs/adr/0001-client-side-binary-padding.md`
  - `docs/adr/0002-single-file-workflow-and-modal-flow.md`
  - `docs/adr/0003-file-size-limits-and-naming.md`
