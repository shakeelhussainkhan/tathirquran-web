import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  requireAdminSecret,
  isMissingReviewColumn,
  MIGRATION_PENDING_MESSAGE,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "approved", "needs_edit"] as const;
type ReviewStatus = (typeof VALID_STATUSES)[number];

interface ReflectionRow {
  id: number;
  ayah_id: number;
  text: string;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

/**
 * GET /api/admin/reflections?status=pending|approved|needs_edit
 *
 * Lists the AI-written reflection rows (tafsir.scholar = 'Reflection') in one
 * review state, enriched with the ayah's Arabic, reference and default
 * English translation so a reviewer can judge the reflection in context.
 *
 * Requires the x-admin-secret header (see lib/admin.ts). Uses the
 * service-role client, created inside the handler — never at module scope
 * (a module-scope service client broke Vercel deploys on Sep 24, 2026).
 *
 * Missing-column handling: until migration 013 runs, production tafsir has
 * no review_status column and the primary query errors. For status=pending
 * we fall back to the pre-migration query and report every row as 'pending'
 * with migrationPending: true; approved/needs_edit lists are honestly empty
 * (nothing can have been reviewed before the columns exist).
 */
export async function GET(req: NextRequest) {
  const auth = requireAdminSecret(req);
  if (!auth.ok) return auth.response;

  const statusParam = req.nextUrl.searchParams.get("status") ?? "pending";
  if (!VALID_STATUSES.includes(statusParam as ReviewStatus)) {
    return NextResponse.json(
      { error: `Invalid status "${statusParam}".` },
      { status: 400 }
    );
  }
  const status = statusParam as ReviewStatus;

  let sb;
  try {
    sb = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Admin API is disabled: SUPABASE_SERVICE_ROLE_KEY is not set on the server." },
      { status: 503 }
    );
  }

  let rows: ReflectionRow[] = [];
  let migrationPending = false;

  const primary = await sb
    .from("tafsir")
    .select("id, ayah_id, text, review_status, reviewed_by, reviewed_at")
    .eq("scholar", "Reflection")
    .eq("review_status", status)
    .order("ayah_id");

  if (primary.error) {
    if (!isMissingReviewColumn(primary.error)) {
      return NextResponse.json(
        { error: `Could not load reflections: ${primary.error.message}` },
        { status: 500 }
      );
    }
    // Migration 013 has not run yet — fall back defensively.
    migrationPending = true;
    if (status !== "pending") {
      return NextResponse.json({ reflections: [], migrationPending });
    }
    const fallback = await sb
      .from("tafsir")
      .select("id, ayah_id, text")
      .eq("scholar", "Reflection")
      .order("ayah_id");
    if (fallback.error) {
      return NextResponse.json(
        { error: `Could not load reflections: ${fallback.error.message}` },
        { status: 500 }
      );
    }
    rows = (fallback.data ?? []).map((r) => ({
      id: r.id as number,
      ayah_id: r.ayah_id as number,
      text: r.text as string,
      review_status: "pending",
      reviewed_by: null,
      reviewed_at: null,
    }));
  } else {
    rows = (primary.data ?? []) as ReflectionRow[];
  }

  if (rows.length === 0) {
    return NextResponse.json({ reflections: [], migrationPending });
  }

  // Enrich with ayah context: reference, Arabic, surah name, default
  // English translation text.
  const ayahIds = [...new Set(rows.map((r) => r.ayah_id))];

  const { data: ayahRows, error: ayahError } = await sb
    .from("ayahs")
    .select("ayah_id, surah_number, ayah_number, arabic_uthmani")
    .in("ayah_id", ayahIds);
  if (ayahError) {
    return NextResponse.json(
      { error: `Could not load ayahs: ${ayahError.message}` },
      { status: 500 }
    );
  }
  const ayahById = new Map(
    (ayahRows ?? []).map((a) => [a.ayah_id as number, a])
  );

  const surahNumbers = [
    ...new Set((ayahRows ?? []).map((a) => a.surah_number as number)),
  ];
  const { data: surahRows } = await sb
    .from("surahs")
    .select("surah_number, name_english, name_transliterated")
    .in("surah_number", surahNumbers);
  const surahByNumber = new Map(
    (surahRows ?? []).map((s) => [s.surah_number as number, s])
  );

  let translationByAyah = new Map<number, string>();
  const { data: defaultTranslation } = await sb
    .from("translations")
    .select("translation_id")
    .eq("language_code", "en")
    .eq("is_default", true)
    .single();
  if (defaultTranslation) {
    const { data: translationRows } = await sb
      .from("ayah_translations")
      .select("ayah_id, text")
      .in("ayah_id", ayahIds)
      .eq("translation_id", defaultTranslation.translation_id as number);
    translationByAyah = new Map(
      (translationRows ?? []).map((t) => [t.ayah_id as number, t.text as string])
    );
  }

  const reflections = rows.map((r) => {
    const ayah = ayahById.get(r.ayah_id);
    const surah = ayah ? surahByNumber.get(ayah.surah_number as number) : undefined;
    return {
      id: r.id,
      ayah_id: r.ayah_id,
      surah_number: ayah?.surah_number ?? null,
      ayah_number: ayah?.ayah_number ?? null,
      surah_name_english: surah?.name_english ?? null,
      surah_name_transliterated: surah?.name_transliterated ?? null,
      arabic_uthmani: ayah?.arabic_uthmani ?? null,
      translation_text: translationByAyah.get(r.ayah_id) ?? null,
      text: r.text,
      review_status: r.review_status ?? "pending",
      reviewed_by: r.reviewed_by ?? null,
      reviewed_at: r.reviewed_at ?? null,
    };
  });

  return NextResponse.json({ reflections, migrationPending });
}
