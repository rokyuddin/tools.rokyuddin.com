export type ToolCategory = "Images" | "Business" | "Bangladesh" | "Developer" | "General";

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
    slug: "whatsapp-link",
    name: "WhatsApp Link Generator",
    tagline: "Generate direct WhatsApp click-to-chat links with custom pre-filled messages",
    description: "Create instant, shareable WhatsApp chat links with customized message text, international country codes, instant QR code generator, and HTML embed buttons.",
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
        description: "Pick your country code or type your international phone number without spaces or dashes.",
      },
      {
        step: 2,
        title: "Add Pre-filled Message (Optional)",
        description: "Type an optional message that will automatically appear in the chat text box when opened.",
      },
      {
        step: 3,
        title: "Copy Link or Download QR Code",
        description: "Click 'Copy Link' to share anywhere, open directly in WhatsApp, or download the QR code.",
      },
    ],
    faqs: [
      {
        question: "Does the user need to save my contact number to message me?",
        answer: "No! WhatsApp Click-to-Chat links allow anyone with WhatsApp to open a direct conversation without saving your contact to their address book first.",
      },
      {
        question: "Is this WhatsApp link generator free to use?",
        answer: "Yes, it is 100% free with unlimited link and QR code generations. No account or subscription required.",
      },
      {
        question: "Can I use emojis in the pre-filled message?",
        answer: "Yes, emojis and international characters are automatically UTF-8 URL-encoded so they display perfectly in WhatsApp.",
      },
      {
        question: "Does my phone number get stored on your server?",
        answer: "No. Everything is generated directly in your browser. No numbers, messages, or metadata are ever saved or transmitted to a server.",
      },
    ],
    relatedToolSlugs: ["bdt-to-words", "color-extractor", "social-resizer"],
  },
  {
    slug: "bdt-to-words",
    name: "BDT Amount to Words Converter",
    tagline: "Convert numeric Bangladeshi Taka amounts into English & Bangla words",
    description: "Convert Bangladeshi Taka amounts into written English and Bangla (বাংলা) words for cheques, invoices, legal deeds, and banking slips. Supports Paisa and decimal figures.",
    category: "Bangladesh",
    popular: true,
    badges: ["English & Bangla", "Cheque Format", "South Asian System", "Paisa Support"],
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
        description: "Type or paste any numerical amount in BDT (e.g. 125500 or 125500.50).",
      },
      {
        step: 2,
        title: "Instant Conversion",
        description: "View the converted written amount simultaneously in both English and formal Bangla.",
      },
      {
        step: 3,
        title: "One-Click Copy",
        description: "Copy either English or Bangla text for your bank cheque, receipt, or invoice.",
      },
    ],
    faqs: [
      {
        question: "How does the South Asian numbering system work?",
        answer: "Unlike the Western system (Millions, Billions), Bangladesh and South Asia use Thousand (1,000), Lakh (100,000 / 10^5), and Crore (10,000,000 / 10^7). This converter accurately formats using this standard.",
      },
      {
        question: "Does it support Bengali numbers as input?",
        answer: "Yes, you can enter standard digits (12345) or Bengali numerals (১২৩৪৫) and it will convert seamlessly.",
      },
      {
        question: "Is this suitable for official bank cheques in Bangladesh?",
        answer: "Yes, the generated words strictly adhere to the formal banking standards for cheques in Bangladesh, including 'Taka only' and 'টাকা মাত্র'.",
      },
    ],
    relatedToolSlugs: ["whatsapp-link", "image-compressor", "color-extractor"],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Compress JPG, PNG, and WebP images directly in your browser with zero quality loss",
    description: "Free online image compressor with 100% in-browser processing. Reduce image file sizes by up to 80% without uploading your photos to any remote server.",
    category: "Images",
    popular: true,
    badges: ["100% In-Browser", "Zero Server Upload", "Batch Support", "Privacy First"],
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
        description: "Drag and drop one or multiple images, or press Ctrl+V to paste from your clipboard.",
      },
      {
        step: 2,
        title: "Adjust Quality & Size",
        description: "Choose your preferred compression level or use the recommended default (80%).",
      },
      {
        step: 3,
        title: "Download Compressed File",
        description: "Download your compressed image instantly with immediate file size savings.",
      },
    ],
    faqs: [
      {
        question: "Are my photos uploaded to your server?",
        answer: "No! All image processing is performed entirely in your browser using the HTML5 Canvas API. Your files never touch a server.",
      },
      {
        question: "What image formats are supported?",
        answer: "JPG/JPEG, PNG, WebP, GIF, and BMP files are supported.",
      },
      {
        question: "Is there a limit on file count or size?",
        answer: "There are no server limits because processing happens on your local hardware. You can process as many images as you need.",
      },
    ],
    relatedToolSlugs: ["image-to-webp", "color-extractor", "social-resizer"],
  },
  {
    slug: "image-to-webp",
    name: "Image to WebP Converter",
    tagline: "Convert JPG, PNG, GIF, and BMP images to modern, fast-loading WebP format",
    description: "Convert images to high-efficiency Google WebP format online for free. Boost your website speed and Google Core Web Vitals with ultra-small file sizes.",
    category: "Images",
    popular: true,
    badges: ["Modern Format", "Next-Gen Image", "Faster Website", "100% In-Browser"],
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
        description: "Drop your JPG or PNG files into the converter or browse from your computer.",
      },
      {
        step: 2,
        title: "Select Quality",
        description: "Keep the balanced 85% preset or adjust the slider for maximum quality.",
      },
      {
        step: 3,
        title: "Download WebP",
        description: "Download the converted WebP images ready for production web use.",
      },
    ],
    faqs: [
      {
        question: "Why should I convert images to WebP?",
        answer: "WebP is a modern image format developed by Google that provides superior lossless and lossy compression for images on the web, making pages load significantly faster.",
      },
      {
        question: "Do all modern browsers support WebP?",
        answer: "Yes! WebP is supported by over 97% of global web browsers, including Chrome, Safari, Firefox, Edge, and iOS/Android browsers.",
      },
      {
        question: "Is transparency preserved when converting PNG to WebP?",
        answer: "Yes, WebP fully supports alpha transparency just like PNG while producing a much smaller file size.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "social-resizer", "color-extractor"],
  },
  {
    slug: "color-extractor",
    name: "Screenshot Color Extractor",
    tagline: "Extract dominant color palettes and pick exact pixel colors from screenshots",
    description: "Extract color palettes from screenshots and photos. Features an interactive loupe pixel eyedropper, contrast ratio checker, and one-click HEX, RGB, HSL, and OKLCH color codes.",
    category: "Images",
    isNew: true,
    badges: ["Interactive Eyedropper", "Palette Extractor", "WCAG Contrast", "HEX / RGB / HSL"],
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
        description: "Press Ctrl+V to paste your clipboard screenshot, or drag and drop an image file.",
      },
      {
        step: 2,
        title: "Pick or Extract Colors",
        description: "View the auto-detected palette or click directly on the image with the eyedropper.",
      },
      {
        step: 3,
        title: "Copy Color Code",
        description: "Click any color swatch to copy its HEX, RGB, or HSL code to your clipboard.",
      },
    ],
    faqs: [
      {
        question: "Can I paste directly from my clipboard?",
        answer: "Yes! Take a screenshot with your OS shortcut (e.g. Snipping tool, Cmd+Shift+4, PrintScreen) and simply press Ctrl+V / Cmd+V on the page.",
      },
      {
        question: "How accurate is the pixel picker?",
        answer: "The pixel picker inspects raw canvas bitmap data at 1:1 pixel coordinate precision with a magnified 10x crosshair loupe.",
      },
      {
        question: "Are color codes provided in developer formats?",
        answer: "Yes, you can copy standard HEX (#2563EB), RGB (rgb(37, 99, 235)), HSL, and modern CSS OKLCH values.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "image-to-webp", "social-resizer"],
  },
  {
    slug: "social-resizer",
    name: "Social Media Image Resizer",
    tagline: "Resize images for Instagram, Facebook, LinkedIn, X (Twitter), and YouTube",
    description: "Crop and resize any image into standard social media post, story, header, banner, and thumbnail dimensions with smart background blur and fit modes.",
    category: "Images",
    isNew: true,
    badges: ["Social Presets", "Blur Background", "Instant Crop", "Multi-Platform"],
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
        description: "Upload your original photo, banner, or promotional graphic.",
      },
      {
        step: 2,
        title: "Choose Fit Mode",
        description: "Select Smart Blur background, Solid Fill (white/black/custom), or Smart Crop.",
      },
      {
        step: 3,
        title: "Export Social Assets",
        description: "Preview each platform result and download your perfectly formatted assets.",
      },
    ],
    faqs: [
      {
        question: "Which social media platforms and sizes are supported?",
        answer: "Instagram (Square 1:1, Portrait 4:5, Story 9:16), Facebook (Feed 16:9, Cover), LinkedIn (Post, Banner), X/Twitter (Post, Header), and YouTube (Thumbnail 1280x720).",
      },
      {
        question: "How does the blur background mode work?",
        answer: "It scales your original photo to fill the canvas with a soft aesthetic gaussian blur while centering the crisp original image without letterbox black bars.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "image-to-webp", "photo-print-size-checker"],
  },
  {
    slug: "photo-print-size-checker",
    name: "Photo Print Size Checker",
    tagline: "Instantly check how large you can print your photo with sharp quality & no blur",
    description: "Upload any photograph or image to calculate maximum print sizes at 300 DPI, 240 DPI, and 150 DPI. Includes aspect ratio crop warnings, custom print size test, and paper size chart (4x6, 5x7, 8x10, A4, A3).",
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
        description: "Select or drop any JPG, PNG, or WebP photo to read its pixel dimensions.",
      },
      {
        step: 2,
        title: "Review Print Size Recommendations",
        description: "Check the DPI and quality star rating across popular photo and poster sizes.",
      },
      {
        step: 3,
        title: "Test Target Size & Cropping",
        description: "Select your desired frame size to see if it requires cropping or loses sharpness.",
      },
    ],
    faqs: [
      {
        question: "What DPI is needed for high quality photo prints?",
        answer: "300 DPI (dots per inch) is the gold standard for crisp photo lab prints viewed up close. 200–240 DPI produces great results, while 150 DPI is acceptable for large wall posters viewed from a few feet away.",
      },
      {
        question: "Why does my 4:3 phone photo need cropping for an 8x10 frame?",
        answer: "Phone cameras shoot in a 4:3 ratio (1.33:1), whereas an 8x10 print has a 5:4 ratio (1.25:1). Because the proportions differ, small portions of the top/bottom or sides must be cropped to fill the frame completely.",
      },
      {
        question: "Are my personal photos uploaded anywhere?",
        answer: "No. The entire analysis runs locally in your web browser. Your images never leave your device.",
      },
    ],
    relatedToolSlugs: ["image-compressor", "social-resizer", "image-to-webp"],
  },
  {
    slug: "favicon-tester",
    name: "Favicon & App Icon Test Lab",
    tagline: "Preview your favicon across browser tabs, bookmarks, mobile home screens & dark mode",
    description: "Upload your icon (SVG, PNG, ICO, WebP) and instantly preview how it looks rendered at 16px, 32px, 48px, 128px, and 192px in realistic browser tabs, search results, mobile home screens, and light/dark backgrounds.",
    category: "Developer",
    popular: true,
    isNew: true,
    badges: ["Multi-Context", "Legibility Warnings", "Dark Mode", "Export Bundle"],
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
        description: "Inspect browser tab simulations, mobile home screen tiles, and light/dark themes.",
      },
      {
        step: 3,
        title: "Check Warnings & Export",
        description: "Verify small-size readability and download resized icon assets.",
      },
    ],
    faqs: [
      {
        question: "What is the recommended size for a master favicon?",
        answer: "We recommend uploading a high-resolution square image of at least 512x512 pixels (or a clean vector SVG) with transparent background.",
      },
      {
        question: "Why does my favicon look blurry on small browser tabs?",
        answer: "Browser tabs render at 16x16 or 32x32 pixels on Retina screens. Fine text, thin lines, and overly complex illustrations blur when compressed into so few pixels.",
      },
      {
        question: "What image formats are supported for testing?",
        answer: "PNG, SVG, JPG, WebP, and ICO files are all supported.",
      },
    ],
    relatedToolSlugs: ["color-extractor", "responsive-screenshot-tester", "social-resizer"],
  },
  {
    slug: "batch-file-renamer",
    name: "Batch File Renamer",
    tagline: "Bulk rename multiple files in your browser with patterns, sequential numbers & live preview",
    description: "Rename dozens or hundreds of files instantly client-side. Add prefixes, suffixes, zero-padded numbering (001, 002), find-and-replace, case changes, and download all renamed files in a single ZIP.",
    category: "General",
    popular: true,
    isNew: true,
    badges: ["100% Client-Side", "Live Diff Preview", "Zero-Padded Numbers", "ZIP Download"],
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
        description: "Choose any number of files (photos, documents, videos, music) from your computer.",
      },
      {
        step: 2,
        title: "Set Renaming Rules",
        description: "Configure sequential numbering, prefix/suffix, replace text, or change casing.",
      },
      {
        step: 3,
        title: "Preview & Download",
        description: "Review the live before/after table and download your renamed files as a ZIP archive.",
      },
    ],
    faqs: [
      {
        question: "Are my files uploaded to any server?",
        answer: "No. All file reading, renaming, and ZIP compression happen 100% inside your web browser locally. Nothing is ever sent over the internet.",
      },
      {
        question: "Can I rename photos and keep their extensions?",
        answer: "Yes! The renamer automatically preserves original file extensions (e.g. .jpg, .png) or lets you format them to lowercase.",
      },
      {
        question: "Is there a limit on how many files I can rename?",
        answer: "You can rename hundreds of files at once, bounded only by your browser's available memory.",
      },
    ],
    relatedToolSlugs: ["text-cleaner", "photo-print-size-checker", "image-compressor"],
  },
  {
    slug: "responsive-screenshot-tester",
    name: "Responsive Screenshot Tester",
    tagline: "Test UI screenshots across mobile, tablet, laptop & desktop viewports with interactive ruler",
    description: "Upload web or app screenshots and preview how your designs scale and fit across standard device viewports (375px to 1920px). Features an interactive draggable width ruler, device frame mockups, and export options.",
    category: "Developer",
    popular: false,
    isNew: true,
    badges: ["Interactive Ruler", "Device Bezels", "Viewport Presets", "Export Mockup"],
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
        description: "Upload a screenshot of your website, app UI, or landing page.",
      },
      {
        step: 2,
        title: "Adjust Viewport Width",
        description: "Click device presets or drag the interactive ruler to test different screen widths.",
      },
      {
        step: 3,
        title: "Customize Frame & Export",
        description: "Toggle device bezels or window frames and download the presentation mockup.",
      },
    ],
    faqs: [
      {
        question: "Does this emulate responsive CSS or test screenshot scaling?",
        answer: "This tool is designed to test and present your static UI screenshots inside responsive viewports and device frames with interactive dimension rulers.",
      },
      {
        question: "Can I preview custom viewport widths?",
        answer: "Yes, you can drag the interactive ruler or type any custom width and height in pixels.",
      },
    ],
    relatedToolSlugs: ["favicon-tester", "social-resizer", "color-extractor"],
  },
  {
    slug: "text-cleaner",
    name: "Personal Data & Text Cleanup Tool",
    tagline: "One-click cleanup for messy copied text, email lists, duplicate lines & strange characters",
    description: "Instantly clean messy copied text. Remove extra spaces, collapse duplicate blank lines, strip invisible Unicode characters, normalize smart quotes, deduplicate email lists, and clean phone numbers.",
    category: "General",
    popular: true,
    isNew: true,
    badges: ["One-Click Clean", "Diff Metrics", "Email & Phone Modes", "No Signup"],
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
        description: "Paste your raw text, email contacts, or copied notes into the editor.",
      },
      {
        step: 2,
        title: "Choose Mode or 1-Click Clean",
        description: "Click 'Clean Everything' or customize specific options (spaces, lines, quotes, deduplication).",
      },
      {
        step: 3,
        title: "Copy Clean Output",
        description: "View the metrics of what was cleaned and copy the result with one click.",
      },
    ],
    faqs: [
      {
        question: "Is my pasted text kept private?",
        answer: "Yes, 100%! All text cleaning and processing occurs purely inside your browser memory. No text is ever transmitted to a server or saved.",
      },
      {
        question: "What invisible characters does this tool remove?",
        answer: "It removes zero-width spaces (\\u200B), byte order marks (\\uFEFF), soft hyphens (\\u00AD), and non-breaking space anomalies that often corrupt code or spreadsheets.",
      },
      {
        question: "How does email list cleaning work?",
        answer: "It scans the input for valid email patterns, trims whitespace, converts them to lowercase, and strips duplicate entries.",
      },
    ],
    relatedToolSlugs: ["batch-file-renamer", "utm-builder", "whatsapp-link"],
  },
  {
    slug: "utm-builder",
    name: "UTM Campaign Builder & Validator",
    tagline: "Generate clean marketing URLs with smart mistake detection, channel presets & naming visualizer",
    description: "Build tracked campaign URLs and prevent analytics errors. Automatically flags uppercase letters, spaces, and invalid formats. Includes 1-click presets for Meta Ads, Google Ads, LinkedIn, Email Newsletters, and WhatsApp.",
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
        description: "Type your landing page destination (e.g. https://yourbrand.com/summer-sale).",
      },
      {
        step: 2,
        title: "Pick Preset or Enter Campaign Fields",
        description: "Select a channel preset (Meta, Google, Newsletter) or enter custom campaign values.",
      },
      {
        step: 3,
        title: "Review Warnings & Copy URL",
        description: "Check the live validation alerts, auto-fix any issues, and copy your clean tracking link.",
      },
    ],
    faqs: [
      {
        question: "Why is UTM parameter casing important?",
        answer: "Google Analytics is case-sensitive. 'Facebook', 'facebook', and 'FACEBOOK' will be tracked as three separate sources, fragmenting your campaign analytics.",
      },
      {
        question: "Should I use dashes or underscores in campaign names?",
        answer: "Either is good, but consistency across your team is key. This tool helps you enforce lowercase and replace spaces with dashes or underscores consistently.",
      },
      {
        question: "What are the required UTM parameters?",
        answer: "At minimum, `utm_source`, `utm_medium`, and `utm_campaign` are recommended for proper reporting in Google Analytics 4 (GA4).",
      },
    ],
    relatedToolSlugs: ["whatsapp-link", "text-cleaner", "social-resizer"],
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
