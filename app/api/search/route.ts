import { NextResponse } from "next/server";
import { searchAyahs } from "@/lib/queries";

// Search results depend on the live database — never cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

/**
 * GET /api/search?q=<term>&page=<n>
 *
 * Searches ayah_translations.text with ILIKE across ALL translations, plus
 * the Arabic Uthmani text on ayahs. Returns one result
 * per ayah, paginated at 20 per page with an exact total.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      {
        error: `Please enter at least ${MIN_QUERY_LENGTH} characters to search.`,
      },
      { status: 400 }
    );
  }
  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Search terms are limited to ${MAX_QUERY_LENGTH} characters.` },
      { status: 400 }
    );
  }

  try {
    const data = await searchAyahs(q, page);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("/api/search error:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
