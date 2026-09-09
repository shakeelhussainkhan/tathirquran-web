import { Suspense } from "react";
import Link from "next/link";
import { getTodayAyahData, getLiveLanguages } from "@/lib/queries";
import DownloadButtons from "@/components/DownloadButtons";
import HomeInteractive from "@/app/HomeInteractive";
import ShareButton from "@/components/ShareButton";
import { formatReadableDate, gregorianToHijriString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getTodayAyahData();
  const languages = await getLiveLanguages();

  if (!data) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#faf5e9",
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
            color: "#7a6030",
            fontSize: "18px",
            textAlign: "center",
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
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#faf5e9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header className="tq-page-header">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: ".2em",
            color: "#c9a227",
            textTransform: "uppercase",
          }}
        >
          TathirQuran
        </span>
        <span
          style={{ fontFamily: "'Amiri', serif", fontSize: "14px", color: "#c9a227" }}
          lang="ar"
          dir="rtl"
        >
          تطهير القرآن
        </span>
      </header>

      {/* Date bar */}
      <div className="tq-date-bar">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "#9a7830",
            letterSpacing: ".05em",
          }}
        >
          {readableDate}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "#9a7830",
            letterSpacing: ".05em",
          }}
          lang="ar"
          dir="rtl"
        >
          {hijriDate}
        </span>
      </div>

      {/* Main interactive content — hero + selectors + tafsir */}
      <Suspense
        fallback={
          <div className="tq-hero">
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "16px",
                color: "rgba(201,162,39,.5)",
                textAlign: "center",
              }}
            >
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </div>
        }
      >
        <HomeInteractive initialData={data} languages={languages} />
      </Suspense>

      {/* Footer */}
      <footer className="tq-page-footer">
        <DownloadButtons />
        <nav
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {[
            { href: "/archive", label: "Archive" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                color: "#c9a227",
                textDecoration: "none",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </Link>
          ))}
          <ShareButton
            surahNumber={data.ayah.surah_number}
            ayahNumber={data.ayah.ayah_number}
          />
        </nav>
      </footer>
    </main>
  );
}
