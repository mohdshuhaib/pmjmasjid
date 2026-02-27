import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key to bypass RLS and insert securely on the backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pmj_no, token, device_type } = body;

    if (!pmj_no || !token) {
      return NextResponse.json({ error: 'Missing pmj_no or token' }, { status: 400 });
    }

    // Upsert the token: If it exists, update it. If not, insert it.
    const { error } = await supabaseAdmin
      .from('device_tokens')
      .upsert(
        {
          pmj_no,
          token,
          device_type: device_type || 'web'
        },
        { onConflict: 'token' } // Requires the UNIQUE constraint on the token column
      );

    if (error) {
      console.error('Supabase Upsert Error:', error.message);
      return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Token registered successfully' });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}