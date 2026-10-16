// Load ayah_words (word-by-word LEXICAL glosses) from the Quran.com API v4
// words endpoint: GET /verses/by_key/{surah}:{ayah}?words=true
//   &word_fields=text_uthmani,transliteration,translation
//
// ===========================================================================
// CRITICAL CONTENT FRAMING — READ BEFORE RUNNING
// ===========================================================================
// The per-word `translation` values returned by Quran.com's word data are
// LEXICAL GLOSSES: dictionary meanings of individual Arabic words (e.g. for
// 1:1: "In (the) name / (of) Allah / the Most Gracious / the Most Merciful").
// They are NOT tafsir, NOT commentary, and NOT a translation of the verse.
// No tafsir or translation EDITION is fetched by this script, and nothing in
// this data may ever be labelled or presented as tafsir/commentary or as a
// scholar's translation. The verse translations shown in the app/website
// remain the existing Shia translations already in ayah_translations; this
// table only powers the optional "Word by word" learning view, whose UI
// carries the same lexical-gloss framing.
//
// Source: Quran.com API v4 word data (the same upstream project the Arabic
// Uthmani text in `ayahs` was seeded from — see scripts/seed.js).
//
// SANITY CHECK BEFORE THIS SHIPS: after loading, Shakeel should eyeball a
// sample — suggested verses 1:1, 2:255 and 36:58 (this script prints all
// three in full) — and confirm the glosses read as plain dictionary meanings
// before the "Word by word" UI is relied on in production.
// ===========================================================================
//
// PREREQUISITE: run supabase/migrations/011_ayah_words.sql first (creates
// the ayah_words table). Shakeel runs SQL himself — this script does not
// create the table and will fail cleanly if it is missing.
//
// Usage:
//   node scripts/load_ayah_words.js --dry-run            # fetch + print samples, NO database access at all
//   node scripts/load_ayah_words.js --dry-run --limit 10 # dry-run over the first 10 ayahs only
//   node scripts/load_ayah_words.js --limit 10           # partial TEST load: first 10 ayahs only
//   node scripts/load_ayah_words.js                      # full load (backs up ayah_words to backups/ first)
//
// Write mode uses SUPABASE_SERVICE_ROLE_KEY from .env.local and writes to
// PRODUCTION (there is no staging DB) — run it deliberately, by hand.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const fs = require('fs');
const path = require('path');

const API = 'https://api.quran.com/api/v4';
const EXPECTED_AYAHS = 6236;
const EXPECTED_SURAHS = 114;
const CONCURRENCY = 10;
const DRY_RUN = process.argv.includes('--dry-run');

function parseLimit() {
  const i = process.argv.indexOf('--limit');
  if (i === -1) return null;
  const n = parseInt(process.argv[i + 1], 10);
  if (!Number.isFinite(n) || n <= 0) {
    console.error('--limit requires a positive integer, e.g. --limit 10');
    process.exit(1);
  }
  return n;
}
const LIMIT = parseLimit();

// Verses printed in full so the lexical glosses can be sanity-checked.
const SAMPLE_KEYS = ['1:1', '2:255', '36:58'];

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) return await res.json();
      console.error(`  HTTP ${res.status} from ${url} (attempt ${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

/** Enumerate every verse key ("surah:ayah") in Quran order from the API's
 *  own chapter metadata — no hardcoded per-surah ayah counts. */
async function getVerseKeys() {
  const json = await fetchJson(`${API}/chapters?language=en&per_page=114&page=1`);
  const chapters = json.chapters;
  if (!Array.isArray(chapters) || chapters.length !== EXPECTED_SURAHS) {
    throw new Error(`Expected ${EXPECTED_SURAHS} chapters, got ${chapters?.length}`);
  }
  const keys = [];
  for (const c of chapters) {
    for (let a = 1; a <= c.verses_count; a++) keys.push(`${c.id}:${a}`);
  }
  return keys;
}

/** Fetch one verse's words. The API appends a non-word entry
 *  (char_type_name === 'end', the ﴿١﴾ ayah-number marker) — it is filtered
 *  out; only real words are kept, re-indexed to a dense 1..N position. */
async function fetchVerseWords(key) {
  const url = `${API}/verses/by_key/${key}?words=true` +
    `&word_fields=text_uthmani,transliteration,translation&per_page=300`;
  const json = await fetchJson(url);
  const words = json.verse?.words;
  if (!Array.isArray(words)) throw new Error(`No words array for ${key}`);
  return words
    .filter(w => w.char_type_name === 'word')
    .map((w, i) => ({
      position: i + 1,
      arabic_text: (w.text_uthmani || w.text || '').trim(),
      translation_en: w.translation?.text?.trim() || null,
      transliteration: w.transliteration?.text?.trim() || null,
    }));
}

/** Fetch words for many verses with modest concurrency, preserving order. */
async function fetchAllWords(keys) {
  const byKey = new Map();
  let done = 0;
  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    const chunk = keys.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(k => fetchVerseWords(k)));
    chunk.forEach((k, j) => byKey.set(k, results[j]));
    done += chunk.length;
    if (done % 500 < CONCURRENCY || done === keys.length) {
      console.log(`  …fetched ${done}/${keys.length} verses`);
    }
  }
  return byKey;
}

function printVerseTable(key, words) {
  console.log(`  ${key} (${words.length} words):`);
  for (const w of words) {
    console.log(`    ${String(w.position).padStart(2)}  ${w.arabic_text}  |  ${w.transliteration ?? '—'}  |  ${w.translation_en ?? '—'}`);
  }
}

async function loadAllRows(sb, table, columns, orderBy) {
  let rows = [];
  let from = 0;
  while (true) {
    const { data: batch, error } = await sb
      .from(table)
      .select(columns)
      .order(orderBy)
      .range(from, from + 999); // Supabase caps at 1,000 rows per query.
    if (error) throw new Error(`Reading ${table} failed: ${error.message}`);
    if (!batch || batch.length === 0) break;
    rows = rows.concat(batch);
    from += 1000;
    if (batch.length < 1000) break;
  }
  return rows;
}

async function main() {
  const allKeys = await getVerseKeys();
  console.log(`✓ API chapter metadata: ${allKeys.length} verses across ${EXPECTED_SURAHS} surahs`);
  if (!LIMIT && allKeys.length !== EXPECTED_AYAHS) {
    console.error(`Refusing to continue: expected ${EXPECTED_AYAHS} verses, API reports ${allKeys.length}.`);
    process.exit(1);
  }

  const keys = LIMIT ? allKeys.slice(0, LIMIT) : allKeys;
  console.log(`Fetching word data for ${keys.length} verses from Quran.com API v4 (words endpoint)…`);
  const byKey = await fetchAllWords(keys);

  // In dry-run, also fetch the sanity-check verses if a --limit cut them off,
  // so the samples below are always available for eyeballing.
  if (DRY_RUN) {
    for (const k of SAMPLE_KEYS) {
      if (!byKey.has(k)) byKey.set(k, await fetchVerseWords(k));
    }
  }

  let totalWords = 0;
  const emptyArabic = [];
  const emptyVerses = [];
  for (const k of keys) {
    const words = byKey.get(k) ?? [];
    if (words.length === 0) emptyVerses.push(k);
    for (const w of words) {
      totalWords++;
      if (!w.arabic_text) emptyArabic.push(`${k}#${w.position}`);
    }
  }
  console.log(`✓ Fetched ${totalWords} words for ${keys.length} verses`);
  if (emptyVerses.length) console.log(`  ⚠ Verses with NO words: ${emptyVerses.slice(0, 10).join(', ')}`);
  if (emptyArabic.length) console.log(`  ⚠ Words with empty Arabic text: ${emptyArabic.slice(0, 10).join(', ')}`);

  console.log('\nSamples — LEXICAL glosses (dictionary meanings of single words, NOT tafsir):');
  for (const k of SAMPLE_KEYS) {
    const words = byKey.get(k);
    if (words) printVerseTable(k, words);
    else console.log(`  ${k}: (not in this run's range — run without --limit to see it)`);
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: no database access performed. Nothing was written.');
    return;
  }

  if (emptyVerses.length > 0 || emptyArabic.length > 0) {
    console.error('\nRefusing to write: fetched data failed validation (empty verse or empty Arabic word).');
    process.exit(1);
  }
  if (!LIMIT && keys.length !== EXPECTED_AYAHS) {
    console.error('\nRefusing to write: verse count mismatch.');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local — cannot write.');
    process.exit(1);
  }
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // 1) BACK UP the current ayah_words state BEFORE any write (repo
  //    convention: backups/, gitignored). On the first run the table is
  //    empty and the backup is an empty array — that is the honest state.
  //    This read also fails cleanly here if migration 011 has not been run.
  console.log('\nBacking up existing ayah_words rows before writing…');
  let existing;
  try {
    existing = await loadAllRows(sb, 'ayah_words', '*', 'id');
  } catch (e) {
    console.error(`\nCould not read ayah_words (${e.message}).`);
    console.error('Has supabase/migrations/011_ayah_words.sql been run yet? Aborting — nothing written.');
    process.exit(1);
  }
  const backupsDir = path.resolve(__dirname, '../backups');
  fs.mkdirSync(backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupsDir, `ayah_words-backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
  console.log(`✓ Backed up ${existing.length} existing ayah_words rows to ${backupPath}`);

  // 2) Match API verse keys to DB ayah_ids by surah/ayah number.
  const ayahRows = await loadAllRows(sb, 'ayahs', 'ayah_id, surah_number, ayah_number', 'ayah_id');
  const ayahMap = {};
  ayahRows.forEach(a => { ayahMap[`${a.surah_number}:${a.ayah_number}`] = a.ayah_id; });
  const rows = [];
  const unmatched = [];
  for (const k of keys) {
    const ayahId = ayahMap[k];
    if (!ayahId) { unmatched.push(k); continue; }
    for (const w of byKey.get(k)) rows.push({ ayah_id: ayahId, ...w });
  }
  if (unmatched.length > 0) {
    console.error(`\n${unmatched.length} API verses did not match a DB ayah (e.g. ${unmatched.slice(0, 5).join(', ')}) — aborting before any write.`);
    process.exit(1);
  }
  console.log(`✓ Matched all ${keys.length} verses to DB ayahs; ${rows.length} word rows to write`);

  // 3) Replace exactly the loaded ayahs' words: delete their existing rows
  //    (backed up above), then insert fresh — re-runs are exact, with no
  //    stale positions left behind.
  const loadedAyahIds = [...new Set(rows.map(r => r.ayah_id))];
  for (let i = 0; i < loadedAyahIds.length; i += 100) {
    const idChunk = loadedAyahIds.slice(i, i + 100);
    const { error } = await sb.from('ayah_words').delete().in('ayah_id', idChunk);
    if (error) {
      console.error(`\nDelete of existing words failed: ${error.message}. Backup is at ${backupPath}`);
      process.exit(1);
    }
  }
  let done = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await sb.from('ayah_words').insert(batch);
    if (error) {
      console.error(`\nInsert batch starting at row ${i} failed: ${error.message}`);
      console.error(`Wrote ${done} rows before the failure. Backup is at ${backupPath}`);
      process.exit(1);
    }
    done += batch.length;
    process.stdout.write(`\r  ${done}/${rows.length}`);
  }
  console.log(`\n✓ Inserted ${done} word rows for ${keys.length} ayahs`);

  // 4) Verify: total count + per-verse counts for the sanity-check verses.
  const { count, error: countError } = await sb
    .from('ayah_words')
    .select('*', { count: 'exact', head: true });
  if (countError) {
    console.error('Verification count failed: ' + countError.message);
  } else {
    console.log(`✓ Verify: ayah_words now holds ${count} rows in total`);
  }
  for (const k of SAMPLE_KEYS) {
    if (!keys.includes(k)) continue;
    const [s, a] = k.split(':').map(Number);
    const ayahId = ayahMap[k];
    const { count: c } = await sb
      .from('ayah_words')
      .select('*', { count: 'exact', head: true })
      .eq('ayah_id', ayahId);
    console.log(`  ${s}:${a} (ayah_id ${ayahId}): ${c} words stored, ${byKey.get(k).length} fetched`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
