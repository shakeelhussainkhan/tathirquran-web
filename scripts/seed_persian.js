require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function seedPersian() {
  console.log('Fetching Persian translation from alquran.cloud...');

  const res = await fetch('https://api.alquran.cloud/v1/quran/fa.ghomshei');
  const data = await res.json();

  if (data.code !== 200) throw new Error('API failed: ' + JSON.stringify(data));

  const ayahs = data.data.surahs.flatMap(s =>
    s.ayahs.map(a => ({ ...a, surahNum: s.number }))
  );
  console.log(`✓ Fetched ${ayahs.length} ayahs`);

  // Get or create translation record
  let { data: trans } = await supabase
    .from('translations')
    .select('translation_id')
    .eq('language_code', 'fa')
    .eq('scholar_name', 'Mahdi Ilahi Ghomshei')
    .single();

  if (!trans) {
    const { data: newTrans, error: insertErr } = await supabase
      .from('translations')
      .insert({
        language_code: 'fa',
        scholar_name: 'Mahdi Ilahi Ghomshei',
        institution: 'Iranian Scholars',
        is_verified_shia: true,
        is_default: true,
        license_type: 'public_domain',
        attribution_text: 'ترجمه مهدی الهی قمشه‌ای',
        completeness_pct: 0
      })
      .select('translation_id')
      .single();
    if (insertErr) throw insertErr;
    trans = newTrans;
    console.log('✓ Created Persian translation record, id:', trans.translation_id);
  } else {
    console.log('✓ Persian translation record exists, id:', trans.translation_id);
  }

  const translationId = trans.translation_id;

  // Get all ayah IDs from database (paginate to handle >1000 rows)
  let dbAyahs = [];
  let page = 0;
  const PAGE = 1000;
  while (true) {
    const { data: chunk, error: ayahErr } = await supabase
      .from('ayahs')
      .select('ayah_id, surah_number, ayah_number')
      .order('ayah_id')
      .range(page * PAGE, (page + 1) * PAGE - 1);
    if (ayahErr) throw ayahErr;
    if (!chunk || chunk.length === 0) break;
    dbAyahs = dbAyahs.concat(chunk);
    if (chunk.length < PAGE) break;
    page++;
  }
  console.log(`✓ Loaded ${dbAyahs.length} ayahs from DB`);

  const ayahMap = {};
  dbAyahs.forEach(a => { ayahMap[`${a.surah_number}:${a.ayah_number}`] = a.ayah_id; });

  // Build insert rows
  const rows = ayahs.map(a => ({
    ayah_id: ayahMap[`${a.surahNum}:${a.numberInSurah}`],
    translation_id: translationId,
    text: a.text
  })).filter(r => r.ayah_id);

  console.log(`Inserting ${rows.length} Persian translations...`);

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.from('ayah_translations').upsert(batch, { onConflict: 'ayah_id,translation_id' });
      if (!error) { lastErr = null; break; }
      lastErr = error;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
    if (lastErr) throw lastErr;
    const batchNum = Math.floor(i / BATCH) + 1;
    if (batchNum % 10 === 0 || i + BATCH >= rows.length) {
      console.log(`  ✓ ${i + batch.length}/${rows.length} done`);
    }
  }

  // Update completeness
  await supabase
    .from('translations')
    .update({ completeness_pct: 100 })
    .eq('translation_id', translationId);

  console.log('✓ Persian translation complete!');
}

seedPersian().catch(err => { console.error('Error:', err); process.exit(1); });
