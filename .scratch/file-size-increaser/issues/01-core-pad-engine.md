# 01: Core Pad Engine & Sizing Logic with Test Suite

**What to build:** The domain engine that performs binary padding calculations, unit parsing (KB/MB), boundary validations, safe padded blob construction, and output file naming.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Function `parseUnitToBytes(amount, unit)` accurately converts KB (1,024) and MB (1,048,576) to exact byte integers
- [x] Function `validateTargetSize(currentBytes, targetBytes, maxBytes)` enforces `targetBytes > currentBytes` and `targetBytes <= 100MB`
- [x] Function `calculatePaddingBytes(currentBytes, targetBytes)` returns exact difference
- [x] Function `generatePaddedFileName(originalName, targetBytes)` produces clean names like `myphoto-1MB.jpg`
- [x] Function `generatePaddedBlob(fileBuffer, targetBytes, mimeType)` constructs a byte-accurate Blob
- [x] Full unit test suite passes in `scripts/run-tests.mjs`
