require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function check() {
  const { count } = await sb.from('tafsir').select('*', { count: 'exact', head: true });
  console.log('Current tafsir rows:', count);

  const { data } = await sb.from('tafsir').select('scholar, language_code, source_book').order('scholar');
  if (data && data.length > 0) {
    const counts = {};
    data.forEach(t => { const k = t.scholar + ' (' + t.language_code + ')'; counts[k] = (counts[k]||0)+1; });
    console.log('By scholar:');
    Object.entries(counts).forEach(([k,v]) => console.log(' ', k, ':', v));
  } else {
    console.log('No tafsir rows yet.');
  }
}
check().catch(console.error);
