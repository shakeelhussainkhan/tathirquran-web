import Link from "next/link";
import type { Metadata } from "next";
import { searchAyahs } from "@/lib/queries";
import type { SearchResponse } from "@/types";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search — TathirQuran",
  description:
    "Search the Holy Quran by Arabic text or translation — English, Persian and Urdu Shia translations.",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialQuery = (params.q ?? "").trim().slice(0, 100);
  const pageRaw = parseInt(params.page ?? "1", 10);
  const initialPage = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  // Server-render the first page of results when arriving with ?q= so the
  // page is meaningful before hydration; the client component takes over
  // for typing, debounce and pagination. No event handlers here — all
  // interactivity lives in SearchClient (Server Component rule).
  let initialData: SearchResponse | null = null;
  let initialError: string | null = null;
  if (initialQuery.length >= 2) {
    try {
      initialData = await searchAyahs(initialQuery, initialPage);
    } catch {
      initialError = "Search failed. Please try again.";
    }
  }

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
        <div style={{ marginBottom: "28px" }}>
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
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "30px",
            fontWeight: 500,
            color: "#0d0a04",
            marginBottom: "6px",
          }}
        >
          Search the Quran
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "#7a6030",
            marginBottom: "24px",
          }}
        >
          Find a verse by its Arabic words or by any of its translations.
        </p>

        <SearchClient
          initialQuery={initialQuery}
          initialPage={initialPage}
          initialData={initialData}
          initialError={initialError}
        />
      </div>

      {/* BOTTOM GOLD BAR */}
      <div className="w4-gold-bar" />
    </main>
  );
}
