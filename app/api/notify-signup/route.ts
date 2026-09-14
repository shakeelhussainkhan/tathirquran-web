import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await sb.from('notify_signups').upsert(
      { email, created_at: new Date().toISOString() },
      { onConflict: 'email' }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: true }); // fail silently
  }
}

export const dynamic = 'force-dynamic';
