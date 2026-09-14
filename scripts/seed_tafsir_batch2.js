require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const NEW_TAFSIR = [
  {
    surah: 2, ayah: 183, scholar: "Allamah Tabataba'i", lang: 'en',
    source: "Al-Mizan fi Tafsir al-Quran, Vol. 2",
    text: "Allamah Tabataba'i writes: 'O you who believe, fasting has been prescribed for you as it was prescribed for those before you, so that you may become God-conscious.' The connection between fasting and taqwa (God-consciousness) is profound. Fasting is not merely abstention from food and drink — it is the training of the whole self to submit to Allah's command even when no one is watching. The Imams of the Ahlul Bayt (AS) have explained that the fast of the body from food is the lesser fast; the greater fast is the fast of the tongue from falsehood, the fast of the eyes from what is forbidden, and the fast of the heart from attachment to other than Allah.",
  },
  {
    surah: 2, ayah: 256, scholar: "Allamah Tabataba'i", lang: 'en',
    source: "Al-Mizan fi Tafsir al-Quran, Vol. 2",
    text: "Allamah Tabataba'i explains: 'There is no compulsion in religion — the right way has become distinct from the wrong way.' This verse establishes one of Islam's foundational principles: faith cannot be coerced. The Imam notes that this is not merely a legal ruling but a statement of reality — true belief is an internal state that external force cannot produce. 'Whoever disbelieves in false deities and believes in Allah has grasped the most trustworthy handhold that never breaks.' The 'trustworthy handhold' (al-urwah al-wuthqa) is interpreted by Imam Sadiq (AS) as referring to the Wilayah of Imam Ali (AS) — the unbreakable connection between the believer and Allah's appointed guide.",
  },
  {
    surah: 18, ayah: 10, scholar: "Allamah Tabataba'i", lang: 'en',
    source: "Al-Mizan fi Tafsir al-Quran, Vol. 13",
    text: "Allamah Tabataba'i writes on the People of the Cave: 'When the youths took refuge in the cave and said: Our Lord, grant us mercy from Yourself and prepare for us from our affair right guidance.' These young men fled from a tyrannical society that demanded they worship idols. Their prayer combines two requests — mercy (rahmah) and right guidance (rashad). The Imam notes that they did not ask for wealth, safety, or victory — only for mercy and guidance. This is the prayer of those who have understood that everything else follows from these two gifts. The story of the People of the Cave is a type for all believers who must sometimes withdraw from corrupt societies to preserve their faith.",
  },
  {
    surah: 19, ayah: 2, scholar: "Allamah Tabataba'i", lang: 'en',
    source: "Al-Mizan fi Tafsir al-Quran, Vol. 14",
    text: "Allamah Tabataba'i explains: 'A mention of the mercy of your Lord to His servant Zakariyya — when he called to his Lord in private supplication.' The word 'private' (khafiyyan — in a low voice, secretly) is significant. The Imam notes that Zakariyya called to Allah secretly for two reasons: humility before the greatness of Allah, and sincerity — a prayer made quietly contains no desire for the praise of others. His prayer was answered with Yahya (John the Baptist). The pattern of the Prophets is consistent: the most profound prayers are private, humble, and stripped of self-display.",
  },
  {
    surah: 20, ayah: 14, scholar: "Allamah Tabataba'i", lang: 'en',
    source: "Al-Mizan fi Tafsir al-Quran, Vol. 14",
    text: "Allamah Tabataba'i writes on the divine self-revelation to Musa (AS): 'Indeed, I am Allah — there is no deity except Me, so worship Me and establish prayer for My remembrance.' This is one of the most direct divine self-revelations in the Quran. Allah speaks directly to Musa from the burning bush: 'Ana Allah' — I am Allah. The command that follows — worship Me and establish prayer for My remembrance — establishes that the purpose of prayer is dhikr (remembrance). Prayer is not primarily ritual but the maintenance of consciousness of Allah throughout the day. The Imams (AS) have emphasized that a prayer prayed without presence of heart (hudur al-qalb) is like a body without a soul.",
  },
  {
    surah: 2, ayah: 183, scholar: 'Ahlul Bayt (AS)', lang: 'en',
    source: "Bihar al-Anwar — narrated from Imam Ali al-Ridha (AS)",
    text: "Imam Ali al-Ridha (AS) said: 'Fasting was made obligatory so that the rich may experience hunger and thereby be moved to give to the poor. For the rich person who is always full does not know the pain of hunger. Through fasting, the rich person tastes what the poor person experiences, so that they show compassion to the weak and give food to the hungry.' And Imam Sadiq (AS) said: 'When you fast, let your hearing fast, your sight fast, your hair fast, your skin fast — and name the days of your fast. Do not make the day you fast the same as the day you do not fast.'",
  },
  {
    surah: 18, ayah: 10, scholar: 'Ahlul Bayt (AS)', lang: 'en',
    source: "Tafsir al-Burhan — narrated from Imam al-Baqir (AS)",
    text: "Imam Muhammad al-Baqir (AS) said: 'The People of the Cave were young men who believed in their Lord. They left their homes, their families, and their wealth for the sake of Allah — they fled with their religion to protect it from being corrupted. Allah is pleased with anyone who, when faced with a situation where their religion is in danger, does what the People of the Cave did.' He also said: 'On Fridays recite Surah Al-Kahf — it protects from the fitna (tribulation) of the Dajjal.'",
  },
];

async function seed() {
  let inserted = 0;
  let skipped = 0;

  for (const entry of NEW_TAFSIR) {
    const { data: ayahRow } = await sb
      .from('ayahs')
      .select('ayah_id')
      .eq('surah_number', entry.surah)
      .eq('ayah_number', entry.ayah)
      .single();

    if (!ayahRow) {
      console.error(`  ✗ Ayah not found: ${entry.surah}:${entry.ayah}`);
      skipped++;
      continue;
    }

    const { data: existing } = await sb
      .from('tafsir')
      .select('id')
      .eq('ayah_id', ayahRow.ayah_id)
      .eq('scholar', entry.scholar)
      .eq('language_code', entry.lang)
      .maybeSingle();

    if (existing) {
      console.log(`  ↷ SKIP  ${entry.surah}:${entry.ayah} — ${entry.scholar} (already exists)`);
      skipped++;
      continue;
    }

    const { error } = await sb.from('tafsir').insert({
      ayah_id: ayahRow.ayah_id,
      language_code: entry.lang,
      scholar: entry.scholar,
      source_book: entry.source,
      text: entry.text,
    });

    if (error) {
      console.error(`  ✗ FAIL  ${entry.surah}:${entry.ayah} — ${entry.scholar} —`, error.message);
      skipped++;
    } else {
      console.log(`  ✓ INSERT ${entry.surah}:${entry.ayah} — ${entry.scholar}`);
      inserted++;
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped/failed: ${skipped}`);

  const { count } = await sb.from('tafsir').select('*', { count: 'exact', head: true });
  console.log(`Total tafsir entries in DB: ${count}`);
}

seed().catch(console.error);
