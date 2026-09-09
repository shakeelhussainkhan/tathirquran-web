"use client";

import { verseRef } from "@/lib/utils";
import type { TodayAyahResponse } from "@/types";

interface AyahCardProps {
  data: TodayAyahResponse;
  activeLanguage?: string;
  overrideTranslation?: { text: string; scholar_name: string; language_code: string } | null;
}

export default function AyahCard({
  data,
  activeLanguage = "en",
  overrideTranslation,
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

  const scholarPart = displayTranslation?.scholar_name
    ? ` · ${displayTranslation.scholar_name}`
    : "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
      }}
    >
      {/* Bismillah */}
      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: "16px",
          color: "rgba(201,162,39,.7)",
          direction: "rtl",
          textAlign: "center",
          marginBottom: "8px",
        }}
        lang="ar"
        dir="rtl"
      >
        بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
      </div>

      {/* Arabic verse */}
      <p className="arabic-verse" lang="ar" dir="rtl">
        {ayah.arabic_uthmani}
      </p>

      {/* Ornament divider */}
      <div className="ornament-divider" aria-hidden="true">
        <div
          style={{
            width: "40px",
            height: "0.5px",
            background: "rgba(201,162,39,.4)",
          }}
        />
        <span style={{ color: "#c9a227", fontSize: "8px" }}>◆</span>
        <div
          style={{
            width: "40px",
            height: "0.5px",
            background: "rgba(201,162,39,.4)",
          }}
        />
      </div>

      {/* Translation */}
      {displayTranslation ? (
        isUrdu ? (
          <div style={{ textAlign: "center" }}>
            <p
              className="urdu-text"
              style={{ fontSize: "20px", color: "#2a1f08", marginBottom: "12px" }}
              lang="ur"
              dir="rtl"
            >
              {displayTranslation.text}
            </p>
            {translation && translation.language_code !== "ur" && (
              <p
                className="translation-text"
                style={{ fontSize: "16px", color: "#7a6030", maxWidth: "600px" }}
                lang="en"
              >
                &ldquo;{translation.text}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <p
            className="translation-text"
            style={{
              maxWidth: "600px",
              direction: isRtlTranslation ? "rtl" : "ltr",
            }}
            lang={displayTranslation.language_code}
          >
            &ldquo;{displayTranslation.text}&rdquo;
          </p>
        )
      ) : (
        <p
          className="translation-text"
          style={{ color: "#7a6030", maxWidth: "600px" }}
        >
          Translation not yet available.
        </p>
      )}

      {/* Reference */}
      <p className="verse-ref">
        {ref}
        {scholarPart}
      </p>

      {/* Urdu coming-soon notice */}
      {isUrdu && (
        <div
          style={{
            textAlign: "center",
            marginTop: "4px",
            paddingTop: "16px",
            borderTop: "0.5px solid rgba(201,162,39,.15)",
            maxWidth: "480px",
          }}
        >
          <p
            className="arabic-text"
            style={{
              fontSize: "13px",
              color: "#8b6520",
              marginBottom: "4px",
              textAlign: "center",
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
            Shia-verified Urdu translation coming soon. Permission requests sent
            to{" "}
            <span style={{ color: "#c9a227" }}>Allama Najafi</span>,{" "}
            <span style={{ color: "#c9a227" }}>Syed Jawadi</span>, and{" "}
            <span style={{ color: "#c9a227" }}>Maulana Farman Ali</span>.
          </p>
        </div>
      )}
    </div>
  );
}
