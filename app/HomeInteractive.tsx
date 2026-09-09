"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslationSelector from "@/components/TranslationSelector";
import TafsirPanel from "@/components/TafsirPanel";
import DownloadButtons from "@/components/DownloadButtons";
import ShareButton from "@/components/ShareButton";
import type { Language, TodayAyahResponse, Translation } from "@/types";

interface HomeInteractiveProps {
  initialData: TodayAyahResponse;
  languages: Language[];
  readableDate: string;
}

export default function HomeInteractive({
  initialData,
  languages,
  readableDate,
}: HomeInteractiveProps) {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedTranslationId, setSelectedTranslationId] = useState<number | null>(null);
  const [overrideTranslation, setOverrideTranslation] = useState<
    TodayAyahResponse["translation"] | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = async (code: string) => {
    setActiveLanguage(code);

    if (code === "en") {
      setOverrideTranslation(null);
      setTranslations([]);
      setSelectedTranslationId(null);
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

  function getAyahId(): string {
    return `${initialData.ayah.surah_number}-${initialData.ayah.ayah_number}`;
  }

  const displayTranslation = overrideTranslation ?? initialData.translation;
  const isUrdu = activeLanguage === "ur";
  const isRtlTranslation = ["ar", "fa", "ur"].includes(
    displayTranslation?.language_code ?? activeLanguage
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "28px 32px",
        justifyContent: "space-between",
        minHeight: "inherit",
      }}
    >
      {/* TOP — date + label */}
      <div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "9px",
            color: "#9a7830",
            letterSpacing: ".05em",
          }}
        >
          {readableDate}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            letterSpacing: ".18em",
            color: "rgba(201,162,39,.55)",
            textTransform: "uppercase",
            marginTop: "3px",
          }}
        >
          TODAY&apos;S AYAH
        </div>
      </div>

      {/* CENTER — translation + controls */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "12px",
          paddingTop: "24px",
          paddingBottom: "24px",
        }}
      >
        {/* Translation label */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            letterSpacing: ".16em",
            color: "#9a7830",
            textTransform: "uppercase",
          }}
        >
          TRANSLATION
        </div>

        {/* Translation text */}
        {displayTranslation ? (
          isUrdu ? (
            <p
              className="urdu-text"
              style={{ fontSize: "20px", color: "#1a1205" }}
              lang="ur"
              dir="rtl"
            >
              {displayTranslation.text}
            </p>
          ) : (
            <p
              className="translation-hero"
              style={{
                maxWidth: "420px",
                direction: isRtlTranslation ? "rtl" : "ltr",
              }}
              lang={displayTranslation.language_code}
            >
              &ldquo;{displayTranslation.text}&rdquo;
            </p>
          )
        ) : (
          <p
            className="translation-hero"
            style={{ color: "#7a6030" }}
          >
            Translation not yet available.
          </p>
        )}

        {/* Ornament */}
        <div
          aria-hidden="true"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <div
            style={{ width: "32px", height: "0.5px", background: "rgba(201,162,39,.35)" }}
          />
          <span style={{ color: "#c9a227", fontSize: "9px" }}>◆</span>
          <div
            style={{ width: "32px", height: "0.5px", background: "rgba(201,162,39,.35)" }}
          />
        </div>

        {/* Scholar name */}
        {displayTranslation?.scholar_name && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              color: "#c9a227",
              letterSpacing: ".08em",
            }}
          >
            {displayTranslation.scholar_name}
          </div>
        )}

        {/* Urdu coming-soon notice */}
        {isUrdu && (
          <div
            style={{
              paddingTop: "12px",
              borderTop: "0.5px solid rgba(201,162,39,.15)",
              maxWidth: "380px",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "#7a6030",
                lineHeight: 1.6,
              }}
            >
              Shia-verified Urdu translation coming soon. Permission requests sent
              to{" "}
              <span style={{ color: "#c9a227" }}>Allama Najafi</span>,{" "}
              <span style={{ color: "#c9a227" }}>Syed Jawadi</span>, and{" "}
              <span style={{ color: "#c9a227" }}>Maulana Farman Ali</span>.
            </p>
          </div>
        )}

        {/* Language section */}
        <div style={{ marginTop: "8px" }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "8px",
              letterSpacing: ".16em",
              color: "#9a7830",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            LANGUAGE
          </div>
          <LanguageSelector
            languages={languages}
            selectedCode={activeLanguage}
            onChange={handleLanguageChange}
          />
        </div>

        {/* Translation selector */}
        {translations.length > 1 && (
          <TranslationSelector
            translations={translations}
            selectedId={selectedTranslationId}
            onChange={handleTranslationChange}
          />
        )}

        {isPending && (
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              color: "#7a6030",
              letterSpacing: "0.06em",
            }}
          >
            Loading…
          </span>
        )}

        {/* Tafsir */}
        <div style={{ marginTop: "4px" }}>
          <TafsirPanel tafsir={initialData.tafsir} />
        </div>
      </div>

      {/* BOTTOM — downloads + nav */}
      <div>
        <DownloadButtons />
        <nav
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <Link href="/archive" className="footer-link">
            ARCHIVE
          </Link>
          <Link href="/about" className="footer-link">
            ABOUT
          </Link>
          <ShareButton
            surahNumber={initialData.ayah.surah_number}
            ayahNumber={initialData.ayah.ayah_number}
          />
        </nav>
      </div>
    </div>
  );
}
