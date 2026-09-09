import { NextResponse } from "next/server";
import { getAyahPageData } from "@/lib/queries";

export const revalidate = 86400; // 24 hours — ayah content is static

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // id format: "2-255" (surah-ayah)
  const parts = id.split("-");
  if (parts.length !== 2) {
    return NextResponse.json(
      { error: "Invalid ayah id format. Use surah-ayah, e.g. /api/ayah/2-255" },
      { status: 400 }
    );
  }

  const surahNum = parseInt(parts[0], 10);
  const ayahNum = parseInt(parts[1], 10);

  if (
    isNaN(surahNum) ||
    isNaN(ayahNum) ||
    surahNum < 1 ||
    surahNum > 114 ||
    ayahNum < 1
  ) {
    return NextResponse.json(
      { error: "Surah must be 1–114 and ayah must be a positive integer." },
      { status: 400 }
    );
  }

  try {
    const data = await getAyahPageData(surahNum, ayahNum);

    if (!data) {
      return NextResponse.json(
        { error: `Ayah ${surahNum}:${ayahNum} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("/api/ayah error:", err);
    return NextResponse.json(
      { error: "Failed to fetch ayah data." },
      { status: 500 }
    );
  }
}
