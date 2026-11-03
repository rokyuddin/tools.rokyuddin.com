import { OpenRouter } from "@openrouter/sdk";
import { siteConfig } from "@/config/site";

export const OPENROUTER_DEFAULT_WHISPER_MODEL = "openai/whisper-large-v3-turbo";
export const OPENROUTER_DEFAULT_TEXT_MODEL = "google/gemini-2.5-flash";

export const STORAGE_KEY_OPENROUTER = "omnitools_openrouter_api_key";

/**
 * Retrieves the saved OpenRouter API key from localStorage or environment variables.
 */
export function getOpenRouterApiKey(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY_OPENROUTER);
    if (saved) return saved.trim();
  }
  return (
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    ""
  ).trim();
}

/**
 * Persists the user's OpenRouter API key in localStorage.
 */
export function saveOpenRouterApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_KEY_OPENROUTER);
  } else {
    localStorage.setItem(STORAGE_KEY_OPENROUTER, key.trim());
  }
}

/**
 * Creates an OpenRouter SDK client instance configured with app headers.
 */
export function createOpenRouterClient(apiKey?: string): OpenRouter {
  const key = apiKey || getOpenRouterApiKey();
  return new OpenRouter({
    apiKey: key,
    httpReferer: siteConfig.url,
    appTitle: siteConfig.name,
  });
}

/**
 * Standard request headers for OpenRouter API calls.
 */
export function getOpenRouterHeaders(apiKey?: string): Record<string, string> {
  const key = apiKey || getOpenRouterApiKey();
  return {
    Authorization: `Bearer ${key.trim()}`,
    "HTTP-Referer": siteConfig.url,
    "X-OpenRouter-Title": siteConfig.name,
  };
}
