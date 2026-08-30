export interface WhatsAppLinkInput {
  dialCode: string;
  phoneNumber: string;
  message?: string;
}

export function sanitizePhoneNumber(input: string): string {
  // Remove all non-numeric characters except leading +
  return input.replace(/[^\d]/g, "");
}

export function generateWhatsAppUrl({
  dialCode,
  phoneNumber,
  message,
}: WhatsAppLinkInput): string {
  const cleanDial = sanitizePhoneNumber(dialCode);
  let cleanNumber = sanitizePhoneNumber(phoneNumber);

  // If user already typed leading 0 (e.g. 01712345678 in BD), strip leading zero
  if (cleanNumber.startsWith("0")) {
    cleanNumber = cleanNumber.substring(1);
  }

  // If user included the full dial code in the phone number box, avoid duplicating
  if (cleanNumber.startsWith(cleanDial) && cleanNumber.length > cleanDial.length + 5) {
    cleanNumber = cleanNumber.substring(cleanDial.length);
  }

  const fullNumber = `${cleanDial}${cleanNumber}`;
  if (!cleanNumber) return "";

  const baseUrl = `https://wa.me/${fullNumber}`;
  if (message && message.trim()) {
    const encodedMessage = encodeURIComponent(message.trim());
    return `${baseUrl}?text=${encodedMessage}`;
  }

  return baseUrl;
}

export function generateHtmlSnippet(url: string, buttonText = "Chat on WhatsApp"): string {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background-color:#25D366;color:#ffffff;text-decoration:none;border-radius:8px;font-family:sans-serif;font-weight:bold;font-size:14px;">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
  ${buttonText}
</a>`;
}
