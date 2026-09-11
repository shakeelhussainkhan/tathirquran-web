import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — TathirQuran",
  description:
    "TathirQuran privacy policy. We do not collect personal data. Free Shia Quran app by Five S LLC.",
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

export default function PrivacyPage() {
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
          Privacy Policy
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
          <div>Effective date: September 9, 2026</div>
          <div>Last updated: September 9, 2026</div>
        </div>

        <div
          style={{
            height: "0.5px",
            background:
              "linear-gradient(90deg, rgba(201,162,39,0.4), rgba(201,162,39,0.1) 80%, transparent)",
            marginBottom: "36px",
          }}
        />

        <Section number="1" title="Introduction">
          <p>
            TathirQuran (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
            &ldquo;the app&rdquo;) is a free, non-commercial Islamic application
            developed by Shakeel Hussain Khan and Syeda Saira Naqvi under Five S
            LLC, San Jose, California, USA. This Privacy Policy explains how we
            handle information when you use TathirQuran on iOS, Android, or at
            tathirquran.com.
          </p>
        </Section>

        <Section number="2" title="Information We Do Not Collect">
          <ul
            style={{
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <li>
              We do not collect your name, email address, phone number, or any
              personal identification
            </li>
            <li>We do not require account registration</li>
            <li>We do not track your location</li>
            <li>
              We do not use advertising or sell data to third parties
            </li>
            <li>
              We do not share any data with any third party for commercial
              purposes
            </li>
          </ul>
        </Section>

        <Section number="3" title="Information We Do Collect (Anonymous)">
          <ul
            style={{
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <li>
              Anonymous usage analytics (which language/translation is selected)
              to improve the app — no personal data attached
            </li>
            <li>
              Standard server logs (IP address, timestamps) retained for up to
              30 days for security purposes only
            </li>
          </ul>
        </Section>

        <Section number="4" title="Quran Content">
          <p>
            All Quran translations displayed are from scholars in the public
            domain or used with explicit permission. Full attribution is
            displayed in the app. We do not claim ownership of any Quranic text.
          </p>
        </Section>

        <Section number="5" title="Third Party Services">
          <ul
            style={{
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <li>
              <strong>Supabase (supabase.com)</strong> — database hosting for
              Quran content. No personal user data is stored. See{" "}
              <a
                href="https://supabase.com/privacy"
                style={{ color: "#c9a227" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                supabase.com/privacy
              </a>
            </li>
            <li>
              <strong>Vercel (vercel.com)</strong> — website hosting. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                style={{ color: "#c9a227" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                vercel.com/legal/privacy-policy
              </a>
            </li>
          </ul>
        </Section>

        <Section number="6" title="Children">
          <p>
            TathirQuran is suitable for all ages. We do not knowingly collect
            data from children under 13.
          </p>
        </Section>

        <Section number="7" title="Changes to This Policy">
          <p>
            We may update this policy occasionally. Continued use of the app
            means acceptance of the updated policy. The &ldquo;last
            updated&rdquo; date at the top will always reflect the latest
            version.
          </p>
        </Section>

        <Section number="8" title="Contact">
          <p style={{ marginBottom: "8px" }}>
            For privacy questions, contact us at:
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
