require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Remove translations with no content: placeholder (ID 12) and zero-completeness (IDs 5, 6, 7)
const BAD_IDS = [5, 6, 7, 12];

async function fix() {
  for (const id of BAD_IDS) {
    const { error: e1 } = await sb.from('ayah_translations').delete().eq('translation_id', id);
    if (e1) console.warn(`  ayah_translations delete failed for ${id}:`, e1.message);

    const { error: e2 } = await sb.from('translations').delete().eq('translation_id', id);
    if (e2) console.warn(`  translations delete failed for ${id}:`, e2.message);
    else console.log(`✓ Deleted translation ${id}`);
  }

  const { data } = await sb.from('translations').select('translation_id, language_code, scholar_name, completeness_pct').eq('language_code', 'ur');
  console.log('\nRemaining Urdu translations:');
  data?.forEach(t => console.log(`  [${t.translation_id}] ${t.scholar_name} (${t.completeness_pct}%)`));
}

fix().catch(console.error);
