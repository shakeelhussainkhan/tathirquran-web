import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — TathirQuran",
  description: "About TathirQuran — the first Shia-specific daily Quran app. Our mission, our scholars, and our translations.",
};

const SCHOLARS = [
  {
    name: "M.H. Shakir",
    lang: "English",
    status: "live" as const,
    description:
      "One of the most widely used Shia English translations of the Quran. Published by Tahrike Tarsile Quran. In the public domain.",
    note: null,
  },
  {
    name: "Muhammad Sarwar",
    lang: "English",
    status: "live" as const,
    description:
      "A scholarly Shia English translation known for its clarity and faithfulness to the Ahl al-Bayt tradition.",
    note: null,
  },
  {
    name: "Mahdi Ilahi Ghomshei",
    lang: "Persian (Farsi)",
    status: "live" as const,
    description:
      "The most beloved and widely-used Persian translation, by the eminent Iranian scholar Mahdi Ilahi Ghomshei. In the public domain.",
    note: null,
  },
  {
    name: "Allama Muhammad Hussain Najafi",
    lang: "Urdu",
    status: "pending" as const,
    description:
      "The definitive Shia Urdu translation — Tafsir-e-Namoona in Urdu. Published by Jamia Imamia Pakistan.",
    note: "Permission letter sent Sep 2026. Awaiting response from Jamia Imamia Pakistan.",
  },
  {
    name: "Syed Zeeshan Haider Jawadi",
    lang: "Urdu",
    status: "pending" as const,
    description:
      "Renowned Shia Urdu translator affiliated with Imamia Mission Lahore.",
    note: "Permission letter sent Sep 2026.",
  },
  {
    name: "Maulana Farman Ali",
    lang: "Urdu",
    status: "pending" as const,
    description:
      "Classical Shia Urdu translation. Contact made with estate/publisher.",
    note: "Permission letter sent to estate Sep 2026.",
  },
];

export default function AboutPage() {
  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "32px", paddingBottom: "12px" }}>
        <Link href="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none" }}>
          ← TathirQuran
        </Link>
        <span style={{ fontFamily: "'Amiri', serif", fontSize: "14px", color: "#c9a227" }} lang="ar" dir="rtl">تطهیر القرآن</span>
      </header>
      <div style={{ height: "0.5px", background: "linear-gradient(90deg, #e8c96a, #c9a227 40%, transparent)", marginBottom: "40px" }} aria-hidden="true" />

      {/* Title */}
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#0d0a04", fontWeight: 500, marginBottom: "8px" }}>
        About TathirQuran
      </h1>
      <p style={{ fontFamily: "'Amiri', serif", fontSize: "18px", color: "#7a6030", direction: "rtl", textAlign: "right", marginBottom: "36px" }} lang="ar" dir="rtl">
        تطهیر القرآن — طهّر صباحك بكلام الله
      </p>

      {/* Mission */}
      <section style={{ marginBottom: "48px" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: "#0d0a04", lineHeight: 1.65, marginBottom: "20px" }}>
          TathirQuran is the first Quran lock screen app built specifically for the
          Shia Ithna Ashari community.
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", color: "#2a1f08", lineHeight: 1.7, marginBottom: "16px" }}>
          Every major Quran app today — QuranWidget, Al-Quran, iQuran — uses Sunni
          translations. For the millions of Shia Muslims in the United States, Canada,
          the UK, and the South Asian diaspora, there is no daily Quran product that
          reflects their tradition, their scholars, or their interpretation.
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", color: "#2a1f08", lineHeight: 1.7 }}>
          TathirQuran fills that gap — delivering a verified Shia ayah each morning,
          directly on your phone&apos;s lock screen.
        </p>
      </section>

      {/* The Name */}
      <section style={{ marginBottom: "48px", paddingLeft: "16px", borderLeft: "3px solid", borderImage: "linear-gradient(180deg, #e8c96a, #c9a227, #8b6520) 1" }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>
          The Name
        </h2>
        <p style={{ fontFamily: "'Amiri', serif", fontSize: "22px", color: "#0d0a04", direction: "rtl", textAlign: "right", lineHeight: 1.8, marginBottom: "12px" }} lang="ar" dir="rtl">
          إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#2a1f08", lineHeight: 1.65, marginBottom: "8px" }}>
          &ldquo;Indeed, Allah intends only to remove impurity from you, O People of the
          Household, and to purify you with a thorough purification.&rdquo;
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#7a6030", letterSpacing: "0.10em", textTransform: "uppercase" }}>
          Quran 33:33 · Ayat al-Tathir
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", color: "#2a1f08", lineHeight: 1.65, marginTop: "14px" }}>
          The app is named after this verse — the Ayat al-Tathir — which speaks of
          purification (<span lang="ar" style={{ fontFamily: "'Amiri', serif" }}>تطهير</span>)
          and is one of the most significant verses in Shia theology, establishing the
          sanctity and authority of the Ahl al-Bayt (peace be upon them).
        </p>
      </section>

      {/* Scholars */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "24px", fontWeight: 600 }}>
          Scholar Translations
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {SCHOLARS.map((s) => (
            <div key={s.name} style={{ display: "flex", gap: 0, overflow: "hidden" }}>
              <div style={{
                width: "3px", flexShrink: 0,
                background: s.status === "live"
                  ? "linear-gradient(180deg, #e8c96a, #c9a227, #8b6520)"
                  : "rgba(201,162,39,0.25)",
              }} />
              <div style={{ flex: 1, paddingLeft: "14px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#0d0a04", fontWeight: 500 }}>
                    {s.name}
                  </h3>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: s.status === "live" ? "#c9a227" : "#7a6030", border: `1px solid ${s.status === "live" ? "rgba(201,162,39,0.4)" : "rgba(122,96,48,0.3)"}`, borderRadius: "2px", padding: "2px 6px" }}>
                    {s.lang} · {s.status === "live" ? "Live" : "Coming Soon"}
                  </span>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", color: "#2a1f08", lineHeight: 1.65, marginBottom: s.note ? "8px" : "0" }}>
                  {s.description}
                </p>
                {s.note && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#7a6030", letterSpacing: "0.04em", fontStyle: "italic" }}>
                    {s.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#c9a227", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>
          Contact & Partnership
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "#2a1f08", lineHeight: 1.65, marginBottom: "10px" }}>
          If you are a Shia scholar, institution, or publisher interested in partnering
          to make your translation available through TathirQuran, please reach out.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c9a227", letterSpacing: "0.08em" }}>
          tathirquran@gmail.com
        </p>
      </section>

      <div style={{ height: "0.5px", background: "linear-gradient(90deg, #e8c96a, rgba(201,162,39,0.2))", marginBottom: "24px" }} aria-hidden="true" />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#7a6030", letterSpacing: "0.06em", opacity: 0.7 }}>
        Sadaqah jariyah · Non-commercial · Built with care for the community
      </p>
    </main>
  );
}
