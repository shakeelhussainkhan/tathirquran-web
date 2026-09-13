require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function fixUrdu(text) {
  if (!text) return text;
  const parts = text.split('۔');
  return parts.map(p => p.trim().split(/\s+/).reverse().join(' ')).join('۔').trim();
}

async function fix() {
  const { data: trans } = await sb.from('translations').select('translation_id').eq('scholar_name', 'Syed Abu Muhammad Naqvi').single();
  const tid = trans.translation_id;
  console.log('Translation ID:', tid);

  // Sample check before fixing
  const { data: sample } = await sb.from('ayah_translations').select('id, text').eq('translation_id', tid).limit(3);
  console.log('Sample before fix:');
  sample.forEach(r => console.log('  ', r.text?.substring(0, 80)));

  let page = 0;
  let total = 0;
  while (true) {
    const { data } = await sb.from('ayah_translations')
      .select('id, text')
      .eq('translation_id', tid)
      .range(page * 500, page * 500 + 499);

    if (!data || data.length === 0) break;

    for (let i = 0; i < data.length; i++) {
      const u = data[i];
      const fixed = fixUrdu(u.text);
      if (fixed !== u.text) {
        await sb.from('ayah_translations').update({ text: fixed }).eq('id', u.id);
      }
    }

    total += data.length;
    process.stdout.write(`\r  Fixed: ${total}`);
    page++;
    if (data.length < 500) break;
  }
  console.log(`\n✓ Processed ${total} Urdu translations`);

  // Sample check after fixing
  const { data: after } = await sb.from('ayah_translations').select('id, text').eq('translation_id', tid).limit(3);
  console.log('Sample after fix:');
  after.forEach(r => console.log('  ', r.text?.substring(0, 80)));
}

fix().catch(console.error);
