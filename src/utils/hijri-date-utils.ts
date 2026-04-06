const DAYS_IN_YEAR = [30, 59, 89, 118, 148, 177, 207, 236, 266, 295, 325];
const DAYS_IN_30_YEARS = [
  354, 708, 1063, 1417, 1771, 2126, 2480, 2834, 3189, 3543, 3898, 4252, 4606, 4961, 5315, 5669,
  6024, 6378, 6732, 7087, 7441, 7796, 8150, 8504, 8859, 9213, 9567, 9922, 10276, 10631,
];

const MONTH_NAMES = {
  long: {
    en: [
      "Moharram al-Haraam",
      "Safar al-Muzaffar",
      "Rabi al-Awwal",
      "Rabi al-Aakhar",
      "Jumada al-Ula",
      "Jumada al-Ukhra",
      "Rajab al-Asab",
      "Shabaan al-Karim",
      "Ramadaan al-Moazzam",
      "Shawwal al-Mukarram",
      "Zilqadah al-Haraam",
      "Zilhaj al-Haraam",
    ],
  },
  short: {
    en: [
      "Moharram",
      "Safar",
      "Rabi I",
      "Rabi II",
      "Jumada I",
      "Jumada II",
      "Rajab",
      "Shabaan",
      "Ramadaan",
      "Shawwal",
      "Zilqadah",
      "Zilhaj",
    ],
  },
  code: {
    en: [
      "Moharram",
      "Safar",
      "R1",
      "R2",
      "J1",
      "J2",
      "Rajab",
      "Shabaan",
      "Ramadaan",
      "Shawwal",
      "Zilqadah",
      "Zilhaj",
    ],
  },
} as const;

type HijriFormat = keyof typeof MONTH_NAMES;

const isJulian = (date: Date): boolean => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return y < 1582 || (y === 1582 && (m < 9 || (m === 9 && d < 5)));
};

const gregorianToAJD = (date: Date): number => {
  let a: number;
  let b: number;
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day =
    date.getDate() +
    date.getHours() / 24 +
    date.getMinutes() / 1440 +
    date.getSeconds() / 86400 +
    date.getMilliseconds() / 86400000;

  if (month < 3) {
    year -= 1;
    month += 12;
  }

  if (isJulian(date)) {
    b = 0;
  } else {
    a = Math.floor(year / 100);
    b = 2 - a + Math.floor(a / 4);
  }

  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
};

const fromAJD = (ajd: number): { year: number; month: number; day: number } => {
  let i = 0;
  let left = Math.floor(ajd - 1948083.5);
  const y30 = Math.floor(left / 10631.0);

  left -= y30 * 10631;
  while (left > DAYS_IN_30_YEARS[i]) i += 1;

  const year = Math.round(y30 * 30.0 + i);
  if (i > 0) left -= DAYS_IN_30_YEARS[i - 1];

  i = 0;
  while (left > DAYS_IN_YEAR[i]) i += 1;

  const month = Math.round(i);
  const day = i > 0 ? Math.round(left - DAYS_IN_YEAR[i - 1]) : Math.round(left);

  return { year, month, day };
};

export const fromGregorian = (gregorianDate: Date, format: HijriFormat = "short"): string => {
  const ajd = gregorianToAJD(gregorianDate);
  const { year, month, day } = fromAJD(ajd);
  const monthName = MONTH_NAMES[format].en[month];
  if (format === "code") {
    return `${day} ${monthName}`;
  }
  return `${day} ${monthName} ${year}`;
};

export const getHijriYear = (gregorianDate: Date = new Date()): number => {
  const ajd = gregorianToAJD(gregorianDate);
  const { year } = fromAJD(ajd);
  return year;
};

export const getHijriDateParts = (
  gregorianDate: Date
): { year: number; month: number; day: number } => {
  const ajd = gregorianToAJD(gregorianDate);
  return fromAJD(ajd);
};

export const getFmbTakhmeenYearFromGregorian = (gregorianDate: Date): number => {
  const { year, month } = getHijriDateParts(gregorianDate);
  return month < 9 ? year - 1 : year;
};

export const formatFmbHijriPeriod = (
  hijriStart: string | number | null | undefined,
  hijriEnd: string | number | null | undefined
): string | null => {
  if (hijriStart == null || hijriStart === "") return null;
  const start = Number(hijriStart);
  if (!Number.isFinite(start)) return null;
  const end =
    hijriEnd != null && hijriEnd !== "" && Number.isFinite(Number(hijriEnd))
      ? Number(hijriEnd)
      : start + 1;
  return `${start}\u2013${end}`;
};
