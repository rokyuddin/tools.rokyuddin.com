"use client";

import React, { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
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
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

const MARKETING_PRESETS = [
  {
    name: "Facebook Ads",
    icon: "📱",
    source: "facebook",
    medium: "paid_social",
    campaign: "spring_sale",
  },
  {
    name: "Google Search",
    icon: "🔍",
    source: "google",
    medium: "cpc",
    campaign: "brand_search",
  },
  {
    name: "LinkedIn",
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
    campaign: "weekly_digest",
  },
  {
    name: "WhatsApp",
    icon: "💬",
    source: "whatsapp",
    medium: "social_share",
    campaign: "vip_offer",
  },
];

export function UtmBuilder() {
  const [params, setParams] = useState<UtmParams>({
    url: "https://example.com/pricing",
    source: "facebook",
    medium: "paid_social",
    campaign: "summer_launch",
    content: "banner_cta",
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
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground font-semibold mr-1">Presets:</span>
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
            Parameters
          </h3>

          <button
            type="button"
            onClick={() => setParams(INITIAL_UTM_PARAMS)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <FieldGroup className="gap-4">
          {/* Website URL */}
          <Field>
            <FieldLabel htmlFor="target-url">
              Website URL <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="target-url"
              value={params.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://yourbrand.com/page"
              className="font-mono text-sm h-11"
            />
          </Field>

          {/* Source & Medium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="utm-source">
                Source (<code className="text-primary font-mono text-xs">utm_source</code>) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="utm-source"
                value={params.source}
                onChange={(e) => update({ source: e.target.value })}
                placeholder="e.g. facebook, google, newsletter"
                className="text-sm font-mono h-11"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="utm-medium">
                Medium (<code className="text-primary font-mono text-xs">utm_medium</code>) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="utm-medium"
                value={params.medium}
                onChange={(e) => update({ medium: e.target.value })}
                placeholder="e.g. cpc, paid_social, email"
                className="text-sm font-mono h-11"
              />
            </Field>
          </div>

          {/* Campaign Name & Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="utm-campaign">
                Campaign (<code className="text-primary font-mono text-xs">utm_campaign</code>)
              </FieldLabel>
              <Input
                id="utm-campaign"
                value={params.campaign}
                onChange={(e) => update({ campaign: e.target.value })}
                placeholder="e.g. promo_spring"
                className="text-sm font-mono h-11"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="utm-content">
                Content (<code className="text-primary font-mono text-xs">utm_content</code>)
              </FieldLabel>
              <Input
                id="utm-content"
                value={params.content}
                onChange={(e) => update({ content: e.target.value })}
                placeholder="e.g. header_cta"
                className="text-sm font-mono h-11"
              />
            </Field>
          </div>

          {/* Campaign Term (Optional) */}
          <Field>
            <FieldLabel htmlFor="utm-term">
              Keyword / Term (<code className="text-primary font-mono text-xs">utm_term</code>)
            </FieldLabel>
            <Input
              id="utm-term"
              value={params.term}
              onChange={(e) => update({ term: e.target.value })}
              placeholder="e.g. running+shoes"
              className="text-sm font-mono h-11"
            />
          </Field>
        </FieldGroup>
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
      <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Share2 className="size-4 text-primary" />
            Generated Tracking URL
          </h3>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={!finalUrl}
              className="gap-1.5 text-xs font-bold cursor-pointer h-9"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copied ? "Copied!" : "Copy URL"}
            </Button>

            {finalUrl && (
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer h-9"
              >
                <ExternalLink className="size-3.5" />
                Open
              </a>
            )}
          </div>
        </div>

        {/* URL Box */}
        <div className="rounded-xl border border-border bg-muted/50 p-3.5">
          <p className="font-mono text-xs text-foreground break-all leading-relaxed select-all">
            {finalUrl || "Enter a website URL above..."}
          </p>
        </div>
      </div>
    </div>
  );
}
