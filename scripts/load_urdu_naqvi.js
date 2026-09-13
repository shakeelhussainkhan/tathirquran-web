require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function load() {
  // Get or create Naqvi translation record
  let { data: trans } = await sb.from('translations').select('translation_id').eq('language_code','ur').eq('scholar_name','Syed Abu Muhammad Naqvi').maybeSingle();

  if (!trans) {
    const { data: newTrans } = await sb.from('translations').insert({
      language_code: 'ur', scholar_name: 'Syed Abu Muhammad Naqvi',
      institution: 'Jafri Library', school: 'Shia Ithna Ashari',
      is_verified_shia: true, is_default: true, is_placeholder: false,
      license_type: 'licensed',
      attribution_text: 'ترجمہ: سید ابو محمد نقوی — بشکریہ جعفری لائبریری',
      completeness_pct: 0
    }).select('translation_id').single();
    trans = newTrans;
  }

  const translationId = trans.translation_id;
  const ayahs = JSON.parse(fs.readFileSync(require('os').homedir() + '/Downloads/urdu_naqvi_extracted.json', 'utf8'));

  const ayahMap = {};
  let offset = 0;
  while (true) {
    const { data: batch } = await sb.from('ayahs').select('ayah_id, surah_number, ayah_number').range(offset, offset + 999);
    if (!batch || batch.length === 0) break;
    batch.forEach(a => { ayahMap[`${a.surah_number}:${a.ayah_number}`] = a.ayah_id; });
    if (batch.length < 1000) break;
    offset += 1000;
  }

  const rows = ayahs.map(a => ({ ayah_id: ayahMap[`${a.surah}:${a.ayah}`], translation_id: translationId, text: a.urdu.trim() })).filter(r => r.ayah_id && r.text && r.text.length > 3);

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await sb.from('ayah_translations').upsert(rows.slice(i, i+200), { onConflict: 'ayah_id,translation_id' });
    if (!error) inserted += Math.min(200, rows.length-i);
    process.stdout.write(`\r  ${inserted}/${rows.length}`);
  }

  const pct = Math.round(inserted/6236*100);
  await sb.from('translations').update({ completeness_pct: pct, is_default: true }).eq('translation_id', translationId);
  await sb.from('translations').update({ is_default: false }).eq('language_code','ur').neq('translation_id', translationId);
  await sb.from('languages').update({ launch_status: 'live' }).eq('language_code','ur');
  await sb.from('permission_requests').upsert({ scholar_name: 'Syed Abu Muhammad Naqvi', institution: 'Jafri Library', language_code: 'ur', translation_id: translationId, sent_date: '2026-09-08', status: 'approved', notes: 'Permission granted by Faiyaz Hasan Sep 12 2026', contact_email: 'admin@jafrilibrary.org' }, { onConflict: 'scholar_name' });

  console.log(`\n✓ ${inserted} Urdu ayahs loaded (${pct}%)`);
  console.log('✓ Urdu language status: live');
  console.log('✓ Naqvi set as default Urdu translation');
}

load().catch(console.error);
