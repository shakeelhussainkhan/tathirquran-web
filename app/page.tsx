import { getTodayAyahData, getLiveLanguages, getTodayIslamicOccasion } from "@/lib/queries";
import HomeInteractive from "@/app/HomeInteractive";
import { formatReadableDate, gregorianToHijriString } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [data, languages, occasion] = await Promise.all([
    getTodayAyahData(),
    getLiveLanguages(),
    getTodayIslamicOccasion(),
  ]);

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
      <header className="w4-header" style={{ padding: "14px 40px" }}>
        {/* LEFT: Photo icon + stacked brand names */}
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

        {/* RIGHT: Gregorian + Hijri dates stacked */}
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
            {readableDate}
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

      {/* HERO + CONTROLS — HomeInteractive owns everything reactive */}
      <HomeInteractive initialData={data} languages={languages} occasion={occasion} />

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
