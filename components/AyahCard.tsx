"use client";

import BronzeBar from "@/components/BronzeBar";
import { verseRef, verseRefArabic } from "@/lib/utils";
import type { TodayAyahResponse } from "@/types";

interface AyahCardProps {
  data: TodayAyahResponse;
  /** Language code for currently selected translation */
  activeLanguage?: string;
  /** Override translation text (from language selector) */
  overrideTranslation?: { text: string; scholar_name: string; language_code: string } | null;
  /** Label shown above the card (e.g. "Today" or a date) */
  label?: string;
}

export default function AyahCard({
  data,
  activeLanguage = "en",
  overrideTranslation,
  label,
}: AyahCardProps) {
  const { ayah, surah, translation } = data;
  const displayTranslation = overrideTranslation ?? translation;

  const isUrdu = activeLanguage === "ur";
  const isRtlTranslation = ["ar", "fa", "ur"].includes(
    displayTranslation?.language_code ?? activeLanguage
  );

  const ref = verseRef(
    surah.name_transliterated,
    ayah.surah_number,
    ayah.ayah_number
  );
  const refArabic = verseRefArabic(
    surah.name_arabic,
    ayah.surah_number,
    ayah.ayah_number
  );

  return (
    <article
      style={{
        backgroundColor: "#fdfaf4",
        border: "1px solid rgba(201,162,39,0.18)",
        display: "flex",
        gap: 0,
        overflow: "hidden",
        borderRadius: "2px",
        boxShadow: "0 1px 3px rgba(13,10,4,0.06), 0 4px 16px rgba(201,162,39,0.08)",
      }}
    >
      {/* 3px bronze gradient bar — visual signature */}
      <BronzeBar />

      {/* Card body */}
      <div style={{ flex: 1, padding: "28px 28px 24px 24px" }}>
        {/* Top label */}
        {label && (
          <p
            className="ui-label"
            style={{
              fontSize: "10px",
              color: "#c9a227",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            {label}
          </p>
        )}

        {/* Arabic text */}
        <p
          className="arabic-text"
          style={{
            fontSize: "28px",
            color: "#0d0a04",
            marginBottom: "16px",
            fontWeight: 400,
          }}
          lang="ar"
          dir="rtl"
        >
          {ayah.arabic_uthmani}
        </p>

        {/* Bronze rule — 22px wide, below Arabic */}
        <div
          style={{
            width: "22px",
            height: "1px",
            background: "linear-gradient(90deg, #e8c96a, #8b6520)",
            marginBottom: "14px",
            marginLeft: "auto",
          }}
          aria-hidden="true"
        />

        {/* Translation */}
        {displayTranslation ? (
          <div style={{ marginBottom: "16px" }}>
            {isUrdu ? (
              <>
                {/* Urdu in Nastaliq */}
                <p
                  className="urdu-text"
                  style={{
                    fontSize: "18px",
                    color: "#2a1f08",
                    marginBottom: "12px",
                  }}
                  lang="ur"
                  dir="rtl"
                >
                  {displayTranslation.text}
                </p>
                {/* Secondary English translation (always visible for Urdu view) */}
                {translation && translation.language_code !== "ur" && (
                  <p
                    className="translation-text"
                    style={{
                      fontSize: "14px",
                      color: "#7a6030",
                      lineHeight: 1.65,
                    }}
                    lang="en"
                  >
                    {translation.text}
                  </p>
                )}
              </>
            ) : (
              <p
                className="translation-text"
                style={{
                  fontSize: "16px",
                  color: "#2a1f08",
                  direction: isRtlTranslation ? "rtl" : "ltr",
                  textAlign: isRtlTranslation ? "right" : "left",
                }}
                lang={displayTranslation.language_code}
              >
                {displayTranslation.text}
              </p>
            )}
          </div>
        ) : (
          <p
            style={{
              fontSize: "14px",
              color: "#7a6030",
              fontStyle: "italic",
              fontFamily: "'Cormorant Garamond', serif",
              marginBottom: "16px",
            }}
          >
            Translation not yet available.
          </p>
        )}

        {/* Surah reference */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            className="ui-label"
            style={{
              fontSize: "10px",
              color: "#c9a227",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {ref}
          </span>
          <span
            className="arabic-text"
            style={{
              fontSize: "12px",
              color: "#7a6030",
              lineHeight: 1,
            }}
            lang="ar"
            dir="rtl"
          >
            {refArabic}
          </span>
          {displayTranslation?.scholar_name && (
            <span
              className="ui-label"
              style={{
                fontSize: "10px",
                color: "#7a6030",
                letterSpacing: "0.06em",
              }}
            >
              — {displayTranslation.scholar_name}
            </span>
          )}
        </div>

        {/* Urdu coming-soon notice */}
        {isUrdu && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(201,162,39,0.15)",
            }}
          >
            <p
              className="arabic-text"
              style={{
                fontSize: "13px",
                color: "#8b6520",
                marginBottom: "4px",
                fontWeight: 400,
              }}
              lang="ur"
              dir="rtl"
            >
              اردو ترجمہ — علمائے شیعہ کی اجازت زیر التوا
            </p>
            <p
              className="ui-label"
              style={{ fontSize: "11px", color: "#7a6030", lineHeight: 1.6 }}
            >
              Shia-verified Urdu translation coming soon. Permission requests
              sent to{" "}
              <span style={{ color: "#c9a227" }}>Allama Najafi</span>,{" "}
              <span style={{ color: "#c9a227" }}>Syed Jawadi</span>, and{" "}
              <span style={{ color: "#c9a227" }}>Maulana Farman Ali</span>.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
