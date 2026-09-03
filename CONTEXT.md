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
