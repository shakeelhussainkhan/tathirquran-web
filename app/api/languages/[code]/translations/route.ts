import { NextResponse } from "next/server";
import { getTranslationsForLanguage } from "@/lib/queries";

export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const translations = await getTranslationsForLanguage(code);
    return NextResponse.json(translations, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
