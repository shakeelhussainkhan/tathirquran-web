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

/**
 * One row of ayah_words: a LEXICAL gloss (dictionary meaning) of a single
 * Arabic word, plus its transliteration. Loaded from Quran.com API v4 word
 * data by scripts/load_ayah_words.js. This is NOT tafsir/commentary and NOT
 * a verse translation — see the framing note in
 * supabase/migrations/011_ayah_words.sql.
 */
export interface AyahWord {
  id: number;
  ayah_id: number;
  position: number;
  arabic_text: string;
  translation_en: string | null;
  transliteration: string | null;
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
  tafsirEntries: Tafsir[];
}

export interface AyahPageData {
  ayah: Ayah;
  surah: Surah;
  translations: (AyahTranslation & { translation: Translation })[];
  tafsir: Tafsir[];
  /** Word-by-word lexical glosses; empty until migration 011 + the loader have been run. */
  words: AyahWord[];
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

// ---------- Search ----------

/** One matched translation snippet for a search result. */
export interface SearchMatch {
  text: string;
  scholar_name: string;
  language_code: string;
}

export interface SearchResult {
  ayah_id: number;
  surah_number: number;
  ayah_number: number;
  surah_name_english: string;
  surah_name_transliterated: string;
  surah_name_arabic: string;
  arabic_uthmani: string;
  /** Which fields the query matched: the Arabic text on the ayah, and/or a translation. */
  matched_in: ("arabic" | "translation")[];
  /** Translation rows whose text matched the query (up to 3). */
  matches: SearchMatch[];
  /** Display translation: the first matched translation, else the default English one. */
  translation_text: string | null;
  translation_scholar: string | null;
  translation_language_code: string | null;
}

export interface SearchResponse {
  query: string;
  page: number;
  page_size: number;
  total_results: number;
  total_pages: number;
  results: SearchResult[];
}

// ---------- Devotionals (occasion duas & ziyarat) ----------

/**
 * A devotional text row (migration 012). Content is VERBATIM from a Shia
 * (Ithna Ashari) source, cited in source_note — never AI-written, never an
 * invented translation. translation_text is null until a verified
 * translation is supplied.
 */
export interface DevotionalText {
  id: number;
  slug: string;
  title: string;
  /** Matches islamic_calendar_tags.occasion, or null if not occasion-bound. */
  occasion_tag: string | null;
  arabic_text: string;
  translation_text: string | null;
  source_note: string;
}
