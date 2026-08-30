export function cleanEmailList(rawText: string): { cleanedText: string; count: number; duplicates: number } {
  // Regex to extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = rawText.match(emailRegex) || [];

  const seen = new Set<string>();
  const uniqueEmails: string[] = [];
  let duplicates = 0;

  for (const match of matches) {
    const clean = match.trim().toLowerCase();
    if (seen.has(clean)) {
      duplicates++;
    } else {
      seen.add(clean);
      uniqueEmails.push(clean);
    }
  }

  return {
    cleanedText: uniqueEmails.join("\n"),
    count: uniqueEmails.length,
    duplicates,
  };
}

export function cleanPhoneList(rawText: string): { cleanedText: string; count: number; duplicates: number } {
  const lines = rawText.split(/\r?\n/);
  const seen = new Set<string>();
  const uniquePhones: string[] = [];
  let duplicates = 0;

  for (const line of lines) {
    // Keep +, digits
    const cleaned = line.replace(/[^\d+]/g, "").trim();
    if (cleaned.length >= 7) {
      if (seen.has(cleaned)) {
        duplicates++;
      } else {
        seen.add(cleaned);
        uniquePhones.push(cleaned);
      }
    }
  }

  return {
    cleanedText: uniquePhones.join("\n"),
    count: uniquePhones.length,
    duplicates,
  };
}

export function cleanNamesList(rawText: string): { cleanedText: string; count: number; duplicates: number } {
  const lines = rawText.split(/\r?\n/);
  const seen = new Set<string>();
  const uniqueNames: string[] = [];
  let duplicates = 0;

  for (const line of lines) {
    const trimmed = line.trim().replace(/\s+/g, " ");
    if (trimmed.length > 0) {
      // Capitalize to Title Case
      const titleCased = trimmed.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      if (seen.has(titleCased.toLowerCase())) {
        duplicates++;
      } else {
        seen.add(titleCased.toLowerCase());
        uniqueNames.push(titleCased);
      }
    }
  }

  return {
    cleanedText: uniqueNames.join("\n"),
    count: uniqueNames.length,
    duplicates,
  };
}
