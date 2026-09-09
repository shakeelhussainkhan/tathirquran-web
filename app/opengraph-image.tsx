import { ImageResponse } from "next/og";
import { getTodayAyahData } from "@/lib/queries";

export const runtime = "edge";
export const alt = "TathirQuran — Daily Ayah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const data = await getTodayAyahData();

  const arabic = data?.ayah.arabic_uthmani ?? "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ";
  const translation =
    data?.translation?.text ?? "In the name of Allah, the Most Gracious, the Most Merciful.";
  const ref = data
    ? `${data.surah.name_transliterated?.toUpperCase()} · ${data.ayah.surah_number}:${data.ayah.ayah_number}`
    : "";

  // Truncate translation if too long for OG image
  const shortTranslation =
    translation.length > 120 ? translation.slice(0, 117) + "…" : translation;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#faf5e9",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Top gold bar */}
        <div
          style={{
            height: "20px",
            width: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, #8b6520 8%, #c9a227 25%, #e8c96a 50%, #c9a227 75%, #8b6520 92%, transparent 100%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 80px",
            gap: "0",
          }}
        >
          {/* Arabic */}
          <div
            style={{
              fontFamily: "serif",
              fontSize: "64px",
              color: "#0d0a04",
              textAlign: "center",
              lineHeight: 1.7,
              direction: "rtl",
              marginBottom: "28px",
              maxWidth: "960px",
            }}
          >
            {arabic}
          </div>

          {/* Ornament */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "1px",
                background: "rgba(201,162,39,0.5)",
              }}
            />
            <div style={{ fontSize: "12px", color: "#c9a227" }}>◆</div>
            <div
              style={{
                width: "60px",
                height: "1px",
                background: "rgba(201,162,39,0.5)",
              }}
            />
          </div>

          {/* Translation */}
          <div
            style={{
              fontFamily: "serif",
              fontSize: "28px",
              fontStyle: "italic",
              color: "#2a1f08",
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: "900px",
              marginBottom: "24px",
            }}
          >
            &ldquo;{shortTranslation}&rdquo;
          </div>

          {/* Verse ref */}
          {ref && (
            <div
              style={{
                fontFamily: "sans-serif",
                fontSize: "14px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c9a227",
              }}
            >
              {ref}
            </div>
          )}
        </div>

        {/* Bottom gold bar with branding */}
        <div
          style={{
            height: "40px",
            width: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, #8b6520 8%, #c9a227 25%, #e8c96a 50%, #c9a227 75%, #8b6520 92%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: "12px",
              letterSpacing: "0.2em",
              color: "#1a1005",
              textTransform: "uppercase",
            }}
          >
            TathirQuran · tathirquran.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
