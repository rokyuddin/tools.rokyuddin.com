import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, HardDrive, EyeOff, ServerOff, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Privacy & Architecture Pledge",
  description:
    "Learn about our zero-tracking, 100% in-browser processing architecture at Roky Tools.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5 opacity-50" />
        <span className="text-foreground font-medium">Privacy Architecture</span>
      </nav>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
          <ShieldCheck className="size-4" />
          <span>Our Strict Privacy Guarantee</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
          Your data never leaves your device.
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          At Roky Tools, privacy is not an afterthought or marketing slogan—it is the foundational technical architecture of every tool we create.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
            <ServerOff className="size-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-foreground mb-1">
            Zero Server File Uploads
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When you compress an image, convert to WebP, or extract colors, all computational rendering is executed locally via the HTML5 Canvas API in your browser. No files are uploaded to our servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 mb-4">
            <Lock className="size-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-foreground mb-1">
            No Account or Sign-in Required
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We never request your email, name, or phone number. There are no databases storing personal user profiles or past tool activities.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 mb-4">
            <EyeOff className="size-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-foreground mb-1">
            No Invasive Tracking
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We don’t run intrusive ad tracking scripts, creepy session replays, or invasive fingerprinting.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-4">
            <HardDrive className="size-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-foreground mb-1">
            Local Storage Only
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            User preferences (such as light/dark mode and feedback responses) stay strictly inside your device&apos;s localStorage and are never synced across the web.
          </p>
        </div>
      </div>
    </div>
  );
}
