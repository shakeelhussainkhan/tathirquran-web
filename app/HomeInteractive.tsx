"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import TranslationSelector from "@/components/TranslationSelector";
import ShareButton from "@/components/ShareButton";
import TafsirPanel from "@/components/TafsirPanel";
import AudioPlayer from "@/components/AudioPlayer";
import NotifySignup from "@/components/NotifySignup";
import type { Language, TodayAyahResponse, Translation, Tafsir } from "@/types";

interface HomeInteractiveProps {
  initialData: TodayAyahResponse;
  languages: Language[];
  occasion?: { occasion: string; priority: number; ayah_id: number } | null;
}

export default function HomeInteractive({
  initialData,
  languages,
  occasion,
}: HomeInteractiveProps) {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedTranslationId, setSelectedTranslationId] = useState<
    number | null
  >(null);
  const [overrideTranslation, setOverrideTranslation] = useState<
    TodayAyahResponse["translation"] | null
  >(null);
  const [overrideTafsirEntries, setOverrideTafsirEntries] = useState<Tafsir[] | null>(null);
  const [attributionText, setAttributionText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getAyahId(): string {
    return `${initialData.ayah.surah_number}-${initialData.ayah.ayah_number}`;
  }

  const handleLangChange = async (code: string) => {
    setActiveLanguage(code);

    if (code === "en") {
      setOverrideTranslation(null);
      setOverrideTafsirEntries(null);
      setTranslations([]);
      setSelectedTranslationId(null);
      setAttributionText(null);
      return;
    }

    startTransition(async () => {
      try {
        const [transRes, ayahRes] = await Promise.all([
          fetch(`/api/languages/${code}/translations`),
          fetch(`/api/ayah-translation?ayah_id=${getAyahId()}&language=${code}`),
        ]);

        const trans: Translation[] = transRes.ok ? await transRes.json() : [];
        setTranslations(trans);

        if (trans.length > 0) {
          const defaultTrans = trans.find((t) => t.is_default) ?? trans[0];
          setSelectedTranslationId(defaultTrans.translation_id);
          setAttributionText(defaultTrans.attribution_text ?? null);

          const ayahData = ayahRes.ok ? await ayahRes.json() : null;
          if (ayahData?.text) {
            setOverrideTranslation({
              text: ayahData.text,
              scholar_name: defaultTrans.scholar_name,
              language_code: code,
            });
          } else {
            setOverrideTranslation(null);
          }
        }
      } catch {
        setOverrideTranslation(null);
      }
    });
  };

  const handleTranslationChange = async (id: number) => {
    setSelectedTranslationId(id);
    const trans = translations.find((t) => t.translation_id === id);
    if (!trans) return;
    setAttributionText(trans.attribution_text ?? null);

    try {
      const res = await fetch(
        `/api/ayah-translation?ayah_id=${getAyahId()}&translation_id=${id}`
      );
      const data = res.ok ? await res.json() : null;
      if (data?.text) {
        setOverrideTranslation({
          text: data.text,
          scholar_name: trans.scholar_name,
          language_code: trans.language_code,
        });
      }
    } catch {
      // keep current
    }
  };

  const displayTranslation = overrideTranslation ?? initialData.translation;
  const isUrdu = activeLanguage === "ur";
  const isRtlTranslation = ["ar", "fa", "ur"].includes(
    displayTranslation?.language_code ?? activeLanguage
  );

  const { ayah, surah, tafsirEntries } = initialData;
  const currentTafsirEntries = overrideTafsirEntries ?? tafsirEntries;

  return (
    <>
      {/* Islamic occasion banner */}
      {occasion && (
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#c9a227",
            padding: "6px 20px",
            textAlign: "center",
            width: "100%",
          }}
        >
          ☪ {occasion.occasion}
        </div>
      )}

      {/* HERO — verse centred on parchment */}
      <section className="w4-hero">
        {/* Islamic geometric watermark */}
        <svg
          className="w4-watermark"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon
            points="250,10 480,135 480,365 250,490 20,365 20,135"
            stroke="#8b6520"
            strokeWidth="1.2"
            fill="none"
          />
          <polygon
            points="250,45 445,158 445,342 250,455 55,342 55,158"
            stroke="#8b6520"
            strokeWidth="0.8"
            fill="none"
          />
          <polygon
            points="250,30 275,110 355,70 330,148 415,150 355,205 415,260 330,260 355,340 275,298 250,378 225,298 145,340 170,260 85,260 145,205 85,150 170,148 145,70 225,110"
            stroke="#8b6520"
            strokeWidth="0.6"
            fill="none"
            opacity="0.7"
          />
          <circle cx="250" cy="250" r="190" stroke="#8b6520" strokeWidth="0.6" fill="none" />
          <circle cx="250" cy="250" r="140" stroke="#8b6520" strokeWidth="0.5" fill="none" />
          <circle cx="250" cy="250" r="90" stroke="#8b6520" strokeWidth="0.4" fill="none" />
          <circle cx="250" cy="250" r="40" stroke="#8b6520" strokeWidth="0.4" fill="none" />
          <polygon
            points="250,110 269,194 355,170 295,234 355,298 269,274 250,358 231,274 145,298 205,234 145,170 231,194"
            stroke="#8b6520"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <line x1="250" y1="10" x2="250" y2="490" stroke="#8b6520" strokeWidth="0.3" opacity="0.4" />
          <line x1="10" y1="250" x2="490" y2="250" stroke="#8b6520" strokeWidth="0.3" opacity="0.4" />
          <line x1="80" y1="80" x2="420" y2="420" stroke="#8b6520" strokeWidth="0.3" opacity="0.3" />
          <line x1="420" y1="80" x2="80" y2="420" stroke="#8b6520" strokeWidth="0.3" opacity="0.3" />
        </svg>

        {/* Verse content */}
        <div className="w4-verse-content">
          {/* Bismillah */}
          <div className="w4-bismillah" lang="ar" dir="rtl">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>

          {/* Arabic verse */}
          <p className="w4-arabic" lang="ar" dir="rtl">
            {ayah.arabic_uthmani}
          </p>

          {/* Ornament */}
          <div className="w4-ornament" aria-hidden="true">
            <div className="w4-ornament-line" />
            <span className="w4-ornament-diamond">◆</span>
            <div className="w4-ornament-line" />
          </div>

          {/* Translation */}
          {displayTranslation ? (
            isUrdu ? (
              <p
                className="urdu-text"
                style={{ fontSize: "22px", color: "#1a1205" }}
                lang="ur"
                dir="rtl"
              >
                {displayTranslation.text}
              </p>
            ) : (
              <p
                className="w4-translation"
                style={{ direction: isRtlTranslation ? "rtl" : "ltr" }}
                lang={displayTranslation.language_code}
              >
                &ldquo;{displayTranslation.text}&rdquo;
              </p>
            )
          ) : (
            <p className="w4-translation" style={{ color: "#7a6030" }}>
              Translation not yet available.
            </p>
          )}

          {/* Verse reference */}
          <div className="w4-ref">
            {surah.name_english} · {ayah.surah_number}:{ayah.ayah_number}
          </div>
          {displayTranslation?.scholar_name && (
            <div className="w4-scholar">
              {displayTranslation.scholar_name}
            </div>
          )}

          {attributionText && (
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                color: "#c9a227",
                textAlign: "center",
                marginTop: "4px",
                letterSpacing: "0.03em",
              }}
            >
              {attributionText}
            </div>
          )}

          {/* Audio player */}
          <div style={{ marginTop: "16px" }}>
            <AudioPlayer
              surahNumber={ayah.surah_number}
              ayahNumber={ayah.ayah_number}
            />
          </div>

          {isPending && (
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                color: "#9a7830",
                letterSpacing: "0.06em",
                marginTop: "8px",
              }}
            >
              Loading…
            </div>
          )}
        </div>
      </section>

      {/* CONTROLS */}
      <div className="w4-controls">
        {/* Language row */}
        <div className="w4-lang-row">
          <span className="w4-lang-label">Language</span>
          <div className="w4-pills">
            {languages.map((lang) => {
              const isSoon =
                lang.launch_status === "beta" ||
                lang.launch_status === "pending";
              const isActive = activeLanguage === lang.language_code;
              return (
                <button
                  key={lang.language_code}
                  className={isActive ? "w4-pill-active" : "w4-pill-inactive"}
                  onClick={() => !isSoon && handleLangChange(lang.language_code)}
                  disabled={isSoon}
                  style={{
                    opacity: isSoon ? 0.7 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {lang.language_name}
                  {isSoon && (
                    <sup
                      style={{
                        fontSize: "7px",
                        color: isActive ? "#fff" : "#c9a227",
                        marginLeft: "3px",
                      }}
                    >
                      SOON
                    </sup>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Translation selector — when multiple available */}
        {translations.length > 1 && (
          <TranslationSelector
            translations={translations}
            selectedId={selectedTranslationId}
            onChange={handleTranslationChange}
          />
        )}

        {/* Tafsir panel */}
        <TafsirPanel tafsirEntries={currentTafsirEntries} />

        {/* Bottom row */}
        <div className="w4-bottom-row">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href="https://apps.apple.com/app/tathirquran/id6811745113"
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(201,162,39,0.55)",
                  border: "0.5px solid rgba(201,162,39,0.25)",
                  padding: "5px 14px",
                  borderRadius: "2px",
                  display: "inline-block",
                }}>
                  ⬡ App Store — Coming Soon
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.fivesllc.tathirquran"
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(201,162,39,0.55)",
                  border: "0.5px solid rgba(201,162,39,0.25)",
                  padding: "5px 14px",
                  borderRadius: "2px",
                  display: "inline-block",
                }}>
                  ⬡ Google Play — Coming Soon
                </div>
              </a>
            </div>
            <NotifySignup />
          </div>
          <div className="w4-links">
            <Link href="/archive" className="w4-link">
              Archive
            </Link>
            <Link href="/about" className="w4-link">
              About
            </Link>
            <Link href="/privacy" className="w4-link">
              Privacy
            </Link>
            <Link href="/terms" className="w4-link">
              Terms
            </Link>
            <ShareButton
              surahNumber={ayah.surah_number}
              ayahNumber={ayah.ayah_number}
              arabicText={ayah.arabic_uthmani}
              translationText={displayTranslation?.text}
            />
          </div>
        </div>
      </div>
    </>
  );
}
