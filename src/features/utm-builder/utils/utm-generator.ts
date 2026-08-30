export interface UtmParams {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

export const INITIAL_UTM_PARAMS: UtmParams = {
  url: "",
  source: "",
  medium: "",
  campaign: "",
  content: "",
  term: "",
};

export function cleanUtmString(str: string, spaceReplacement: "_" | "-" = "_"): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, spaceReplacement)
    .replace(/[^a-z0-9_\-]/g, "");
}

export function autoFixUtmParams(params: UtmParams): UtmParams {
  let cleanUrl = params.url.trim();
  if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  return {
    url: cleanUrl,
    source: cleanUtmString(params.source),
    medium: cleanUtmString(params.medium),
    campaign: cleanUtmString(params.campaign),
    content: cleanUtmString(params.content),
    term: cleanUtmString(params.term),
  };
}

export function buildCampaignUrl(params: UtmParams): string {
  let base = params.url.trim();
  if (!base) return "";

  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }

  try {
    const urlObj = new URL(base);

    if (params.source.trim()) {
      urlObj.searchParams.set("utm_source", params.source.trim());
    }
    if (params.medium.trim()) {
      urlObj.searchParams.set("utm_medium", params.medium.trim());
    }
    if (params.campaign.trim()) {
      urlObj.searchParams.set("utm_campaign", params.campaign.trim());
    }
    if (params.content.trim()) {
      urlObj.searchParams.set("utm_content", params.content.trim());
    }
    if (params.term.trim()) {
      urlObj.searchParams.set("utm_term", params.term.trim());
    }

    return urlObj.toString();
  } catch {
    // If URL is incomplete, build a fallback string
    const queryParts: string[] = [];
    if (params.source.trim()) queryParts.push(`utm_source=${encodeURIComponent(params.source.trim())}`);
    if (params.medium.trim()) queryParts.push(`utm_medium=${encodeURIComponent(params.medium.trim())}`);
    if (params.campaign.trim()) queryParts.push(`utm_campaign=${encodeURIComponent(params.campaign.trim())}`);
    if (params.content.trim()) queryParts.push(`utm_content=${encodeURIComponent(params.content.trim())}`);
    if (params.term.trim()) queryParts.push(`utm_term=${encodeURIComponent(params.term.trim())}`);

    const delimiter = base.includes("?") ? "&" : "?";
    return queryParts.length > 0 ? `${base}${delimiter}${queryParts.join("&")}` : base;
  }
}
