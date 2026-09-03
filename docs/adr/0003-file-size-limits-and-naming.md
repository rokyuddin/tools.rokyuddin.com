# Client-Side Safe Limits and Output File Naming

To ensure optimal browser performance and avoid memory pressure or tab crashes on mobile/desktop devices:
1. Target file size is bounded between `(currentFileSize + 1 byte)` and a safe maximum of `100 MB`.
2. Binary calculation adheres to standard binary unit conventions (1 KB = 1,024 Bytes, 1 MB = 1,048,576 Bytes).
3. The exported filename defaults to `{originalBasename}-{targetSizeFormatted}.{ext}` (e.g. `photo-1MB.jpg`), preventing accidental overwrite of the source file.
