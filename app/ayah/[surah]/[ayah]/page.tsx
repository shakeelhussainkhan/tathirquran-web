import { notFound } from "next/navigation";
import Link from "next/link";
import { getAyahPageData } from "@/lib/queries";
import { verseRef, gregorianToHijriString } from "@/lib/utils";
import type { Metadata } from "next";
import BronzeBar from "@/components/BronzeBar";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ surah: string; ayah: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah, ayah } = await params;
  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);
  const data = await getAyahPageData(surahNum, ayahNum);
  if (!data) return { title: "Ayah not found — TathirQuran" };

  const ref = verseRef(data.surah.name_transliterated, surahNum, ayahNum);
  const translationText =
    data.translations.find((t) => t.translation.language_code === "en")?.text ?? "";

  return {
    title: `${ref} — TathirQuran`,
    description: translationText.slice(0, 160),
    openGraph: {
      title: `${ref} — TathirQuran`,
      description: translationText.slice(0, 160),
    },
  };
}

export default async function AyahPage({ params }: Props) {
  const { surah, ayah } = await params;
  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);

  if (isNaN(surahNum) || isNaN(ayahNum)) notFound();

  const data = await getAyahPageData(surahNum, ayahNum);
  if (!data) notFound();

  const { ayah: ayahData, surah: surahData, translations, tafsir } = data;
  const ref = verseRef(surahData.name_transliterated, surahNum, ayahNum);

  // English Shakir translation
  const enTranslation = translations.find(
    (t) => t.translation.language_code === "en" && t.translation.is_default
  );

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 64px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "32px", paddingBottom: "12px" }}>
        <Link
          href="/"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}
        >
          ← TathirQuran
        </Link>
        <span style={{ fontFamily: "'Amiri', serif", fontSize: "14px", color: "#c9a227" }} lang="ar" dir="rtl">
          تطهیر القرآن
        </span>
      </header>
      <div style={{ height: "0.5px", background: "linear-gradient(90deg, #e8c96a, #c9a227 40%, transparent)", marginBottom: "40px" }} aria-hidden="true" />

      {/* Ayah card */}
      <article style={{ backgroundColor: "#fdfaf4", border: "1px solid rgba(201,162,39,0.18)", display: "flex", gap: 0, overflow: "hidden", borderRadius: "2px", boxShadow: "0 1px 3px rgba(13,10,4,0.06), 0 4px 16px rgba(201,162,39,0.08)" }}>
        <BronzeBar />
        <div style={{ flex: 1, padding: "28px 28px 24px 24px" }}>
          <p className="ui-label" style={{ fontSize: "10px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "20px", fontWeight: 500 }}>
            {surahData.name_english} · {surahData.revelation_type ?? ""}
          </p>
          <p className="arabic-text" style={{ fontSize: "30px", color: "#0d0a04", marginBottom: "16px" }} lang="ar" dir="rtl">
            {ayahData.arabic_uthmani}
          </p>
          <div style={{ width: "22px", height: "1px", background: "linear-gradient(90deg, #e8c96a, #8b6520)", marginBottom: "14px", marginLeft: "auto" }} aria-hidden="true" />
          {enTranslation && (
            <p className="translation-text" style={{ fontSize: "17px", color: "#2a1f08", marginBottom: "16px" }}>
              {enTranslation.text}
            </p>
          )}
          <p className="ui-label" style={{ fontSize: "10px", color: "#c9a227", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {ref}
            {enTranslation && (
              <span style={{ color: "#7a6030", letterSpacing: "0.06em", textTransform: "none", marginLeft: "8px" }}>
                — {enTranslation.translation.scholar_name}
              </span>
            )}
          </p>
        </div>
      </article>

      {/* All translations */}
      {translations.length > 1 && (
        <section style={{ marginTop: "32px" }}>
          <p className="ui-label" style={{ fontSize: "10px", color: "#7a6030", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 500 }}>
            Available Translations
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {translations.map((t) => (
              <div key={t.id} style={{ paddingLeft: "12px", borderLeft: "2px solid rgba(201,162,39,0.2)" }}>
                <p className="translation-text" style={{ fontSize: "15px", color: "#2a1f08", marginBottom: "6px", direction: t.translation.language_code === "ar" || t.translation.language_code === "fa" || t.translation.language_code === "ur" ? "rtl" : "ltr" }} lang={t.translation.language_code}>
                  {t.text}
                </p>
                <p className="ui-label" style={{ fontSize: "10px", color: "#7a6030", letterSpacing: "0.06em" }}>
                  {t.translation.scholar_name} · {t.translation.language_code.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tafsir */}
      {tafsir.length > 0 && (
        <section style={{ marginTop: "32px" }}>
          <p className="ui-label" style={{ fontSize: "10px", color: "#7a6030", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 500 }}>
            Tafsir
          </p>
          {tafsir.map((t) => (
            <div key={t.id} style={{ paddingLeft: "12px", borderLeft: "2px solid rgba(201,162,39,0.3)", marginBottom: "16px" }}>
              <p className="translation-text" style={{ fontSize: "15px", color: "#2a1f08", lineHeight: 1.75 }}>{t.text}</p>
              <p className="ui-label" style={{ marginTop: "8px", fontSize: "10px", color: "#7a6030" }}>
                — {t.scholar}{t.source_book && `, ${t.source_book}`}{t.volume && ` vol. ${t.volume}`}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Navigation */}
      <nav style={{ marginTop: "40px", display: "flex", gap: "16px" }}>
        {ayahNum > 1 && (
          <Link href={`/ayah/${surahNum}/${ayahNum - 1}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#c9a227", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
            ← Previous
          </Link>
        )}
        {ayahNum < surahData.ayah_count && (
          <Link href={`/ayah/${surahNum}/${ayahNum + 1}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#c9a227", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
            Next →
          </Link>
        )}
      </nav>
    </main>
  );
}
