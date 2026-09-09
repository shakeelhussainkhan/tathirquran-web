import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 86400;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Accept either ayah_id (numeric) or ayah key like "2-255"
  const ayahIdRaw = searchParams.get("ayah_id");
  const languageCode = searchParams.get("language");
  const translationIdRaw = searchParams.get("translation_id");

  if (!ayahIdRaw) {
    return NextResponse.json({ error: "Missing ayah_id" }, { status: 400 });
  }

  // Resolve ayah_id — could be "1-1" (surah-ayah) or numeric
  let ayahId: number | null = null;

  if (ayahIdRaw.includes("-")) {
    const [surahStr, ayahStr] = ayahIdRaw.split("-");
    const { data } = await supabase
      .from("ayahs")
      .select("ayah_id")
      .eq("surah_number", parseInt(surahStr, 10))
      .eq("ayah_number", parseInt(ayahStr, 10))
      .single();
    ayahId = data?.ayah_id ?? null;
  } else {
    ayahId = parseInt(ayahIdRaw, 10);
  }

  if (!ayahId) {
    return NextResponse.json({ error: "Ayah not found" }, { status: 404 });
  }

  // Build query
  let query = supabase
    .from("ayah_translations")
    .select("text, translation_id, translations(scholar_name, language_code, is_placeholder)")
    .eq("ayah_id", ayahId);

  if (translationIdRaw) {
    query = query.eq("translation_id", parseInt(translationIdRaw, 10));
  } else if (languageCode) {
    // Join via translations table to filter by language
    const { data: transData } = await supabase
      .from("translations")
      .select("translation_id")
      .eq("language_code", languageCode)
      .eq("is_default", true)
      .single();
    if (transData) {
      query = query.eq("translation_id", transData.translation_id);
    }
  }

  const { data, error } = await query.limit(1).single();

  if (error || !data) {
    return NextResponse.json(
      { text: null, message: "Translation not available" },
      { status: 200 }
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
