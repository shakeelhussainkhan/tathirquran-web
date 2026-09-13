require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function reload() {
  const candidates = ['ur.jawadi', 'ur.jalandhry', 'ur.ahmedali', 'ur.maududi'];
  let chosenId = null;

  for (const id of candidates) {
    console.log(`Trying ${id}...`);
    try {
      const test = await fetchWithRetry(`https://api.alquran.cloud/v1/surah/1/${id}`);
      if (test.code === 200 && test.data.ayahs.length > 0) {
        const sample = test.data.ayahs[0].text;
        console.log(`  ✓ Sample: ${sample.slice(0, 60)}`);
        chosenId = id;
        break;
      }
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
    }
  }

  if (!chosenId) {
    console.error('No working Urdu translation found on alquran.cloud');
    process.exit(1);
  }

  console.log(`\nUsing: ${chosenId}`);
  console.log('Fetching full Quran...');

  const data = await fetchWithRetry(`https://api.alquran.cloud/v1/quran/${chosenId}`);
  if (data.code !== 200) throw new Error('API failed: ' + JSON.stringify(data));

  const allAyahs = data.data.surahs.flatMap(s =>
    s.ayahs.map(a => ({ surah: s.number, ayah: a.numberInSurah, text: a.text }))
  );
  console.log(`✓ Fetched ${allAyahs.length} ayahs`);

  const { data: trans } = await sb.from('translations')
    .select('translation_id')
    .eq('scholar_name', 'Syed Abu Muhammad Naqvi')
    .single();

  if (!trans) {
    console.error('Naqvi translation record not found');
    process.exit(1);
  }

  const translationId = trans.translation_id;
  console.log('Translation ID:', translationId);

  let dbAyahs = [];
  let from = 0;
  while (true) {
    const { data: batch } = await sb.from('ayahs')
      .select('ayah_id, surah_number, ayah_number')
      .range(from, from + 999);
    if (!batch || batch.length === 0) break;
    dbAyahs = dbAyahs.concat(batch);
    from += 1000;
    if (batch.length < 1000) break;
  }
  console.log(`DB ayahs loaded: ${dbAyahs.length}`);

  const ayahMap = {};
  dbAyahs.forEach(a => { ayahMap[`${a.surah_number}:${a.ayah_number}`] = a.ayah_id; });

  const rows = allAyahs
    .map(a => ({
      ayah_id: ayahMap[`${a.surah}:${a.ayah}`],
      translation_id: translationId,
      text: a.text.trim()
    }))
    .filter(r => r.ayah_id && r.text && r.text.length > 2);

  console.log(`Matched ${rows.length} ayahs`);

  let done = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await sb.from('ayah_translations')
      .upsert(rows.slice(i, i + 200), { onConflict: 'ayah_id,translation_id' });
    if (error) console.error('Batch error:', error.message);
    else done += Math.min(200, rows.length - i);
    process.stdout.write(`\r  ${done}/${rows.length}`);
  }

  const pct = Math.round(done / 6236 * 100);
  await sb.from('translations').update({
    completeness_pct: pct,
    is_default: true,
    placeholder_note: `Text sourced from alquran.cloud/${chosenId} — Naqvi PDF text was corrupted in extraction`,
  }).eq('translation_id', translationId);

  await sb.from('languages').update({ launch_status: 'live' }).eq('language_code', 'ur');

  console.log(`\n✓ ${done} Urdu ayahs loaded (${pct}%)`);

  console.log('\nVerify Al-Fatiha:');
  for (let an = 1; an <= 7; an++) {
    const aid = ayahMap[`1:${an}`];
    const { data: t } = await sb.from('ayah_translations')
      .select('text')
      .eq('ayah_id', aid)
      .eq('translation_id', translationId)
      .single();
    console.log(`  1:${an}: ${t?.text?.slice(0, 70)}`);
  }
}

reload().catch(console.error);
