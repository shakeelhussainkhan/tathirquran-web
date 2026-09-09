/**
 * TathirQuran Seed Script
 *
 * Populates the Supabase database with:
 *   1. Surah metadata (114 chapters) from Quran.com API
 *   2. Arabic Uthmani text (6236 ayahs) from Quran.com API
 *   3. English translations: M.H. Shakir (id 131) + Muhammad Sarwar (id 95)
 *   4. Urdu translations available on Quran.com (placeholder, non-Shia)
 *   5. Daily schedule: sequential from 2026-09-08, 2 years forward
 *
 * Run: node scripts/seed.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const QURAN_API = "https://api.quran.com/api/v4";

// Quran.com translation IDs
const TRANSLATION_IDS = {
  shakir:  131,  // M.H. Shakir — Shia, public domain
  sarwar:  95,   // Muhammad Sarwar — Shia, open
};

// Urdu translation IDs to try on Quran.com
const URDU_TRANSLATION_IDS_TO_TRY = [158, 97];  // Jalandhry, Ahmed Ali

async function fetchJson(url) {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json();
    } catch (err) {
      if (attempt < 2) {
        console.log(`  ⚠ Fetch error (attempt ${attempt + 1}/3): ${err.message}. Retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
      } else {
        throw err;
      }
    }
  }
}

/** Paginates through Quran.com endpoint, returning all results. */
async function fetchAllPages(endpoint, dataKey, perPage = 50) {
  const results = [];
  let page = 1;
  while (true) {
    const url = `${QURAN_API}${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=${perPage}&page=${page}`;
    const json = await fetchJson(url);
    const items = json[dataKey];
    if (!items || items.length === 0) break;
    results.push(...items);
    const pagination = json.meta?.pagination ?? json.pagination;
    const totalPages = pagination?.total_pages ?? 1;
    if (page >= totalPages) break;
    page++;
  }
  return results;
}

// ---------- 1. Surahs ----------

async function seedSurahs() {
  console.log("\n📖 Fetching 114 surahs from Quran.com...");
  const chapters = await fetchAllPages("/chapters?language=en", "chapters", 114);

  const rows = chapters.map((c) => ({
    surah_number:        c.id,
    name_arabic:         c.name_arabic,
    name_transliterated: c.name_simple,
    name_english:        c.translated_name?.name ?? c.name_simple,
    revelation_type:     c.revelation_place === "makkah" ? "Meccan" : "Medinan",
    ayah_count:          c.verses_count,
    juz_start:           c.juz_number ?? null,
  }));

  const { error } = await supabase
    .from("surahs")
    .upsert(rows, { onConflict: "surah_number" });
  if (error) throw error;
  console.log(`  ✓ ${rows.length} surahs inserted.`);
  return rows;
}

// ---------- 2. Ayahs ----------

async function seedAyahs() {
  console.log("\n🕌 Fetching all Quran ayahs (Uthmani script)...");

  // Single call — returns all 6236 verses
  const json = await fetchJson(`${QURAN_API}/quran/verses/uthmani`);
  const verses = json.verses;

  if (!verses || verses.length === 0) {
    throw new Error("No verses returned from Quran.com API.");
  }

  console.log(`  Found ${verses.length} ayahs. Inserting in batches...`);

  // Map verse_key "1:1" -> surah/ayah numbers
  const rows = verses.map((v) => {
    const [surah, ayah] = v.verse_key.split(":").map(Number);
    return {
      surah_number:   surah,
      ayah_number:    ayah,
      arabic_uthmani: v.text_uthmani,
      juz_number:     v.juz_number   ?? null,
      page_number:    v.page_number  ?? null,
      hizb_number:    v.hizb_number  ?? null,
    };
  });

  // Insert in chunks of 500 to avoid request size limits
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("ayahs")
      .upsert(chunk, { onConflict: "surah_number,ayah_number" });
    if (error) throw error;
    inserted += chunk.length;
    process.stdout.write(`\r  ✓ ${inserted}/${rows.length} ayahs`);
  }
  console.log(`\n  ✓ ${rows.length} ayahs inserted.`);
}

// ---------- 3. Fetch DB translation_ids ----------

async function getDbTranslationIds() {
  const { data, error } = await supabase
    .from("translations")
    .select("translation_id, scholar_name");
  if (error) throw error;
  return data;
}

// ---------- 4. Fetch ayah_id map ----------

async function buildAyahIdMap() {
  console.log("\n🗺  Building ayah_id map...");
  const allRows = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("ayahs")
      .select("ayah_id, surah_number, ayah_number")
      .order("surah_number")
      .order("ayah_number")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    allRows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const map = {};  // "surah:ayah" -> ayah_id
  for (const row of allRows) {
    map[`${row.surah_number}:${row.ayah_number}`] = row.ayah_id;
  }
  console.log(`  ✓ Map built for ${allRows.length} ayahs.`);
  return map;
}

// ---------- 5. Seed English translations ----------

// alquran.cloud returns surahs[] -> ayahs[] with numberInSurah and absolute number
async function fetchAlquranEdition(edition) {
  const json = await fetchJson(`https://api.alquran.cloud/v1/quran/${edition}`);
  if (json.code !== 200 || !json.data?.surahs) throw new Error(`alquran.cloud bad response for ${edition}`);
  const flat = [];
  for (const surah of json.data.surahs) {
    for (const ayah of surah.ayahs) {
      flat.push({ surah_number: surah.number, ayah_number: ayah.numberInSurah, text: ayah.text });
    }
  }
  return flat;
}

async function seedEnglishTranslation(alquranEdition, dbTranslationId, scholarName, ayahIdMap) {
  console.log(`\n📝 Fetching ${scholarName} translation (alquran.cloud edition=${alquranEdition})...`);
  const translations = await fetchAlquranEdition(alquranEdition);

  if (!translations || translations.length === 0) {
    console.log(`  ⚠ No translations returned for ${scholarName}.`);
    return 0;
  }

  const rows = translations
    .map((t) => {
      const key = `${t.surah_number}:${t.ayah_number}`;
      const ayahId = ayahIdMap[key];
      if (!ayahId) return null;

      // Strip HTML tags
      const cleanText = t.text.replace(/<[^>]+>/g, "").trim();

      return {
        ayah_id:        ayahId,
        translation_id: dbTranslationId,
        text:           cleanText,
      };
    })
    .filter(Boolean);

  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("ayah_translations")
      .upsert(chunk, { onConflict: "ayah_id,translation_id" });
    if (error) throw error;
    inserted += chunk.length;
    process.stdout.write(`\r  ✓ ${inserted}/${rows.length}`);
  }
  console.log(`\n  ✓ ${rows.length} ${scholarName} translations inserted.`);
  return rows.length;
}

// ---------- 6. Urdu translations from Quran.com ----------

async function seedUrduTranslations(ayahIdMap) {
  console.log("\n🌐 Fetching available Urdu translations from Quran.com...");

  // Discover what's available
  const resourcesJson = await fetchJson(`${QURAN_API}/resources/translations?language=ur`);
  const available = resourcesJson.translations ?? [];
  console.log(`  Available Urdu translations on Quran.com: ${available.map((t) => `${t.name} (${t.id})`).join(", ") || "none"}`);

  let totalInserted = 0;

  for (const quranComId of URDU_TRANSLATION_IDS_TO_TRY) {
    const meta = available.find((t) => t.id === quranComId);
    if (!meta) {
      console.log(`  ⚠ Translation id=${quranComId} not found in Urdu resources. Skipping.`);
      continue;
    }

    console.log(`  Fetching ${meta.name} (id=${quranComId})...`);

    try {
      const json = await fetchJson(`${QURAN_API}/quran/translations/${quranComId}`);
      const translations = json.translations ?? [];

      if (translations.length === 0) {
        console.log(`  ⚠ Empty response for ${meta.name}.`);
        continue;
      }

      // Insert this as a placeholder translation in the translations table
      const { data: existingTrans } = await supabase
        .from("translations")
        .select("translation_id")
        .eq("scholar_name", meta.name)
        .eq("language_code", "ur")
        .single();

      let dbTransId;
      if (existingTrans) {
        dbTransId = existingTrans.translation_id;
      } else {
        const { data: newTrans, error: transErr } = await supabase
          .from("translations")
          .insert({
            language_code:    "ur",
            scholar_name:     meta.name,
            institution:      meta.author_name ?? null,
            is_verified_shia: false,
            is_default:       false,
            is_placeholder:   true,
            placeholder_note: "Placeholder translation pending Shia scholar permission. Not displayed to users until replaced.",
            license_type:     "open",
            attribution_text: `Translation by ${meta.name}`,
            completeness_pct: 100,
          })
          .select("translation_id")
          .single();
        if (transErr) throw transErr;
        dbTransId = newTrans.translation_id;
      }

      const rows = translations
        .map((t) => {
          const [surahStr, ayahStr] = (t.verse_key ?? "").split(":");
          const ayahId = ayahIdMap[`${surahStr}:${ayahStr}`];
          if (!ayahId) return null;
          const cleanText = t.text.replace(/<[^>]+>/g, "").trim();
          return { ayah_id: ayahId, translation_id: dbTransId, text: cleanText };
        })
        .filter(Boolean);

      const CHUNK = 500;
      let inserted = 0;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const { error } = await supabase
          .from("ayah_translations")
          .upsert(chunk, { onConflict: "ayah_id,translation_id" });
        if (error) throw error;
        inserted += chunk.length;
      }
      totalInserted += inserted;
      console.log(`  ✓ ${inserted} ${meta.name} (Urdu placeholder) translations inserted.`);
    } catch (err) {
      console.log(`  ⚠ Error fetching ${meta.name}: ${err.message}`);
    }
  }

  return totalInserted;
}

// ---------- 7. Daily Schedule ----------

/**
 * Converts a Gregorian date to Hijri (simple algorithm).
 * Used to map Gregorian dates to Hijri occasions.
 */
function toHijri(year, month, day) {
  const jd =
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
    day - 32075;

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
  const hDay   = l3 - Math.floor((709 * hMonth) / 24);
  const hYear  = 30 * n + j - 30;
  return { year: hYear, month: hMonth, day: hDay };
}

async function seedDailySchedule(ayahIdMap) {
  console.log("\n📅 Building daily schedule (2026-09-08 → 2028-09-07)...");

  // Fetch all ayahs in order to build sequential mapping
  const { data: ayahRows, error: ayahErr } = await supabase
    .from("ayahs")
    .select("ayah_id, surah_number, ayah_number")
    .order("surah_number")
    .order("ayah_number");
  if (ayahErr) throw ayahErr;

  // Fetch Islamic calendar tags (priority >= 8)
  const { data: calTags, error: tagErr } = await supabase
    .from("islamic_calendar_tags")
    .select("*")
    .gte("priority", 8);
  if (tagErr) throw tagErr;

  const START_DATE = new Date("2026-09-08T00:00:00Z");
  const END_DATE   = new Date("2028-09-07T00:00:00Z");
  const DAYS = Math.floor((END_DATE - START_DATE) / 86400000) + 1;

  const TOTAL_AYAHS = ayahRows.length;
  const scheduleRows = [];

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(START_DATE.getTime() + i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const hijri = toHijri(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());

    // Check if this Hijri date has a high-priority occasion
    const occasion = calTags.find(
      (t) => t.hijri_month === hijri.month && t.hijri_day === hijri.day
    );

    if (occasion) {
      scheduleRows.push({
        schedule_date: dateStr,
        ayah_id:       occasion.ayah_id,
        reason:        "islamic_calendar",
        notes:         occasion.occasion,
      });
    } else {
      // Sequential — cycle through all 6236 ayahs
      const idx = i % TOTAL_AYAHS;
      scheduleRows.push({
        schedule_date: dateStr,
        ayah_id:       ayahRows[idx].ayah_id,
        reason:        "sequential",
        notes:         null,
      });
    }
  }

  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < scheduleRows.length; i += CHUNK) {
    const chunk = scheduleRows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("daily_schedule")
      .upsert(chunk, { onConflict: "schedule_date" });
    if (error) throw error;
    inserted += chunk.length;
    process.stdout.write(`\r  ✓ ${inserted}/${scheduleRows.length} schedule entries`);
  }
  console.log(`\n  ✓ ${scheduleRows.length} daily schedule entries inserted.`);
  return scheduleRows.length;
}

// ---------- Main ----------

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  TathirQuran Seed Script");
  console.log("  Supabase:", SUPABASE_URL);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 1. Surahs
  await seedSurahs();

  // 2. Ayahs
  await seedAyahs();

  // 3. Build ayah_id map (needed for translations)
  const ayahIdMap = await buildAyahIdMap();

  // 4. Get DB translation ids
  const dbTranslations = await getDbTranslationIds();
  const shakir  = dbTranslations.find((t) => t.scholar_name === "M.H. Shakir");
  const sarwar  = dbTranslations.find((t) => t.scholar_name === "Muhammad Sarwar");

  // 5. English translations (from alquran.cloud — Quran.com no longer hosts Shakir/Sarwar)
  let enCount = 0;
  if (shakir) {
    enCount += await seedEnglishTranslation(
      "en.shakir", shakir.translation_id, "M.H. Shakir", ayahIdMap
    );
  } else {
    console.log("\n⚠ Shakir translation_id not found in DB — run migration 004 first.");
  }

  if (sarwar) {
    enCount += await seedEnglishTranslation(
      "en.sarwar", sarwar.translation_id, "Muhammad Sarwar", ayahIdMap
    );
  } else {
    console.log("\n⚠ Sarwar translation_id not found in DB — run migration 004 first.");
  }

  // 6. Urdu placeholder translations
  await seedUrduTranslations(ayahIdMap);

  // 7. Daily schedule
  await seedDailySchedule(ayahIdMap);

  // Summary
  const { count: surahCount } = await supabase.from("surahs").select("*", { count: "exact", head: true });
  const { count: ayahCount }  = await supabase.from("ayahs").select("*",  { count: "exact", head: true });
  const { count: transCount } = await supabase.from("ayah_translations").select("*", { count: "exact", head: true });
  const { count: schedCount } = await supabase.from("daily_schedule").select("*", { count: "exact", head: true });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seed complete ✓");
  console.log(`  ${surahCount} surahs`);
  console.log(`  ${ayahCount} ayahs`);
  console.log(`  ${transCount} ayah_translations`);
  console.log(`  ${schedCount} daily_schedule entries`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
