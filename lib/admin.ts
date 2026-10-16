import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side helpers for the /api/admin/* routes.
 *
 * Security model (fail closed):
 * - Every admin route must call requireAdminSecret() FIRST, before touching
 *   the database.
 * - The reviewer types the admin secret once into a password field on the
 *   admin page; the client sends it on every request in the
 *   `x-admin-secret` header. The secret is never returned to the client and
 *   never logged.
 * - If ADMIN_SECRET is not set on the server, ALL admin routes return 503 —
 *   there is no default or fallback secret.
 * - The comparison is constant-time over SHA-256 digests so neither the
 *   secret's length nor a matching prefix leaks through timing.
 */

export type AdminCheck =
  | { ok: true }
  | { ok: false; response: NextResponse };

export function requireAdminSecret(req: NextRequest): AdminCheck {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Admin API is disabled: ADMIN_SECRET is not set on the server.",
        },
        { status: 503 }
      ),
    };
  }

  const provided = req.headers.get("x-admin-secret") ?? "";
  const providedDigest = createHash("sha256").update(provided).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(providedDigest, expectedDigest)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or missing admin secret." },
        { status: 401 }
      ),
    };
  }

  return { ok: true };
}

/**
 * True when a Supabase/PostgREST error is the "column does not exist" error
 * for the review columns added by migration 013. Until Shakeel runs that
 * migration, production tafsir has no review_status / reviewed_by /
 * reviewed_at columns, and queries naming them fail with this error.
 */
export function isMissingReviewColumn(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  if (e.code === "42703") return true;
  const message = e.message ?? "";
  return (
    message.includes("review_status") ||
    message.includes("reviewed_by") ||
    message.includes("reviewed_at")
  );
}

export const MIGRATION_PENDING_MESSAGE =
  "Reflection review is not available yet: migration 013 (review_status columns) has not been run on the database.";
