export interface BanglaMonthInfo {
  index: number;
  nameBn: string;
  nameEn: string;
  days: number;
  seasonIndex: number;
}

export interface BanglaSeasonInfo {
  index: number;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  iconName: string;
  colorClass: string;
  monthsBn: string;
  monthsEn: string;
}

export interface BanglaDateResult {
  day: number;
  dayBn: string;
  monthIndex: number;
  monthNameBn: string;
  monthNameEn: string;
  year: number;
  yearBn: string;
  season: BanglaSeasonInfo;
  weekdayBn: string;
  weekdayEn: string;
  isLeapYear: boolean;
  fullDateBn: string;
  fullDateEn: string;
  formalDocBn: string;
  shortDateBn: string;
}

export interface HistoricalPreset {
  id: string;
  titleBn: string;
  titleEn: string;
  gregorianDateStr: string; // YYYY-MM-DD or MM-DD
  fixedYear?: number;
  descriptionBn: string;
  descriptionEn: string;
  significance: string;
}

export const BANGLA_NUMERALS = [
  "০",
  "১",
  "২",
  "৩",
  "৪",
  "৫",
  "৬",
  "৭",
  "৮",
  "৯",
];

export function toBanglaNumber(num: number | string): string {
  return String(num).replace(
    /\d/g,
    (d) => BANGLA_NUMERALS[Number.parseInt(d, 10)],
  );
}

export function fromBanglaNumber(str: string): string {
  const bnToEnMap: Record<string, string> = {
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
  return str.replace(/[০-৯]/g, (d) => bnToEnMap[d] ?? d);
}

export const BANGLA_WEEKDAYS = [
  { nameBn: "রবিবার", nameEn: "Sunday", shortBn: "রবি" },
  { nameBn: "সোমবার", nameEn: "Monday", shortBn: "সোম" },
  { nameBn: "মঙ্গলবার", nameEn: "Tuesday", shortBn: "মঙ্গল" },
  { nameBn: "বুধবার", nameEn: "Wednesday", shortBn: "বুধ" },
  { nameBn: "বৃহস্পতিবার", nameEn: "Thursday", shortBn: "বৃহস্পতি" },
  { nameBn: "শুক্রবার", nameEn: "Friday", shortBn: "শুক্র" },
  { nameBn: "শনিবার", nameEn: "Saturday", shortBn: "শনি" },
];

export const BANGLA_SEASONS: BanglaSeasonInfo[] = [
  {
    index: 0,
    nameBn: "গ্রীষ্ম",
    nameEn: "Grishma (Summer)",
    descriptionBn:
      "তপ্ত রোদ, কালবৈশাখী ও মধু মাসের পাকা ফলের সমাহার (আম, জাম, কাঁঠাল, লিচু)।",
    descriptionEn:
      "Sun-drenched days, Kalbaishakhi storms, and juicy seasonal fruits like mango, jackfruit, and litchi.",
    iconName: "Sun",
    colorClass:
      "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    monthsBn: "বৈশাখ – জ্যৈষ্ঠ",
    monthsEn: "Boishakh – Joistho",
  },
  {
    index: 1,
    nameBn: "বর্ষা",
    nameEn: "Borsha (Monsoon)",
    descriptionBn: "টুপটাপ বৃষ্টি, কদম-কেয়ার সুবাস আর নদী-হাওরের থৈ থৈ জলরাশি।",
    descriptionEn:
      "Continuous raindrops, fragrant Kadam blossoms, and lush green overflowing rivers.",
    iconName: "CloudRain",
    colorClass:
      "from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30",
    monthsBn: "আষাঢ় – শ্রাবণ",
    monthsEn: "Asharh – Srabon",
  },
  {
    index: 2,
    nameBn: "শরৎ",
    nameEn: "Sharat (Autumn)",
    descriptionBn:
      "নীল আকাশে সাদা মেঘের ভেলা, নদীর তীরে ফুটে থাকা কাশফুল আর শিউলি ফুলের মিষ্টি ঘ্রাণ।",
    descriptionEn:
      "Crisp blue skies with white cotton clouds, blooming Kash grass, and sweet fragrant Shiuli flowers.",
    iconName: "CloudSun",
    colorClass:
      "from-cyan-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    monthsBn: "ভাদ্র – আশ্বিন",
    monthsEn: "Bhadro – Ashwin",
  },
  {
    index: 3,
    nameBn: "হেমন্ত",
    nameEn: "Hemanta (Late Autumn)",
    descriptionBn: "সোনালী ধানের শিষ, নবান্ন উৎসব আর কুয়াশাঘেরা ভোরের নতুন ধানের সুঘ্রাণ।",
    descriptionEn:
      "Golden paddy harvests, the joyous Nabanna festival, and misty early mornings.",
    iconName: "Wheat",
    colorClass:
      "from-yellow-500/20 to-amber-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    monthsBn: "কার্তিক – অগ্রহায়ণ",
    monthsEn: "Kartik – Ogrohayon",
  },
  {
    index: 4,
    nameBn: "শীত",
    nameEn: "Sheet (Winter)",
    descriptionBn: "মিঠে রোদ, খেজুরের সুস্বাদু রস আর ঘরে ঘরে ভাপা-চিতই পিঠাপুলির ধুম।",
    descriptionEn:
      "Chilly mornings, fresh date palm sap, and homemade traditional Pitha delicacies.",
    iconName: "Snowflake",
    colorClass:
      "from-indigo-500/20 to-blue-600/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    monthsBn: "পৌষ – মাঘ",
    monthsEn: "Poush – Magh",
  },
  {
    index: 5,
    nameBn: "বসন্ত",
    nameEn: "Basanta (Spring)",
    descriptionBn:
      "ঋতুরাজ বসন্ত, গাছে গাছে পলাশ-শিমুলের রক্তিম সমারোহ আর কোকিলের সুমধুর কুহু ডাক।",
    descriptionEn:
      "The king of seasons, vibrant red Palash flowers, and melodic cuckoo calls.",
    iconName: "Flower2",
    colorClass:
      "from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    monthsBn: "ফাল্গুন – চৈত্র",
    monthsEn: "Falgun – Choitro",
  },
];

export const BANGLA_MONTHS: BanglaMonthInfo[] = [
  { index: 0, nameBn: "বৈশাখ", nameEn: "Boishakh", days: 31, seasonIndex: 0 },
  { index: 1, nameBn: "জ্যৈষ্ঠ", nameEn: "Joistho", days: 31, seasonIndex: 0 },
  { index: 2, nameBn: "আষাঢ়", nameEn: "Asharh", days: 31, seasonIndex: 1 },
  { index: 3, nameBn: "শ্রাবণ", nameEn: "Srabon", days: 31, seasonIndex: 1 },
  { index: 4, nameBn: "ভাদ্র", nameEn: "Bhadro", days: 31, seasonIndex: 2 },
  { index: 5, nameBn: "আশ্বিন", nameEn: "Ashwin", days: 31, seasonIndex: 2 },
  { index: 6, nameBn: "কার্তিক", nameEn: "Kartik", days: 30, seasonIndex: 3 },
  { index: 7, nameBn: "অগ্রহায়ণ", nameEn: "Ogrohayon", days: 30, seasonIndex: 3 },
  { index: 8, nameBn: "পৌষ", nameEn: "Poush", days: 30, seasonIndex: 4 },
  { index: 9, nameBn: "মাঘ", nameEn: "Magh", days: 30, seasonIndex: 4 },
  { index: 10, nameBn: "ফাল্গুন", nameEn: "Falgun", days: 29, seasonIndex: 5 }, // 30 in leap year
  { index: 11, nameBn: "চৈত্র", nameEn: "Choitro", days: 30, seasonIndex: 5 },
];

export const HISTORICAL_PRESETS: HistoricalPreset[] = [
  {
    id: "pohela-boishakh",
    titleBn: "পহেলা বৈশাখ (বাংলা নববর্ষ)",
    titleEn: "Pohela Boishakh (Bangla New Year)",
    gregorianDateStr: "04-14",
    descriptionBn: "বাংলা ক্যালেন্ডারের প্রথম দিন ও সর্বজনীন বাঙালি উৎসব।",
    descriptionEn:
      "First day of the Bengali calendar and universal festive celebration.",
    significance: "১ বৈশাখ",
  },
  {
    id: "ekushey-february",
    titleBn: "একুশে ফেব্রুয়ারি (আন্তর্জাতিক মাতৃভাষা দিবস)",
    titleEn: "Ekushey February (Mother Language Day)",
    gregorianDateStr: "02-21",
    descriptionBn: "১৯৫২ সালের ভাষা আন্দোলনের ঐতিহাসিক দিন, যা ৮ই ফাল্গুনের সাথে সমকালিক।",
    descriptionEn: "Historic Bengali Language Movement Day (8 Falgun).",
    significance: "৮ ফাল্গুন",
  },
  {
    id: "independence-day",
    titleBn: "২৬শে মার্চ (স্বাধীনতা দিবস)",
    titleEn: "26th March (Independence Day)",
    gregorianDateStr: "03-26",
    descriptionBn: "১৯৭১ সালের স্বাধীনতা ঘোষণার ঐতিহাসিক দিন (১২ই চৈত্র)।",
    descriptionEn: "Independence and National Day of Bangladesh (12 Choitro).",
    significance: "১২ চৈত্র",
  },
  {
    id: "victory-day",
    titleBn: "১৬ই ডিসেম্বর (বিজয় দিবস)",
    titleEn: "16th December (Victory Day)",
    gregorianDateStr: "12-16",
    descriptionBn: "১৯৭১ সালের মহান মুক্তিযুদ্ধে চূড়ান্ত বিজয়ের দিন (১লা পৌষ)।",
    descriptionEn: "Victory Day of Bangladesh (1 Poush).",
    significance: "১ পৌষ",
  },
  {
    id: "rabindra-jayanti",
    titleBn: "২৫শে বৈশাখ (রবীন্দ্র জয়ন্তী)",
    titleEn: "25th Boishakh (Rabindra Jayanti)",
    gregorianDateStr: "05-08",
    descriptionBn: "বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের শুভ জন্মজয়ন্তী (২৫শে বৈশাখ / ৮ই মে)।",
    descriptionEn: "Birth anniversary of Nobel laureate Rabindranath Tagore.",
    significance: "২৫ বৈশাখ",
  },
  {
    id: "nazrul-jayanti",
    titleBn: "১১ই জ্যৈষ্ঠ (নজরুল জয়ন্তী)",
    titleEn: "11th Joistho (Nazrul Jayanti)",
    gregorianDateStr: "05-25",
    descriptionBn:
      "জাতীয় কবি কাজী নজরুল ইসলামের শুভ জন্মজয়ন্তী (১১ই জ্যৈষ্ঠ / ২৫শে মে)।",
    descriptionEn: "Birth anniversary of National Poet Kazi Nazrul Islam.",
    significance: "১১ জ্যৈষ্ঠ",
  },
];

export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInBanglaMonth(
  monthIndex: number,
  gregorianYear: number,
): number {
  if (monthIndex === 10) {
    // Falgun: 30 days if the Gregorian year containing February is a leap year
    return isGregorianLeapYear(gregorianYear) ? 30 : 29;
  }
  return BANGLA_MONTHS[monthIndex].days;
}

/**
 * Converts a Gregorian Date to the official Bangladeshi Bengali Calendar (Bangla Academy 2019 revision).
 */
export function gregorianToBangla(dateInput: Date | string): BanglaDateResult {
  const date =
    typeof dateInput === "string"
      ? new Date(`${dateInput}T00:00:00`)
      : new Date(dateInput);

  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-11
  const gDay = date.getDate();
  const dayOfWeek = date.getDay(); // 0-6 (0 = Sunday)

  const isLeap = isGregorianLeapYear(gYear);

  let bDay = 1;
  let bMonthIndex = 0;
  let bYear = gYear - 593;

  if (gMonth === 3) {
    // April
    if (gDay < 14) {
      bMonthIndex = 11; // Choitro
      bDay = gDay + 17; // Mar has 31 days. Mar 15-31 is 17 days.
      bYear = gYear - 594;
    } else {
      bMonthIndex = 0; // Boishakh
      bDay = gDay - 13;
      bYear = gYear - 593;
    }
  } else if (gMonth === 4) {
    // May
    if (gDay < 15) {
      bMonthIndex = 0; // Boishakh
      bDay = gDay + 17; // Apr 14-30 is 17 days
    } else {
      bMonthIndex = 1; // Joistho
      bDay = gDay - 14;
    }
  } else if (gMonth === 5) {
    // June
    if (gDay < 15) {
      bMonthIndex = 1; // Joistho
      bDay = gDay + 17; // May 15-31 is 17 days
    } else {
      bMonthIndex = 2; // Asharh
      bDay = gDay - 14;
    }
  } else if (gMonth === 6) {
    // July
    if (gDay < 16) {
      bMonthIndex = 2; // Asharh
      bDay = gDay + 16; // Jun 15-30 is 16 days
    } else {
      bMonthIndex = 3; // Srabon
      bDay = gDay - 15;
    }
  } else if (gMonth === 7) {
    // August
    if (gDay < 16) {
      bMonthIndex = 3; // Srabon
      bDay = gDay + 16; // Jul 16-31 is 16 days
    } else {
      bMonthIndex = 4; // Bhadro
      bDay = gDay - 15;
    }
  } else if (gMonth === 8) {
    // September
    if (gDay < 16) {
      bMonthIndex = 4; // Bhadro
      bDay = gDay + 16; // Aug 16-31 is 16 days
    } else {
      bMonthIndex = 5; // Ashwin
      bDay = gDay - 15;
    }
  } else if (gMonth === 9) {
    // October
    if (gDay < 17) {
      bMonthIndex = 5; // Ashwin
      bDay = gDay + 15; // Sep 16-30 is 15 days
    } else {
      bMonthIndex = 6; // Kartik
      bDay = gDay - 16;
    }
  } else if (gMonth === 10) {
    // November
    if (gDay < 16) {
      bMonthIndex = 6; // Kartik
      bDay = gDay + 15; // Oct 17-31 is 15 days
    } else {
      bMonthIndex = 7; // Ogrohayon
      bDay = gDay - 15;
    }
  } else if (gMonth === 11) {
    // December
    if (gDay < 16) {
      bMonthIndex = 7; // Ogrohayon
      bDay = gDay + 15; // Nov 16-30 is 15 days
    } else {
      bMonthIndex = 8; // Poush
      bDay = gDay - 15;
    }
  } else if (gMonth === 0) {
    // January
    bYear = gYear - 594;
    if (gDay < 15) {
      bMonthIndex = 8; // Poush
      bDay = gDay + 16; // Dec 16-31 is 16 days
    } else {
      bMonthIndex = 9; // Magh
      bDay = gDay - 14;
    }
  } else if (gMonth === 1) {
    // February
    bYear = gYear - 594;
    if (gDay < 14) {
      bMonthIndex = 9; // Magh
      bDay = gDay + 17; // Jan 15-31 is 17 days
    } else {
      bMonthIndex = 10; // Falgun
      bDay = gDay - 13;
    }
  } else if (gMonth === 2) {
    // March
    bYear = gYear - 594;
    if (gDay < 15) {
      bMonthIndex = 10; // Falgun
      const febDaysInFalgun = isLeap ? 16 : 15;
      bDay = gDay + febDaysInFalgun;
    } else {
      bMonthIndex = 11; // Choitro
      bDay = gDay - 14;
    }
  }

  const monthObj = BANGLA_MONTHS[bMonthIndex];
  const seasonObj = BANGLA_SEASONS[monthObj.seasonIndex];
  const weekdayObj = BANGLA_WEEKDAYS[dayOfWeek];

  const dayBn = toBanglaNumber(bDay);
  const yearBn = toBanglaNumber(bYear);

  const fullDateBn = `${dayBn} ${monthObj.nameBn}, ${yearBn} বঙ্গাব্দ`;
  const fullDateEn = `${bDay} ${monthObj.nameEn} ${bYear} BS`;
  const formalDocBn = `${dayBn} ${monthObj.nameBn} ${yearBn} বঙ্গাব্দ, ${weekdayObj.nameBn}`;
  const shortDateBn = `${toBanglaNumber(String(bDay).padStart(2, "0"))}/${toBanglaNumber(String(bMonthIndex + 1).padStart(2, "0"))}/${yearBn}`;

  return {
    day: bDay,
    dayBn,
    monthIndex: bMonthIndex,
    monthNameBn: monthObj.nameBn,
    monthNameEn: monthObj.nameEn,
    year: bYear,
    yearBn,
    season: seasonObj,
    weekdayBn: weekdayObj.nameBn,
    weekdayEn: weekdayObj.nameEn,
    isLeapYear: isLeap,
    fullDateBn,
    fullDateEn,
    formalDocBn,
    shortDateBn,
  };
}

/**
 * Converts a Bengali date (Bongabdo year, 0-indexed month, and day) to Gregorian Date.
 */
export function banglaToGregorian(
  bYear: number,
  bMonthIndex: number,
  bDay: number,
): Date {
  if (bMonthIndex >= 0 && bMonthIndex <= 7) {
    const gYear = bYear + 593;
    switch (bMonthIndex) {
      case 0:
        return new Date(gYear, 3, 14 + (bDay - 1)); // Boishakh (Apr 14)
      case 1:
        return new Date(gYear, 4, 15 + (bDay - 1)); // Joistho (May 15)
      case 2:
        return new Date(gYear, 5, 15 + (bDay - 1)); // Asharh (Jun 15)
      case 3:
        return new Date(gYear, 6, 16 + (bDay - 1)); // Srabon (Jul 16)
      case 4:
        return new Date(gYear, 7, 16 + (bDay - 1)); // Bhadro (Aug 16)
      case 5:
        return new Date(gYear, 8, 16 + (bDay - 1)); // Ashwin (Sep 16)
      case 6:
        return new Date(gYear, 9, 17 + (bDay - 1)); // Kartik (Oct 17)
      case 7:
        return new Date(gYear, 10, 16 + (bDay - 1)); // Ogrohayon (Nov 16)
    }
  } else if (bMonthIndex === 8) {
    // Poush
    if (bDay <= 16) {
      return new Date(bYear + 593, 11, 16 + (bDay - 1));
    }
    return new Date(bYear + 594, 0, bDay - 16);
  } else if (bMonthIndex === 9) {
    // Magh
    if (bDay <= 17) {
      return new Date(bYear + 594, 0, 15 + (bDay - 1));
    }
    return new Date(bYear + 594, 1, bDay - 17);
  } else if (bMonthIndex === 10) {
    // Falgun
    const gYear = bYear + 594;
    const isLeap = isGregorianLeapYear(gYear);
    const febDaysInFalgun = isLeap ? 16 : 15;
    if (bDay <= febDaysInFalgun) {
      return new Date(gYear, 1, 14 + (bDay - 1));
    }
    return new Date(gYear, 2, bDay - febDaysInFalgun);
  } else {
    // Choitro
    if (bDay <= 17) {
      return new Date(bYear + 594, 2, 15 + (bDay - 1));
    }
    return new Date(bYear + 594, 3, bDay - 17);
  }

  return new Date();
}
