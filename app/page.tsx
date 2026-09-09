import { Suspense } from "react";
import { getTodayAyahData, getLiveLanguages } from "@/lib/queries";
import HomeInteractive from "@/app/HomeInteractive";
import AyahCard from "@/components/AyahCard";
import { formatReadableDate, gregorianToHijriString, verseRef } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getTodayAyahData();
  const languages = await getLiveLanguages();

  if (!data) {
    return (
      <main
        style={{
          minHeight: "100svh",
          backgroundColor: "#1a1005",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "rgba(201,162,39,.6)",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          The database is being prepared. Please check back soon.
        </p>
      </main>
    );
  }

  const today = new Date(data.date + "T00:00:00Z");
  const hijriDate = gregorianToHijriString(today);
  const readableDate = formatReadableDate(data.date);
  const ref = verseRef(
    data.surah.name_transliterated,
    data.ayah.surah_number,
    data.ayah.ayah_number
  );

  return (
    <div className="split-layout">
      {/* LEFT PANEL — dark, sacred */}
      <div className="split-left">
        {/* Top branding */}
        <div style={{ padding: "28px 32px", textAlign: "right" }}>
          <div
            lang="ar"
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "16px",
              color: "rgba(201,162,39,.8)",
            }}
          >
            تطهير القرآن
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "8px",
              letterSpacing: ".22em",
              color: "rgba(201,162,39,.4)",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            TATHIRQURAN
          </div>
        </div>

        {/* Center — verse */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 36px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Radial glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(201,162,39,.08), transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Bismillah */}
          <div
            lang="ar"
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "13px",
              color: "rgba(201,162,39,.5)",
              direction: "rtl",
              marginBottom: "20px",
              zIndex: 1,
              position: "relative",
            }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>

          {/* Arabic verse */}
          <AyahCard data={data} />

          {/* Verse reference */}
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              letterSpacing: ".12em",
              color: "rgba(201,162,39,.5)",
              textTransform: "uppercase",
              marginTop: "16px",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {ref}
          </div>
        </div>

        {/* Bottom — hijri date */}
        <div style={{ padding: "20px 32px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              color: "rgba(201,162,39,.3)",
              letterSpacing: ".08em",
            }}
          >
            {hijriDate}
          </div>
          <div
            aria-hidden="true"
            style={{ color: "rgba(201,162,39,.2)", fontSize: "10px", marginTop: "6px" }}
          >
            ·  ·  ·
          </div>
        </div>
      </div>

      {/* GOLD DIVIDER */}
      <div className="split-divider" aria-hidden="true" />

      {/* RIGHT PANEL — ivory, readable */}
      <div className="split-right">
        <Suspense
          fallback={
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "9px",
                  color: "#9a7830",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                Loading…
              </p>
            </div>
          }
        >
          <HomeInteractive
            initialData={data}
            languages={languages}
            readableDate={readableDate}
          />
        </Suspense>
      </div>
    </div>
  );
}
