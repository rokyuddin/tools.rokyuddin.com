# OmniTools — [tools.rokyuddin.com](https://tools.rokyuddin.com)

> **Simple, fast, and privacy-first online tools for everyday tasks. Zero signup required.**

**OmniTools** is a curated collection of fast, lightweight, and privacy-friendly online utilities. Every tool solves one specific problem extremely well with **100% in-browser execution**, zero mandatory accounts, and no intrusive subscriptions.

---

## ✨ Available Tools

| Tool | Route | Description |
|---|---|---|
| **Universal Reels Downloader** | [`/tools/reels-downloader`](https://tools.rokyuddin.com/tools/reels-downloader) | Download Instagram Reels, TikTok (no watermark), Facebook Reels, YouTube Shorts, and X (Twitter) videos in HD quality with zero ads. |
| **WhatsApp Link Generator** | [`/tools/whatsapp-link`](https://tools.rokyuddin.com/tools/whatsapp-link) | Generate instant WhatsApp click-to-chat links with country codes, custom pre-filled messages, high-res QR codes, and HTML embed buttons. |
| **BDT Amount to Words** | [`/tools/bdt-to-words`](https://tools.rokyuddin.com/tools/bdt-to-words) | Convert numeric Bangladeshi Taka (BDT ৳) amounts into written English and formal Bangla (বাংলা) words for bank cheques, tax invoices, and legal deeds. Supports Bengali numerals (`১২৫৫০০`) and decimal paisa. |
| **Image Compressor** | [`/tools/image-compressor`](https://tools.rokyuddin.com/tools/image-compressor) | Compress JPG, PNG, and WebP images up to 80% smaller directly inside your browser. Features live side-by-side comparison and batch downloads. |
| **Image → WebP Converter** | [`/tools/image-to-webp`](https://tools.rokyuddin.com/tools/image-to-webp) | Convert JPG, PNG, GIF, and BMP into Google's modern WebP format with quality adjustment and batch processing. |
| **Screenshot Color Extractor** | [`/tools/color-extractor`](https://tools.rokyuddin.com/tools/color-extractor) | Paste screenshots directly (`Ctrl+V`) or upload images to auto-detect dominant color palettes, inspect exact pixels with an interactive 10x loupe eyedropper, and view WCAG contrast scores. |
| **Social Media Resizer** | [`/tools/social-resizer`](https://tools.rokyuddin.com/tools/social-resizer) | Crop and resize images for Instagram, Facebook, LinkedIn, X (Twitter), and YouTube with smart background blur and fill modes. |

---

## 🔒 Privacy Architecture

At OmniTools, privacy is built directly into the technical architecture:

* **100% In-Browser Execution**: All image compression, WebP conversions, palette extractions, and calculations happen on your device via HTML5 Canvas and Web APIs.
* **Zero Server Uploads**: Your images, text, and data never leave your browser and are never uploaded to any remote server or database.
* **No Signup or Tracking**: No accounts, passwords, or intrusive session tracking.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (`@base-ui/react`, `lucide-react`)
* **Typography**: DM Sans (Body) & Nunito Sans (Headings)
* **Testing**: Node.js Test Runner (`node:test`, `node:assert/strict`)
* **Linter & Formatter**: [Biome](https://biomejs.dev/)
* **Creator Support**: [SupportKori](https://www.supportkori.com/mdrokyuddin)

---

## 📁 Architecture & Directory Structure

```text
src/
├── app/
│   ├── layout.tsx                     # Root layout with SupportKori widget script
│   ├── page.tsx                       # Homepage with instant search & category clusters
│   ├── tools/
│   │   ├── page.tsx                   # Searchable full tools directory
│   │   ├── whatsapp-link/page.tsx     # WhatsApp Link Generator route
│   │   ├── bdt-to-words/page.tsx      # BDT Amount to Words route
│   │   ├── image-compressor/page.tsx  # Image Compressor route
│   │   ├── image-to-webp/page.tsx     # Image to WebP route
│   │   ├── color-extractor/page.tsx   # Color Extractor route
│   │   └── social-resizer/page.tsx    # Social Media Resizer route
│   ├── privacy/page.tsx               # Privacy policy & architecture pledge
│   ├── sitemap.ts                     # Dynamic Next.js sitemap
│   └── robots.ts                      # Robots.txt
│
├── config/
│   ├── site.ts                        # Site metadata, creator links, SupportKori URL
│   └── tools.ts                       # Central Tool Registry (metadata, SEO, FAQs, related tools)
│
├── components/
│   ├── ui/                            # Accessible Base UI primitives (Button, Card, Input, Slider, etc.)
│   ├── layout/                        # Header, Footer, SearchDialog (Cmd+K)
│   ├── tool-shell/                    # Standardized ToolShell, ToolCard, ToolFeedback
│   ├── upload/                        # UploadDropzone with drag-drop and Ctrl+V paste
│   └── common/                        # CopyButton, DownloadButton
│
├── features/                          # Self-contained feature business logic
│   ├── whatsapp-link/
│   ├── bdt-to-words/
│   ├── image-compressor/
│   ├── image-to-webp/
│   ├── color-extractor/
│   └── social-resizer/
│
└── lib/
    └── utils.ts                       # Formatting and helper utilities
```

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) v20+ (tested on v24)
* [pnpm](https://pnpm.io/) v10+

### Installation

```bash
# Clone repository
git clone https://github.com/mdrokyuddin/tools.rokyuddin.com.git
cd tools.rokyuddin.com

# Install dependencies
pnpm install
```

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Unit Tests

```bash
pnpm test
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## ☕ Support the Project

OmniTools is completely free to use without paywalls or ads. If these tools saved you time, you can support ongoing development on SupportKori:

👉 **[Support on SupportKori](https://www.supportkori.com/mdrokyuddin)**

---

## 👤 Author

**Md Rokyuddin**
* Website: [rokyuddin.com](https://rokyuddin.com)
* Tools Platform: [tools.rokyuddin.com](https://tools.rokyuddin.com)
* Support: [supportkori.com/mdrokyuddin](https://www.supportkori.com/mdrokyuddin)

---

## 📄 License

This project is licensed under the MIT License.
