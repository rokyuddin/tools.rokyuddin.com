export interface ViewportPreset {
  id: string;
  name: string;
  category: "mobile" | "tablet" | "laptop" | "desktop";
  width: number;
  height: number;
  scale: number;
  iconName: string;
}

export const VIEWPORT_PRESETS: ViewportPreset[] = [
  // Mobile
  {
    id: "iphone-se",
    name: "iPhone SE (375px)",
    category: "mobile",
    width: 375,
    height: 667,
    scale: 1,
    iconName: "Smartphone",
  },
  {
    id: "iphone-15",
    name: "iPhone 14/15 (390px)",
    category: "mobile",
    width: 390,
    height: 844,
    scale: 1,
    iconName: "Smartphone",
  },
  {
    id: "iphone-pro-max",
    name: "iPhone Pro Max (430px)",
    category: "mobile",
    width: 430,
    height: 932,
    scale: 1,
    iconName: "Smartphone",
  },

  // Tablet
  {
    id: "ipad-mini",
    name: "iPad Mini (768px)",
    category: "tablet",
    width: 768,
    height: 1024,
    scale: 1,
    iconName: "Tablet",
  },
  {
    id: "ipad-pro",
    name: "iPad Pro (1024px)",
    category: "tablet",
    width: 1024,
    height: 1366,
    scale: 1,
    iconName: "Tablet",
  },

  // Laptop & Desktop
  {
    id: "macbook-air",
    name: "MacBook Air (1280px)",
    category: "laptop",
    width: 1280,
    height: 800,
    scale: 1,
    iconName: "Laptop",
  },
  {
    id: "desktop-hd",
    name: "Desktop FHD (1440px)",
    category: "desktop",
    width: 1440,
    height: 900,
    scale: 1,
    iconName: "Monitor",
  },
  {
    id: "desktop-fhd",
    name: "Large Desktop (1920px)",
    category: "desktop",
    width: 1920,
    height: 1080,
    scale: 1,
    iconName: "Monitor",
  },
];
