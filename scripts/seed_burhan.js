require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const AHLULBAYT_NARRATIONS = [
  {
    surah: 1, ayah: 1,
    text: "Imam Ali ibn Abi Talib (AS) said: 'Al-hamd lillah' is a word of gratitude. When a servant says it, Allah says: 'My servant has thanked Me.' And when a servant says 'Al-hamd lillahi Rabb il-alamin' with true understanding, then for that servant the reward is greater than all he has given in charity.",
    source: "Bihar al-Anwar, Vol. 82 — narrated from Imam Ali (AS)"
  },
  {
    surah: 1, ayah: 5,
    text: "Imam Muhammad al-Baqir (AS) said: Allah, Blessed and Exalted, said: 'I have divided the prayer between Myself and My servant into two halves. When the servant says Iyyaka na'budu wa iyyaka nasta'in — You alone we worship and You alone we ask for help — Allah says: This is between Me and My servant, and My servant shall have what he asked for.'",
    source: "Tafsir al-Burhan, Vol. 1 — narrated from Imam al-Baqir (AS)"
  },
  {
    surah: 1, ayah: 6,
    text: "Imam Ja'far al-Sadiq (AS) said about 'Ihdina al-sirat al-mustaqim': 'It means: Guide us to know and to follow the Imam.' And in another narration: 'The straight path is the path of the Imams — the path of knowing Allah, Exalted be He.'",
    source: "Tafsir al-Burhan, Vol. 1 — narrated from Imam al-Sadiq (AS)"
  },
  {
    surah: 2, ayah: 2,
    text: "Imam Ali al-Ridha (AS) was asked about 'no doubt in it.' He said: 'There is no doubt for us — the family of the Prophet — that it is the truth and from the truth. And those who doubt are other than us.'",
    source: "Tafsir al-Burhan, Vol. 1 — narrated from Imam al-Ridha (AS)"
  },
  {
    surah: 2, ayah: 255,
    text: "The Prophet Muhammad (SAWW) said: 'The master of the verses of the Quran is Ayat al-Kursi. Whoever recites it after every obligatory prayer — nothing stands between him and paradise except death.' And Imam Ali (AS) said: 'I heard the Prophet say: whoever recites Ayat al-Kursi after the obligatory prayers, Allah builds for him a palace in paradise and will reward him with the reward of the prophets and martyrs.'",
    source: "Tafsir al-Burhan, Vol. 1 — narrated from the Prophet (SAWW) and Imam Ali (AS)"
  },
  {
    surah: 5, ayah: 55,
    text: "The narrators reported that when the verse 'Your guardian is only Allah, His Messenger, and those who believe — those who establish prayer and give zakah while bowing' was revealed, Imam Ali (AS) was in the state of ruku' (bowing) when a beggar entered the mosque. He gestured with his hand and gave his ring to the beggar while still in prayer. The Prophet (SAWW) said: 'This verse was revealed concerning Ali.'",
    source: "Tafsir al-Burhan, Vol. 2 — narrated through multiple chains"
  },
  {
    surah: 33, ayah: 33,
    text: "Imam Ja'far al-Sadiq (AS) said about the Ayah of Purification: 'We are the Ahlul Bayt whom Allah purified with a comprehensive purification. We are the ones concerning whom this verse was revealed — myself, my father, my grandfather, and Fatima al-Zahra (AS).'",
    source: "Tafsir al-Burhan, Vol. 4 — narrated from Imam al-Sadiq (AS)"
  },
  {
    surah: 76, ayah: 8,
    text: "Imam Muhammad al-Baqir (AS) narrated that the verse 'And they give food, in spite of their love for it, to the needy, the orphan, and the captive' was revealed concerning Ali ibn Abi Talib, Fatima al-Zahra, Hasan, and Husayn (peace be upon them all) — when they fasted for three days and gave their food to those in need on each evening of their fast.",
    source: "Tafsir al-Burhan, Vol. 5 — narrated from Imam al-Baqir (AS)"
  },
  {
    surah: 97, ayah: 1,
    text: "Imam Ja'far al-Sadiq (AS) said: 'Whoever recites Surah al-Qadr in one of the obligatory prayers, a caller from the heavens calls out to him: O servant of Allah, your past sins have been forgiven — begin your deeds anew.' And he said: 'Laylat al-Qadr is Fatima, and al-Qadr is Allah — whoever knows Fatima with her true knowledge has comprehended the Night of Power.'",
    source: "Tafsir al-Burhan, Vol. 5 — narrated from Imam al-Sadiq (AS)"
  },
  {
    surah: 108, ayah: 1,
    text: "Imam Ja'far al-Sadiq (AS) said: 'Al-Kawthar is the river in paradise that Allah gave to His Prophet (SAWW). And it is also the intercession. And it is also the progeny of the Prophet — for those who hate us hate the Prophet, and those who hate the Prophet have indeed hated Allah Himself.'",
    source: "Tafsir al-Burhan, Vol. 5 — narrated from Imam al-Sadiq (AS)"
  },
  {
    surah: 112, ayah: 1,
    text: "The Prophet Muhammad (SAWW) said: 'Whoever recites Qul Huwa Allahu Ahad ten times, Allah builds for him a palace in paradise.' And Imam Ali (AS) said: 'Whoever loves that his heart becomes the abode of certainty about Allah, let him recite this Surah — for it contains the description of the Lord of the Worlds.'",
    source: "Tafsir al-Burhan, Vol. 5 — narrated from the Prophet (SAWW) and Imam Ali (AS)"
  },
];

async function getAyahId(surah, ayah) {
  const { data } = await sb.from('ayahs')
    .select('ayah_id')
    .eq('surah_number', surah)
    .eq('ayah_number', ayah)
    .single();
  return data?.ayah_id;
}

async function seedBurhan() {
  console.log('\n═══ Loading Tafsir al-Burhan — Ahlul Bayt (AS) narrations ═══\n');

  let inserted = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of AHLULBAYT_NARRATIONS) {
    const ayahId = await getAyahId(entry.surah, entry.ayah);
    if (!ayahId) {
      console.log(`  ✗ Ayah not found in DB: ${entry.surah}:${entry.ayah}`);
      missing++;
      continue;
    }

    const { data: existing } = await sb.from('tafsir')
      .select('id')
      .eq('ayah_id', ayahId)
      .eq('scholar', 'Ahlul Bayt (AS)')
      .eq('language_code', 'en')
      .maybeSingle();

    if (existing) {
      console.log(`  → ${entry.surah}:${entry.ayah} already exists`);
      skipped++;
      continue;
    }

    const { error } = await sb.from('tafsir').insert({
      ayah_id: ayahId,
      scholar: 'Ahlul Bayt (AS)',
      language_code: 'en',
      text: entry.text,
      source_book: entry.source,
      volume: null
    });

    if (error) {
      console.log(`  ✗ ${entry.surah}:${entry.ayah} — ${error.message}`);
    } else {
      console.log(`  ✓ ${entry.surah}:${entry.ayah} — inserted`);
      inserted++;
    }
  }

  console.log(`\nTafsir al-Burhan: ${inserted} inserted, ${skipped} already existed, ${missing} ayahs not in DB`);
  return inserted;
}

seedBurhan().catch(console.error);
