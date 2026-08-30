"use client";

import React, { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Sliders,
  Share2,
} from "lucide-react";
import {
  buildCampaignUrl,
  autoFixUtmParams,
  INITIAL_UTM_PARAMS,
  type UtmParams,
} from "../utils/utm-generator";
import { validateUtmParams } from "../utils/utm-validator";
import { CampaignHierarchyPreview } from "./CampaignHierarchyPreview";
import { UtmValidatorAlerts } from "./UtmValidatorAlerts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

const MARKETING_PRESETS = [
  {
    name: "Meta / Facebook Ads",
    icon: "📱",
    source: "facebook",
    medium: "paid_social",
    campaign: "spring_sale_2026",
  },
  {
    name: "Google Search (CPC)",
    icon: "🔍",
    source: "google",
    medium: "cpc",
    campaign: "brand_search",
  },
  {
    name: "LinkedIn Sponsored",
    icon: "💼",
    source: "linkedin",
    medium: "paid_social",
    campaign: "b2b_lead_gen",
  },
  {
    name: "Email Newsletter",
    icon: "📧",
    source: "newsletter",
    medium: "email",
    campaign: "weekly_digest_issue_42",
  },
  {
    name: "Influencer / Affiliate",
    icon: "⭐",
    source: "instagram_influencer",
    medium: "affiliate",
    campaign: "summer_collab",
  },
  {
    name: "WhatsApp Direct Share",
    icon: "💬",
    source: "whatsapp",
    medium: "social_share",
    campaign: "customer_vip_offer",
  },
];

export function UtmBuilder() {
  const [params, setParams] = useState<UtmParams>({
    url: "https://example.com/pricing",
    source: "facebook",
    medium: "paid_social",
    campaign: "summer_launch_2026",
    content: "hero_cta_banner",
    term: "",
  });
  const [copied, setCopied] = useState(false);

  const update = (partial: Partial<UtmParams>) => {
    setParams((prev) => ({ ...prev, ...partial }));
  };

  const finalUrl = useMemo(() => {
    return buildCampaignUrl(params);
  }, [params]);

  const validation = useMemo(() => {
    return validateUtmParams(params);
  }, [params]);

  const hasFixableIssues = useMemo(() => {
    return validation.issues.some(
      (i) => i.id.startsWith("uppercase-") || i.id.startsWith("spaces-") || i.id === "missing-protocol"
    );
  }, [validation]);

  const handleAutoFix = () => {
    setParams(autoFixUtmParams(params));
  };

  const handleCopy = async () => {
    if (!finalUrl) return;
    const ok = await copyToClipboard(finalUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyPreset = (preset: (typeof MARKETING_PRESETS)[0]) => {
    setParams((prev) => ({
      ...prev,
      source: preset.source,
      medium: preset.medium,
      campaign: preset.campaign,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Marketing Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-semibold">1-Click Presets:</span>
        {MARKETING_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-medium text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Main Form Fields */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <LinkIcon className="size-4 text-primary" />
            Campaign Parameters
          </h3>

          <button
            type="button"
            onClick={() => setParams(INITIAL_UTM_PARAMS)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset All
          </button>
        </div>

        {/* Website URL */}
        <div>
          <Label htmlFor="target-url" className="text-xs font-semibold">
            Website URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="target-url"
            value={params.url}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://yourbrand.com/landing-page"
            className="mt-1 font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            The destination page users will land on after clicking your link.
          </p>
        </div>

        {/* Source & Medium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="utm-source" className="text-xs font-semibold">
              Campaign Source (<code className="text-primary font-mono">utm_source</code>) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="utm-source"
              value={params.source}
              onChange={(e) => update({ source: e.target.value })}
              placeholder="e.g. facebook, google, newsletter"
              className="mt-1 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Referrer or platform (e.g. facebook, linkedin, twitter).
            </p>
          </div>

          <div>
            <Label htmlFor="utm-medium" className="text-xs font-semibold">
              Campaign Medium (<code className="text-primary font-mono">utm_medium</code>) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="utm-medium"
              value={params.medium}
              onChange={(e) => update({ medium: e.target.value })}
              placeholder="e.g. cpc, paid_social, email"
              className="mt-1 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Marketing medium for GA4 channel grouping (e.g. cpc, email).
            </p>
          </div>
        </div>

        {/* Campaign Name & Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="utm-campaign" className="text-xs font-semibold">
              Campaign Name (<code className="text-primary font-mono">utm_campaign</code>)
            </Label>
            <Input
              id="utm-campaign"
              value={params.campaign}
              onChange={(e) => update({ campaign: e.target.value })}
              placeholder="e.g. ramadan_sale_2026"
              className="mt-1 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Product, promo code, or slogan (e.g. summer_promo).
            </p>
          </div>

          <div>
            <Label htmlFor="utm-content" className="text-xs font-semibold">
              Campaign Content (<code className="text-primary font-mono">utm_content</code>)
            </Label>
            <Input
              id="utm-content"
              value={params.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="e.g. logolink, blue_button_v1"
              className="mt-1 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Used for A/B testing ad variations or creatives.
            </p>
          </div>
        </div>

        {/* Campaign Term (Optional) */}
        <div>
          <Label htmlFor="utm-term" className="text-xs font-semibold">
            Campaign Term (<code className="text-primary font-mono">utm_term</code>)
          </Label>
          <Input
            id="utm-term"
            value={params.term}
            onChange={(e) => update({ term: e.target.value })}
            placeholder="e.g. running+shoes, cheap+web+hosting"
            className="mt-1 text-xs font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Paid search keyword (usually used for Google Ads search terms).
          </p>
        </div>
      </div>

      {/* Campaign Hierarchy Key Visualizer */}
      <CampaignHierarchyPreview params={params} />

      {/* Validation & Consistency Alerts */}
      <UtmValidatorAlerts
        issues={validation.issues}
        onAutoFix={handleAutoFix}
        hasFixableIssues={hasFixableIssues}
      />

      {/* Final Generated URL Output Box */}
      <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <Share2 className="size-4 text-primary" />
              Generated Campaign Tracking URL
            </h3>
            <p className="text-xs text-muted-foreground">
              Ready to use in ad campaigns, newsletters, and social posts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={!finalUrl}
              className="gap-1.5 text-xs font-bold cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copied ? "Copied Link!" : "Copy URL"}
            </Button>

            {finalUrl && (
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ExternalLink className="size-3.5" />
                Test Link
              </a>
            )}
          </div>
        </div>

        {/* URL Box */}
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="font-mono text-xs text-foreground break-all leading-relaxed select-all">
            {finalUrl || "Please enter a destination website URL above..."}
          </p>
        </div>
      </div>
    </div>
  );
}
