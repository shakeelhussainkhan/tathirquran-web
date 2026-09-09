"use client";

import { useState, useTransition } from "react";
import AyahCard from "@/components/AyahCard";
import LanguageSelector from "@/components/LanguageSelector";
import TranslationSelector from "@/components/TranslationSelector";
import type { Language, TodayAyahResponse, Translation, AyahTranslation } from "@/types";

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
      // Reset to default
      setOverrideTranslation(null);
      setTranslations([]);
      setSelectedTranslationId(null);
      return;
    }

    startTransition(async () => {
      try {
        // Fetch translations for this language and the ayah text
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

  // We don't have the ayah_id directly in TodayAyahResponse, but we can build it
  // by calling the API we already have. For now use a dummy approach — the API routes
  // below will join on surah/ayah numbers instead.
  function getAyahId(): string {
    return `${initialData.ayah.surah_number}-${initialData.ayah.ayah_number}`;
  }

  return (
    <div>
      <AyahCard
        data={initialData}
        activeLanguage={activeLanguage}
        overrideTranslation={overrideTranslation}
        label="Today"
      />

      <div style={{ marginTop: "20px" }}>
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
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              color: "#7a6030",
              marginTop: "8px",
              letterSpacing: "0.06em",
            }}
          >
            Loading translation…
          </p>
        )}
      </div>
    </div>
  );
}
