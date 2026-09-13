import type { HijriDate } from "@/types";

export function toHijri(year: number, month: number, day: number): HijriDate {
  const date = new Date(Date.UTC(year, month - 1, day));
  const parts = new Intl.DateTimeFormat("en-US", {
    calendar: "islamic-umalqura",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const HIJRI_MONTHS = [
    "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shaban",
    "Ramadan", "Shawwal", "Dhul Qadah", "Dhul Hijjah",
  ];

  const hYear = get("year");
  const hMonth = get("month");
  const hDay = get("day");

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
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === "day")?.value ?? "";
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const year = parts.find((p) => p.type === "year")?.value ?? "";
    return `${day} ${month} ${year} AH`;
  } catch {
    const h = toHijri(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    return formatHijriDate(h);
  }
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
