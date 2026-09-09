export interface Language {
  language_code: string;
  language_name: string;
  native_name: string;
  script: string;
  rtl: boolean;
  font_family: string | null;
  launch_status: "live" | "beta" | "pending";
  display_order: number | null;
  created_at: string;
}

export interface Surah {
  surah_number: number;
  name_arabic: string;
  name_transliterated: string;
  name_english: string;
  revelation_type: "Meccan" | "Medinan" | null;
  ayah_count: number;
  juz_start: number | null;
}

export interface Ayah {
  ayah_id: number;
  surah_number: number;
  ayah_number: number;
  arabic_uthmani: string;
  transliteration: string | null;
  juz_number: number | null;
  page_number: number | null;
  hizb_number: number | null;
}

export interface Translation {
  translation_id: number;
  language_code: string;
  scholar_name: string;
  scholar_title: string | null;
  institution: string | null;
  school: string | null;
  is_verified_shia: boolean;
  is_default: boolean;
  is_placeholder: boolean;
  placeholder_note: string | null;
  license_type: "public_domain" | "licensed" | "partnership" | "open" | null;
  attribution_text: string | null;
  completeness_pct: number;
  created_at: string;
}

export interface AyahTranslation {
  id: number;
  ayah_id: number;
  translation_id: number;
  text: string;
  verified_at: string | null;
}

export interface Tafsir {
  id: number;
  ayah_id: number;
  scholar: string;
  language_code: string;
  text: string;
  source_book: string | null;
  volume: string | null;
  created_at: string;
}

export interface IslamicCalendarTag {
  id: number;
  ayah_id: number;
  occasion: string;
  hijri_month: number | null;
  hijri_day: number | null;
  priority: number;
  notes: string | null;
}

export interface DailySchedule {
  schedule_date: string;
  ayah_id: number;
  reason: "sequential" | "islamic_calendar" | "curated" | "special";
  notes: string | null;
  created_at: string;
}

export interface PermissionRequest {
  id: number;
  scholar_name: string;
  institution: string | null;
  language_code: string | null;
  translation_id: number | null;
  sent_date: string | null;
  status: "draft" | "sent" | "responded" | "approved" | "declined";
  notes: string | null;
  contact_email: string | null;
  created_at: string;
}

// Composed types for API responses
export interface TodayAyahResponse {
  date: string;
  hijri_date: string;
  ayah: Pick<Ayah, "surah_number" | "ayah_number" | "arabic_uthmani" | "transliteration">;
  surah: Pick<Surah, "name_arabic" | "name_english" | "name_transliterated">;
  translation: {
    text: string;
    scholar_name: string;
    language_code: string;
  } | null;
  tafsir: {
    text: string;
    scholar: string;
    source_book: string | null;
  } | null;
}

export interface AyahPageData {
  ayah: Ayah;
  surah: Surah;
  translations: (AyahTranslation & { translation: Translation })[];
  tafsir: Tafsir[];
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}
