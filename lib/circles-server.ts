import { randomInt } from "node:crypto";
import { createServiceClient } from "./supabase";

/**
 * Family circles — server-side helpers for app/api/circles/*.
 *
 * Privacy model (stated plainly, also in the PR — do not oversell it):
 * there are no accounts and no emails. A member is a random device-held
 * UUID plus a self-chosen display name, and knowing a circle's invite
 * code is the ONLY access control: anyone with the code can join and
 * see display names + who has read today's verse. Circles are for
 * trusted family / small groups only. The tables have RLS enabled with
 * no public policies, so nothing is readable directly with the anon
 * key; every route below re-checks membership via the service role.
 *
 * The Supabase service-role client is created INSIDE each request
 * handler (by calling createServiceClient() there — the factory in
 * lib/supabase.ts), never at module scope: a module-scope service
 * client is what took the site down for ~11 days in Sep 2026
 * (see HANDOVER §5 and the /api/notify-signup fix in 3b8465a).
 * This module only holds pure helpers plus query functions that take
 * the client as an argument.
 */

export type ServiceClient = ReturnType<typeof createServiceClient>;

export const CIRCLE_NAME_MAX = 60;
export const DISPLAY_NAME_MAX = 40;
export const DEVICE_ID_MAX = 64;

// ---------------------------------------------------------------------------
// Invite codes
// ---------------------------------------------------------------------------

/**
 * Unambiguous alphabet: no 0/O, 1/I/L, so a code read aloud or typed
 * from a screenshot cannot be confused. 31 symbols, 6 chars ≈ 887M
 * combinations. Codes are generated with crypto randomInt, never
 * Math.random.
 */
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 6;

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

const INVITE_ALPHABET_SET = new Set(INVITE_CODE_ALPHABET.split(""));

/** Normalise + validate a user-supplied invite code; null if malformed. */
export function cleanInviteCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  if (code.length < 4 || code.length > 12) return null;
  for (const ch of code) {
    if (!INVITE_ALPHABET_SET.has(ch)) return null;
  }
  return code;
}

// ---------------------------------------------------------------------------
// Input validation — every field is trimmed and length-capped
// ---------------------------------------------------------------------------

/** Trim a string field and enforce 1..max chars; null if invalid. */
export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

const DEVICE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

/** A device id is the app's UUID; reject empty / oversized / odd values. */
export function cleanDeviceId(value: unknown): string | null {
  const id = cleanText(value, DEVICE_ID_MAX);
  if (!id || !DEVICE_ID_RE.test(id)) return null;
  return id;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A schedule_date must be a real YYYY-MM-DD calendar date. (The date is
 * the client's LOCAL day — the API cannot know the user's timezone, and
 * "today" for a daily-verse habit is the day on the user's own clock,
 * consistent with the app's local-date streaks.)
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2020 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

// ---------------------------------------------------------------------------
// Light in-memory rate limiting
// ---------------------------------------------------------------------------

/**
 * Best-effort per-key rate limit. In-memory means per server instance
 * (Vercel may run several, and counters reset on redeploy) — this is a
 * speed bump against casual abuse of the code-guessing / circle-spam
 * surface, not a security boundary. The real controls are validation,
 * membership checks, and the size of the invite-code space.
 */
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // Opportunistic prune so the map cannot grow without bound.
  if (rateBuckets.size > 5000) {
    for (const [k, bucket] of rateBuckets) {
      if (now - bucket.windowStart > windowMs) rateBuckets.delete(k);
    }
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Queries (all take the service-role client created inside the handler)
// ---------------------------------------------------------------------------

export interface CircleRow {
  id: string;
  name: string;
  invite_code: string;
}

export interface MemberRow {
  device_id: string;
  display_name: string;
  joined_at: string;
}

export async function getCircleById(
  sb: ServiceClient,
  circleId: string
): Promise<CircleRow | null> {
  const { data, error } = await sb
    .from("circles")
    .select("id, name, invite_code")
    .eq("id", circleId)
    .maybeSingle();
  if (error) throw error;
  return (data as CircleRow | null) ?? null;
}

export async function getCircleByInviteCode(
  sb: ServiceClient,
  inviteCode: string
): Promise<CircleRow | null> {
  const { data, error } = await sb
    .from("circles")
    .select("id, name, invite_code")
    .eq("invite_code", inviteCode)
    .maybeSingle();
  if (error) throw error;
  return (data as CircleRow | null) ?? null;
}

export async function getMembers(
  sb: ServiceClient,
  circleId: string
): Promise<MemberRow[]> {
  const { data, error } = await sb
    .from("circle_members")
    .select("device_id, display_name, joined_at")
    .eq("circle_id", circleId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data as MemberRow[] | null) ?? [];
}

export async function findMember(
  sb: ServiceClient,
  circleId: string,
  deviceId: string
): Promise<MemberRow | null> {
  const { data, error } = await sb
    .from("circle_members")
    .select("device_id, display_name, joined_at")
    .eq("circle_id", circleId)
    .eq("device_id", deviceId)
    .maybeSingle();
  if (error) throw error;
  return (data as MemberRow | null) ?? null;
}

export interface MemberStatus {
  display_name: string;
  is_you: boolean;
  checked_in: boolean;
}

/**
 * The member list for one date, with a read / not-yet flag per member.
 * Deliberately a plain list in join order — no counts ranked against
 * each other, no streaks, no scores. Community, not competition.
 */
export async function getMemberStatusForDate(
  sb: ServiceClient,
  circle: CircleRow,
  date: string,
  forDeviceId: string
): Promise<{
  circle_id: string;
  name: string;
  invite_code: string;
  date: string;
  members: MemberStatus[];
}> {
  const members = await getMembers(sb, circle.id);
  const { data, error } = await sb
    .from("circle_checkins")
    .select("device_id")
    .eq("circle_id", circle.id)
    .eq("schedule_date", date);
  if (error) throw error;
  const checkedIn = new Set(
    ((data as { device_id: string }[] | null) ?? []).map((r) => r.device_id)
  );
  return {
    circle_id: circle.id,
    name: circle.name,
    invite_code: circle.invite_code,
    date,
    members: members.map((m) => ({
      display_name: m.display_name,
      is_you: m.device_id === forDeviceId,
      checked_in: checkedIn.has(m.device_id),
    })),
  };
}

/** Member list without check-in state (used by the join response). */
export function memberListPayload(
  circle: CircleRow,
  members: MemberRow[],
  forDeviceId: string
): {
  circle_id: string;
  name: string;
  invite_code: string;
  members: { display_name: string; is_you: boolean }[];
} {
  return {
    circle_id: circle.id,
    name: circle.name,
    invite_code: circle.invite_code,
    members: members.map((m) => ({
      display_name: m.display_name,
      is_you: m.device_id === forDeviceId,
    })),
  };
}

/**
 * True when an error means the circles tables do not exist yet — i.e.
 * migration 014 has not been run. Routes turn that into an honest
 * 503 "Circles aren't available yet" instead of a bare 500.
 */
export function isCirclesSchemaMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  const message = String((error as { message?: unknown }).message ?? "");
  return (
    code === "42P01" || // undefined_table
    code === "PGRST205" || // table not in the PostgREST schema cache
    /circle(s|_members|_checkins).*does not exist/i.test(message) ||
    /Could not find the table.*circle/i.test(message)
  );
}
