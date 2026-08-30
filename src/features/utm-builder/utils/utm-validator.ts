import type { UtmParams } from "./utm-generator";

export interface UtmIssue {
  id: string;
  field: keyof UtmParams | "general";
  type: "warning" | "error" | "info";
  message: string;
}

export function validateUtmParams(params: UtmParams): {
  isValid: boolean;
  hasWarnings: boolean;
  issues: UtmIssue[];
} {
  const issues: UtmIssue[] = [];

  // 1. URL checks
  if (!params.url.trim()) {
    issues.push({
      id: "missing-url",
      field: "url",
      type: "error",
      message: "Destination website URL is required.",
    });
  } else {
    try {
      const parsed = new URL(
        params.url.startsWith("http://") || params.url.startsWith("https://")
          ? params.url
          : `https://${params.url}`
      );
      if (!params.url.startsWith("https://") && !params.url.startsWith("http://")) {
        issues.push({
          id: "missing-protocol",
          field: "url",
          type: "warning",
          message: "Missing https:// protocol. We will automatically prepend https://.",
        });
      }
      if (params.url.startsWith("http://")) {
        issues.push({
          id: "insecure-http",
          field: "url",
          type: "warning",
          message: "Insecure http:// detected. Modern websites should use https://.",
        });
      }
    } catch {
      issues.push({
        id: "invalid-url",
        field: "url",
        type: "error",
        message: "Invalid website URL format.",
      });
    }
  }

  // 2. UTM Source check
  if (!params.source.trim()) {
    issues.push({
      id: "missing-source",
      field: "source",
      type: "warning",
      message: "utm_source is strongly recommended for Google Analytics (e.g. facebook, google, newsletter).",
    });
  }

  // 3. UTM Medium check
  if (!params.medium.trim()) {
    issues.push({
      id: "missing-medium",
      field: "medium",
      type: "warning",
      message: "utm_medium is recommended for GA4 channel grouping (e.g. cpc, paid_social, email).",
    });
  }

  // 4. UTM Campaign check
  if (!params.campaign.trim()) {
    issues.push({
      id: "missing-campaign",
      field: "campaign",
      type: "info",
      message: "utm_campaign identifies the promotional campaign (e.g. summer_sale_2026).",
    });
  }

  // Check for Uppercase and Spaces across all fields
  const fieldsToCheck: Array<keyof UtmParams> = ["source", "medium", "campaign", "content", "term"];

  for (const field of fieldsToCheck) {
    const val = params[field];
    if (!val) continue;

    if (/[A-Z]/.test(val)) {
      issues.push({
        id: `uppercase-${field}`,
        field,
        type: "warning",
        message: `Uppercase letters detected in utm_${field} ("${val}"). Google Analytics is case-sensitive! Convert to lowercase to avoid fragmented data.`,
      });
    }

    if (/\s/.test(val)) {
      issues.push({
        id: `spaces-${field}`,
        field,
        type: "warning",
        message: `Spaces detected in utm_${field}. Spaces get converted to "%20". Use underscores (_) or hyphens (-) instead.`,
      });
    }
  }

  const hasErrors = issues.some((i) => i.type === "error");
  const hasWarnings = issues.some((i) => i.type === "warning");

  return {
    isValid: !hasErrors,
    hasWarnings,
    issues,
  };
}
