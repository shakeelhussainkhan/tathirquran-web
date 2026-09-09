import type { TodayAyahResponse } from "@/types";

interface LockScreenPreviewProps {
  data: TodayAyahResponse;
}

export default function LockScreenPreview({ data }: LockScreenPreviewProps) {
  const { ayah, surah, translation } = data;

  // Truncate Arabic for widget display
  const arabicShort =
    ayah.arabic_uthmani.length > 80
      ? ayah.arabic_uthmani.slice(0, 80) + "…"
      : ayah.arabic_uthmani;
  const translationShort = translation
    ? translation.text.length > 90
      ? translation.text.slice(0, 90) + "…"
      : translation.text
    : "";

  return (
    <div
      style={{
        width: "220px",
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
      }}
      aria-label="Lock screen widget preview"
    >
      {/* Phone frame */}
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "32px",
          padding: "40px 12px 20px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
          position: "relative",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "6px",
            background: "#111",
            borderRadius: "4px",
          }}
        />

        {/* Widget */}
        <div
          style={{
            background: "rgba(253,250,244,0.12)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            padding: "12px",
            display: "flex",
            gap: "8px",
            border: "1px solid rgba(232,201,106,0.2)",
          }}
        >
          {/* Mini bronze bar */}
          <div
            style={{
              width: "2px",
              background: "linear-gradient(180deg, #e8c96a, #c9a227, #8b6520)",
              borderRadius: "2px",
              alignSelf: "stretch",
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Label */}
            <p
              style={{
                fontSize: "7px",
                color: "#c9a227",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              TathirQuran · Today
            </p>

            {/* Arabic */}
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "13px",
                color: "#fdfaf4",
                direction: "rtl",
                textAlign: "right",
                lineHeight: 1.6,
                marginBottom: "6px",
              }}
              lang="ar"
              dir="rtl"
            >
              {arabicShort}
            </p>

            {/* Translation */}
            {translationShort && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "9px",
                  color: "rgba(253,250,244,0.75)",
                  lineHeight: 1.5,
                  marginBottom: "6px",
                }}
              >
                {translationShort}
              </p>
            )}

            {/* Reference */}
            <p
              style={{
                fontSize: "7px",
                color: "#c9a227",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {surah.name_transliterated} {ayah.surah_number}:{ayah.ayah_number}
            </p>
          </div>
        </div>

        {/* Screen time / clock mock */}
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "9px",
            marginTop: "12px",
            letterSpacing: "0.06em",
          }}
        >
          Tap to open
        </p>
      </div>
    </div>
  );
}
