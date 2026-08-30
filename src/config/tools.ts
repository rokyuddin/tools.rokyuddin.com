export type ToolCategory = "Images" | "Business" | "Bangladesh" | "Developer";

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
    relatedToolSlugs: ["image-compressor", "image-to-webp", "color-extractor"],
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
