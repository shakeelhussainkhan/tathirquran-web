import { NextResponse } from "next/server";
import { getAyahPageData } from "@/lib/queries";
import { renderVerseCard } from "@/lib/verse-card";

/**
 * GET /api/verse-card/[surah]/[ayah]
 *
 * Renders the illuminated share-as-image card (1080×1350 PNG) for one
 * ayah, using the ayah's real Supabase data (Arabic Uthmani + the default
 * English translation). No verse text is hardcoded.
 *
 * Node runtime (not edge — see CODE-REVIEW-FINDINGS L-w2: the existing
 * OG routes' `runtime = "edge"` export is deprecated).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ surah: string; ayah: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { surah, ayah } = await params;
  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);

  if (
    Number.isNaN(surahNum) ||
    Number.isNaN(ayahNum) ||
    surahNum < 1 ||
    surahNum > 114 ||
    ayahNum < 1
  ) {
    return NextResponse.json(
      { error: "Invalid surah/ayah. Expected /api/verse-card/<1-114>/<ayah>." },
      { status: 400 }
    );
  }

  const data = await getAyahPageData(surahNum, ayahNum);
  if (!data) {
    return NextResponse.json(
      { error: `Ayah ${surahNum}:${ayahNum} not found.` },
      { status: 404 }
    );
  }

  try {
    const png = await renderVerseCard(data);
    return new Response(Buffer.from(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
        "Content-Disposition": `inline; filename="tathirquran-${surahNum}-${ayahNum}.png"`,
      },
    });
  } catch (err) {
    // Most likely the Amiri font could not be loaded — fail honestly
    // rather than serving a card whose Arabic renders as boxes.
    console.error("/api/verse-card font/render error:", err);
    return NextResponse.json(
      { error: "Verse card could not be rendered (Arabic font unavailable)." },
      { status: 500 }
    );
  }
}
