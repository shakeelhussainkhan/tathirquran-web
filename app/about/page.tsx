import Link from "next/link";
import type { Metadata } from "next";
import LockScreenPreview from "@/components/LockScreenPreview";
import type { TodayAyahResponse } from "@/types";
import { gregorianToHijriString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About — TathirQuran",
  description:
    "About TathirQuran — the first Shia-specific daily Quran app. Our mission, our scholars, and our translations.",
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

const WIDGET_EXAMPLE: TodayAyahResponse = {
  date: "2026-09-09",
  hijri_date: "15 Rabi al-Awwal 1448 AH",
  ayah: {
    surah_number: 33,
    ayah_number: 33,
    arabic_uthmani:
      "إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا",
    transliteration: null,
  },
  surah: {
    name_arabic: "الأحزاب",
    name_english: "The Combined Forces",
    name_transliterated: "Al-Ahzab",
  },
  translation: {
    text: "Indeed, Allah intends only to remove impurity from you, O People of the Household, and to purify you with a thorough purification.",
    scholar_name: "M.H. Shakir",
    language_code: "en",
  },
  tafsirEntries: [],
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "9px",
        color: "#c9a227",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: "16px",
        fontWeight: 600,
      }}
    >
      {children}
    </h2>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: "0.5px",
        background:
          "linear-gradient(90deg, rgba(201,162,39,0.4), rgba(201,162,39,0.1) 80%, transparent)",
        margin: "36px 0",
      }}
      aria-hidden="true"
    />
  );
}

export default function AboutPage() {
  const today = new Date();
  const gregorianDate = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hijriDate = gregorianToHijriString(today);

  return (
    <main className="w4-page">
      {/* TOP GOLD BAR */}
      <div className="w4-gold-bar" />

      {/* HEADER */}
      <header className="w4-header" style={{ padding: "14px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/apple-icon.png"
            alt="TathirQuran"
            className="tq-header-icon"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              objectFit: "cover",
              objectPosition: "center top",
              border: "0.5px solid rgba(139,101,32,0.4)",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c9a227",
                lineHeight: 1,
              }}
            >
              TathirQuran
            </span>
            <span
              style={{
                fontFamily: "Amiri, serif",
                fontSize: "14px",
                color: "rgba(201,162,39,0.75)",
                lineHeight: 1.2,
                direction: "rtl",
              }}
            >
              تطهير القرآن
            </span>
          </div>
        </div>
        <div
          className="tq-header-dates"
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              color: "#9a7830",
              letterSpacing: "0.04em",
            }}
          >
            {gregorianDate}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              color: "rgba(201,162,39,0.65)",
              letterSpacing: "0.04em",
            }}
          >
            {hijriDate}
          </span>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          flex: 1,
          maxWidth: "680px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 32px 80px",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c9a227",
            textDecoration: "none",
            marginBottom: "28px",
          }}
        >
          ← Back to Today
        </Link>

        {/* 1. About TathirQuran */}
        <section style={{ marginBottom: "0" }}>
          <SectionLabel>About TathirQuran</SectionLabel>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "32px",
              fontWeight: 400,
              color: "#0d0a04",
              marginBottom: "16px",
            }}
          >
            Daily Quran. Shia Verified.
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "17px",
              color: "#2a1f08",
              lineHeight: 1.75,
              marginBottom: "20px",
            }}
          >
            TathirQuran delivers one verse of the Holy Quran each day — with
            translations specifically selected from Shia scholars and reviewed
            for authenticity. Start every morning with the Word of Allah.
          </p>

          {/* Ayah of Purification */}
          <div
            style={{
              background: "rgba(201,162,39,0.05)",
              border: "0.5px solid rgba(201,162,39,0.2)",
              borderRadius: "2px",
              padding: "24px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "26px",
                color: "#0d0a04",
                direction: "rtl",
                textAlign: "center",
                lineHeight: 1.8,
                marginBottom: "14px",
              }}
              lang="ar"
              dir="rtl"
            >
              إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ
              الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent: "center",
                margin: "14px 0",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "0.5px",
                  background: "rgba(201,162,39,0.5)",
                }}
              />
              <span style={{ fontSize: "9px", color: "#c9a227" }}>◆</span>
              <div
                style={{
                  width: "40px",
                  height: "0.5px",
                  background: "rgba(201,162,39,0.5)",
                }}
              />
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "16px",
                fontStyle: "italic",
                color: "#2a1f08",
                textAlign: "center",
                lineHeight: 1.7,
                marginBottom: "8px",
              }}
            >
              &ldquo;Indeed, Allah intends only to remove impurity from you, O
              People of the Household, and to purify you with a thorough
              purification.&rdquo;
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                color: "#c9a227",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Surah Al-Ahzab 33:33
            </p>
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              color: "#2a1f08",
              lineHeight: 1.75,
            }}
          >
            This verse — the Ayah of Purification (آية التطهير) — is the
            spiritual foundation of TathirQuran. It affirms the divine
            selection of the Ahlul Bayt (AS) and is the reason this app
            exists.
          </p>
        </section>

        <Divider />

        {/* 2. The Name */}
        <section>
          <SectionLabel>The Name</SectionLabel>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "17px",
              color: "#2a1f08",
              lineHeight: 1.75,
              marginBottom: "12px",
            }}
          >
            <strong style={{ color: "#0d0a04" }}>Tathir (تطهير)</strong> means
            purification in Arabic — specifically the divine, thorough
            purification mentioned in the Ayah above. It is the gerund of the
            root ط‌ه‌ر (ṭahara), meaning to be pure or clean.
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "17px",
              color: "#2a1f08",
              lineHeight: 1.75,
            }}
          >
            This name connects every daily verse to the legacy of the Ahlul
            Bayt (AS): Imam Ali, Lady Fatimah, Imam Hasan, and Imam Husayn
            (peace be upon them all) — whose purified character the Quran
            itself attests to.
          </p>
        </section>

        <Divider />

        {/* 3. Translations */}
        <section>
          <SectionLabel>Translations</SectionLabel>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {SCHOLARS.map((s) => (
              <div
                key={s.name}
                style={{ display: "flex", gap: 0, overflow: "hidden" }}
              >
                <div
                  style={{
                    width: "3px",
                    flexShrink: 0,
                    background:
                      s.status === "live"
                        ? "linear-gradient(180deg, #e8c96a, #c9a227, #8b6520)"
                        : "rgba(201,162,39,0.25)",
                  }}
                />
                <div style={{ flex: 1, paddingLeft: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "6px",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "18px",
                        color: "#0d0a04",
                        fontWeight: 500,
                      }}
                    >
                      {s.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "9px",
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        color: s.status === "live" ? "#c9a227" : "#7a6030",
                        border: `1px solid ${s.status === "live" ? "rgba(201,162,39,0.4)" : "rgba(122,96,48,0.3)"}`,
                        borderRadius: "2px",
                        padding: "2px 6px",
                      }}
                    >
                      {s.lang} ·{" "}
                      {s.status === "live" ? "✓ Verified" : "⏳ Permission Pending"}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "15px",
                      color: "#2a1f08",
                      lineHeight: 1.65,
                      marginBottom: s.note ? "8px" : "0",
                    }}
                  >
                    {s.description}
                  </p>
                  {s.note && (
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        color: "#7a6030",
                        letterSpacing: "0.04em",
                        fontStyle: "italic",
                      }}
                    >
                      {s.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* 3B. Scholars & Translations Table */}
        <section>
          <SectionLabel>Scholars &amp; Translations</SectionLabel>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#8b6520",
                    color: "#faf5e9",
                  }}
                >
                  <th style={{ padding: "10px 12px", textAlign: "left", letterSpacing: "0.06em", fontWeight: 500 }}>Language</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", letterSpacing: "0.06em", fontWeight: 500 }}>Scholar</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", letterSpacing: "0.06em", fontWeight: 500 }}>School</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", letterSpacing: "0.06em", fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { lang: "English", scholar: "M.H. Shakir", school: "Shia Ithna Ashari", status: "✓ Live", live: true },
                  { lang: "English", scholar: "Muhammad Sarwar", school: "Shia Ithna Ashari", status: "✓ Live", live: true },
                  { lang: "Persian", scholar: "Mahdi Ilahi Ghomshei", school: "Iranian Shia", status: "✓ Live", live: true },
                  { lang: "Urdu", scholar: "Allama M.H. Najafi (RA)", school: "Shia Ithna Ashari", status: "⏳ Permission requested", live: false },
                  { lang: "Urdu", scholar: "Syed Z.H. Jawadi (RA)", school: "Shia Ithna Ashari", status: "⏳ Permission requested", live: false },
                  { lang: "Urdu", scholar: "Maulana Farman Ali (RA)", school: "Shia Ithna Ashari", status: "⏳ Permission requested", live: false },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "#faf5e9" : "rgba(201,162,39,0.05)",
                      borderBottom: "0.5px solid rgba(201,162,39,0.15)",
                    }}
                  >
                    <td style={{ padding: "10px 12px", color: "#2a1f08" }}>{row.lang}</td>
                    <td style={{ padding: "10px 12px", color: "#0d0a04" }}>{row.scholar}</td>
                    <td style={{ padding: "10px 12px", color: "#7a6030" }}>{row.school}</td>
                    <td style={{ padding: "10px 12px", color: row.live ? "#c9a227" : "#9a7830" }}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Divider />

        {/* 3C. Coming Soon */}
        <section>
          <SectionLabel>Coming Soon</SectionLabel>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingLeft: "0",
              listStyle: "none",
            }}
          >
            {[
              "iOS App with native lock screen widget",
              "Android App with home screen widget",
              "More languages (Turkish, French, Spanish, Indonesian, and more)",
              "Tafsir from Al-Mizan (Allamah Tabataba'i)",
              "Audio recitation by Shia qaris",
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "16px",
                  color: "#2a1f08",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: "#c9a227", flexShrink: 0, marginTop: "2px" }}>◆</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        {/* 3D. Islamic Calendar */}
        <section>
          <SectionLabel>Islamic Calendar</SectionLabel>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              color: "#2a1f08",
              lineHeight: 1.75,
            }}
          >
            TathirQuran observes the Shia Islamic calendar. Special ayahs are
            curated for Ashura (Muharram 10), Arbaeen (Safar 20), Eid
            al-Ghadeer (Dhul Hijjah 18), Laylat al-Qadr (Ramadan 23), Wiladat
            of the Holy Prophet (SAWW), and the birthdays and martyrdom
            anniversaries of the 14 Masoomeen (AS).
          </p>
        </section>

        <Divider />

        {/* 4. Lock Screen Preview */}
        <section>
          <SectionLabel>Lock Screen Widget Preview</SectionLabel>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              color: "#2a1f08",
              lineHeight: 1.7,
              marginBottom: "24px",
            }}
          >
            The TathirQuran widget displays each day&apos;s ayah directly on
            your iPhone lock screen or Android home screen — so you begin every
            day with the Word of Allah before unlocking your phone.
          </p>

          <LockScreenPreview data={WIDGET_EXAMPLE} />
        </section>

        <Divider />

        {/* 5. Built by */}
        <section>
          <SectionLabel>Built By</SectionLabel>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px",
                  color: "#0d0a04",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Shakeel Hussain Khan
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  color: "#7a6030",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                FCA · CIA · CISA · CRISC
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "15px",
                  color: "#2a1f08",
                }}
              >
                Five S LLC · San Jose, CA · Member SABA
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px",
                  color: "#0d0a04",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Syeda Saira Naqvi
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "15px",
                  color: "#2a1f08",
                }}
              >
                Five S LLC · San Jose, CA · Member SABA
              </p>
            </div>
          </div>
        </section>

        <Divider />

        {/* 6. Contact */}
        <section>
          <SectionLabel>Contact</SectionLabel>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              color: "#2a1f08",
              lineHeight: 1.7,
              marginBottom: "10px",
            }}
          >
            For partnership inquiries, translation permissions, or general
            questions:
          </p>
          <a
            href="mailto:info@tathirquran.com"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#c9a227",
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            info@tathirquran.com
          </a>
        </section>

        <Divider />

        {/* 7. Download */}
        <section>
          <SectionLabel>Download</SectionLabel>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              color: "#2a1f08",
              lineHeight: 1.7,
              marginBottom: "20px",
            }}
          >
            Native iOS and Android apps with lock screen widgets are coming
            soon. Built with React Native and WidgetKit / Jetpack Glance.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                border: "0.5px solid rgba(201,162,39,0.4)",
                borderRadius: "2px",
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            >
              <span style={{ fontSize: "16px" }}>🍎</span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#0d0a04",
                }}
              >
                iOS — Coming Soon
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                border: "0.5px solid rgba(201,162,39,0.4)",
                borderRadius: "2px",
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            >
              <span style={{ fontSize: "16px" }}>🤖</span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#0d0a04",
                }}
              >
                Android — Coming Soon
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
