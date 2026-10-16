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
 * POST /api/circles/checkin — record that a member read today's verse.
 *
 * Body: { circle_id, device_id, schedule_date }
 * Returns the same member-status payload as GET /[id]/today, for the
 * checked-in date.
 *
 * Member-only: the device_id must already be a member of the circle
 * (else 403). The insert is an upsert on the unique
 * (circle_id, device_id, schedule_date) constraint, so re-opening the
 * app on the same day is harmless.
 *
 * schedule_date is the client's LOCAL date — the day on the user's own
 * clock is the day that counts for a daily-verse habit (see the note
 * in app/api/circles/[id]/today/route.ts).
 *
 * A check-in says only "this member opened the daily verse that day".
 * It is not a score; nothing in the API ranks members or compares
 * streaks.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: NO_STORE });
  }

  const circleId = typeof body?.circle_id === "string" ? body.circle_id : "";
  const deviceId = cleanDeviceId(body?.device_id);
  const scheduleDate = body?.schedule_date;

  if (!isUuid(circleId)) {
    return NextResponse.json(
      { error: "A valid circle_id is required." },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!deviceId) {
    return NextResponse.json(
      { error: "A valid device_id is required." },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!isValidDateString(scheduleDate)) {
    return NextResponse.json(
      { error: "A valid schedule_date (YYYY-MM-DD) is required." },
      { status: 400, headers: NO_STORE }
    );
  }

  if (!rateLimit(`checkin:${deviceId}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many check-ins from this device. Please try again later." },
      { status: 429, headers: NO_STORE }
    );
  }

  try {
    // Service-role client created INSIDE the handler — never module scope.
    const sb = createServiceClient();

    const circle = await getCircleById(sb, circleId);
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

    const { error } = await sb.from("circle_checkins").upsert(
      {
        circle_id: circle.id,
        device_id: deviceId,
        schedule_date: scheduleDate,
      },
      { onConflict: "circle_id,device_id,schedule_date" }
    );
    if (error) throw error;

    const payload = await getMemberStatusForDate(
      sb,
      circle,
      scheduleDate,
      deviceId
    );
    return NextResponse.json(payload, { status: 200, headers: NO_STORE });
  } catch (err) {
    if (isCirclesSchemaMissing(err)) {
      return NextResponse.json(
        { error: "Circles aren't available yet." },
        { status: 503, headers: NO_STORE }
      );
    }
    console.error("/api/circles/checkin error:", err);
    return NextResponse.json(
      { error: "Could not record your check-in. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
