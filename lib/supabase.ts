import { createClient } from "@supabase/supabase-js";

// NOTE: `||` not `??` — an env var that is set but EMPTY must also fall
// back. An empty string passes `??` and makes createClient throw
// "supabaseUrl is required" at module evaluation, which kills
// `next build` during page-data collection (builds failed silently
// on Vercel from 2026-10-16 until this fix).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// Service role client — only used in API routes / seed script (server-side only)
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
