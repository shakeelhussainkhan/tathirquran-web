import Link from "next/link";
import { getRecentSchedule, getAyahById, getSurah } from "@/lib/queries";
import { formatReadableDate, gregorianToHijriString } from "@/lib/utils";
import BronzeBar from "@/components/BronzeBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive — TathirQuran",
  description: "Browse past daily ayahs from TathirQuran.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const schedule = await getRecentSchedule(60);

  // Fetch ayah + surah for each entry
  const entries = await Promise.all(
    schedule.map(async (s) => {
      const ayah = await getAyahById(s.ayah_id);
      const surah = ayah ? await getSurah(ayah.surah_number) : null;
      return { schedule: s, ayah, surah };
    })
  );

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 64px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "32px", paddingBottom: "12px" }}>
        <Link href="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}>
          ← TathirQuran
        </Link>
        <span style={{ fontFamily: "'Amiri', serif", fontSize: "14px", color: "#c9a227" }} lang="ar" dir="rtl">تطهیر القرآن</span>
      </header>
      <div style={{ height: "0.5px", background: "linear-gradient(90deg, #e8c96a, #c9a227 40%, transparent)", marginBottom: "32px" }} aria-hidden="true" />

      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#0d0a04", fontWeight: 500, marginBottom: "8px" }}>
        Archive
      </h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#7a6030", letterSpacing: "0.04em", marginBottom: "36px" }}>
        Daily ayahs — most recent first
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {entries.map(({ schedule: s, ayah, surah }) => {
          if (!ayah || !surah) return null;
          const date = new Date(s.schedule_date + "T00:00:00Z");
          const hijri = gregorianToHijriString(date);
          const isSpecial = s.reason === "islamic_calendar" || s.reason === "special";

          return (
            <Link
              key={s.schedule_date}
              href={`/ayah/${ayah.surah_number}/${ayah.ayah_number}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  overflow: "hidden",
                  backgroundColor: "#fdfaf4",
                  border: "1px solid rgba(201,162,39,0.12)",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div style={{ width: "3px", background: isSpecial ? "linear-gradient(180deg, #e8c96a, #c9a227, #8b6520)" : "rgba(201,162,39,0.2)", flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#7a6030", letterSpacing: "0.06em", marginBottom: "4px" }}>
                      {formatReadableDate(s.schedule_date)}
                      {isSpecial && (
                        <span style={{ marginLeft: "8px", color: "#c9a227" }}>
                          · {s.notes ?? "special occasion"}
                        </span>
                      )}
                    </p>
                    <p style={{ fontFamily: "'Amiri', serif", fontSize: "15px", color: "#0d0a04", direction: "rtl", textAlign: "right" }} lang="ar" dir="rtl">
                      {ayah.arabic_uthmani.slice(0, 60)}{ayah.arabic_uthmani.length > 60 ? "…" : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#c9a227", letterSpacing: "0.10em", textTransform: "uppercase" }}>
                      {surah.name_transliterated} {ayah.surah_number}:{ayah.ayah_number}
                    </p>
                    <p style={{ fontFamily: "'Amiri', serif", fontSize: "11px", color: "#7a6030", direction: "rtl" }} lang="ar" dir="rtl">
                      {hijri}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {entries.length === 0 && (
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#7a6030", fontSize: "18px" }}>
          No archive entries yet. The daily schedule will appear here once the database is seeded.
        </p>
      )}
    </main>
  );
}
