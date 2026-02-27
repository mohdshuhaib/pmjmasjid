import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Security Check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. The Daily Date Check (UTC Time) - Replaces Vercel's URL parameters
  const today = new Date();
  const month = today.getUTCMonth() + 1; // JavaScript months are 0-11
  const date = today.getUTCDate();

  let type = '';

  // Check if today is December 28th
  if (month === 12 && date === 28) {
    type = 'annual';
  }
  // Check if today is the 1st of March, June, September, or December
  else if (date === 1 && [3, 6, 9, 12].includes(month)) {
    type = 'arrears';
  }
  // If it is any other day of the year, exit quietly!
  else {
    return NextResponse.json({
      success: true,
      message: 'No reminders scheduled for today. Sleeping until tomorrow.'
    });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const targetColumn = type === 'annual' ? 'annual_subs' : 'arrears';

    // 3. Fetch all active device tokens first
    const { data: tokensData, error: tokenError } = await supabaseAdmin
      .from('device_tokens')
      .select('pmj_no, token');

    if (tokenError) throw tokenError;
    if (!tokensData || tokensData.length === 0) {
      return NextResponse.json({ success: true, message: 'No devices registered in the database.' });
    }

    // Group the tokens by Family PMJ No
    const families: Record<number, { tokens: string[], totalAmount: number, headName: string }> = {};
    tokensData.forEach(t => {
      if (!families[t.pmj_no]) families[t.pmj_no] = { tokens: [], totalAmount: 0, headName: 'Family Head' };
      families[t.pmj_no].tokens.push(t.token);
    });

    // 4. Fetch ALL Active Members (Heads AND Dependents)
    const { data: members, error: membersError } = await supabaseAdmin
      .from('members')
      .select(`pmj_no, head_pmj_no, name, ${targetColumn}`)
      .eq('status', 'active');

    if (membersError) throw membersError;

    // 5. Calculate TOTAL Dues for each Family
    members.forEach(m => {
      // Find which family they belong to
      const pmj = m.pmj_no || m.head_pmj_no;

      // If they are orphaned or their family hasn't enabled notifications, skip them to save memory
      if (!pmj || !families[pmj]) return;

      // Safely parse the amount (Ignoring "NA" and "0")
      const rawAmount = (m as Record<string, any>)[targetColumn];
      const amount = (rawAmount && rawAmount.toUpperCase() !== 'NA') ? (parseFloat(rawAmount) || 0) : 0;

      // Add their dues to the family total
      families[pmj].totalAmount += amount;

      // If this specific member has a PMJ No, they are the Head. Let's use their actual name for the message.
      if (m.pmj_no) {
        families[pmj].headName = m.name;
      }
    });

    // 6. Initialize Firebase
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
      });
    }

    // 7. Construct Personalized Messages for families that owe money
    const messages: any[] = [];
    Object.keys(families).forEach(pmjKey => {
      const fam = families[Number(pmjKey)];

      // Only send if the total family debt is greater than 0
      if (fam.totalAmount > 0 && fam.tokens.length > 0) {
        const title = type === 'annual' ? 'Annual Subscription Due' : 'Pending Arrears Reminder';
        const body = `Asalamu Alaikum ${fam.headName}, this is a gentle reminder that your total family ${type === 'annual' ? 'annual subscription' : 'arrears'} is ₹${fam.totalAmount}. Please arrange to clear this soon. Jazakallah Khair.`;

        // Create a message payload for every device this family owns
        fam.tokens.forEach(token => {
          messages.push({
            token,
            notification: { title, body },
            data: { url: '/dashboard' }
          });
        });
      }
    });

    if (messages.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending dues found for registered devices.' });
    }

    // 8. Send in batches of 500
    const deadTokens: string[] = [];
    const CHUNK_SIZE = 500;

    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);
      const response = await admin.messaging().sendEach(chunk);

      // 9. Identify dead tokens
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (errorCode === 'messaging/invalid-registration-token' || errorCode === 'messaging/registration-token-not-registered') {
            deadTokens.push(chunk[index].token);
          }
        }
      });
    }

    // 10. Cleanup dead tokens
    if (deadTokens.length > 0) {
      await supabaseAdmin.from('device_tokens').delete().in('token', deadTokens);
    }

    // 11. Log the success in your database
    await supabaseAdmin.from('logs').insert({
      event_type: `AUTOMATED_REMINDER_${type.toUpperCase()}`,
      status: 'SUCCESS',
      message: `Sent ${messages.length} ${type} reminders. Cleaned up ${deadTokens.length} dead tokens.`
    });

    return NextResponse.json({
      success: true,
      sent: messages.length,
      message: `Successfully sent ${type} reminders.`
    });

  } catch (error: any) {
    console.error('Reminder Cron Error:', error);

    // Log the error
    await supabaseAdmin.from('logs').insert({
      event_type: `AUTOMATED_REMINDER_${type?.toUpperCase() || 'UNKNOWN'}`,
      status: 'ERROR',
      message: `Failed to send reminders: ${error.message}`
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}