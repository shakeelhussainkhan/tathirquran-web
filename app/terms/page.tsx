import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — TathirQuran",
  description:
    "TathirQuran terms of service. Free Shia Quran app by Five S LLC.",
};

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "32px" }}>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "20px",
          fontStyle: "italic",
          color: "#8b6520",
          marginBottom: "12px",
          fontWeight: 500,
        }}
      >
        {number}. {title}
      </h2>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#2a1f08",
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
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
          maxWidth: "680px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 32px 80px",
        }}
      >
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
          ← Back to Home
        </Link>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "32px",
            fontWeight: 400,
            color: "#0d0a04",
            marginBottom: "8px",
          }}
        >
          Terms of Service
        </h1>

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            color: "#7a6030",
            letterSpacing: "0.06em",
            marginBottom: "36px",
          }}
        >
          <div>Effective: September 9, 2026</div>
        </div>

        <div
          style={{
            height: "0.5px",
            background:
              "linear-gradient(90deg, rgba(201,162,39,0.4), rgba(201,162,39,0.1) 80%, transparent)",
            marginBottom: "36px",
          }}
        />

        <Section number="1" title="Acceptance">
          <p>
            By using TathirQuran — whether on iOS, Android, or at
            tathirquran.com — you accept these Terms of Service. If you do not
            agree, please discontinue use of the app.
          </p>
        </Section>

        <Section number="2" title="Free Service">
          <p>
            TathirQuran is provided free of charge with no warranty, express or
            implied. We may modify, suspend, or discontinue the service at any
            time without notice. We are not liable for any interruptions to
            service.
          </p>
        </Section>

        <Section number="3" title="Quran Content">
          <p>
            All content is provided for religious and educational use only. We
            make every effort to ensure the accuracy of all translations and
            Quranic content, but cannot guarantee that every translation is free
            of error. Always consult a qualified Islamic scholar for religious
            guidance.
          </p>
        </Section>

        <Section number="4" title="Intellectual Property">
          <p>
            The TathirQuran name, logo, and app design are owned by Five S LLC.
            Quran translations displayed within TathirQuran belong to their
            respective scholars or estates and are used with permission or from
            the public domain. No ownership of any Quranic text is claimed by
            Five S LLC.
          </p>
        </Section>

        <Section number="5" title="Prohibited Use">
          <p>
            You may not use TathirQuran or its content for commercial purposes
            without prior written permission from Five S LLC. You may not
            reproduce, redistribute, or resell the TathirQuran app or its
            content.
          </p>
        </Section>

        <Section number="6" title="Disclaimer">
          <p>
            TathirQuran is not a substitute for qualified Islamic scholarship.
            The app is offered as a spiritual aid and convenience. No fatwa,
            religious ruling, or scholarly opinion is expressed or implied by
            the content of the app.
          </p>
        </Section>

        <Section number="7" title="Governing Law">
          <p>
            These Terms of Service are governed by the laws of the State of
            California, USA. Any disputes shall be resolved in the courts of
            Santa Clara County, California.
          </p>
        </Section>

        <Section number="8" title="Contact">
          <p style={{ marginBottom: "8px" }}>
            For questions about these terms:
          </p>
          <a
            href="mailto:info@tathirquran.com"
            style={{
              color: "#c9a227",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            info@tathirquran.com
          </a>
          <p style={{ marginTop: "8px" }}>
            Five S LLC, San Jose, California, USA
          </p>
        </Section>
      </div>

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
