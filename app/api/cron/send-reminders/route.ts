import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Security Check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. The Daily Date Check (UTC Time)
  const today = new Date();
  const month = today.getUTCMonth() + 1; // JavaScript months are 0-11
  const date = today.getUTCDate();

  let type = '';

  // Check if today is December 28th (Annual Reminder)
  if (month === 12 && date === 28) {
    type = 'annual';
  }
  // Check if today is Jan 1st, Apr 1st, Jul 1st, or Oct 1st (Arrears Reminder)
  else if (date === 1 && [1, 4, 7, 10].includes(month)) {
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

    // 3. Fetch all active device tokens
    const { data: tokensData, error: tokenError } = await supabaseAdmin
      .from('device_tokens')
      .select('pmj_no, token');

    if (tokenError) throw tokenError;
    if (!tokensData || tokensData.length === 0) {
      return NextResponse.json({ success: true, message: 'No devices registered.' });
    }

    // Group the tokens by Family PMJ No
    const families: Record<number, { tokens: string[], totalAmount: number, headName: string }> = {};
    tokensData.forEach(t => {
      if (!families[t.pmj_no]) families[t.pmj_no] = { tokens: [], totalAmount: 0, headName: 'Family Head' };
      families[t.pmj_no].tokens.push(t.token);
    });

    // 4. Fetch ALL Active Members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('members')
      .select(`pmj_no, head_pmj_no, name, ${targetColumn}`)
      .eq('status', 'active');

    if (membersError) throw membersError;

    // 5. Calculate TOTAL Dues for each Family
    members.forEach(m => {
      const pmj = m.pmj_no || m.head_pmj_no;
      if (!pmj || !families[pmj]) return;

      const rawAmount = (m as Record<string, any>)[targetColumn];
      const amount = (rawAmount && rawAmount.toUpperCase() !== 'NA') ? (parseFloat(rawAmount) || 0) : 0;

      families[pmj].totalAmount += amount;
      if (m.pmj_no) families[pmj].headName = m.name;
    });

    // 6. Initialize Firebase
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
        const serviceAccount = JSON.parse(buffer.toString('utf8'));

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
    }

    // 7. Construct Personalized Messages
    const messages: any[] = [];
    Object.keys(families).forEach(pmjKey => {
      const fam = families[Number(pmjKey)];
      if (fam.totalAmount > 0 && fam.tokens.length > 0) {
        const title = type === 'annual' ? 'വാർഷിക വരി അറിയിപ്പ്' : 'കുടിശ്ശിക ഓർമ്മപ്പെടുത്തൽ';
        const body = `അസ്സലാമു അലൈക്കും ${fam.headName}, നിങ്ങളുടെ കുടുംബത്തിന്റെ ${type === 'annual' ? 'വാർഷിക വരി' : 'കുടിശ്ശിക'} ₹${fam.totalAmount}. അടയ്ക്കാനുള്ളത് ബാക്കിയുണ്ട്. ദയവായി വേഗത്തിൽ തീർപ്പാക്കണമെന്ന് വിനീതമായി അഭ്യർത്ഥിക്കുന്നു. ജസാകല്ലാഹു ഖൈറൻ.`;

        fam.tokens.forEach(token => {
          messages.push({
            token,
            notification: { title, body },
            data: { url: '/dashboard' }
          });
        });
      }
    });

    if (messages.length === 0) return NextResponse.json({ success: true, message: 'No pending dues found.' });

    // 8. Send in batches of 500
    const deadTokens: string[] = [];
    const CHUNK_SIZE = 500;

    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);
      const response = await admin.messaging().sendEach(chunk);

      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (errorCode === 'messaging/invalid-registration-token' || errorCode === 'messaging/registration-token-not-registered') {
            deadTokens.push(chunk[index].token);
          }
        }
      });
    }

    // 9. Cleanup dead tokens
    if (deadTokens.length > 0) {
      await supabaseAdmin.from('device_tokens').delete().in('token', deadTokens);
    }

    // 10. Log the success
    await supabaseAdmin.from('logs').insert({
      event_type: `AUTOMATED_REMINDER_${type.toUpperCase()}`,
      status: 'SUCCESS',
      message: `Sent ${messages.length} ${type} reminders. Cleaned up ${deadTokens.length} dead tokens.`
    });

    return NextResponse.json({ success: true, sent: messages.length });

  } catch (error: any) {
    console.error('Reminder Cron Error:', error);
    await supabaseAdmin.from('logs').insert({
      event_type: `AUTOMATED_REMINDER_${type?.toUpperCase() || 'UNKNOWN'}`,
      status: 'ERROR',
      message: `Failed to send reminders: ${error.message}`
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}