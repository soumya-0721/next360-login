import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json();

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: 'Email and sessionId are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'revoked' })
      .eq('session_id', sessionId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to revoke session: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
