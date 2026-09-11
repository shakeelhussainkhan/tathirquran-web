require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function seedUrdu() {
  const candidates = ['ur.najafi', 'ur.jawadi', 'ur.jalandhry', 'ur.ahmedali'];
  let loaded = false;

  for (const identifier of candidates) {
    try {
      console.log(`Trying: ${identifier}`);
      const res = await fetch(`https://api.alquran.cloud/v1/quran/${identifier}`);
      const data = await res.json();
      if (data.code !== 200) { console.log(`  HTTP code: ${data.code}`); continue; }

      const ayahs = data.data.surahs.flatMap(s => s.ayahs.map(a => ({ ...a, surahNum: s.number })));
      console.log(`✓ Found ${ayahs.length} ayahs for ${identifier}`);

      let { data: trans } = await supabase
        .from('translations')
        .select('translation_id')
        .eq('language_code', 'ur')
        .eq('is_placeholder', true)
        .single();

      if (!trans) {
        const { data: newTrans, error } = await supabase
          .from('translations')
          .insert({
            language_code: 'ur',
            scholar_name: identifier === 'ur.najafi' ? 'Muhammad Hussain Najafi' : identifier === 'ur.jawadi' ? 'Syed Zeeshan Haider Jawadi' : 'Placeholder Urdu',
            school: 'Shia Ithna Ashari',
            is_verified_shia: true,
            is_default: false,
            is_placeholder: true,
            placeholder_note: `Loaded from alquran.cloud/${identifier}. Pending explicit permission confirmation from scholar/publisher.`,
            license_type: 'open',
            attribution_text: 'اردو ترجمہ',
            completeness_pct: 0
          })
          .select('translation_id')
          .single();
        if (error) throw error;
        trans = newTrans;
        console.log('✓ Created placeholder Urdu translation record, id:', trans.translation_id);
      }

      const translationId = trans.translation_id;

      // Fetch all ayahs with pagination (Supabase default limit is 1000)
      let allDbAyahs = [];
      let from = 0;
      while (true) {
        const { data: batch } = await supabase
          .from('ayahs')
          .select('ayah_id, surah_number, ayah_number')
          .range(from, from + 999);
        if (!batch || batch.length === 0) break;
        allDbAyahs = allDbAyahs.concat(batch);
        if (batch.length < 1000) break;
        from += 1000;
      }
      console.log(`DB has ${allDbAyahs.length} ayahs`);

      const ayahMap = {};
      allDbAyahs.forEach(a => { ayahMap[`${a.surah_number}:${a.ayah_number}`] = a.ayah_id; });

      const rows = ayahs.map(a => ({
        ayah_id: ayahMap[`${a.surahNum}:${a.numberInSurah}`],
        translation_id: translationId,
        text: a.text
      })).filter(r => r.ayah_id);

      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from('ayah_translations').upsert(rows.slice(i, i + 500));
        if (error) throw error;
        process.stdout.write('.');
      }
      console.log(`\n✓ ${rows.length} Urdu placeholder translations inserted`);

      await supabase.from('translations').update({ completeness_pct: 100 }).eq('translation_id', translationId);
      loaded = true;
      break;
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
  }

  if (!loaded) console.log('No Urdu translation available from alquran.cloud — manual loading required');
}

seedUrdu().catch(console.error);
