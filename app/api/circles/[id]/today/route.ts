import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  cleanDeviceId,
  findMember,
  getCircleById,
  getMemberStatusForDate,
  isCirclesSchemaMissing,
  isUuid,
  isValidDateString,
  rateLimit,
} from "@/lib/circles-server";

// Circle state is live database state — never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Content-Type": "application/json",
};

/**
 * GET /api/circles/[id]/today?device_id=...&date=YYYY-MM-DD
 *
 * Returns the circle's name and invite code, plus the member list with
 * a checked_in flag for the given date:
 *   { circle_id, name, invite_code, date,
 *     members: [{ display_name, is_you, checked_in }] }
 *
 * The device_id must be a member of the circle (else 403) — membership
 * is the only thing standing between this list and the public, so it
 * is checked on every call.
 *
 * `date` is supplied by the client because "today" is the user's LOCAL
 * day: the server's clock (UTC) cannot know whether it is still
 * Tuesday evening or already Wednesday for the person holding the
 * phone. This matches the app, whose streaks already run on local
 * dates (lib/streaks.ts).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { error: "Invalid circle id." },
      { status: 400, headers: NO_STORE }
    );
  }

  const { searchParams } = new URL(req.url);
  const deviceId = cleanDeviceId(searchParams.get("device_id"));
  const date = searchParams.get("date");

  if (!deviceId) {
    return NextResponse.json(
      { error: "A valid device_id query parameter is required." },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!isValidDateString(date)) {
    return NextResponse.json(
      { error: "A valid date query parameter (YYYY-MM-DD) is required." },
      { status: 400, headers: NO_STORE }
    );
  }

  if (!rateLimit(`today:${deviceId}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests from this device. Please try again later." },
      { status: 429, headers: NO_STORE }
    );
  }

  try {
    // Service-role client created INSIDE the handler — never module scope.
    const sb = createServiceClient();

    const circle = await getCircleById(sb, id);
    if (!circle) {
      return NextResponse.json(
        { error: "Circle not found." },
        { status: 404, headers: NO_STORE }
      );
    }

    const member = await findMember(sb, circle.id, deviceId);
    if (!member) {
      return NextResponse.json(
        { error: "This device is not a member of this circle." },
        { status: 403, headers: NO_STORE }
      );
    }

    const payload = await getMemberStatusForDate(sb, circle, date, deviceId);
    return NextResponse.json(payload, { status: 200, headers: NO_STORE });
  } catch (err) {
    if (isCirclesSchemaMissing(err)) {
      return NextResponse.json(
        { error: "Circles aren't available yet." },
        { status: 503, headers: NO_STORE }
      );
    }
    console.error("/api/circles/[id]/today error:", err);
    return NextResponse.json(
      { error: "Could not load the circle. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
