import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Security Check: Block anyone who doesn't have the CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Initialize Supabase Admin (Bypasses normal user rules)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 3. Trigger the Financial Rollover
    const { error: rpcError } = await supabaseAdmin.rpc('process_yearly_rollover', {
      head_amount: '1250',
      dependent_amount: '200'
    });

    if (rpcError) throw rpcError;

    // 4. Log the SUCCESS
    await supabaseAdmin.from('logs').insert({
      event_type: 'YEARLY_ROLLOVER',
      status: 'SUCCESS',
      message: 'Yearly financial rollover completed successfully for all active members.'
    });

    return NextResponse.json({ success: true, message: 'Rollover complete and logged.' });

  } catch (error: any) {
    console.error('Rollover Error:', error);

    // 5. Log the ERROR
    await supabaseAdmin.from('logs').insert({
      event_type: 'YEARLY_ROLLOVER',
      status: 'ERROR',
      message: `Failed to roll over: ${error.message}`
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}