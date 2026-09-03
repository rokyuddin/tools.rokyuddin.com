# Client-Side Binary Padding for Exact Target File Sizes

When increasing a file size to satisfy upload requirements (e.g. portals requiring a minimum file size), we append trailing null bytes directly in the client browser (using Web APIs / `Blob` / `Uint8Array`).

This guarantees byte-accurate sizing for any file type, preserves original visual quality without lossy re-encoding, and ensures user files never leave their machine.
