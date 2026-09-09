import { ImageResponse } from "next/og";
import { getAyahPageData } from "@/lib/queries";
import { verseRef } from "@/lib/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ surah: string; ayah: string }>;
}

export default async function AyahOGImage({ params }: Props) {
  const { surah, ayah } = await params;
  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);

  const data = await getAyahPageData(surahNum, ayahNum);

  const arabic =
    data?.ayah.arabic_uthmani ?? "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ";
  const enText =
    data?.translations.find(
      (t) => t.translation.language_code === "en" && t.translation.is_default
    )?.text ?? "";
  const ref = data
    ? verseRef(data.surah.name_transliterated, surahNum, ayahNum)
    : `${surahNum}:${ayahNum}`;
  const shortTranslation =
    enText.length > 120 ? enText.slice(0, 117) + "…" : enText;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#faf5e9",
          display: "flex",
          flexDirection: "column",
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

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 80px",
          }}
        >
          <div
            style={{
              fontFamily: "serif",
              fontSize: "60px",
              color: "#0d0a04",
              textAlign: "center",
              lineHeight: 1.7,
              direction: "rtl",
              marginBottom: "24px",
              maxWidth: "960px",
            }}
          >
            {arabic}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
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

          {shortTranslation && (
            <div
              style={{
                fontFamily: "serif",
                fontSize: "26px",
                fontStyle: "italic",
                color: "#2a1f08",
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: "900px",
                marginBottom: "20px",
              }}
            >
              &ldquo;{shortTranslation}&rdquo;
            </div>
          )}

          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: "14px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c9a227",
            }}
          >
            {ref.toUpperCase()}
          </div>
        </div>

        {/* Bottom bar */}
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
    { ...size }
  );
}
