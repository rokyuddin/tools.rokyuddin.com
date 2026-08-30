const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function convertBelowThousand(n: number): string {
  let str = "";
  if (n >= 100) {
    str += `${ones[Math.floor(n / 100)]} hundred`;
    n %= 100;
    if (n > 0) str += " ";
  }
  if (n > 0) {
    if (n < 20) {
      str += ones[n];
    } else {
      const ten = tens[Math.floor(n / 10)];
      const one = ones[n % 10];
      str += ten + (one ? `-${one}` : "");
    }
  }
  return str;
}

export function convertNumberToWordsEn(taka: number, paisa = 0): string {
  if (taka === 0 && paisa === 0) {
    return "Zero taka only.";
  }

  let words = "";

  if (taka > 0) {
    let num = taka;

    // Crores (can exceed 100 crore, so recursive or handled in chunks)
    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    if (crore > 0) {
      words += `${convertNumberToWordsEn(crore, 0).replace(/ taka only\./i, "")} crore `;
    }

    // Lakhs
    const lakh = Math.floor(num / 100000);
    num %= 100000;

    if (lakh > 0) {
      words += `${convertBelowThousand(lakh)} lakh `;
    }

    // Thousands
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (thousand > 0) {
      words += `${convertBelowThousand(thousand)} thousand `;
    }

    // Hundreds and below
    if (num > 0) {
      words += `${convertBelowThousand(num)} `;
    }

    words = `${words.trim()} taka`;
  }

  if (paisa > 0) {
    const paisaWords = convertBelowThousand(paisa);
    if (taka > 0) {
      words += ` and ${paisaWords} paisa`;
    } else {
      words = `${paisaWords} paisa`;
    }
  }

  words = `${words.trim()} only.`;

  // Capitalize first letter
  return words.charAt(0).toUpperCase() + words.slice(1);
}
