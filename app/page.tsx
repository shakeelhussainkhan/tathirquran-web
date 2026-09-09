import { Suspense } from "react";
import Link from "next/link";
import { getTodayAyahData, getLiveLanguages, getTranslationsForLanguage, getAyahTranslation } from "@/lib/queries";
import AyahCard from "@/components/AyahCard";
import TafsirPanel from "@/components/TafsirPanel";
import DownloadButtons from "@/components/DownloadButtons";
import LockScreenPreview from "@/components/LockScreenPreview";
import HomeInteractive from "@/app/HomeInteractive";
import { formatReadableDate, gregorianToHijriString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getTodayAyahData();
  const languages = await getLiveLanguages();

  if (!data) {
    return (
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px" }}>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "#7a6030",
            fontSize: "18px",
          }}
        >
          The database is being prepared. Please check back soon.
          <br />
          <span style={{ fontSize: "13px" }}>
            Supabase migrations and seed data are pending.
          </span>
        </p>
      </main>
    );
  }

  const today = new Date(data.date + "T00:00:00Z");
  const hijriDate = gregorianToHijriString(today);
  const readableDate = formatReadableDate(data.date);

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 64px" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingTop: "32px",
          paddingBottom: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "#c9a227",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          TathirQuran
        </span>
        <span
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "14px",
            color: "#c9a227",
            direction: "rtl",
          }}
          lang="ar"
          dir="rtl"
        >
          تطهیر القرآن
        </span>
      </header>

      {/* Bronze rule under header */}
      <div
        style={{
          height: "0.5px",
          background: "linear-gradient(90deg, #e8c96a, #c9a227 40%, transparent)",
          marginBottom: "40px",
        }}
        aria-hidden="true"
      />

      {/* Date row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "4px",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "#7a6030",
            letterSpacing: "0.06em",
          }}
        >
          {readableDate}
        </p>
        <p
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "13px",
            color: "#7a6030",
          }}
          lang="ar"
          dir="rtl"
        >
          {hijriDate}
        </p>
      </div>

      {/* Main ayah card + interactive language/translation selector */}
      <Suspense fallback={<AyahCard data={data} label="Today" />}>
        <HomeInteractive
          initialData={data}
          languages={languages}
        />
      </Suspense>

      {/* Tafsir */}
      <div style={{ marginTop: "32px" }}>
        <TafsirPanel tafsir={data.tafsir} />
      </div>

      {/* Divider */}
      <div
        style={{
          height: "0.5px",
          background: "linear-gradient(90deg, #e8c96a, rgba(201,162,39,0.2))",
          margin: "36px 0",
        }}
        aria-hidden="true"
      />

      {/* Lock screen preview */}
      <section style={{ marginBottom: "40px" }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            color: "#7a6030",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "20px",
            fontWeight: 500,
          }}
        >
          Lock Screen Widget Preview
        </p>
        <LockScreenPreview data={data} />
      </section>

      {/* Divider */}
      <div
        style={{
          height: "0.5px",
          background: "linear-gradient(90deg, rgba(201,162,39,0.2), #e8c96a, rgba(201,162,39,0.2))",
          margin: "36px 0",
        }}
        aria-hidden="true"
      />

      {/* Footer */}
      <footer style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <DownloadButtons />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <nav style={{ display: "flex", gap: "20px" }}>
            {[
              { href: "/archive", label: "Archive" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  color: "#7a6030",
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              color: "#c9a227",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: 0,
            }}
            onClick={() => {
              if (typeof navigator !== "undefined") {
                navigator.clipboard?.writeText(
                  `${window.location.origin}/ayah/${data.ayah.surah_number}/${data.ayah.ayah_number}`
                );
              }
            }}
          >
            Share this ayah →
          </button>
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            color: "#7a6030",
            letterSpacing: "0.06em",
            opacity: 0.7,
          }}
        >
          Purify your mornings with the Word of Allah · بِسْمِ اللَّهِ
        </p>
      </footer>
    </main>
  );
}
