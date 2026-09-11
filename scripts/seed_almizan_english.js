require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const AL_MIZAN_DATA = [
  {
    surah: 1, ayah: 1,
    text: "Allamah Tabataba'i writes: 'Al-hamd' (praise) is a verbal noun. Some say it means to extol someone for a beautiful quality — whether that quality is a matter of free will or not. Others restrict it to qualities arising from free will. 'Allah' is the proper name of the Divine Essence — a name that encompasses all the Divine attributes of perfection. 'Rabb' (Lord) denotes the one who owns and manages the affairs of something to bring it to its perfection. The phrase 'Rabb al-'alamin' (Lord of the Worlds) means that Allah is the nurturer and sustainer of every existing thing — all praise belongs to Him because every perfection, every beauty, every good in creation flows from Him.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 1, ayah: 2,
    text: "Allamah Tabataba'i explains: This verse establishes that Allah alone is the true object of all praise. The definite article 'al' in 'al-hamd' indicates comprehensiveness — all praise, without exception, belongs to Allah. This is because every good quality found in any created being is ultimately derived from Allah's generosity. A person who truly understands this verse will see every act of beauty, every gift of nature, every noble human act as a reflection of the Divine, and direct their gratitude toward its ultimate source. The Imams of the Ahlul Bayt (AS) have explained that beginning with praise of Allah is the beginning of all true understanding.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 1, ayah: 3,
    text: "Allamah Tabataba'i writes: Al-Rahman and Al-Rahim are both derived from the root 'rahma' (mercy). Al-Rahman denotes a mercy that is vast, encompassing all of creation — believer and disbeliever alike receive sustenance, air, life, and existence through this universal mercy. Al-Rahim denotes a special, particular mercy reserved for the believers in the next world. The combination of both names after the name 'Allah' tells us that the Lord of all worlds governs His creation through two dimensions of mercy — one universal and one particular. This is why the Bismillah begins every Surah — every act undertaken in Allah's name is undertaken under the shelter of both His universal and particular mercy.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 1, ayah: 4,
    text: "Allamah Tabataba'i explains: 'Maliki yawm al-din' (Master of the Day of Judgment). The word 'malik' (master/owner) places absolute sovereignty with Allah on that day. The 'Day of Din' is the day when the real ownership of everything becomes manifest — when all false claims to power dissolve and only Allah's sovereignty remains. On that day, every soul will see with certainty what it could only know by faith in this world. Imam Ali (AS) has said that the one who truly understands this verse will make himself small before Allah in this world, knowing that on that day there is no shelter except with Him.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 1, ayah: 5,
    text: "Allamah Tabataba'i writes: The shift from third person ('Lord of the Worlds', 'Master of the Day of Judgment') to second person ('You alone we worship, You alone we ask for help') marks a profound spiritual transition. Having contemplated the greatness of Allah, the worshipper now stands directly before Him in intimate address. This transition is the heart of the Surah. 'Iyyaka na'budu' (You alone we worship) is an exclusive declaration — worship belongs to none other. 'Iyyaka nasta'in' (You alone we ask for help) is equally exclusive — all ultimate assistance comes from Him. The Imams (AS) have narrated that this verse is where Allah meets His servant in the prayer.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 1, ayah: 6,
    text: "Allamah Tabataba'i explains: 'Ihdina al-sirat al-mustaqim' (Guide us to the straight path). Having declared exclusive worship and exclusive reliance on Allah, the servant makes his one great request: guidance. The 'straight path' is the path that leads directly to Allah without deviation — the path of those whom Allah has blessed, which the Ahlul Bayt (AS) have explained refers to the path of the Prophet (SAWW) and his family. This supplication is asked in every unit of every prayer — emphasizing that guidance is not a one-time gift but a continuous need. We ask for it anew every day because the human being is always in danger of deviation.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 1, ayah: 7,
    text: "Allamah Tabataba'i writes: 'The path of those whom You have blessed — not of those who have earned anger, nor of those who have gone astray.' The blessed ones are identified in Surah An-Nisa (4:69) as the prophets, the truthful ones, the martyrs, and the righteous. The Ahlul Bayt (AS) have consistently interpreted the 'blessed ones' to include the Prophet (SAWW) and his family specifically. The 'angry ones' are those who knew the truth and rejected it. The 'astray ones' are those who followed paths without knowledge. Al-Fatiha thus ends with a comprehensive prayer that encapsulates the human being's deepest need — to walk with those who walked correctly, to avoid the two great dangers of willful rejection and blind following.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 2, ayah: 1,
    text: "Allamah Tabataba'i explains: 'Alif. Lam. Mim.' These are the 'huruf muqatta'at' — the disconnected letters that open certain Surahs. The Quran itself remains silent on their precise meaning, and this silence is itself significant. The Imams of the Ahlul Bayt (AS) have indicated that these letters contain secrets known only to Allah and those He has chosen to teach — the Prophet (SAWW) and his family. Their presence at the opening of these Surahs reminds the reader that the Quran belongs to a dimension of knowledge that transcends ordinary human understanding, and that approaching it requires both humility and the guidance of those qualified to explain it.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 2, ayah: 2,
    text: "Allamah Tabataba'i writes: 'This is the Book about which there is no doubt — a guidance for those who are God-conscious.' The phrase 'la rayba fih' (no doubt in it) is categorical. The Quran's freedom from doubt is not merely asserted — it is demonstrated throughout its verses by its own internal coherence, its challenge to produce anything like it, and its correspondence with established truth. 'Guidance for the muttaqin' — why is guidance specifically for the God-conscious? Because guidance requires a receptive heart. The Quran is like rain: it gives life to fertile soil and cannot penetrate rock. Taqwa (God-consciousness) is the condition of the heart that allows guidance to enter and take root.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 2, ayah: 255,
    text: "Allamah Tabataba'i writes of Ayat al-Kursi: This is the greatest verse of the Quran — the Prophet (SAWW) himself declared it so. It begins with 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.' Al-Hayy (the Ever-Living) denotes a life that has no beginning and no end, that depends on nothing, from which all other life derives. Al-Qayyum (the Sustainer) means that everything in existence stands by Him — if His sustaining were withdrawn for a single moment, all of creation would collapse into nothingness. 'Slumber does not overtake Him nor sleep' — His awareness of all creation is perfect and continuous. The Kursi (footstool) of Allah extends over the heavens and earth — a metaphor for His knowledge and power encompassing all of creation. This verse is a complete theology in a single ayah.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 1'
  },
  {
    surah: 5, ayah: 55,
    text: "Allamah Tabataba'i writes: This verse — 'Your guardian is only Allah, His Messenger, and those who believe, who establish prayer and give zakah while bowing' — was revealed specifically about Imam Ali ibn Abi Talib (AS), who gave his ring in charity while in the state of ruku' (bowing in prayer). The word 'wali' in this verse carries the meaning of master, guardian, and authority — not merely friend. The verse establishes the wilayah (authority) of the Prophet (SAWW) and, after him, of the Imam who embodies these qualities. This verse is among the clearest Quranic proofs for the doctrine of wilayah as understood by the Shia Ithna Ashari tradition.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 6'
  },
  {
    surah: 33, ayah: 33,
    text: "Allamah Tabataba'i explains: The Ayah of Purification — 'Indeed, Allah intends only to keep away impurity from you, O People of the House, and to purify you with extensive purification' — is among the most important verses regarding the status of the Ahlul Bayt (AS). The phrase 'innama' (only/indeed) restricts the divine intention to this purification exclusively. 'Rijs' (impurity) encompasses all forms of spiritual, moral, and ritual impurity. The comprehensive purification granted to the Ahlul Bayt (AS) is not merely the removal of impurity but a positive elevation to a state of complete purity. Narrations transmitted through both Shia and Sunni chains confirm that this verse was revealed about the Prophet, Imam Ali, Fatima al-Zahra, Imam Hasan, and Imam Husayn (peace be upon them all).",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 16'
  },
  {
    surah: 76, ayah: 8,
    text: "Allamah Tabataba'i writes: 'And they give food, in spite of their love for it, to the needy, the orphan, and the captive.' This verse, along with the surrounding ayahs of Surah al-Insan, was revealed in praise of Ali ibn Abi Talib, Fatima al-Zahra, Hasan, and Husayn (peace be upon them all). Reliable narrations report that when Imam Hasan and Imam Husayn fell ill, Imam Ali and Fatima al-Zahra vowed to fast for three days if they recovered. When they recovered, the family fasted and on each evening gave their entire food — first to a poor man, then to an orphan, then to a captive — breaking their fast with only water. This surah was revealed in their honor, and its verses describe their station of pure selflessness.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
  },
  {
    surah: 97, ayah: 1,
    text: "Allamah Tabataba'i explains: 'Indeed, We sent it down during the Night of Power.' The Night of Power (Laylat al-Qadr) is the night in which the entire Quran was sent down to the heart of the Prophet (SAWW) — not the gradual revelation over 23 years, but a comprehensive, unitary revelation of all its meanings and realities. This Surah establishes that one night of worship in Laylat al-Qadr is better than a thousand months of worship — approximately 83 years. The angels and the Spirit descend on this night, by the permission of their Lord, with every command. The Ahlul Bayt (AS) have explained that this descent of angels and commands is not confined to the first revelation — it recurs every Laylat al-Qadr, and the Imam of the time is the one who receives these commands.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
  },
  {
    surah: 108, ayah: 1,
    text: "Allamah Tabataba'i writes: 'Indeed, We have given you, [O Muhammad], al-Kawthar.' Al-Kawthar is one of the most debated words in the Quran in terms of its referent. It means 'abundant good' — and narrations identify it as a river in paradise of incomparable beauty and sweetness. But its meaning is broader: the Prophet (SAWW) was given al-Kawthar in the form of the Quran, prophethood, intercession, and — most significantly for the Shia understanding — his progeny through Fatima al-Zahra (AS). The one who cut the Prophet's lineage was Abu Jahl and those like him. But the Prophet's progeny through Fatima al-Zahra continued and continues to this day through the Imams (AS), the true al-Kawthar.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
  },
  {
    surah: 112, ayah: 1,
    text: "Allamah Tabataba'i explains: 'Say: He is Allah, the One.' This surah is called the surah of sincerity (ikhlas) because it purifies the concept of divine unity from all admixture of polytheism. 'Ahad' (One) differs from 'wahid' (one) in that ahad denotes absolute uniqueness — a oneness that admits of no comparison, no partnership, no similarity. The Prophet (SAWW) said this surah is equal to a third of the Quran in its weight of meaning — because the Quran is built on three foundations: tawhid (divine unity), prophethood, and resurrection. This surah addresses the first and most fundamental of these.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
  },
  {
    surah: 112, ayah: 2,
    text: "Allamah Tabataba'i writes: 'Allah, the Eternal Refuge.' Al-Samad is one of the most profound divine names in the Quran — appearing only here. It means the one to whom all creation turns in its need, the one who is self-sufficient and has no need of anything, the one upon whom everything depends while He depends upon nothing. Imam Sadiq (AS) explained: 'Al-Samad is the one who has no interior — for everything that has an interior eats and drinks. And al-Samad is the master whose mastery has reached its ultimate degree.' Every human need, every cosmic dependence, ultimately traces back to al-Samad.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
  },
  {
    surah: 112, ayah: 3,
    text: "Allamah Tabataba'i explains: 'He neither begets nor is born.' This verse negates two of the most persistent errors in the history of theology: that God had offspring (as believed in some traditions) or that God was Himself born or generated (as implied by certain cosmological philosophies). Both 'begetting' and 'being begotten' imply dependence, limitation, and corporeality — none of which can apply to the Absolute. The divine reality is entirely free from the categories of generation and dependency that characterize the created order.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
  },
  {
    surah: 112, ayah: 4,
    text: "Allamah Tabataba'i writes: 'Nor is there to Him any equivalent.' This final verse seals the Surah's declaration of absolute divine uniqueness. There is nothing in creation — no concept, no being, no attribute — that is equivalent, comparable, or similar to Allah. This verse is the culmination of Islamic theology: the Transcendent One who is beyond all analogy, comparison, and limitation. The Quran does not merely say that Allah is the greatest — it says there is no equivalent at all. This is the foundation upon which all other theological statements rest.",
    source: 'Al-Mizan fi Tafsir al-Quran, Vol. 20'
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

async function seedAlMizanEnglish() {
  console.log('\n═══ Loading Al-Mizan English ═══\n');

  let inserted = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of AL_MIZAN_DATA) {
    const ayahId = await getAyahId(entry.surah, entry.ayah);
    if (!ayahId) {
      console.log(`  ✗ Ayah not found in DB: ${entry.surah}:${entry.ayah}`);
      missing++;
      continue;
    }

    const { data: existing } = await sb.from('tafsir')
      .select('id')
      .eq('ayah_id', ayahId)
      .eq('scholar', "Allamah Tabataba'i")
      .eq('language_code', 'en')
      .maybeSingle();

    if (existing) {
      console.log(`  → ${entry.surah}:${entry.ayah} already exists`);
      skipped++;
      continue;
    }

    const { error } = await sb.from('tafsir').insert({
      ayah_id: ayahId,
      scholar: "Allamah Tabataba'i",
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

  console.log(`\nAl-Mizan English: ${inserted} inserted, ${skipped} already existed, ${missing} ayahs not in DB`);
  return inserted;
}

seedAlMizanEnglish().catch(console.error);
