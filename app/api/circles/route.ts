import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  CIRCLE_NAME_MAX,
  DISPLAY_NAME_MAX,
  cleanDeviceId,
  cleanText,
  generateInviteCode,
  isCirclesSchemaMissing,
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
 * POST /api/circles — create a circle and its founding member.
 *
 * Body: { name, display_name, device_id }
 * Returns 201: { circle_id, invite_code, name }
 *
 * No accounts: the device_id is a random UUID the app keeps on the
 * device, and the returned invite_code is the circle's only access
 * control. Anyone with the code can join — see the security & privacy
 * section of the PR and lib/circles-server.ts.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: NO_STORE });
  }

  const name = cleanText(body?.name, CIRCLE_NAME_MAX);
  const displayName = cleanText(body?.display_name, DISPLAY_NAME_MAX);
  const deviceId = cleanDeviceId(body?.device_id);

  if (!name) {
    return NextResponse.json(
      { error: `A circle name of 1–${CIRCLE_NAME_MAX} characters is required.` },
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

  // A device should not be able to mint circles at machine speed.
  if (!rateLimit(`create:${deviceId}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many circles created from this device. Please try again later." },
      { status: 429, headers: NO_STORE }
    );
  }

  try {
    // Service-role client created INSIDE the handler — never at module
    // scope (that is what broke Vercel deploys in Sep 2026).
    const sb = createServiceClient();

    // Insert with a fresh code; on the (very unlikely) unique-code
    // collision, retry with another code.
    let circle: { id: string; invite_code: string } | null = null;
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 5 && !circle; attempt++) {
      const inviteCode = generateInviteCode();
      const { data, error } = await sb
        .from("circles")
        .insert({ name, invite_code: inviteCode })
        .select("id, invite_code")
        .single();
      if (!error && data) {
        circle = data as { id: string; invite_code: string };
      } else {
        lastError = error;
        if ((error as { code?: string } | null)?.code !== "23505") break;
      }
    }
    if (!circle) throw lastError ?? new Error("Could not create circle.");

    const { error: memberError } = await sb.from("circle_members").insert({
      circle_id: circle.id,
      device_id: deviceId,
      display_name: displayName,
    });
    if (memberError) {
      // Do not leave an orphaned, memberless circle behind.
      await sb.from("circles").delete().eq("id", circle.id);
      throw memberError;
    }

    return NextResponse.json(
      { circle_id: circle.id, invite_code: circle.invite_code, name },
      { status: 201, headers: NO_STORE }
    );
  } catch (err) {
    if (isCirclesSchemaMissing(err)) {
      return NextResponse.json(
        { error: "Circles aren't available yet." },
        { status: 503, headers: NO_STORE }
      );
    }
    console.error("/api/circles POST error:", err);
    return NextResponse.json(
      { error: "Could not create the circle. Please try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
