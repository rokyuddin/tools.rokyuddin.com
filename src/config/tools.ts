export type ToolCategory =
  | "Images"
  | "Business"
  | "Bangladesh"
  | "Developer"
  | "General"
  | "Documents";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  popular?: boolean;
  isNew?: boolean;
  badges: string[];
  keywords: string[];
  features: string[];
  howItWorks: HowItWorksStep[];
  faqs: ToolFaq[];
  relatedToolSlugs: string[];
}

export const toolsRegistry: ToolDefinition[] = [
  {
    slug: "file-size-increaser",
    name: "File Size Increaser & Image Padder",
    tagline:
      "Increase image and file size to any exact target size online for free",
    description:
      "Easily inflate images and files to meet minimum file size upload requirements (e.g. visa portals, job applications, or university submissions). 100% private in-browser safe padding with byte accuracy.",
    category: "Images",
    popular: true,
    isNew: true,
    badges: [
      "Exact Byte Size",
      "Any File Format",
      "100% In-Browser",
      "Zero Quality Loss",
    ],
    keywords: [
      "increase image size",
      "make file size bigger",
      "image padder",
      "increase file size online",
      "pad file with bytes",
      "inflate photo size",
      "make 10kb image 1mb",
    ],
    features: [
      "Exact target size matching down to the single byte in KB or MB",
      "Safe binary null-padding preserving 100% original visual fidelity without lossy re-encoding",
      "Supports all file formats: JPG, PNG, WebP, PDF, Word documents, text, archives, and binaries",
      "Smart first-upload modal with one-click popular presets (100KB, 500KB, 1MB, 2MB, 5MB, 10MB)",
      "Interactive workbench with live inline size adjustments without reopening popups",
      "100% private client-side processing: files never leave your device or touch any server",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload File or Image",
        description:
          "Drag & drop any image or file, browse from your computer, or paste directly from clipboard.",
      },
      {
        step: 2,
        title: "Choose Target Size",
        description:
          "In the instant popup, select a popular preset (like 1 MB) or type your exact desired size.",
      },
      {
        step: 3,
        title: "Download Padded File",
        description:
          "Adjust inline if needed and click Download to immediately save your byte-accurate file.",
      },
    ],
    faqs: [
      {
        question: "How does the File Size Increaser make files bigger?",
        answer:
          "It safely appends trailing null padding bytes to the file until the target byte count is met. This guarantees exact size matching without altering original image pixels, audio, or document text.",
      },
      {
        question: "Does increasing image size reduce its visual quality?",
        answer:
          "No! Because it uses binary padding rather than lossy re-compression or pixel stretching, your original image looks 100% identical to the source.",
      },
      {
        question: "Are my files uploaded to your server?",
        answer:
          "Never. All padding calculations and Blob generations are performed entirely within your web browser using HTML5 Web APIs. No data is transferred to any external server.",
      },
      {
        question: "Can I increase PDF or Word document sizes too?",
        answer:
          "Yes! This tool works on any file format, including PDF, DOCX, XLSX, TXT, ZIP, and all image types.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "photo-print-size-checker", "image-to-webp"],
  },
  {
    slug: "blur-image",
    name: "Photo Blur & Privacy Redaction Tool",
    tagline:
      "Blur, pixelate, or blackout sensitive text, passwords, faces & phone numbers in photos",
    description:
      "Censor sensitive information in screenshots and photos before sharing. Features interactive pixelate mosaic, Gaussian blur, blackout bars, and whiteout boxes with 100% in-browser privacy.",
    category: "Images",
    popular: true,
    isNew: true,
    badges: [
      "100% In-Browser",
      "Pixelate & Blur",
      "One-Click Copy",
      "Undo / Redo",
    ],
    keywords: [
      "blur image",
      "pixelate image online",
      "blur screenshot",
      "hide text in image",
      "censor photo",
      "redact image",
      "privacy brush",
      "blackout image",
      "mosaic blur tool",
    ],
    features: [
      "Multiple Redaction Modes: Pixelate Mosaic, Smooth Blur, Blackout Box, and Whiteout Box",
      "Live adjustable strength slider (custom pixel block size & blur radius)",
      "Drag-to-select redaction boxes over sensitive phone numbers, emails, addresses, and faces",
      "Full Undo / Redo history stack with Ctrl+Z keyboard shortcuts",
      "One-click 'Copy Image to Clipboard' for instant pasting into Slack, Discord, WhatsApp, or Gmail",
      "100% Client-Side Canvas execution — your personal photos never leave your device",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload or Paste Image",
        description:
          "Drag and drop your screenshot or press Ctrl+V to paste directly from your clipboard.",
      },
      {
        step: 2,
        title: "Choose Effect & Drag Over Sensitive Areas",
        description:
          "Select Pixelate, Blur, Black Box, or White Box, and drag your cursor over any private details.",
      },
      {
        step: 3,
        title: "Copy or Download",
        description:
          "Click 'Copy Image' to paste anywhere, or download as a high-resolution PNG file.",
      },
    ],
    faqs: [
      {
        question: "Are my sensitive screenshots uploaded to your server?",
        answer:
          "No! All blurring, pixelation, and image rendering happen 100% locally in your web browser memory using HTML5 Canvas. Zero data is ever sent across the network.",
      },
      {
        question: "What is the difference between Pixelate and Blur?",
        answer:
          "Pixelate creates a classic retro mosaic grid (censor blocks) over the selected region, while Blur applies a soft Gaussian smoothing effect.",
      },
      {
        question: "Can blurred or pixelated text be reversed or un-blurred?",
        answer:
          "No. When you export or copy the image, the underlying pixel data is permanently replaced with the blended color mosaic/blur on canvas bitmap level, making it cryptographically unrecoverable.",
      },
      {
        question: "Can I paste directly from my clipboard?",
        answer:
          "Yes! Simply take a screenshot with your OS shortcut (Snipping Tool, Cmd+Shift+4, PrintScreen) and press Ctrl+V / Cmd+V on the page.",
      },
    ],
    relatedToolSlugs: ["color-extractor", "social-resizer", "image-compressor"],
  },
  {
    slug: "reels-downloader",
    name: "Universal Reels & Video Downloader",
    tagline:
      "Download Instagram Reels, TikTok without watermark, Facebook Reels, YouTube Shorts & X videos",
    description:
      "Download high quality MP4 videos and MP3 audio from Instagram, TikTok (no watermark), Facebook, YouTube Shorts, and X (Twitter) directly to your device with zero ads.",
    category: "General",
    popular: true,
    isNew: true,
    badges: ["No Watermark", "HD MP4", "All Platforms", "100% Free"],
    keywords: [
      "reels downloader",
      "instagram reels downloader",
      "tiktok video download no watermark",
      "facebook reel saver",
      "youtube shorts downloader",
      "x video download",
      "twitter video downloader",
      "online reel saver",
    ],
    features: [
      "All-in-one multi-platform support: Instagram, TikTok, Facebook, YouTube Shorts, and X (Twitter)",
      "TikTok downloads without any watermarks or logos",
      "Original HD quality MP4 video stream extraction",
      "In-browser video preview player with poster image and metadata",
      "One-click direct MP4 video and MP3 audio downloads",
      "Clean, ad-free experience without popups, redirects, or mandatory logins",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Copy Video Link",
        description:
          "Copy the link of any Reel or Short video from Instagram, TikTok, Facebook, YouTube, or X.",
      },
      {
        step: 2,
        title: "Paste URL",
        description:
          "Paste the URL into the input box above or click the Paste button.",
      },
      {
        step: 3,
        title: "Download Video",
        description:
          "Preview the video and click 'Download HD Video (MP4)' to save it directly to your phone or computer.",
      },
    ],
    faqs: [
      {
        question: "Does this downloader remove TikTok watermarks?",
        answer:
          "Yes! TikTok videos are downloaded in clean HD MP4 format without the TikTok watermark logo or username overlay.",
      },
      {
        question: "Can I download videos on iPhone (iOS) and Android?",
        answer:
          "Yes! On Android, the video saves directly to your Downloads folder. On iPhone/iOS Safari, click download, open in new tab, and tap the Share icon to 'Save Video' to your Photos.",
      },
      {
        question: "Do I need to install any app or create an account?",
        answer:
          "No. Everything runs seamlessly in your web browser with zero app installation, zero extensions, and no accounts required.",
      },
      {
        question: "Is this video downloader free?",
        answer:
          "Yes, it is 100% free with unlimited downloads and no subscription fees.",
      },
    ],
    relatedToolSlugs: ["social-resizer", "image-compressor", "text-cleaner"],
  },
  {
    slug: "whatsapp-link",
    name: "WhatsApp Link Generator",
    tagline:
      "Generate direct WhatsApp click-to-chat links with custom pre-filled messages",
    description:
      "Create instant, shareable WhatsApp chat links with customized message text, international country codes, instant QR code generator, and HTML embed buttons.",
    category: "Business",
    popular: true,
    badges: ["Free", "Instant", "QR Code", "No Signup"],
    keywords: [
      "whatsapp link generator",
      "wa me link",
      "whatsapp chat link",
      "click to chat whatsapp",
      "whatsapp qr code generator",
      "direct whatsapp url",
      "whatsapp message link",
    ],
    features: [
      "Country code selector with instant search (Bangladesh +880, US, UK, India, etc.)",
      "Automatic phone number cleaning and international formatting",
      "Live message encoder with real-time character count and emoji support",
      "Instant clickable link with one-click copy and 'Open in WhatsApp'",
      "High-resolution QR code generator with PNG download",
      "HTML embed button code snippet for websites and landing pages",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Select Country & Enter Phone Number",
        description:
          "Pick your country code or type your international phone number without spaces or dashes.",
      },
      {
        step: 2,
        title: "Add Pre-filled Message (Optional)",
        description:
          "Type an optional message that will automatically appear in the chat text box when opened.",
      },
      {
        step: 3,
        title: "Copy Link or Download QR Code",
        description:
          "Click 'Copy Link' to share anywhere, open directly in WhatsApp, or download the QR code.",
      },
    ],
    faqs: [
      {
        question: "Does the user need to save my contact number to message me?",
        answer:
          "No! WhatsApp Click-to-Chat links allow anyone with WhatsApp to open a direct conversation without saving your contact to their address book first.",
      },
      {
        question: "Is this WhatsApp link generator free to use?",
        answer:
          "Yes, it is 100% free with unlimited link and QR code generations. No account or subscription required.",
      },
      {
        question: "Can I use emojis in the pre-filled message?",
        answer:
          "Yes, emojis and international characters are automatically UTF-8 URL-encoded so they display perfectly in WhatsApp.",
      },
      {
        question: "Does my phone number get stored on your server?",
        answer:
          "No. Everything is generated directly in your browser. No numbers, messages, or metadata are ever saved or transmitted to a server.",
      },
    ],
    relatedToolSlugs: ["bdt-to-words", "color-extractor", "social-resizer"],
  },
  {
    slug: "bdt-to-words",
    name: "BDT Amount to Words Converter",
    tagline:
      "Convert numeric Bangladeshi Taka amounts into English & Bangla words",
    description:
      "Convert Bangladeshi Taka amounts into written English and Bangla (বাংলা) words for cheques, invoices, legal deeds, and banking slips. Supports Paisa and decimal figures.",
    category: "Bangladesh",
    popular: true,
    badges: [
      "English & Bangla",
      "Cheque Format",
      "South Asian System",
      "Paisa Support",
    ],
    keywords: [
      "bdt to words",
      "taka to words",
      "bangla number to words",
      "cheque amount in words",
      "bdt amount converter",
      "bangladeshi taka in words",
      "crore lakh thousand converter",
      "টাকা কথায় রূপান্তর",
    ],
    features: [
      "Dual English & Bangla (বাংলা) word translation side by side",
      "Accurate South Asian numbering system (Crore, Lakh, Hajar, Shatak)",
      "Handles decimal paisa/poisha amounts accurately (e.g. 50 Paisa / ৫০ পয়সা)",
      "Supports English digits, comma-formatted numbers, and Bengali numerals (১২৩৪৫)",
      "Standard, Cheque, and Invoice formatted outputs with 'Only' / 'মাত্র'",
      "Interactive breakdown showing Crores, Lakhs, Thousands, Hundreds, Units, and Paisa",
      "Quick preset amount buttons (1K, 10K, 50K, 1 Lakh, 10 Lakh, 1 Crore)",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Enter Amount",
        description:
          "Type or paste any numerical amount in BDT (e.g. 125500 or 125500.50).",
      },
      {
        step: 2,
        title: "Instant Conversion",
        description:
          "View the converted written amount simultaneously in both English and formal Bangla.",
      },
      {
        step: 3,
        title: "One-Click Copy",
        description:
          "Copy either English or Bangla text for your bank cheque, receipt, or invoice.",
      },
    ],
    faqs: [
      {
        question: "How does the South Asian numbering system work?",
        answer:
          "Unlike the Western system (Millions, Billions), Bangladesh and South Asia use Thousand (1,000), Lakh (100,000 / 10^5), and Crore (10,000,000 / 10^7). This converter accurately formats using this standard.",
      },
      {
        question: "Does it support Bengali numbers as input?",
        answer:
          "Yes, you can enter standard digits (12345) or Bengali numerals (১২৩৪৫) and it will convert seamlessly.",
      },
      {
        question: "Is this suitable for official bank cheques in Bangladesh?",
        answer:
          "Yes, the generated words strictly adhere to the formal banking standards for cheques in Bangladesh, including 'Taka only' and 'টাকা মাত্র'.",
      },
    ],
    relatedToolSlugs: [
      "whatsapp-link",
      "bangla-date-converter",
      "image-compressor",
    ],
  },
  {
    slug: "bangla-date-converter",
    name: "Bangla Date & Season Converter (বঙ্গাব্দ ও ষড়ঋতু)",
    tagline:
      "Convert Gregorian English dates to accurate Bengali dates, Bongabdo years & seasons",
    description:
      "Accurate Bangla date and season converter based on the official Bangladesh Bangla Academy 2019 calendar revision. View today's live Bangla date, Bongabdo year, 6 seasons (ষড়ঋতু), historical dates, and copy in official document formats.",
    category: "Bangladesh",
    popular: true,
    isNew: true,
    badges: [
      "Bangla Academy 2019",
      "ষড়ঋতু পরিচয়",
      "Bidirectional",
      "1-Click Copy",
    ],
    keywords: [
      "bangla date converter",
      "today bangla date",
      "ajker bangla tarikh",
      "আজকের বাংলা তারিখ",
      "বঙ্গাব্দ ক্যালেন্ডার",
      "bangla calendar converter",
      "bangla to english date converter",
      "gregorian to bangla date",
      "bangla six seasons",
      "ষড়ঋতু ক্যালেন্ডার",
      "pohela boishakh converter",
      "bangla month calendar",
    ],
    features: [
      "Official Bangladesh Standard (Bangla Academy 2019 calendar revision)",
      "Bidirectional conversion: Gregorian to Bangla and Bangla to Gregorian",
      "Live 'Today's Bangla Date' hero widget with automated Bengali year and date calculation",
      "Six Seasons (ষড়ঋতু) explorer with poetic cultural descriptions and month spans",
      "National and Historical Days quick-presets (Pohela Boishakh, Ekushey Feb, 26 March, 16 Dec)",
      "Multi-format copy buttons: Standard Bengali, Formal Cheque/Deed format, and English transliteration",
      "100% Client-Side execution — zero network requests, instant calculations",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Pick or Select Date",
        description:
          "Choose any English Gregorian date or switch to the Bangla tab to select a Bengali day, month, and year.",
      },
      {
        step: 2,
        title: "Instant Calculation",
        description:
          "View the exact Bengali date, weekday, Bongabdo year, and current season (Ritu) updated live.",
      },
      {
        step: 3,
        title: "Copy Desired Format",
        description:
          "Click any one-click copy button to paste into formal cheques, official documents, or social posts.",
      },
    ],
    faqs: [
      {
        question: "Which Bangla calendar standard does this tool use?",
        answer:
          "This tool strictly follows the official Bangladeshi Bengali calendar revised by the Bangla Academy in 2019, where the first 6 months have 31 days, Kartik to Magh have 30 days, Falgun has 29 days (30 in leap year), and Choitro has 30 days.",
      },
      {
        question: "When does the Bengali New Year (Pohela Boishakh) start?",
        answer:
          "In the official Bangladesh calendar, Pohela Boishakh (১লা বৈশাখ) is locked to April 14th every year.",
      },
      {
        question: "How are leap years handled in the Bengali calendar?",
        answer:
          "In a Gregorian leap year (such as 2024, 2028), the month of Falgun (ফাল্গুন) has 30 days instead of 29 days, ensuring all subsequent national dates stay permanently synchronized.",
      },
      {
        question: "Can I convert older historical dates or land deed dates?",
        answer:
          "Yes! You can convert any historical date backwards or forwards across centuries using either the Gregorian or Bangla date selectors.",
      },
    ],
    relatedToolSlugs: ["bdt-to-words", "whatsapp-link", "text-cleaner"],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline:
      "Compress JPG, PNG, and WebP images directly in your browser with zero quality loss",
    description:
      "Free online image compressor with 100% in-browser processing. Reduce image file sizes by up to 80% without uploading your photos to any remote server.",
    category: "Images",
    popular: true,
    badges: [
      "100% In-Browser",
      "Zero Server Upload",
      "Batch Support",
      "Privacy First",
    ],
    keywords: [
      "image compressor",
      "compress jpg",
      "compress png",
      "reduce image size",
      "compress image online free",
      "client side image compressor",
      "private image compressor",
      "photo optimizer",
    ],
    features: [
      "100% Client-side compression — your images never leave your device",
      "Adjustable compression quality slider (10% to 100%)",
      "Dimension scaling presets (Original, 75%, 50%, 25%)",
      "Real-time visual comparison modal with before/after comparison",
      "Live statistics: Original size, compressed size, and percentage saved",
      "Multi-file batch queue with individual and ZIP download",
      "Drag & drop upload or paste directly from clipboard (Ctrl+V)",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload or Paste Image",
        description:
          "Drag and drop one or multiple images, or press Ctrl+V to paste from your clipboard.",
      },
      {
        step: 2,
        title: "Adjust Quality & Size",
        description:
          "Choose your preferred compression level or use the recommended default (80%).",
      },
      {
        step: 3,
        title: "Download Compressed File",
        description:
          "Download your compressed image instantly with immediate file size savings.",
      },
    ],
    faqs: [
      {
        question: "Are my photos uploaded to your server?",
        answer:
          "No! All image processing is performed entirely in your browser using the HTML5 Canvas API. Your files never touch a server.",
      },
      {
        question: "What image formats are supported?",
        answer: "JPG/JPEG, PNG, WebP, GIF, and BMP files are supported.",
      },
      {
        question: "Is there a limit on file count or size?",
        answer:
          "There are no server limits because processing happens on your local hardware. You can process as many images as you need.",
      },
    ],
    relatedToolSlugs: ["image-to-webp", "color-extractor", "social-resizer"],
  },
  {
    slug: "image-to-webp",
    name: "Image to WebP Converter",
    tagline:
      "Convert JPG, PNG, GIF, and BMP images to modern, fast-loading WebP format",
    description:
      "Convert images to high-efficiency Google WebP format online for free. Boost your website speed and Google Core Web Vitals with ultra-small file sizes.",
    category: "Images",
    popular: true,
    badges: [
      "Modern Format",
      "Next-Gen Image",
      "Faster Website",
      "100% In-Browser",
    ],
    keywords: [
      "image to webp",
      "png to webp",
      "jpg to webp",
      "convert to webp",
      "webp converter online",
      "core web vitals image",
      "free webp converter",
    ],
    features: [
      "Convert JPG, PNG, GIF, BMP, and SVG to WebP format instantly",
      "Lossy and lossless compression mode toggles",
      "Batch conversion for multiple images simultaneously",
      "Significant file size reduction (often 30–50% smaller than JPEG/PNG)",
      "Zero server uploads — fast, secure, and completely private",
      "One-click batch ZIP download",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Select Images",
        description:
          "Drop your JPG or PNG files into the converter or browse from your computer.",
      },
      {
        step: 2,
        title: "Select Quality",
        description:
          "Keep the balanced 85% preset or adjust the slider for maximum quality.",
      },
      {
        step: 3,
        title: "Download WebP",
        description:
          "Download the converted WebP images ready for production web use.",
      },
    ],
    faqs: [
      {
        question: "Why should I convert images to WebP?",
        answer:
          "WebP is a modern image format developed by Google that provides superior lossless and lossy compression for images on the web, making pages load significantly faster.",
      },
      {
        question: "Do all modern browsers support WebP?",
        answer:
          "Yes! WebP is supported by over 97% of global web browsers, including Chrome, Safari, Firefox, Edge, and iOS/Android browsers.",
      },
      {
        question: "Is transparency preserved when converting PNG to WebP?",
        answer:
          "Yes, WebP fully supports alpha transparency just like PNG while producing a much smaller file size.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "social-resizer", "color-extractor"],
  },
  {
    slug: "color-extractor",
    name: "Screenshot Color Extractor",
    tagline:
      "Extract dominant color palettes and pick exact pixel colors from screenshots",
    description:
      "Extract color palettes from screenshots and photos. Features an interactive loupe pixel eyedropper, contrast ratio checker, and one-click HEX, RGB, HSL, and OKLCH color codes.",
    category: "Images",
    isNew: true,
    badges: [
      "Interactive Eyedropper",
      "Palette Extractor",
      "WCAG Contrast",
      "HEX / RGB / HSL",
    ],
    keywords: [
      "screenshot color extractor",
      "image color picker",
      "extract colors from image",
      "palette generator from photo",
      "eyedropper tool online",
      "color code finder from image",
      "hex color from screenshot",
    ],
    features: [
      "Paste screenshots directly with Ctrl+V or upload any image",
      "Automatic dominant palette extraction with vibrant, dark, and light shades",
      "Interactive 10x magnified Pixel Loupe Eyedropper — click any exact pixel",
      "Copy in multiple CSS formats: HEX, RGB, HSL, and OKLCH",
      "Built-in WCAG text contrast readability rating (Pass/Fail for AA & AAA)",
      "Color harmony suggestions (complementary, analogous, triadic)",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Paste or Upload Image",
        description:
          "Press Ctrl+V to paste your clipboard screenshot, or drag and drop an image file.",
      },
      {
        step: 2,
        title: "Pick or Extract Colors",
        description:
          "View the auto-detected palette or click directly on the image with the eyedropper.",
      },
      {
        step: 3,
        title: "Copy Color Code",
        description:
          "Click any color swatch to copy its HEX, RGB, or HSL code to your clipboard.",
      },
    ],
    faqs: [
      {
        question: "Can I paste directly from my clipboard?",
        answer:
          "Yes! Take a screenshot with your OS shortcut (e.g. Snipping tool, Cmd+Shift+4, PrintScreen) and simply press Ctrl+V / Cmd+V on the page.",
      },
      {
        question: "How accurate is the pixel picker?",
        answer:
          "The pixel picker inspects raw canvas bitmap data at 1:1 pixel coordinate precision with a magnified 10x crosshair loupe.",
      },
      {
        question: "Are color codes provided in developer formats?",
        answer:
          "Yes, you can copy standard HEX (#2563EB), RGB (rgb(37, 99, 235)), HSL, and modern CSS OKLCH values.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "image-to-webp", "social-resizer"],
  },
  {
    slug: "social-resizer",
    name: "Social Media Image Resizer",
    tagline:
      "Resize images for Instagram, Facebook, LinkedIn, X (Twitter), and YouTube",
    description:
      "Crop and resize any image into standard social media post, story, header, banner, and thumbnail dimensions with smart background blur and fit modes.",
    category: "Images",
    isNew: true,
    badges: [
      "Social Presets",
      "Blur Background",
      "Instant Crop",
      "Multi-Platform",
    ],
    keywords: [
      "social media image resizer",
      "instagram post resizer",
      "facebook cover resizer",
      "linkedin banner size",
      "youtube thumbnail resizer",
      "twitter header resizer",
      "image cropper for social media",
    ],
    features: [
      "All standard dimensions for Instagram, Facebook, LinkedIn, X, and YouTube",
      "Fit Modes: Smart Blur Background, Solid Color Fill, or Smart Fill (Crop)",
      "Live preview for every social network aspect ratio simultaneously",
      "One-click download for individual sizes or all sizes at once",
      "High resolution canvas output without distortion",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload Image",
        description:
          "Upload your original photo, banner, or promotional graphic.",
      },
      {
        step: 2,
        title: "Choose Fit Mode",
        description:
          "Select Smart Blur background, Solid Fill (white/black/custom), or Smart Crop.",
      },
      {
        step: 3,
        title: "Export Social Assets",
        description:
          "Preview each platform result and download your perfectly formatted assets.",
      },
    ],
    faqs: [
      {
        question: "Which social media platforms and sizes are supported?",
        answer:
          "Instagram (Square 1:1, Portrait 4:5, Story 9:16), Facebook (Feed 16:9, Cover), LinkedIn (Post, Banner), X/Twitter (Post, Header), and YouTube (Thumbnail 1280x720).",
      },
      {
        question: "How does the blur background mode work?",
        answer:
          "It scales your original photo to fill the canvas with a soft aesthetic gaussian blur while centering the crisp original image without letterbox black bars.",
      },
    ],
    relatedToolSlugs: [
      "image-compressor",
      "image-to-webp",
      "photo-print-size-checker",
    ],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    tagline: "Resize any image to exact pixels in your browser",
    description:
      "Free online image resizer with 100% in-browser processing. Resize by size, percentage, or social presets with format conversion and batch ZIP download.",
    category: "Images",
    popular: true,
    isNew: true,
    badges: ["100% In-Browser", "Batch Support", "Social Presets", "Privacy First"],
    keywords: [
      "image resizer",
      "resize image online",
      "resize jpg png",
      "image dimension resizer",
      "client side image resizer",
    ],
    features: [
      "Resize by exact pixels, percentage, or 6 social presets",
      "Aspect Ratio Lock, rotate, flip, and crop per image",
      "Format conversion to JPG, PNG, or WebP with quality control",
      "Optional target file size for JPG and WebP",
      "Batch queue up to 10 images with ZIP download",
      "100% client-side canvas processing, files never uploaded",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload Images",
        description: "Drag and drop, browse, or paste images from clipboard.",
      },
      {
        step: 2,
        title: "Choose Dimensions",
        description: "Pick By Size, As Percentage, or a Social preset.",
      },
      {
        step: 3,
        title: "Export Files",
        description: "Download individually or all as a ZIP archive.",
      },
    ],
    faqs: [
      {
        question: "Are my photos uploaded to your server?",
        answer:
          "No. All resizing happens in your browser with canvas. Files never leave your device.",
      },
      {
        question: "What formats are supported?",
        answer: "JPG, PNG, WebP, AVIF, BMP, and static GIF input; JPG, PNG, or WebP output.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "image-to-webp", "social-resizer"],
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    tagline: "Convert JPG, PNG, WebP, GIF, BMP & AVIF entirely in your browser",
    description:
      "Free online image converter with 100% in-browser processing. Convert between JPG, PNG, and WebP with per-file control over quality, resolution, background fill, and target file size.",
    category: "Images",
    popular: true,
    isNew: true,
    badges: ["100% In-Browser", "Batch Support", "Per-File Options", "Privacy First"],
    keywords: [
      "image converter",
      "jpg to png",
      "png to jpg",
      "convert webp",
      "image format converter",
      "client side image converter",
    ],
    features: [
      "Convert JPG, PNG, WebP, GIF, BMP, and AVIF to JPG, PNG, or WebP",
      "Per-file output format picker with live conversion",
      "Per-file Options: quality, custom resolution, background fill, target file size",
      "EXIF metadata stripped automatically on export",
      "Batch queue up to 10 images with ZIP download",
      "100% client-side canvas processing, files never uploaded",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload Images",
        description: "Drag and drop, browse, or paste images from clipboard.",
      },
      {
        step: 2,
        title: "Pick Format & Options",
        description: "Choose the output format per file and fine-tune quality, resolution, or file size in Options.",
      },
      {
        step: 3,
        title: "Download Files",
        description: "Download individually or all as a ZIP archive.",
      },
    ],
    faqs: [
      {
        question: "Are my photos uploaded to your server?",
        answer:
          "No. All conversion happens in your browser with canvas. Files never leave your device.",
      },
      {
        question: "Which formats can I convert between?",
        answer:
          "Input: JPG, PNG, WebP, GIF (first frame), BMP, and AVIF. Output: JPG, PNG, or WebP — the formats browsers can encode. SVG and HEIC/HEIF are rejected with a clear message.",
      },
      {
        question: "What happens to transparency when converting to JPG?",
        answer:
          "JPG has no transparency, so transparent areas are filled with your chosen background color (white by default) in the per-file Options panel.",
      },
    ],
    relatedToolSlugs: ["image-to-webp", "image-compressor", "image-resizer"],
  },
  {
    slug: "photo-print-size-checker",
    name: "Photo Print Size Checker",
    tagline:
      "Instantly check how large you can print your photo with sharp quality & no blur",
    description:
      "Upload any photograph or image to calculate maximum print sizes at 300 DPI, 240 DPI, and 150 DPI. Includes aspect ratio crop warnings, custom print size test, and paper size chart (4x6, 5x7, 8x10, A4, A3).",
    category: "Images",
    popular: true,
    isNew: true,
    badges: ["300 DPI", "Quality Rating", "Aspect Ratio", "Print Sizes"],
    keywords: [
      "photo print size checker",
      "how big can i print a photo",
      "image print size calculator",
      "photo print quality checker",
      "dpi print calculator",
      "image resolution for print",
      "4x6 5x7 8x10 print dimensions",
    ],
    features: [
      "Instant resolution & aspect ratio analysis (e.g., 4032x3024, 4:3)",
      "Star quality ratings (★★★★★) for 15+ standard print & photo frame sizes",
      "'Can I print this?' interactive target size calculator with custom dimensions",
      "Visual aspect ratio mismatch & crop preview indicator",
      "Supports standard Imperial (inches) and Metric (cm/mm & ISO A-series) standards",
      "100% private in-browser analysis — your personal photos are never uploaded to a server",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload Photo",
        description:
          "Select or drop any JPG, PNG, or WebP photo to read its pixel dimensions.",
      },
      {
        step: 2,
        title: "Review Print Size Recommendations",
        description:
          "Check the DPI and quality star rating across popular photo and poster sizes.",
      },
      {
        step: 3,
        title: "Test Target Size & Cropping",
        description:
          "Select your desired frame size to see if it requires cropping or loses sharpness.",
      },
    ],
    faqs: [
      {
        question: "What DPI is needed for high quality photo prints?",
        answer:
          "300 DPI (dots per inch) is the gold standard for crisp photo lab prints viewed up close. 200–240 DPI produces great results, while 150 DPI is acceptable for large wall posters viewed from a few feet away.",
      },
      {
        question:
          "Why does my 4:3 phone photo need cropping for an 8x10 frame?",
        answer:
          "Phone cameras shoot in a 4:3 ratio (1.33:1), whereas an 8x10 print has a 5:4 ratio (1.25:1). Because the proportions differ, small portions of the top/bottom or sides must be cropped to fill the frame completely.",
      },
      {
        question: "Are my personal photos uploaded anywhere?",
        answer:
          "No. The entire analysis runs locally in your web browser. Your images never leave your device.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "social-resizer", "image-to-webp"],
  },
  {
    slug: "favicon-tester",
    name: "Favicon & App Icon Test Lab",
    tagline:
      "Preview your favicon across browser tabs, bookmarks, mobile home screens & dark mode",
    description:
      "Upload your icon (SVG, PNG, ICO, WebP) and instantly preview how it looks rendered at 16px, 32px, 48px, 128px, and 192px in realistic browser tabs, search results, mobile home screens, and light/dark backgrounds.",
    category: "Developer",
    popular: true,
    isNew: true,
    badges: [
      "Multi-Context",
      "Legibility Warnings",
      "Dark Mode",
      "Export Bundle",
    ],
    keywords: [
      "favicon tester",
      "favicon preview",
      "favicon size checker",
      "app icon tester",
      "browser tab favicon preview",
      "favicon generator preview",
      "website icon checker",
    ],
    features: [
      "Real-world context mockups: Browser Tab, Bookmarks Bar, Mobile Home Screen, SERP snippet, and Dock",
      "Pixel size preview grid: 16x16, 32x32, 48x48, 64x64, 128x128, 192x192, and 512x512",
      "Instant background switcher (Light, Dark, Slate, Transparent Grid)",
      "Smart Legibility Warnings: text legibility alerts, 16px detail loss, low contrast, and non-square warning",
      "One-click multi-size PNG bundle ZIP download",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload Icon or Favicon",
        description: "Upload an SVG, PNG, WebP, JPG, or ICO image.",
      },
      {
        step: 2,
        title: "Test In Contexts & Backgrounds",
        description:
          "Inspect browser tab simulations, mobile home screen tiles, and light/dark themes.",
      },
      {
        step: 3,
        title: "Check Warnings & Export",
        description:
          "Verify small-size readability and download resized icon assets.",
      },
    ],
    faqs: [
      {
        question: "What is the recommended size for a master favicon?",
        answer:
          "We recommend uploading a high-resolution square image of at least 512x512 pixels (or a clean vector SVG) with transparent background.",
      },
      {
        question: "Why does my favicon look blurry on small browser tabs?",
        answer:
          "Browser tabs render at 16x16 or 32x32 pixels on Retina screens. Fine text, thin lines, and overly complex illustrations blur when compressed into so few pixels.",
      },
      {
        question: "What image formats are supported for testing?",
        answer: "PNG, SVG, JPG, WebP, and ICO files are all supported.",
      },
    ],
    relatedToolSlugs: [
      "color-extractor",
      "responsive-screenshot-tester",
      "social-resizer",
    ],
  },
  {
    slug: "batch-file-renamer",
    name: "Batch File Renamer",
    tagline:
      "Bulk rename multiple files in your browser with patterns, sequential numbers & live preview",
    description:
      "Rename dozens or hundreds of files instantly client-side. Add prefixes, suffixes, zero-padded numbering (001, 002), find-and-replace, case changes, and download all renamed files in a single ZIP.",
    category: "General",
    popular: true,
    isNew: true,
    badges: [
      "100% Client-Side",
      "Live Diff Preview",
      "Zero-Padded Numbers",
      "ZIP Download",
    ],
    keywords: [
      "batch file renamer",
      "bulk file renamer",
      "bulk image renamer",
      "photo renamer online",
      "rename multiple files",
      "file rename pattern",
      "sequential file numbering",
    ],
    features: [
      "Sequential numbering with custom start number, step, and zero padding (e.g., 001, 002)",
      "Prefix and suffix insertion, text find-and-replace with regex support",
      "Case conversions: lowercase, UPPERCASE, Title Case, kebab-case, snake_case, camelCase",
      "Space handling: remove spaces, replace with dashes (-), or underscores (_)",
      "Live side-by-side Diff table (Original Name → New Name) with duplicate name warnings",
      "One-click batch ZIP archive download containing all renamed files",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Select or Drop Files",
        description:
          "Choose any number of files (photos, documents, videos, music) from your computer.",
      },
      {
        step: 2,
        title: "Set Renaming Rules",
        description:
          "Configure sequential numbering, prefix/suffix, replace text, or change casing.",
      },
      {
        step: 3,
        title: "Preview & Download",
        description:
          "Review the live before/after table and download your renamed files as a ZIP archive.",
      },
    ],
    faqs: [
      {
        question: "Are my files uploaded to any server?",
        answer:
          "No. All file reading, renaming, and ZIP compression happen 100% inside your web browser locally. Nothing is ever sent over the internet.",
      },
      {
        question: "Can I rename photos and keep their extensions?",
        answer:
          "Yes! The renamer automatically preserves original file extensions (e.g. .jpg, .png) or lets you format them to lowercase.",
      },
      {
        question: "Is there a limit on how many files I can rename?",
        answer:
          "You can rename hundreds of files at once, bounded only by your browser's available memory.",
      },
    ],
    relatedToolSlugs: [
      "text-cleaner",
      "photo-print-size-checker",
      "image-compressor",
    ],
  },
  {
    slug: "responsive-screenshot-tester",
    name: "Responsive Screenshot Tester",
    tagline:
      "Test UI screenshots across mobile, tablet, laptop & desktop viewports with interactive ruler",
    description:
      "Upload web or app screenshots and preview how your designs scale and fit across standard device viewports (375px to 1920px). Features an interactive draggable width ruler, device frame mockups, and export options.",
    category: "Developer",
    popular: false,
    isNew: true,
    badges: [
      "Interactive Ruler",
      "Device Bezels",
      "Viewport Presets",
      "Export Mockup",
    ],
    keywords: [
      "responsive screenshot tester",
      "mobile screenshot tester",
      "viewport screenshot tester",
      "screenshot size tester",
      "device frame generator",
      "responsive preview screenshot",
    ],
    features: [
      "Standard device presets: iPhone (375px, 390px, 430px), iPad (768px, 1024px), Laptop (1280px, 1440px), Desktop (1920px)",
      "Interactive draggable width ruler with real-time pixel display and breakpoint tick marks",
      "Custom width & height viewport inputs",
      "Styling options: Mac window frame with traffic lights, phone bezel, clean drop shadows, and background gradients",
      "Zoom controls: Fit, 50%, 75%, 100%, and Actual Size",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Upload Screenshot",
        description:
          "Upload a screenshot of your website, app UI, or landing page.",
      },
      {
        step: 2,
        title: "Adjust Viewport Width",
        description:
          "Click device presets or drag the interactive ruler to test different screen widths.",
      },
      {
        step: 3,
        title: "Customize Frame & Export",
        description:
          "Toggle device bezels or window frames and download the presentation mockup.",
      },
    ],
    faqs: [
      {
        question:
          "Does this emulate responsive CSS or test screenshot scaling?",
        answer:
          "This tool is designed to test and present your static UI screenshots inside responsive viewports and device frames with interactive dimension rulers.",
      },
      {
        question: "Can I preview custom viewport widths?",
        answer:
          "Yes, you can drag the interactive ruler or type any custom width and height in pixels.",
      },
    ],
    relatedToolSlugs: ["favicon-tester", "social-resizer", "color-extractor"],
  },
  {
    slug: "text-cleaner",
    name: "Personal Data & Text Cleanup Tool",
    tagline:
      "One-click cleanup for messy copied text, email lists, duplicate lines & strange characters",
    description:
      "Instantly clean messy copied text. Remove extra spaces, collapse duplicate blank lines, strip invisible Unicode characters, normalize smart quotes, deduplicate email lists, and clean phone numbers.",
    category: "General",
    popular: true,
    isNew: true,
    badges: [
      "One-Click Clean",
      "Diff Metrics",
      "Email & Phone Modes",
      "No Signup",
    ],
    keywords: [
      "text cleaner",
      "clean text online",
      "remove extra spaces",
      "remove duplicate lines",
      "clean email list",
      "normalize quotes",
      "remove invisible characters",
      "strip unicode characters",
    ],
    features: [
      "'Clean Everything' 1-click action with instant change metrics summary (spaces, lines, quotes)",
      "Whitespace tools: Trim each line, collapse multiple spaces, normalize line breaks",
      "Line tools: Remove empty lines, remove duplicate lines, sort alphabetically",
      "Character normalization: Convert curly quotes (“ ” ‘ ’) to straight quotes, normalize em/en dashes, strip zero-width characters",
      "Specialized modes: General Text, Clean Email List (dedupe & lowercase), Clean Phone Numbers, Clean Names (Title Case)",
      "Live before/after comparison with 1-click copy & text download",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Paste Messy Text or List",
        description:
          "Paste your raw text, email contacts, or copied notes into the editor.",
      },
      {
        step: 2,
        title: "Choose Mode or 1-Click Clean",
        description:
          "Click 'Clean Everything' or customize specific options (spaces, lines, quotes, deduplication).",
      },
      {
        step: 3,
        title: "Copy Clean Output",
        description:
          "View the metrics of what was cleaned and copy the result with one click.",
      },
    ],
    faqs: [
      {
        question: "Is my pasted text kept private?",
        answer:
          "Yes, 100%! All text cleaning and processing occurs purely inside your browser memory. No text is ever transmitted to a server or saved.",
      },
      {
        question: "What invisible characters does this tool remove?",
        answer:
          "It removes zero-width spaces (\\u200B), byte order marks (\\uFEFF), soft hyphens (\\u00AD), and non-breaking space anomalies that often corrupt code or spreadsheets.",
      },
      {
        question: "How does email list cleaning work?",
        answer:
          "It scans the input for valid email patterns, trims whitespace, converts them to lowercase, and strips duplicate entries.",
      },
    ],
    relatedToolSlugs: ["batch-file-renamer", "utm-builder", "whatsapp-link"],
  },
  {
    slug: "utm-builder",
    name: "UTM Campaign Builder & Validator",
    tagline:
      "Generate clean marketing URLs with smart mistake detection, channel presets & naming visualizer",
    description:
      "Build tracked campaign URLs and prevent analytics errors. Automatically flags uppercase letters, spaces, and invalid formats. Includes 1-click presets for Meta Ads, Google Ads, LinkedIn, Email Newsletters, and WhatsApp.",
    category: "Business",
    popular: true,
    isNew: true,
    badges: ["Smart Validator", "Auto-Fix", "Ad Presets", "Hierarchy Preview"],
    keywords: [
      "utm builder",
      "utm generator",
      "utm validator",
      "campaign url builder",
      "google analytics utm builder",
      "facebook ads utm parameters",
      "utm tracking link creator",
    ],
    features: [
      "Comprehensive UTM parameters: utm_source, utm_medium, utm_campaign, utm_content, utm_term",
      "Live Validator & Mistake Alerts: flags uppercase letters, spaces, missing protocols, and duplicate queries",
      "One-click 'Auto-Fix' to convert all fields to clean snake_case or kebab-case",
      "Quick marketing presets: Meta/Facebook Ads, Google Search CPC, LinkedIn Sponsored, Email Newsletter, Influencer, WhatsApp",
      "Campaign Hierarchy Key Visualizer (e.g. `facebook / paid_social / ramadan_sale_2026`)",
      "One-click copy, URL preview, and QR code generator",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Enter Website URL",
        description:
          "Type your landing page destination (e.g. https://yourbrand.com/summer-sale).",
      },
      {
        step: 2,
        title: "Pick Preset or Enter Campaign Fields",
        description:
          "Select a channel preset (Meta, Google, Newsletter) or enter custom campaign values.",
      },
      {
        step: 3,
        title: "Review Warnings & Copy URL",
        description:
          "Check the live validation alerts, auto-fix any issues, and copy your clean tracking link.",
      },
    ],
    faqs: [
      {
        question: "Why is UTM parameter casing important?",
        answer:
          "Google Analytics is case-sensitive. 'Facebook', 'facebook', and 'FACEBOOK' will be tracked as three separate sources, fragmenting your campaign analytics.",
      },
      {
        question: "Should I use dashes or underscores in campaign names?",
        answer:
          "Either is good, but consistency across your team is key. This tool helps you enforce lowercase and replace spaces with dashes or underscores consistently.",
      },
      {
        question: "What are the required UTM parameters?",
        answer:
          "At minimum, `utm_source`, `utm_medium`, and `utm_campaign` are recommended for proper reporting in Google Analytics 4 (GA4).",
      },
    ],
    relatedToolSlugs: ["whatsapp-link", "text-cleaner", "social-resizer"],
  },
  {
    slug: "pdf-reader",
    name: "PDF Book Reader",
    tagline:
      "Read PDF files in a clean, book-like paginated reader with light, sepia & dark themes",
    description:
      "Upload any PDF document and read it in a beautiful paginated reader with two-page spread on desktop, dark and sepia reading modes, and keyboard navigation. 100% in-browser — your PDF never leaves your device.",
    category: "Documents",
    isNew: true,
    badges: [
      "100% In-Browser",
      "Paginated Reader",
      "Dark & Sepia",
      "Keyboard Shortcuts",
    ],
    keywords: [
      "pdf reader online",
      "pdf viewer",
      "read pdf online",
      "pdf book reader",
      "online pdf viewer",
      "pdf document reader",
      "browser pdf reader",
    ],
    features: [
      "Paginated reader with two-page spread on desktop, single page on mobile",
      "Three reading themes: Light (cream), Sepia (parchment), and Dark (soft black)",
      "Zoom controls: Fit Width, Fit Page, and custom zoom levels",
      "Keyboard shortcuts: Arrow keys to navigate, +/- to zoom, F for fullscreen",
      "Fullscreen immersive reading mode",
      "Session-only page memory — remembers where you left off in the current browser session",
      "100% client-side — your PDF files are processed entirely in your browser and never uploaded to any server",
    ],
    howItWorks: [
      {
        step: 1,
        title: "Drop or Browse PDF",
        description:
          "Drag and drop your PDF file or click to browse and select from your device.",
      },
      {
        step: 2,
        title: "Read & Navigate",
        description:
          "Use arrow keys, click zones, or toolbar buttons to flip pages. Switch themes and zoom as needed.",
      },
      {
        step: 3,
        title: "Fullscreen & Focus",
        description:
          "Press F for fullscreen immersive reading. Your position is remembered if you accidentally close the tab.",
      },
    ],
    faqs: [
      {
        question: "Are my PDF files uploaded to your server?",
        answer:
          "No! All PDF rendering happens 100% locally in your browser using Mozilla's pdf.js library. Your documents never leave your device.",
      },
      {
        question: "Can I read large PDF books with hundreds of pages?",
        answer:
          "Yes! Pages are rendered on demand as you navigate, so even large PDFs with hundreds of pages load quickly and efficiently.",
      },
      {
        question: "Does it remember where I stopped reading?",
        answer:
          "Yes, within your current browser session. If you accidentally close the tab and reopen it, you'll resume from the same page. This data is cleared when you close your browser.",
      },
    ],
    relatedToolSlugs: ["text-cleaner", "batch-file-renamer", "favicon-tester"],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolsRegistry.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return toolsRegistry.filter((tool) => tool.category === category);
}

export function getPopularTools(): ToolDefinition[] {
  return toolsRegistry.filter((tool) => tool.popular);
}

export function getRelatedTools(slug: string): ToolDefinition[] {
  const current = getToolBySlug(slug);
  if (!current) return [];
  return current.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolDefinition => Boolean(t));
}
