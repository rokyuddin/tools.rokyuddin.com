const bengaliToEnglishDigitsMap: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export interface ParsedAmount {
  taka: number;
  paisa: number;
  isValid: boolean;
  rawString: string;
}

export function parseBanglaOrEnglishNumber(input: string): ParsedAmount {
  if (!input || !input.trim()) {
    return { taka: 0, paisa: 0, isValid: false, rawString: "" };
  }

  // Convert any Bengali numerals to English numerals
  let normalized = input.trim();
  for (const [bn, en] of Object.entries(bengaliToEnglishDigitsMap)) {
    normalized = normalized.replaceAll(bn, en);
  }

  // Remove commas, spaces, currency symbols ($, ৳, Tk, BDT)
  normalized = normalized
    .replace(/[,\s৳$]/g, "")
    .replace(/^(?:BDT|Tk|TK|tk|bdt)\.?/i, "")
    .trim();

  // Validate number format (optional decimal point)
  const regex = /^\d+(\.\d+)?$/;
  if (!regex.test(normalized)) {
    return { taka: 0, paisa: 0, isValid: false, rawString: input };
  }

  const parts = normalized.split(".");
  const taka = parseInt(parts[0], 10);

  let paisa = 0;
  if (parts.length > 1 && parts[1]) {
    // Take first 2 digits of decimal as paisa
    const paisaStr = parts[1].padEnd(2, "0").slice(0, 2);
    paisa = parseInt(paisaStr, 10);
  }

  return {
    taka,
    paisa,
    isValid: !isNaN(taka),
    rawString: normalized,
  };
}

export function getNumberBreakdown(amount: number) {
  const crore = Math.floor(amount / 10000000);
  let rem = amount % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = Math.floor(rem / 100);
  const units = rem % 100;

  return { crore, lakh, thousand, hundred, units };
}
