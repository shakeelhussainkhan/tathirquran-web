require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function main() {
  // Get ayah_id=1 (Al-Fatiha 1:1)
  const { data: ayah, error: ayahErr } = await supabase
    .from("ayahs")
    .select("ayah_id")
    .eq("surah_number", 1)
    .eq("ayah_number", 1)
    .single();
  if (ayahErr) throw ayahErr;

  const ayahId = ayah.ayah_id;
  console.log(`Using ayah_id=${ayahId} (Al-Fatiha 1:1)`);

  const tags = [
    { ayah_id: ayahId, occasion: "Ashura — Day of Imam Husayn (AS)",  hijri_month: 1,  hijri_day: 10, priority: 10, notes: "Muharram 10" },
    { ayah_id: ayahId, occasion: "Arbaeen",                           hijri_month: 2,  hijri_day: 20, priority:  9, notes: "Safar 20" },
    { ayah_id: ayahId, occasion: "Wiladat Imam Ali (AS)",             hijri_month: 7,  hijri_day: 13, priority: 10, notes: "Rajab 13" },
    { ayah_id: ayahId, occasion: "Laylat al-Qadr",                    hijri_month: 9,  hijri_day: 23, priority: 10, notes: "Ramadan 23" },
    { ayah_id: ayahId, occasion: "Eid al-Fitr",                       hijri_month: 10, hijri_day:  1, priority:  9, notes: "Shawwal 1" },
    { ayah_id: ayahId, occasion: "Eid al-Adha",                       hijri_month: 12, hijri_day: 10, priority:  9, notes: "Dhul Hijjah 10" },
    { ayah_id: ayahId, occasion: "Eid al-Ghadeer",                    hijri_month: 12, hijri_day: 18, priority: 10, notes: "Dhul Hijjah 18 — most important Shia occasion" },
    { ayah_id: ayahId, occasion: "Mabath — First Revelation",         hijri_month: 7,  hijri_day: 27, priority:  9, notes: "Rajab 27" },
    { ayah_id: ayahId, occasion: "Wiladat Imam Mahdi (AS)",           hijri_month: 8,  hijri_day: 15, priority: 10, notes: "Shaban 15" },
    { ayah_id: ayahId, occasion: "Wiladat Prophet Muhammad (SAWW)",   hijri_month: 3,  hijri_day: 17, priority:  9, notes: "Rabi al-Awwal 17" },
  ];

  const { error } = await supabase
    .from("islamic_calendar_tags")
    .insert(tags);
  if (error) throw error;

  console.log(`✓ ${tags.length} Islamic calendar tags inserted.`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message ?? err);
  process.exit(1);
});
