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
  SearchResponse,
  SearchResult,
  DevotionalText,
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

// ---------- Search ----------

export const SEARCH_PAGE_SIZE = 20;

/** Supabase/PostgREST returns at most 1,000 rows per request — scan in batches of this size. */
const SEARCH_SCAN_BATCH = 1000;

/** Escape LIKE/ILIKE wildcards so user input is matched literally. */
function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

interface IdRow {
  ayah_id: number;
}

type IdBatchResult = PromiseLike<{
  data: IdRow[] | null;
  count: number | null;
  error: { message: string } | null;
}>;

/**
 * Collects every distinct ayah_id produced by a paginated id query.
 * `makeQuery` must build a FRESH query for each batch (Supabase builders are
 * single-use) and apply .order() + .range(from, to). The first call must also
 * request an exact count so the remaining batches can be fetched in parallel.
 */
async function collectMatchingAyahIds(
  makeQuery: (from: number, to: number, withCount: boolean) => IdBatchResult
): Promise<Set<number>> {
  const ids = new Set<number>();

  const first = await makeQuery(0, SEARCH_SCAN_BATCH - 1, true);
  if (first.error) throw new Error(first.error.message);
  (first.data ?? []).forEach((r) => ids.add(r.ayah_id));

  const total = first.count ?? ids.size;
  if (total > SEARCH_SCAN_BATCH) {
    const batches: IdBatchResult[] = [];
    for (let from = SEARCH_SCAN_BATCH; from < total; from += SEARCH_SCAN_BATCH) {
      batches.push(makeQuery(from, from + SEARCH_SCAN_BATCH - 1, false));
    }
    const rest = await Promise.all(batches);
    for (const batch of rest) {
      if (batch.error) throw new Error(batch.error.message);
      (batch.data ?? []).forEach((r) => ids.add(r.ayah_id));
    }
  }

  return ids;
}

/**
 * Full-text search across every translation (ayah_translations.text) plus the
 * Arabic Uthmani text on ayahs. One result per ayah,
 * ordered by Quran order (ayah_id follows surah/ayah order in the seed),
 * paginated at SEARCH_PAGE_SIZE with an exact total.
 */
export async function searchAyahs(
  rawQuery: string,
  page = 1
): Promise<SearchResponse> {
  const query = rawQuery.trim();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const pattern = `%${escapeIlike(query)}%`;

  const [translationIds, arabicIds] = await Promise.all([
    collectMatchingAyahIds(
      (from, to, withCount) =>
        supabase
          .from("ayah_translations")
          .select("ayah_id", withCount ? { count: "exact" } : undefined)
          .ilike("text", pattern)
          .order("ayah_id")
          .order("id")
          .range(from, to) as unknown as IdBatchResult
    ),
    collectMatchingAyahIds(
      (from, to, withCount) =>
        supabase
          .from("ayahs")
          .select("ayah_id", withCount ? { count: "exact" } : undefined)
          .ilike("arabic_uthmani", pattern)
          .order("ayah_id")
          .range(from, to) as unknown as IdBatchResult
    ),
  ]);

  const allIds = new Set<number>([...translationIds, ...arabicIds]);
  const sortedIds = [...allIds].sort((a, b) => a - b);

  const total_results = sortedIds.length;
  const total_pages = Math.max(1, Math.ceil(total_results / SEARCH_PAGE_SIZE));
  const pageIds = sortedIds.slice(
    (safePage - 1) * SEARCH_PAGE_SIZE,
    safePage * SEARCH_PAGE_SIZE
  );

  if (pageIds.length === 0) {
    return {
      query,
      page: safePage,
      page_size: SEARCH_PAGE_SIZE,
      total_results,
      total_pages,
      results: [],
    };
  }

  // Details for just this page of ayahs.
  const { data: ayahRows, error: ayahError } = await supabase
    .from("ayahs")
    .select("*")
    .in("ayah_id", pageIds);
  if (ayahError) throw ayahError;
  const ayahs = (ayahRows as Ayah[]) ?? [];

  const surahNumbers = [...new Set(ayahs.map((a) => a.surah_number))];
  const { data: surahRows } = await supabase
    .from("surahs")
    .select("*")
    .in("surah_number", surahNumbers);
  const surahByNumber = new Map<number, Surah>(
    ((surahRows as Surah[]) ?? []).map((s) => [s.surah_number, s])
  );

  // Translation rows on this page whose text actually matched.
  const { data: matchRows } = await supabase
    .from("ayah_translations")
    .select("*, translation:translations(*)")
    .in("ayah_id", pageIds)
    .ilike("text", pattern)
    .order("ayah_id");
  const matchesByAyah = new Map<
    number,
    (AyahTranslation & { translation: Translation })[]
  >();
  for (const row of (matchRows as (AyahTranslation & {
    translation: Translation;
  })[]) ?? []) {
    const list = matchesByAyah.get(row.ayah_id) ?? [];
    if (list.length < 3) list.push(row);
    matchesByAyah.set(row.ayah_id, list);
  }

  // Fallback display translation (default English) for ayahs that matched
  // only in Arabic, so every result has readable context.
  const needsFallback = pageIds.filter((id) => !matchesByAyah.has(id));
  const fallbackByAyah = new Map<number, AyahTranslation>();
  let defaultTranslationMeta: Translation | null = null;
  if (needsFallback.length > 0) {
    defaultTranslationMeta = await getDefaultTranslation("en");
    if (defaultTranslationMeta) {
      const { data: fallbackRows } = await supabase
        .from("ayah_translations")
        .select("*")
        .in("ayah_id", needsFallback)
        .eq("translation_id", defaultTranslationMeta.translation_id);
      for (const row of (fallbackRows as AyahTranslation[]) ?? []) {
        fallbackByAyah.set(row.ayah_id, row);
      }
    }
  }

  const ayahById = new Map<number, Ayah>(ayahs.map((a) => [a.ayah_id, a]));

  const results: SearchResult[] = pageIds
    .map((id) => {
      const ayah = ayahById.get(id);
      if (!ayah) return null;
      const surah = surahByNumber.get(ayah.surah_number);
      const matches = matchesByAyah.get(id) ?? [];
      const fallback = fallbackByAyah.get(id);

      const matched_in: SearchResult["matched_in"] = [];
      if (arabicIds.has(id)) matched_in.push("arabic");
      if (translationIds.has(id)) matched_in.push("translation");

      const firstMatch = matches[0];
      const result: SearchResult = {
        ayah_id: ayah.ayah_id,
        surah_number: ayah.surah_number,
        ayah_number: ayah.ayah_number,
        surah_name_english: surah?.name_english ?? "",
        surah_name_transliterated: surah?.name_transliterated ?? "",
        surah_name_arabic: surah?.name_arabic ?? "",
        arabic_uthmani: ayah.arabic_uthmani,
        matched_in,
        matches: matches.map((m) => ({
          text: m.text,
          scholar_name: m.translation?.scholar_name ?? "",
          language_code: m.translation?.language_code ?? "",
        })),
        translation_text: firstMatch
          ? firstMatch.text
          : fallback
            ? fallback.text
            : null,
        translation_scholar: firstMatch
          ? (firstMatch.translation?.scholar_name ?? null)
          : fallback
            ? (defaultTranslationMeta?.scholar_name ?? null)
            : null,
        translation_language_code: firstMatch
          ? (firstMatch.translation?.language_code ?? null)
          : fallback
            ? (defaultTranslationMeta?.language_code ?? null)
            : null,
      };
      return result;
    })
    .filter((r): r is SearchResult => r !== null);

  return {
    query,
    page: safePage,
    page_size: SEARCH_PAGE_SIZE,
    total_results,
    total_pages,
    results,
  };
}

// ---------- Devotionals (occasion duas & ziyarat) ----------
// All devotional reads are best-effort: if migration 012 has not been run
// yet (table missing) or the seed is empty, they return null / empty lists
// and NO devotional cards are shown anywhere. No placeholder content.

export async function getDevotionalBySlug(slug: string): Promise<DevotionalText | null> {
  const { data, error } = await supabase
    .from("devotional_texts")
    .select("*")
    .eq("slug", slug)
    .limit(1);
  if (error) return null;
  return (data?.[0] as DevotionalText) ?? null;
}

export async function getDevotionalByOccasionTag(
  occasionTag: string
): Promise<DevotionalText | null> {
  const { data, error } = await supabase
    .from("devotional_texts")
    .select("*")
    .eq("occasion_tag", occasionTag)
    .order("id")
    .limit(1);
  if (error) return null;
  return (data?.[0] as DevotionalText) ?? null;
}

/**
 * The devotionals the home page may surface today: the one paired with
 * today's Islamic occasion (if a row exists), plus Dua Kumayl (slug
 * 'dua-kumayl', if seeded) — the client component applies the
 * Thursday-evening rule before showing the Kumayl card.
 */
export async function getHomeDevotionals(
  occasion: string | null
): Promise<{ occasionDevotional: DevotionalText | null; kumayl: DevotionalText | null }> {
  const [occasionDevotional, kumayl] = await Promise.all([
    occasion ? getDevotionalByOccasionTag(occasion) : Promise.resolve(null),
    getDevotionalBySlug("dua-kumayl"),
  ]);
  // If today's occasion devotional IS Dua Kumayl, don't surface it twice.
  return {
    occasionDevotional,
    kumayl: kumayl && kumayl.slug !== occasionDevotional?.slug ? kumayl : null,
  };
}
