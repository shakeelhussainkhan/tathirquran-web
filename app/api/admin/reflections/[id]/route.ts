import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  requireAdminSecret,
  isMissingReviewColumn,
  MIGRATION_PENDING_MESSAGE,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

const VALID_ACTIONS = ["approve", "edit_approve", "reject"] as const;
type ReviewAction = (typeof VALID_ACTIONS)[number];

const MAX_TEXT_LENGTH = 20000;
const MAX_REVIEWER_LENGTH = 80;

/**
 * PATCH /api/admin/reflections/[id]
 *
 * Body: { action: "approve" | "edit_approve" | "reject",
 *         text?: string        (required for edit_approve),
 *         reviewed_by: string  (reviewer's name/initials, required) }
 *
 * - approve      → review_status = 'approved'
 * - edit_approve → text replaced with the edited text, review_status = 'approved'
 * - reject       → review_status = 'needs_edit'
 * reviewed_at is always set server-side. Only rows with
 * scholar = 'Reflection' can be reviewed through this route — verified
 * tafsir content is never touched here.
 *
 * Requires the x-admin-secret header (see lib/admin.ts); the service-role
 * client is created inside the handler, never at module scope.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminSecret(req);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid reflection id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const { action, text, reviewed_by } = (body ?? {}) as {
    action?: unknown;
    text?: unknown;
    reviewed_by?: unknown;
  };

  if (!VALID_ACTIONS.includes(action as ReviewAction)) {
    return NextResponse.json(
      { error: 'Invalid action. Expected "approve", "edit_approve" or "reject".' },
      { status: 400 }
    );
  }

  if (typeof reviewed_by !== "string" || reviewed_by.trim().length === 0) {
    return NextResponse.json(
      { error: "reviewed_by is required (the reviewer's name or initials)." },
      { status: 400 }
    );
  }
  const reviewer = reviewed_by.trim();
  if (reviewer.length > MAX_REVIEWER_LENGTH) {
    return NextResponse.json(
      { error: `reviewed_by must be ${MAX_REVIEWER_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  let editedText: string | undefined;
  if (action === "edit_approve") {
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Edited text is required for edit_approve and must not be empty." },
        { status: 400 }
      );
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Edited text must be ${MAX_TEXT_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }
    editedText = text;
  }

  let sb;
  try {
    sb = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Admin API is disabled: SUPABASE_SERVICE_ROLE_KEY is not set on the server." },
      { status: 503 }
    );
  }

  // Only Reflection rows are reviewable through this route.
  const { data: existing, error: loadError } = await sb
    .from("tafsir")
    .select("id, scholar")
    .eq("id", id)
    .single();
  if (loadError || !existing) {
    return NextResponse.json({ error: "Reflection not found." }, { status: 404 });
  }
  if (existing.scholar !== "Reflection") {
    return NextResponse.json(
      { error: "Only Reflection rows can be reviewed through this route." },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {
    review_status: action === "reject" ? "needs_edit" : "approved",
    reviewed_by: reviewer,
    reviewed_at: new Date().toISOString(),
  };
  if (editedText !== undefined) update.text = editedText;

  const { data: updated, error: updateError } = await sb
    .from("tafsir")
    .update(update)
    .eq("id", id)
    .select("id, ayah_id, text, review_status, reviewed_by, reviewed_at")
    .single();

  if (updateError) {
    if (isMissingReviewColumn(updateError)) {
      return NextResponse.json(
        { error: MIGRATION_PENDING_MESSAGE },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `Could not save the review: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ reflection: updated });
}
