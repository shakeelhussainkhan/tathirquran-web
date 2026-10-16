// Load ayahs.transliteration from the alquran.cloud `en.transliteration` edition.
//
// CONTENT NOTE: `en.transliteration` is a phonetic TRANSCRIPTION of the Arabic
// text (how the Arabic sounds, written in Latin letters) — it is NOT a
// translation and NOT tafsir, so it carries no sectarian content and does not
// fall under the Shia-only translation/tafsir rule. No translation or tafsir
// edition is fetched by this script.
//
// Usage:
//   node scripts/load_transliteration.js --dry-run   # fetch + report only, no DB access at all
//   node scripts/load_transliteration.js             # back up ayahs to backups/, then load
//
// Write mode uses SUPABASE_SERVICE_ROLE_KEY from .env.local and writes to
// PRODUCTION (there is no staging DB) — run it deliberately, by hand.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const fs = require('fs');
const path = require('path');

const EDITION = 'en.transliteration';
const API_URL = `https://api.alquran.cloud/v1/quran/${EDITION}`;
const EXPECTED_AYAHS = 6236;
const EXPECTED_SURAHS = 114;
const DRY_RUN = process.argv.includes('--dry-run');

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
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

async function fetchTransliteration() {
  console.log(`Fetching ${API_URL} ...`);
  const data = await fetchWithRetry(API_URL);
  if (data.code !== 200 || !data.data || !Array.isArray(data.data.surahs)) {
    throw new Error('Unexpected API response: ' + JSON.stringify(data).slice(0, 200));
  }
  const surahs = data.data.surahs;
  const ayahs = surahs.flatMap(s =>
    s.ayahs.map(a => ({ surah: s.number, ayah: a.numberInSurah, text: (a.text || '').trim() }))
  );
  return { surahs, ayahs };
}

function reportFetch({ surahs, ayahs }) {
  const empty = ayahs.filter(a => !a.text);
  console.log(`✓ Fetched ${ayahs.length} ayahs across ${surahs.length} surahs from ${EDITION}`);
  if (ayahs.length !== EXPECTED_AYAHS) {
    console.log(`  ⚠ Expected ${EXPECTED_AYAHS} ayahs, got ${ayahs.length}`);
  }
  if (surahs.length !== EXPECTED_SURAHS) {
    console.log(`  ⚠ Expected ${EXPECTED_SURAHS} surahs, got ${surahs.length}`);
  }
  if (empty.length > 0) {
    console.log(`  ⚠ ${empty.length} ayahs have empty transliteration text, e.g. ` +
      empty.slice(0, 5).map(a => `${a.surah}:${a.ayah}`).join(', '));
  } else {
    console.log('  ✓ No empty transliteration strings');
  }
  const sample = (s, a) => ayahs.find(x => x.surah === s && x.ayah === a);
  console.log('Samples:');
  for (const [s, a] of [[1, 1], [1, 2], [2, 255], [36, 58], [114, 6]]) {
    const row = sample(s, a);
    console.log(`  ${s}:${a}: ${row ? row.text : '(MISSING)'}`);
  }
  return empty;
}

async function loadAllAyahs(sb, columns) {
  let rows = [];
  let from = 0;
  while (true) {
    const { data: batch, error } = await sb
      .from('ayahs')
      .select(columns)
      .order('ayah_id')
      .range(from, from + 999);
    if (error) throw new Error('Reading ayahs failed: ' + error.message);
    if (!batch || batch.length === 0) break;
    rows = rows.concat(batch);
    from += 1000;
    if (batch.length < 1000) break;
  }
  return rows;
}

async function main() {
  const { surahs, ayahs } = await fetchTransliteration();
  const empty = reportFetch({ surahs, ayahs });

  if (DRY_RUN) {
    console.log('\n--dry-run: no database access performed. Nothing was written.');
    return;
  }

  if (ayahs.length !== EXPECTED_AYAHS || empty.length > 0) {
    console.error('\nRefusing to write: fetched data failed validation (count or empty-text check).');
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

  // 1) BACK UP the full ayahs table BEFORE any write (repo convention: backups/, gitignored).
  console.log('\nBacking up ayahs table before writing...');
  const backupRows = await loadAllAyahs(sb, '*');
  if (backupRows.length === 0) {
    console.error('Backup returned 0 rows — aborting before any write.');
    process.exit(1);
  }
  const backupsDir = path.resolve(__dirname, '../backups');
  fs.mkdirSync(backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupsDir, `ayahs-backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupRows, null, 2));
  console.log(`✓ Backed up ${backupRows.length} ayahs rows to ${backupPath}`);

  // 2) Match API ayahs to DB ayah_ids by surah/ayah number.
  const ayahMap = {};
  backupRows.forEach(a => { ayahMap[`${a.surah_number}:${a.ayah_number}`] = a.ayah_id; });
  const rows = ayahs
    .map(a => ({ ayah_id: ayahMap[`${a.surah}:${a.ayah}`], transliteration: a.text }))
    .filter(r => r.ayah_id && r.transliteration);
  const unmatched = ayahs.length - rows.length;
  if (unmatched > 0) {
    console.error(`\n${unmatched} API ayahs did not match a DB row — aborting before any write.`);
    process.exit(1);
  }
  console.log(`✓ Matched ${rows.length}/${ayahs.length} ayahs to DB rows`);

  // 3) Batched writes (200/batch, repo convention). Upsert on the ayah_id PK
  //    updates only the transliteration column for existing rows.
  let done = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await sb.from('ayahs').upsert(batch, { onConflict: 'ayah_id' });
    if (error) {
      console.error(`\nBatch starting at row ${i} failed: ${error.message}`);
      console.error(`Wrote ${done} rows before the failure. Backup is at ${backupPath}`);
      process.exit(1);
    }
    done += batch.length;
    process.stdout.write(`\r  ${done}/${rows.length}`);
  }
  console.log(`\n✓ Updated transliteration for ${done} ayahs`);

  // 4) Verify: count non-null transliterations + spot-check two ayahs.
  const { count, error: countError } = await sb
    .from('ayahs')
    .select('*', { count: 'exact', head: true })
    .not('transliteration', 'is', null);
  if (countError) {
    console.error('Verification count failed: ' + countError.message);
  } else {
    console.log(`✓ Verify: ${count} ayahs now have a non-null transliteration (expected ${EXPECTED_AYAHS})`);
  }
  for (const [s, a] of [[1, 1], [2, 255]]) {
    const { data: row } = await sb
      .from('ayahs')
      .select('transliteration')
      .eq('surah_number', s)
      .eq('ayah_number', a)
      .single();
    console.log(`  ${s}:${a}: ${row?.transliteration ?? '(null)'}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
