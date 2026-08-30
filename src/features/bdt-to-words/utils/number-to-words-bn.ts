const bengaliNumbers: string[] = [
  "শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
  "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ",
  "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ", "ত্রিশ",
  "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
  "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
  "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
  "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
  "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
  "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "অষ্টআশি", "ঊননব্বই", "নব্বই",
  "একানব্বই", "বানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
];

function convertBelowThousandBn(n: number): string {
  let str = "";
  if (n >= 100) {
    const hundredDigit = Math.floor(n / 100);
    str += `${bengaliNumbers[hundredDigit]} শত `;
    n %= 100;
  }
  if (n > 0) {
    str += bengaliNumbers[n];
  }
  return str.trim();
}

export function convertNumberToWordsBn(taka: number, paisa = 0): string {
  if (taka === 0 && paisa === 0) {
    return "শূন্য টাকা মাত্র।";
  }

  let words = "";

  if (taka > 0) {
    let num = taka;

    // কোটি (Crore)
    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    if (crore > 0) {
      words += `${convertNumberToWordsBn(crore, 0).replace(/ টাকা মাত্র।/g, "")} কোটি `;
    }

    // লাখ (Lakh)
    const lakh = Math.floor(num / 100000);
    num %= 100000;

    if (lakh > 0) {
      words += `${convertBelowThousandBn(lakh)} লাখ `;
    }

    // হাজার (Thousand)
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (thousand > 0) {
      words += `${convertBelowThousandBn(thousand)} হাজার `;
    }

    // শত ও একক (Hundred & Units)
    if (num > 0) {
      words += `${convertBelowThousandBn(num)} `;
    }

    words = `${words.trim()} টাকা`;
  }

  if (paisa > 0) {
    const paisaWords = convertBelowThousandBn(paisa);
    if (taka > 0) {
      words += ` এবং ${paisaWords} পয়সা`;
    } else {
      words = `${paisaWords} পয়সা`;
    }
  }

  words = `${words.trim()} মাত্র।`;
  return words;
}
