require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const OCCASION_AYAHS = [
  { occasion: 'Ashura — Day of Imam Husayn (AS)', surah: 2, ayah: 155 },
  { occasion: 'Arbaeen', surah: 2, ayah: 156 },
  { occasion: 'Wiladat Imam Ali (AS)', surah: 5, ayah: 55 },
  { occasion: 'Laylat al-Qadr', surah: 97, ayah: 1 },
  { occasion: 'Eid al-Fitr', surah: 2, ayah: 185 },
  { occasion: 'Eid al-Adha', surah: 22, ayah: 37 },
  { occasion: 'Eid al-Ghadeer', surah: 5, ayah: 3 },
  { occasion: 'Mabath — First Revelation', surah: 96, ayah: 1 },
  { occasion: 'Wiladat Imam Mahdi (AS)', surah: 21, ayah: 105 },
  { occasion: 'Wiladat Prophet Muhammad (SAWW)', surah: 21, ayah: 107 },
];

async function fix() {
  for (const entry of OCCASION_AYAHS) {
    const { data: ayah } = await sb.from('ayahs')
      .select('ayah_id')
      .eq('surah_number', entry.surah)
      .eq('ayah_number', entry.ayah)
      .single();

    if (!ayah) { console.log(`  ✗ Not found: ${entry.surah}:${entry.ayah}`); continue; }

    const { error } = await sb.from('islamic_calendar_tags')
      .update({ ayah_id: ayah.ayah_id })
      .eq('occasion', entry.occasion);

    if (error) console.log(`  ✗ ${entry.occasion}: ${error.message}`);
    else console.log(`  ✓ ${entry.occasion} → ${entry.surah}:${entry.ayah}`);
  }
  console.log('✓ Calendar tags updated');
}

fix().catch(console.error);
