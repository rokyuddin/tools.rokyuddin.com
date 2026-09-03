# 02: Initial Target Size Modal Dialog with Quick Presets

**What to build:** An accessible, focused modal dialog that automatically opens upon initial file selection to prompt for the target file size with quick presets and instant validation.

**Blocked by:** 01: Core Pad Engine & Sizing Logic with Test Suite

**Status:** resolved

- [x] Modal auto-opens when a file is first selected/dropped
- [x] Number input is autofocused and allows decimal entry (e.g. 1.5 MB)
- [x] Unit toggle (`KB` / `MB`)
- [x] Quick preset chips (`100 KB`, `500 KB`, `1 MB`, `2 MB`, `5 MB`)
- [x] Shows current file size as reference
- [x] Error feedback if target size <= original size or > 100 MB
- [x] Accessible focus trap and Enter/Escape key support
