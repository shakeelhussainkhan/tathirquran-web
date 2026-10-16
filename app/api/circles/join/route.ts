import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  DISPLAY_NAME_MAX,
  cleanDeviceId,
  cleanInviteCode,
  cleanText,
  findMember,
  getCircleByInviteCode,
  getMembers,
  isCirclesSchemaMissing,
  memberListPayload,
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
 * POST /api/circles/join — join a circle with its invite code.
 *
 * Body: { invite_code, display_name, device_id }
 * Returns 200: { circle_id, invite_code, name, members: [...] }
 * 404 when the code does not match any circle.
 *
 * Re-joining with the same device_id is idempotent: the member row is
 * unique on (circle_id, device_id), and a re-join simply refreshes the
 * display name the member now goes by.
 *
 * Knowing the code is the ONLY access control — anyone who has it can
 * join and see the circle's display names. That is by design for
 * trusted family / small groups, and it is stated plainly in the app
 * and in the PR's security & privacy section.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: NO_STORE });
  }

  const inviteCode = cleanInviteCode(body?.invite_code);
  const displayName = cleanText(body?.display_name, DISPLAY_NAME_MAX);
  const deviceId = cleanDeviceId(body?.device_id);

  if (!inviteCode) {
    return NextResponse.json(
      { error: "A valid invite code is required." },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!displayName) {
    return NextResponse.json(
      { error: `A display name of 1–${DISPLAY_NAME_MAX} characters is required.` },
      { status: 400, headers: NO_STORE }
    );
  }
  if (!deviceId) {
    return NextResponse.json(
      { error: "A valid device_id is required." },
      { status: 400, headers: NO_STORE }
    );
  }

  // Slow down code guessing from a single device.
  if (!rateLimit(`join:${deviceId}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many join attempts from this device. Please try again later." },
      { status: 429, headers: NO_STORE }
    );
  }

  try {
    // Service-role client created INSIDE the handler — never module scope.
    const sb = createServiceClient();

    const circle = await getCircleByInviteCode(sb, inviteCode);
    if (!circle) {
      return NextResponse.json(
        { error: "No circle found for that invite code. Please check the code and try again." },
        { status: 404, headers: NO_STORE }
      );
    }

    const existing = await findMember(sb, circle.id, deviceId);
    if (existing) {
      if (existing.display_name !== displayName) {
        const { error } = await sb
          .from("circle_members")
          .update({ display_name: displayName })
          .eq("circle_id", circle.id)
          .eq("device_id", deviceId);
        if (error) throw error;
      }
    } else {
      const { error } = await sb.from("circle_members").insert({
        circle_id: circle.id,
        device_id: deviceId,
        display_name: displayName,
      });
      // A concurrent join from the same device can race us to the
      // unique constraint — that is still a successful join.
      if (error && (error as { code?: string }).code !== "23505") throw error;
    }

    const members = await getMembers(sb, circle.id);
    return NextResponse.json(memberListPayload(circle, members, deviceId), {
      status: 200,
      headers: NO_STORE,
    });
  } catch (err) {
    if (isCirclesSchemaMissing(err)) {
      return NextResponse.json(
        { error: "Circles aren't available yet." },
        { status: 503, headers: NO_STORE }
      );
    }
    console.error("/api/circles/join error:", err);
    return NextResponse.json(
      { error: "Could not join the circle. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
