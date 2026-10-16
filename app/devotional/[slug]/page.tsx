import { notFound } from "next/navigation";
import Link from "next/link";
import { getDevotionalBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * A single devotional text (dua / ziyarat), rendered from devotional_texts.
 *
 * The Arabic is shown exactly as stored (a verbatim text from the Shia
 * source cited in source_note). The English translation is shown ONLY when
 * a verified one is stored; otherwise an honest note says so — a
 * translation is never invented to fill the space.
 */
export default async function DevotionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const devotional = await getDevotionalBySlug(slug);
  if (!devotional) notFound();

  return (
    <main className="w4-page">
      <div className="w4-gold-bar" />

      <div style={{ flex: 1, width: "100%", maxWidth: "720px", margin: "0 auto", padding: "32px 24px 48px" }}>
        <Link
          href="/"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#9a7830",
            textDecoration: "none",
          }}
        >
          ← Today&apos;s Ayah
        </Link>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "34px",
            fontWeight: 600,
            color: "#1a1205",
            textAlign: "center",
            margin: "28px 0 6px",
          }}
        >
          {devotional.title}
        </h1>

        {devotional.occasion_tag && (
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#9a7830",
              textAlign: "center",
              margin: "0 0 28px",
            }}
          >
            {devotional.occasion_tag}
          </p>
        )}

        {/* Arabic text — verbatim from the cited Shia source */}
        <p
          dir="rtl"
          lang="ar"
          style={{
            fontFamily: "Amiri, serif",
            fontSize: "24px",
            lineHeight: 2.1,
            color: "#0d0a04",
            textAlign: "right",
            whiteSpace: "pre-wrap",
            margin: "0 0 32px",
          }}
        >
          {devotional.arabic_text}
        </p>

        {devotional.translation_text ? (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "19px",
              lineHeight: 1.7,
              color: "#1a1205",
              whiteSpace: "pre-wrap",
              margin: "0 0 32px",
            }}
          >
            {devotional.translation_text}
          </p>
        ) : (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "16px",
              color: "#7a6030",
              textAlign: "center",
              margin: "0 0 32px",
            }}
          >
            English translation to be added from a verified source.
          </p>
        )}

        {/* Source attribution */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            lineHeight: 1.6,
            color: "#9a7830",
            borderTop: "0.5px solid rgba(139,101,32,0.3)",
            paddingTop: "14px",
            margin: 0,
          }}
        >
          Source: {devotional.source_note}
        </p>
      </div>

      <div className="w4-gold-bar" />
    </main>
  );
}
