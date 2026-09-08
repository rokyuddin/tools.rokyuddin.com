# tools.rokyuddin.com

A suite of fast, client-side, privacy-first web utilities and productivity tools.

## Language

### File Size Increaser

**Target File Size**:
The exact total file size in bytes requested by the user for the output file.
_Avoid_: Desired weight, output dimension

**File Padding**:
The operation of appending null bytes or trailer data to reach the target file size without modifying original data.
_Avoid_: File bloating, fake expansion, file corruption

**Padded File**:
The resulting file containing original file content followed by the exact padding bytes required to match the target file size.
_Avoid_: Inflated image, dummy file

**Size Preset**:
A predefined standard target file size chip (e.g. 500 KB, 1 MB, 2 MB) provided for quick selection.
_Avoid_: Quick size, template size

**Safe Maximum Target Size**:
The enforced upper boundary (100 MB) preventing client memory exhaustion when constructing in-browser Blobs.
_Avoid_: File threshold, memory cap

**Target Unit**:
The digital information measurement unit (`KB` or `MB`) chosen by the user to express the Target File Size.
_Avoid_: Scale, size magnitude

### Image Resizer

**Original Dimensions**:
The pixel width × height read from the source image before any change.
_Avoid_: Original size, source resolution

**Target Dimensions**:
The pixel width × height requested by the user for the output image.
_Avoid_: Output dimension, desired weight

**Resize Mode**:
How Target Dimensions are chosen: `By Size` (explicit width/height), `By Percentage` (scale of original), or `Social Preset` (platform dimensions).
_Avoid_: Resize type, size mode

**Aspect Ratio Lock**:
When on, changing width auto-updates height (and vice versa) to preserve original proportions.
_Avoid_: Lock ratio, proportion lock

**Resized Image**:
The resulting image rendered on canvas at Target Dimensions and encoded in the chosen Export Format.
_Avoid_: Inflated image, converted image

**Export Format**:
The output encoding (`Original`, `JPG`, `PNG`, or `WebP`) chosen for the Resized Image.
_Avoid_: Save as type, file type

### Meme Generator

**Meme Template**:
A pre-loaded background image from the built-in gallery that the user picks as a starting point.
_Avoid_: Meme background, template image

**Base Image**:
Whichever image is currently on the canvas — either a Meme Template or a user-uploaded image.
_Avoid_: Source image, canvas image

**Text Overlay**:
A draggable, editable text box rendered on top of the Base Image.
_Avoid_: Caption zone, text box, caption

**Icon Overlay**:
A draggable emoji rendered on top of the Base Image.
_Avoid_: Sticker, emoji caption

**Canvas Padding**:
Extra solid-color bars added above and/or below the Base Image for additional caption space.
_Avoid_: Padding bars, borders

**Meme Output**:
The final composited image (Base Image + Canvas Padding + all overlays) exported as a file.
_Avoid_: Final meme, rendered meme

**Export Format**:
The output encoding (`PNG`, `JPG`, or `WebP`) chosen for the Meme Output.
_Avoid_: Save as type, file type
