import Link from "next/link";
import { getRecentSchedule, getAyahById, getSurah } from "@/lib/queries";
import { formatReadableDate, gregorianToHijriString } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive — TathirQuran",
  description: "Browse the past 60 days of daily ayahs from TathirQuran.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const today = new Date();
  const gregorianDate = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hijriDate = gregorianToHijriString(today);

  const schedule = await getRecentSchedule(60);

  const entries = await Promise.all(
    schedule.map(async (s) => {
      const ayah = await getAyahById(s.ayah_id);
      const surah = ayah ? await getSurah(ayah.surah_number) : null;
      return { schedule: s, ayah, surah };
    })
  );

  return (
    <main className="w4-page">
      {/* TOP GOLD BAR */}
      <div className="w4-gold-bar" />

      {/* HEADER */}
      <header className="w4-header" style={{ padding: "14px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/apple-icon.png"
            alt="TathirQuran"
            className="tq-header-icon"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              objectFit: "cover",
              objectPosition: "center top",
              border: "0.5px solid rgba(139,101,32,0.4)",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c9a227",
                lineHeight: 1,
              }}
            >
              TathirQuran
            </span>
            <span
              style={{
                fontFamily: "Amiri, serif",
                fontSize: "14px",
                color: "rgba(201,162,39,0.75)",
                lineHeight: 1.2,
                direction: "rtl",
              }}
            >
              تطهير القرآن
            </span>
          </div>
        </div>
        <div
          className="tq-header-dates"
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              color: "#9a7830",
              letterSpacing: "0.04em",
            }}
          >
            {gregorianDate}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              color: "rgba(201,162,39,0.65)",
              letterSpacing: "0.04em",
            }}
          >
            {hijriDate}
          </span>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          flex: 1,
          maxWidth: "720px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 32px 64px",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c9a227",
            textDecoration: "none",
            marginBottom: "28px",
          }}
        >
          ← Back to Today
        </Link>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "26px",
            fontWeight: 400,
            color: "#0d0a04",
            marginBottom: "4px",
          }}
        >
          Archive
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            color: "#7a6030",
            letterSpacing: "0.06em",
            marginBottom: "28px",
          }}
        >
          Past 60 days · most recent first
        </p>

        {/* Row list */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {entries.map(({ schedule: s, ayah, surah }, idx) => {
            if (!ayah || !surah) return null;
            const date = new Date(s.schedule_date + "T00:00:00Z");
            const hijri = gregorianToHijriString(date);
            const readable = formatReadableDate(s.schedule_date);

            return (
              <Link
                key={s.schedule_date}
                href={`/ayah/${ayah.surah_number}/${ayah.ayah_number}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr auto",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 0",
                    borderBottom:
                      idx < entries.length - 1
                        ? "0.5px solid rgba(201,162,39,0.12)"
                        : "none",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(201,162,39,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                  }}
                >
                  {/* Date column */}
                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        color: "#7a6030",
                        letterSpacing: "0.04em",
                        marginBottom: "2px",
                      }}
                    >
                      {readable}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Amiri', serif",
                        fontSize: "11px",
                        color: "rgba(201,162,39,0.7)",
                        direction: "rtl",
                      }}
                      lang="ar"
                      dir="rtl"
                    >
                      {hijri}
                    </p>
                  </div>

                  {/* Arabic snippet */}
                  <p
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: "16px",
                      color: "#0d0a04",
                      direction: "rtl",
                      textAlign: "right",
                      lineHeight: 1.7,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    lang="ar"
                    dir="rtl"
                  >
                    {ayah.arabic_uthmani.slice(0, 80)}
                    {ayah.arabic_uthmani.length > 80 ? "…" : ""}
                  </p>

                  {/* Surah ref */}
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      color: "#c9a227",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      textAlign: "right",
                    }}
                  >
                    {surah.name_transliterated} {ayah.surah_number}:
                    {ayah.ayah_number}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {entries.length === 0 && (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "#7a6030",
              fontSize: "18px",
              textAlign: "center",
              marginTop: "60px",
            }}
          >
            No archive entries yet. The daily schedule will appear here once
            ayahs are scheduled.
          </p>
        )}
      </div>

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
