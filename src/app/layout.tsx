import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "OmniTools – Free, Fast & Privacy-First Online Utilities",
    template: "%s | OmniTools",
  },
  description:
    "Collection of fast, free, privacy-friendly online utilities. Image compressor, WebP converter, WhatsApp link generator, BDT amount to words, and screenshot color extractor. 100% private, client-side execution.",
  keywords: [
    "free online tools",
    "omnitools",
    "image compressor",
    "image to webp",
    "whatsapp link generator",
    "bdt to words",
    "taka to words",
    "color extractor",
    "social media resizer",
    "no signup tools",
    "private tools",
    "developer utilities",
  ],
  authors: [{ name: siteConfig.creator.name, url: siteConfig.creator.url }],
  creator: siteConfig.creator.name,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "OmniTools – Free, Fast & Privacy-First Online Utilities",
    description:
      "Simple tools for everyday problems. Free, fast, zero signup, and 100% in-browser private execution.",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTools – Free, Fast & Privacy-First Online Utilities",
    description:
      "Simple tools for everyday problems. Free, fast, zero signup, and 100% in-browser private execution.",
    creator: "@mdrokyuddin",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full antialiased font-sans")}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.png" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />

        {/* SupportKori Floating Widget */}
        <Script
          src="https://www.supportkori.com/widget.js"
          data-id="mdrokyuddin"
          data-message="Support Me"
          data-color="#FFDD00"
          data-position="right"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
