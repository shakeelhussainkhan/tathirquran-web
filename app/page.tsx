import { getTodayAyahData, getLiveLanguages } from "@/lib/queries";
import HomeInteractive from "@/app/HomeInteractive";
import { formatReadableDate, gregorianToHijriString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getTodayAyahData();
  const languages = await getLiveLanguages();

  if (!data) {
    return (
      <main className="w4-page">
        <div className="w4-gold-bar" />
        <div
          style={{
            flex: 1,
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
          </p>
        </div>
        <div className="w4-gold-bar" />
      </main>
    );
  }

  const today = new Date(data.date + "T00:00:00Z");
  const hijriDate = gregorianToHijriString(today);
  const readableDate = formatReadableDate(data.date);

  return (
    <main className="w4-page">
      {/* TOP GOLD BAR */}
      <div className="w4-gold-bar" />

      {/* HEADER */}
      <header className="w4-header">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#c9a227",
          }}
        >
          TathirQuran
        </span>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.04em",
              color: "#9a7830",
            }}
          >
            {readableDate}
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.04em",
              color: "rgba(201,162,39,0.7)",
            }}
          >
            {hijriDate}
          </span>
          <span
            lang="ar"
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "16px",
              color: "rgba(201,162,39,0.7)",
              direction: "rtl",
            }}
          >
            تطهير القرآن
          </span>
        </div>
      </header>

      {/* HERO + CONTROLS — HomeInteractive owns everything reactive */}
      <HomeInteractive initialData={data} languages={languages} />

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
