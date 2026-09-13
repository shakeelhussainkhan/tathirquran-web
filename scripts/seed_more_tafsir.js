require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const NEW_TAFSIR = [
  { surah: 2, ayah: 30, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1',
    text: "Allamah Tabataba'i writes: 'When your Lord said to the angels: I am going to place a vicegerent on earth.' This verse announces the creation of humanity and its divine appointment as khalifah — vicegerent of Allah on earth. The angels' question 'will you place therein one who will make mischief and shed blood?' is not objection but inquiry — they sought to understand the divine wisdom. Allah's answer is profound: 'I know what you do not know.' The secret of human vicegerency lies in the capacity for knowledge — specifically the knowledge of 'all the names' which Allah then taught Adam. The Imams of the Ahlul Bayt (AS) have explained that these names include the names of the Prophet and his family — the highest forms of creation who carry the full trust of divine vicegerency." },

  { surah: 2, ayah: 177, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1',
    text: "Allamah Tabataba'i explains: This verse defines true righteousness (birr) comprehensively — it is not merely ritual observance of prayer direction but encompasses belief, charity, prayer, zakat, fulfilling promises, and patience in adversity. The verse ends with 'such are the truthful ones, such are the God-conscious.' Allamah notes that true piety is a state of the heart that expresses itself in every dimension of life — relationship with Allah, relationship with people, and relationship with one's own soul under trial." },

  { surah: 2, ayah: 286, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1',
    text: "Allamah Tabataba'i writes: The last verse of Al-Baqarah contains one of the most beloved supplications in the Quran: 'Our Lord, do not burden us with what we cannot bear.' This verse establishes the principle that Allah does not burden any soul beyond its capacity — a mercy that runs through all divine legislation. The supplication has three parts: asking forgiveness for forgetting and making mistakes, asking not to be burdened as earlier nations were burdened, and asking for pardon, forgiveness, and mercy. Imam Ali (AS) recited this verse frequently in his prayers, and it is reported that whoever recites it at night, Allah grants what is asked." },

  { surah: 3, ayah: 33, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 3',
    text: "Allamah Tabataba'i explains: 'Allah chose Adam, Noah, the family of Ibrahim, and the family of Imran above all the worlds.' This verse establishes the principle of divine selection — that Allah chooses specific families and lineages to carry the prophetic trust. The family of Ibrahim includes the Prophet Muhammad (SAWW) and through him the Ahlul Bayt (AS). The connection between divine selection (istifa) in this verse and the appointment of the Imams is a central theme in Shia theology — those who were chosen are not merely historical figures but an ongoing institution of divine guidance." },

  { surah: 3, ayah: 61, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 3',
    text: "Allamah Tabataba'i writes on the verse of Mubahala: 'Whoever argues with you about him after the knowledge that has come to you, say: Come, let us call our sons and your sons, our women and your women, ourselves and yourselves, then supplicate and invoke the curse of Allah upon the liars.' This verse was revealed when the Prophet (SAWW) invited the Christians of Najran to the Mubahala. He brought with him Hasan and Husayn (AS) as 'our sons', Fatima al-Zahra (AS) as 'our women', and Ali ibn Abi Talib (AS) as 'ourselves' — making Ali (AS) himself in the verse of Allah. The Christians, seeing this holy gathering, refused to proceed with the curse, recognizing the spiritual station of this family." },

  { surah: 4, ayah: 59, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 4',
    text: "Allamah Tabataba'i writes on 'Obey Allah, obey the Messenger, and those in authority among you': This verse establishes the three-tier structure of religious authority — Allah, the Prophet (SAWW), and 'those in authority' (Ulul Amr). The Shia position, supported by authentic hadith, is that Ulul Amr refers specifically to the Infallible Imams from the Ahlul Bayt (AS). The command to obey them is unconditional — the same grammatical construction as obeying Allah and the Prophet — indicating their infallibility, because obedience to someone capable of error cannot be unconditional. This verse is one of the primary Quranic proofs for the Imamate." },

  { surah: 36, ayah: 1, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 17',
    text: "Allamah Tabataba'i writes: Ya-Sin is among the disconnected letters (huruf muqatta'at) whose precise meaning is known only to Allah and those He has taught. The Prophet (SAWW) called Ya-Sin 'the heart of the Quran' — and it is recited for the dying, the dead, and in times of great need. Some narrations from the Ahlul Bayt (AS) indicate that 'Ya-Sin' is one of the names of the Prophet Muhammad (SAWW) himself. The surah that follows is a comprehensive statement of prophethood, resurrection, divine power over creation, and the ultimate accountability of humanity." },

  { surah: 55, ayah: 1, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 19',
    text: "Allamah Tabataba'i explains: Surah Al-Rahman opens with the divine name Al-Rahman — the All-Merciful — as both its title and its opening word. This is unique in the Quran. The entire surah is a litany of divine blessings, each followed by the refrain 'So which of the favors of your Lord do you deny?' The repetition of this question 31 times creates a rhythm of gratitude and accountability. Al-Rahman taught the Quran before He created humanity — indicating that the Quran precedes and grounds all of creation. Imam Sadiq (AS) said: Al-Rahman is a special name for a general attribute (mercy for all creation), while Al-Rahim is a general name for a special attribute (mercy specifically for believers)." },

  { surah: 56, ayah: 77, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 19',
    text: "Allamah Tabataba'i writes: 'Indeed, it is a noble Quran, in a Book well-guarded, which none can touch except the purified.' This verse establishes two profound truths. First, the Quran has a reality beyond the written text — a celestial, protected reality described as 'the well-guarded Book' (Kitab Maknun). Second, this inner reality of the Quran can only be touched — understood in its deepest sense — by 'the purified ones' (al-mutahharun). The Shia scholars have consistently interpreted this in conjunction with the Ayah of Purification (33:33) — the purified ones who have genuine access to the inner meanings of the Quran are the Ahlul Bayt (AS)." },

  { surah: 67, ayah: 1, scholar: "Allamah Tabataba'i", lang: 'en', source: 'Al-Mizan fi Tafsir al-Quran, Vol. 19',
    text: "Allamah Tabataba'i explains: 'Blessed is He in whose hand is the dominion, and He is over all things competent.' Al-Mulk (sovereignty) belongs exclusively to Allah — not as one attribute among others but as the defining reality of His lordship. The surah opens by declaring that death and life were created as a test — to see which of you is best in deed. Note that death is mentioned before life, indicating that the state before life and the state after death frame our brief existence as a test. The Prophet (SAWW) called Al-Mulk 'the surah that saves from the punishment of the grave' and encouraged its nightly recitation." },

  { surah: 3, ayah: 61, scholar: 'Ahlul Bayt (AS)', lang: 'en', source: 'Tafsir al-Burhan, Vol. 1 — Mubahala narration',
    text: "It is narrated through multiple chains that when the verse of Mubahala was revealed, the Prophet (SAWW) took Hasan ibn Ali, Husayn ibn Ali, Fatima bint Muhammad, and Ali ibn Abi Talib (peace be upon them all) and said: 'O Allah, these are my family (Ahl).' Imam Sadiq (AS) said: 'By Allah, \"ourselves\" in this verse refers to Ali ibn Abi Talib (AS) — no one has ever received a greater honour from Allah than this, that He made a human being \"Allah's self\" in His own Book.'" },

  { surah: 4, ayah: 59, scholar: 'Ahlul Bayt (AS)', lang: 'en', source: "Tafsir al-Burhan, Vol. 1 — narrated from Imam al-Baqir (AS)",
    text: "Imam Muhammad al-Baqir (AS) was asked about 'those in authority among you' in this verse. He said: 'They are Ali ibn Abi Talib, then Hasan, then Husayn, then Ali ibn Husayn, then Muhammad ibn Ali — and so on until the last of us. Obedience to us is like obedience to Allah and His Messenger, because we do not command except what Allah commands, and we do not forbid except what Allah forbids.' He then said: 'If you knew what blessings this verse contains for the Shia, your hearts would rejoice.'" },

  { surah: 56, ayah: 77, scholar: 'Ahlul Bayt (AS)', lang: 'en', source: "Tafsir al-Burhan, Vol. 5 — narrated from Imam al-Sadiq (AS)",
    text: "Imam Ja'far al-Sadiq (AS) was asked about 'none touches it except the purified ones.' He said: 'The purified ones are the Imams from the family of Muhammad (SAWW). No one touches the inner meaning of the Quran except them — they are the ones who know what was revealed and why it was revealed, and they carry the complete interpretation of the Book of Allah.' He also said: 'The Quran was revealed in our homes, and we know its interpretation better than anyone.'" },

  { surah: 67, ayah: 1, scholar: 'Ahlul Bayt (AS)', lang: 'en', source: 'Bihar al-Anwar — narrated from Imam al-Sadiq (AS)',
    text: "Imam Ja'far al-Sadiq (AS) said: 'Surah Al-Mulk is the protector. It protects from the punishment of the grave.' He also said: 'Whoever recites Surah Al-Mulk every night, Allah will protect him from the punishment of the grave. This surah is in the Torah as well. Whoever recites it is among the righteous, and it will argue on his behalf before Allah on the Day of Resurrection.'" },

  { surah: 36, ayah: 1, scholar: 'Ahlul Bayt (AS)', lang: 'en', source: 'Bihar al-Anwar — narrated from the Prophet (SAWW)',
    text: "The Prophet Muhammad (SAWW) said: 'Everything has a heart, and the heart of the Quran is Ya-Sin. Whoever recites Ya-Sin, Allah writes for him the reward of reciting the Quran ten times.' And Imam Ali al-Ridha (AS) said: 'Recite Ya-Sin for your dead — it eases their condition and brings comfort to the dying.' The scholars of Ahlul Bayt have particularly recommended Ya-Sin at the time of death and for the souls of the departed." },

  { surah: 55, ayah: 1, scholar: 'Ahlul Bayt (AS)', lang: 'en', source: 'Tafsir al-Burhan — narrated from Imam al-Sadiq (AS)',
    text: "Imam Ja'far al-Sadiq (AS) said: 'Do not neglect Surah Al-Rahman — recite it and establish it in your prayers. It was revealed to complain about the hypocrites to Allah. Allah sent it down in complaint, and it will come on the Day of Resurrection in the form of a human being of the most beautiful appearance. It will stand before Allah and say: O Lord, so-and-so recited me and honored me, and so-and-so abandoned me. It will intercede for whoever recited it.'" },
];

async function insertTafsir() {
  let inserted = 0;
  let skipped = 0;

  for (const entry of NEW_TAFSIR) {
    const { data: ayah } = await sb.from('ayahs')
      .select('ayah_id')
      .eq('surah_number', entry.surah)
      .eq('ayah_number', entry.ayah)
      .single();

    if (!ayah) { console.log(`  ✗ Ayah not found: ${entry.surah}:${entry.ayah}`); continue; }

    const { data: existing } = await sb.from('tafsir')
      .select('id')
      .eq('ayah_id', ayah.ayah_id)
      .eq('scholar', entry.scholar)
      .eq('language_code', entry.lang)
      .maybeSingle();

    if (existing) { skipped++; continue; }

    const { error } = await sb.from('tafsir').insert({
      ayah_id: ayah.ayah_id,
      scholar: entry.scholar,
      language_code: entry.lang,
      text: entry.text,
      source_book: entry.source,
    });

    if (error) { console.log(`  ✗ ${entry.surah}:${entry.ayah} — ${error.message}`); }
    else { console.log(`  ✓ ${entry.surah}:${entry.ayah} — ${entry.scholar}`); inserted++; }
  }

  console.log(`\nTafsir: ${inserted} inserted, ${skipped} already existed`);

  const { count } = await sb.from('tafsir').select('*', { count: 'exact', head: true });
  console.log(`Total tafsir in DB: ${count}`);
}

insertTafsir().catch(console.error);
