// app/api/notify-signup/route.ts — hardened (Phase 1 security)
// Fixes: real email validation + normalization, no silent false success,
// basic per-IP rate limiting. NOTE: the in-memory rate limiter below is
// best-effort on serverless (each Vercel instance has its own memory).
// For production-grade limiting, swap in a Redis/Upstash counter.

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ---- email validation ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

// ---- best-effort in-memory rate limiter ----
const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  let email: string | null;
  try {
    const body = await req.json();
    email = normalizeEmail(body?.email);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    // Honest failure: misconfiguration, not a silent fake success.
    console.error('notify-signup misconfigured: missing Supabase env vars');
    return NextResponse.json(
      { error: 'Signup temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  const sb = createClient(url, serviceKey);

  const { error } = await sb
    .from('notify_signups')
    .upsert({ email, created_at: new Date().toISOString() }, { onConflict: 'email' });

  if (error) {
    console.error('notify-signup db error:', error.message);
    return NextResponse.json(
      { error: 'Signup temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';
