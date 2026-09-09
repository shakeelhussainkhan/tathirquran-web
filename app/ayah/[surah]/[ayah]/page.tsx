import { notFound } from "next/navigation";
import Link from "next/link";
import { getAyahPageData } from "@/lib/queries";
import { verseRef } from "@/lib/utils";
import ShareButton from "@/components/ShareButton";
import type { Metadata } from "next";

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
  const enText =
    data.translations.find(
      (t) => t.translation.language_code === "en" && t.translation.is_default
    )?.text ?? "";

  return {
    title: `${ref} — TathirQuran`,
    description: enText.slice(0, 160),
    openGraph: {
      title: `${ref} — TathirQuran`,
      description: enText.slice(0, 160),
      url: `https://tathirquran.com/ayah/${surahNum}/${ayahNum}`,
      siteName: "TathirQuran",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${ref} — TathirQuran`,
      description: enText.slice(0, 160),
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

  const enTranslation = translations.find(
    (t) => t.translation.language_code === "en" && t.translation.is_default
  );
  const otherTranslations = translations.filter(
    (t) => !(t.translation.language_code === "en" && t.translation.is_default)
  );

  const isRTL = (lang: string) =>
    lang === "ar" || lang === "fa" || lang === "ur";

  return (
    <main className="w4-page">
      {/* TOP GOLD BAR */}
      <div className="w4-gold-bar" />

      {/* HEADER */}
      <header className="w4-header">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c9a227",
          }}
        >
          TathirQuran
        </span>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "13px",
              color: "#c9a227",
              direction: "rtl",
            }}
            lang="ar"
            dir="rtl"
          >
            تطهير القرآن
          </span>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          flex: 1,
          maxWidth: "720px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 32px 64px",
        }}
      >
        {/* Back to today */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#c9a227",
              textDecoration: "none",
            }}
          >
            ← Today&apos;s Ayah
          </Link>
          <ShareButton surahNumber={surahNum} ayahNumber={ayahNum} />
        </div>

        {/* Surah label */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#7a6030",
            marginBottom: "24px",
          }}
        >
          {surahData.name_english}
          {surahData.revelation_type
            ? ` · ${surahData.revelation_type}`
            : ""}
        </p>

        {/* Arabic verse */}
        <p
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "38px",
            color: "#0d0a04",
            direction: "rtl",
            textAlign: "right",
            lineHeight: 1.8,
            marginBottom: "24px",
          }}
          lang="ar"
          dir="rtl"
        >
          {ayahData.arabic_uthmani}
        </p>

        {/* Ornament */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
          aria-hidden="true"
        >
          <div
            style={{
              width: "48px",
              height: "0.5px",
              background: "rgba(201,162,39,0.4)",
            }}
          />
          <span style={{ fontSize: "9px", color: "#c9a227" }}>◆</span>
          <div
            style={{
              width: "48px",
              height: "0.5px",
              background: "rgba(201,162,39,0.4)",
            }}
          />
        </div>

        {/* Primary translation */}
        {enTranslation && (
          <>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "20px",
                fontStyle: "italic",
                color: "#2a1f08",
                lineHeight: 1.7,
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              &ldquo;{enTranslation.text}&rdquo;
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#c9a227",
                textAlign: "center",
                marginBottom: "4px",
              }}
            >
              {ref}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                color: "#7a6030",
                textAlign: "center",
                marginBottom: "36px",
              }}
            >
              {enTranslation.translation.scholar_name}
            </p>
          </>
        )}

        {/* Other translations */}
        {otherTranslations.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7a6030",
                marginBottom: "16px",
              }}
            >
              More Translations
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {otherTranslations.map((t) => (
                <div
                  key={t.id}
                  style={{
                    paddingLeft: "14px",
                    borderLeft: "2px solid rgba(201,162,39,0.2)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: isRTL(t.translation.language_code)
                        ? "'Amiri', serif"
                        : "'Cormorant Garamond', serif",
                      fontSize: isRTL(t.translation.language_code) ? "18px" : "16px",
                      fontStyle: "italic",
                      color: "#2a1f08",
                      lineHeight: 1.8,
                      direction: isRTL(t.translation.language_code) ? "rtl" : "ltr",
                      textAlign: isRTL(t.translation.language_code) ? "right" : "left",
                      marginBottom: "6px",
                    }}
                    lang={t.translation.language_code}
                  >
                    {t.text}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      color: "#7a6030",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t.translation.scholar_name} ·{" "}
                    {t.translation.language_code.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tafsir */}
        {tafsir.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7a6030",
                marginBottom: "16px",
              }}
            >
              Tafsir
            </p>
            {tafsir.map((t) => (
              <div
                key={t.id}
                style={{
                  paddingLeft: "14px",
                  borderLeft: "2px solid rgba(201,162,39,0.3)",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px",
                    color: "#2a1f08",
                    lineHeight: 1.75,
                    marginBottom: "8px",
                  }}
                >
                  {t.text}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    color: "#7a6030",
                  }}
                >
                  — {t.scholar}
                  {t.source_book && `, ${t.source_book}`}
                  {t.volume && ` vol. ${t.volume}`}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "16px",
            borderTop: "0.5px solid rgba(201,162,39,0.15)",
            paddingTop: "20px",
          }}
        >
          {ayahNum > 1 && (
            <Link
              href={`/ayah/${surahNum}/${ayahNum - 1}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                color: "#c9a227",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              ← Previous
            </Link>
          )}
          <div style={{ flex: 1 }} />
          {surahData.ayah_count && ayahNum < surahData.ayah_count && (
            <Link
              href={`/ayah/${surahNum}/${ayahNum + 1}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                color: "#c9a227",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Next →
            </Link>
          )}
        </nav>
      </div>

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
