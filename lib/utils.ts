import type { HijriDate } from "@/types";

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Shaban",
  "Ramadan",
  "Shawwal",
  "Dhul Qadah",
  "Dhul Hijjah",
];

/**
 * Converts a Gregorian date to Hijri using the standard astronomical algorithm.
 * Accurate to within 1 day for modern dates; not a calendar-authority substitute.
 */
export function toHijri(year: number, month: number, day: number): HijriDate {
  // Julian Day Number
  const jd =
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4
    ) +
    day -
    32075;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return {
    year: hYear,
    month: hMonth,
    day: hDay,
    monthName: HIJRI_MONTHS[hMonth - 1] ?? "",
  };
}

export function formatHijriDate(h: HijriDate): string {
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

export function gregorianToHijriString(date: Date): string {
  const h = toHijri(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  return formatHijriDate(h);
}

/** Returns today's date as a YYYY-MM-DD string in UTC. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Formats a YYYY-MM-DD string to a readable date like "Monday, 8 September 2026". */
export function formatReadableDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Formats Arabic numeral for Quran verse reference (e.g. ١:١). */
export function toArabicNumerals(n: number): string {
  return n
    .toString()
    .split("")
    .map((c) => String.fromCharCode(0x0660 + parseInt(c)))
    .join("");
}

/** Returns a short reference like "Al-Fatiha 1:1". */
export function verseRef(
  surahTranslit: string,
  surahNum: number,
  ayahNum: number
): string {
  return `${surahTranslit} ${surahNum}:${ayahNum}`;
}

/** Returns an Arabic reference like "الفاتحة ١:١". */
export function verseRefArabic(
  surahArabic: string,
  surahNum: number,
  ayahNum: number
): string {
  return `${surahArabic} ${toArabicNumerals(surahNum)}:${toArabicNumerals(ayahNum)}`;
}

/** Clamps a value between min and max. */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
