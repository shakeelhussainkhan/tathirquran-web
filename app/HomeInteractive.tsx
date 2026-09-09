"use client";

import { useState, useTransition } from "react";
import AyahCard from "@/components/AyahCard";
import LanguageSelector from "@/components/LanguageSelector";
import TranslationSelector from "@/components/TranslationSelector";
import TafsirPanel from "@/components/TafsirPanel";
import type { Language, TodayAyahResponse, Translation } from "@/types";

interface HomeInteractiveProps {
  initialData: TodayAyahResponse;
  languages: Language[];
}

export default function HomeInteractive({
  initialData,
  languages,
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

  return (
    <>
      {/* Hero — verse floats on parchment */}
      <section className="tq-hero">
        <AyahCard
          data={initialData}
          activeLanguage={activeLanguage}
          overrideTranslation={overrideTranslation}
        />
      </section>

      {/* Language + translation selector */}
      <div className="tq-selectors">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "9px",
            letterSpacing: ".15em",
            color: "#9a7830",
            textTransform: "uppercase",
          }}
        >
          Translation
        </span>
        <LanguageSelector
          languages={languages}
          selectedCode={activeLanguage}
          onChange={handleLanguageChange}
        />
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
      </div>

      {/* Tafsir */}
      <div className="tq-tafsir-wrap">
        <TafsirPanel tafsir={initialData.tafsir} />
      </div>
    </>
  );
}
