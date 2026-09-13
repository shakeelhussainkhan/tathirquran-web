import { supabase } from "@/lib/supabase";
import type {
  Ayah,
  Surah,
  Translation,
  AyahTranslation,
  Tafsir,
  Language,
  TodayAyahResponse,
  AyahPageData,
  DailySchedule,
  PermissionRequest,
} from "@/types";
import { gregorianToHijriString, todayUTC } from "@/lib/utils";

// ---------- Languages ----------

export async function getLiveLanguages(): Promise<Language[]> {
  const { data, error } = await supabase
    .from("languages")
    .select("*")
    .in("launch_status", ["live", "beta"])
    .order("display_order");
  if (error) throw error;
  return data as Language[];
}

// ---------- Surahs ----------

export async function getAllSurahs(): Promise<Surah[]> {
  const { data, error } = await supabase
    .from("surahs")
    .select("*")
    .order("surah_number");
  if (error) throw error;
  return data as Surah[];
}

export async function getSurah(surahNumber: number): Promise<Surah | null> {
  const { data, error } = await supabase
    .from("surahs")
    .select("*")
    .eq("surah_number", surahNumber)
    .single();
  if (error) return null;
  return data as Surah;
}

// ---------- Ayahs ----------

export async function getAyah(
  surahNumber: number,
  ayahNumber: number
): Promise<Ayah | null> {
  const { data, error } = await supabase
    .from("ayahs")
    .select("*")
    .eq("surah_number", surahNumber)
    .eq("ayah_number", ayahNumber)
    .single();
  if (error) return null;
  return data as Ayah;
}

export async function getAyahById(ayahId: number): Promise<Ayah | null> {
  const { data, error } = await supabase
    .from("ayahs")
    .select("*")
    .eq("ayah_id", ayahId)
    .single();
  if (error) return null;
  return data as Ayah;
}

export async function getSurahAyahs(surahNumber: number): Promise<Ayah[]> {
  const { data, error } = await supabase
    .from("ayahs")
    .select("*")
    .eq("surah_number", surahNumber)
    .order("ayah_number");
  if (error) throw error;
  return data as Ayah[];
}

// ---------- Daily Schedule ----------

export async function getTodaySchedule(): Promise<DailySchedule | null> {
  const today = todayUTC();
  const { data, error } = await supabase
    .from("daily_schedule")
    .select("*")
    .eq("schedule_date", today)
    .single();
  if (error) return null;
  return data as DailySchedule;
}

export async function getScheduleForDate(date: string): Promise<DailySchedule | null> {
  const { data, error } = await supabase
    .from("daily_schedule")
    .select("*")
    .eq("schedule_date", date)
    .single();
  if (error) return null;
  return data as DailySchedule;
}

export async function getRecentSchedule(limit = 30): Promise<DailySchedule[]> {
  const today = todayUTC();
  const { data, error } = await supabase
    .from("daily_schedule")
    .select("*")
    .lte("schedule_date", today)
    .order("schedule_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as DailySchedule[];
}

// ---------- Translations ----------

export async function getDefaultTranslation(
  languageCode: string
): Promise<Translation | null> {
  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("language_code", languageCode)
    .eq("is_default", true)
    .single();
  if (error) return null;
  return data as Translation;
}

export async function getTranslationsForLanguage(
  languageCode: string
): Promise<Translation[]> {
  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("language_code", languageCode)
    .gt("completeness_pct", 0)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return data as Translation[];
}

// ---------- Ayah Translations ----------

export async function getAyahTranslation(
  ayahId: number,
  translationId: number
): Promise<AyahTranslation | null> {
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("*")
    .eq("ayah_id", ayahId)
    .eq("translation_id", translationId)
    .single();
  if (error) return null;
  return data as AyahTranslation;
}

export async function getAllTranslationsForAyah(
  ayahId: number
): Promise<(AyahTranslation & { translation: Translation })[]> {
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("*, translation:translations(*)")
    .eq("ayah_id", ayahId);
  if (error) throw error;
  return data as (AyahTranslation & { translation: Translation })[];
}

// ---------- Tafsir ----------

export async function getTafsirForAyah(
  ayahId: number,
  languageCode = "en"
): Promise<Tafsir | null> {
  const { data, error } = await supabase
    .from("tafsir")
    .select("*")
    .eq("ayah_id", ayahId)
    .eq("language_code", languageCode)
    .limit(1)
    .single();
  if (error) return null;
  return data as Tafsir;
}

export async function getAllTafsirForAyah(
  ayahId: number,
  languageCode = "en"
): Promise<Tafsir[]> {
  const { data } = await supabase
    .from("tafsir")
    .select("*")
    .eq("ayah_id", ayahId)
    .eq("language_code", languageCode)
    .order("scholar");
  return (data as Tafsir[]) ?? [];
}

// ---------- Composed Queries ----------

/**
 * Returns the complete data for today's scheduled ayah, including
 * Arabic text, default English translation, and tafsir if available.
 */
export async function getTodayAyahData(): Promise<TodayAyahResponse | null> {
  const today = todayUTC();

  // Resolve daily schedule
  let schedule = await getTodaySchedule();

  // Fallback: if no schedule, default to Fatiha 1:1
  let ayah: Ayah | null = null;
  if (schedule) {
    ayah = await getAyahById(schedule.ayah_id);
  } else {
    ayah = await getAyah(1, 1);
  }

  if (!ayah) return null;

  const surah = await getSurah(ayah.surah_number);
  if (!surah) return null;

  // Default English (Shakir)
  const defaultTranslation = await getDefaultTranslation("en");
  let translationText: TodayAyahResponse["translation"] = null;

  if (defaultTranslation) {
    const ayahTrans = await getAyahTranslation(
      ayah.ayah_id,
      defaultTranslation.translation_id
    );
    if (ayahTrans) {
      translationText = {
        text: ayahTrans.text,
        scholar_name: defaultTranslation.scholar_name,
        language_code: defaultTranslation.language_code,
      };
    }
  }

  // Tafsir (best-effort, all scholars)
  const tafsirEntries = await getAllTafsirForAyah(ayah.ayah_id);

  const dateObj = new Date(today + "T00:00:00Z");
  const hijriDate = gregorianToHijriString(dateObj);

  return {
    date: today,
    hijri_date: hijriDate,
    ayah: {
      surah_number: ayah.surah_number,
      ayah_number: ayah.ayah_number,
      arabic_uthmani: ayah.arabic_uthmani,
      transliteration: ayah.transliteration,
    },
    surah: {
      name_arabic: surah.name_arabic,
      name_english: surah.name_english,
      name_transliterated: surah.name_transliterated,
    },
    translation: translationText,
    tafsirEntries,
  };
}

/**
 * Returns full data for a specific ayah (all translations + tafsir).
 */
export async function getAyahPageData(
  surahNum: number,
  ayahNum: number
): Promise<AyahPageData | null> {
  const ayah = await getAyah(surahNum, ayahNum);
  if (!ayah) return null;

  const surah = await getSurah(surahNum);
  if (!surah) return null;

  const [translations, tafsir] = await Promise.all([
    getAllTranslationsForAyah(ayah.ayah_id),
    supabase
      .from("tafsir")
      .select("*")
      .eq("ayah_id", ayah.ayah_id)
      .then(({ data }) => (data as Tafsir[]) ?? []),
  ]);

  return { ayah, surah, translations, tafsir };
}

// ---------- Islamic Calendar ----------

export async function getTodayIslamicOccasion(): Promise<{ occasion: string; priority: number; ayah_id: number } | null> {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(today);
  const hijriDay = parseInt(parts.find((p) => p.type === "day")?.value ?? "0");
  const hijriMonth = parseInt(parts.find((p) => p.type === "month")?.value ?? "0");

  const { data } = await supabase
    .from("islamic_calendar_tags")
    .select("occasion, priority, ayah_id")
    .eq("hijri_month", hijriMonth)
    .eq("hijri_day", hijriDay)
    .order("priority", { ascending: false })
    .limit(1);

  return (data?.[0] as { occasion: string; priority: number; ayah_id: number }) ?? null;
}

// ---------- Permissions ----------

export async function getPermissionRequests(): Promise<PermissionRequest[]> {
  const { data, error } = await supabase
    .from("permission_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as PermissionRequest[];
}
