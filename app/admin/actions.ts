"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize Admin Client (Requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
// Bypasses RLS so admins can create auth accounts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface CSVMemberRow {
  name: string;
  father_name: string;
  address: string;
  pmj_no: number | null;
  mr_no: number;
  head_pmj_no: number | null;
  annual_subs: string;
  arrears: string;
  book_no: string;
  page_no: string;
  status: 'active' | 'deceased' | 'fee_exempt';
}

// 1. Bulk Process CSV
export async function processCSVUpload(parsedData: CSVMemberRow[]) {
  const results = { created: 0, errors: [] as string[] };

  for (const row of parsedData) {
    try {
      let authId = null;

      // If user is a Head (has a PMJ No), create an Auth account
      if (row.pmj_no) {
        const email = `${row.pmj_no}@pmjmasjid.com`;
        const password = `00${row.pmj_no}00${row.mr_no}`; // Updated to use MR_NO

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
        });

        if (authError && !authError.message.includes("already registered")) {
          throw new Error(`Auth Error for PMJ ${row.pmj_no}: ${authError.message}`);
        }

        if (authData?.user) authId = authData.user.id;
      }

      // Insert into the new public.members table structure
      const { error: dbError } = await supabaseAdmin.from('members').insert({
        auth_id: authId,
        name: row.name,
        father_name: row.father_name || null,
        address: row.address || null,
        pmj_no: row.pmj_no,
        mr_no: row.mr_no,
        head_pmj_no: row.head_pmj_no,
        annual_subs: row.annual_subs || 0,
        arrears: row.arrears || 0,
        book_no: row.book_no || null,
        page_no: row.page_no || null,
        status: row.status || 'active'
      });

      if (dbError) {
        // Handle duplicate MR NO gracefully
        if (dbError.code === '23505') throw new Error(`MR Number ${row.mr_no} already exists.`);
        throw new Error(`DB Error for MR ${row.mr_no}: ${dbError.message}`);
      }

      results.created++;

    } catch (err: any) {
      results.errors.push(err.message);
    }
  }

  return results;
}

// 2. Add Individual Member
export async function addIndividualMember(formData: FormData) {
  const row: CSVMemberRow = {
    name: formData.get("name") as string,
    father_name: formData.get("father_name") as string,
    address: formData.get("address") as string,
    pmj_no: formData.get("pmj_no") ? parseInt(formData.get("pmj_no") as string) : null,
    mr_no: parseInt(formData.get("mr_no") as string),
    head_pmj_no: formData.get("head_pmj_no") ? parseInt(formData.get("head_pmj_no") as string) : null,
    annual_subs: (formData.get("annual_subs") as string) || '0',
    arrears: (formData.get("arrears") as string) || '0',
    book_no: formData.get("book_no") as string,
    page_no: formData.get("page_no") as string,
    status: (formData.get("status") as 'active' | 'deceased' | 'fee_exempt' ) || 'active'
  };

  const result = await processCSVUpload([row]);

  if (result.errors.length > 0) {
    return { success: false, error: result.errors[0] };
  }
  return { success: true };
}

// 3. Delete Member (And their Auth Account if applicable)
export async function deleteMemberAction(memberId: string, authId: string | null) {
  try {
    // 1. If they have an auth account (Family Head), delete it from Supabase Auth
    if (authId) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authId);
      if (authError) throw new Error(`Auth Delete Error: ${authError.message}`);
    }

    // 2. Delete from the members table
    const { error: dbError } = await supabaseAdmin.from('members').delete().eq('id', memberId);
    if (dbError) throw new Error(`DB Delete Error: ${dbError.message}`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. Convert Single Member to Married (Family Head)
export async function convertMemberAction(memberId: string, mr_no: number, newPmjNo: number) {
  try {
    const email = `${newPmjNo}@pmjmasjid.com`;
    const password = `00${newPmjNo}00${mr_no}`;

    // 1. Create the new Auth account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);

    // 2. Update the Member in the Database
    const { error: dbError } = await supabaseAdmin.from('members').update({
      auth_id: authData.user.id,
      pmj_no: newPmjNo,
      head_pmj_no: null // Remove them from their parent's dependency
    }).eq('id', memberId);

    if (dbError) {
      // Rollback Auth creation if DB update fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`DB Error: ${dbError.message}`);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 5. Send Notice & Broadcast Push Notification
export async function sendNoticeAction(formData: FormData) {
  try {
    const noticeData = {
      heading: formData.get('heading') as string,
      details: formData.get('details') as string,
      notice_date: formData.get('notice_date') as string,
      confirmed_by: formData.get('confirmed_by') as string,
    };

    // 1. Save Notice to Supabase
    const { data: notice, error: dbError } = await supabaseAdmin
      .from('notices')
      .insert([noticeData])
      .select()
      .single();

    if (dbError) throw new Error(`Database Error: ${dbError.message}`);

    // 2. Fetch all registered device tokens
    const { data: tokensData } = await supabaseAdmin.from('device_tokens').select('token');

    if (tokensData && tokensData.length > 0) {
      try {
        // 3. Initialize Firebase Admin
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

        const tokens = tokensData.map(t => t.token);
        const deadTokens: string[] = [];

        // 4. Chunk the tokens into batches of 500 to prevent Firebase crashes
        const CHUNK_SIZE = 500;

        for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
          const chunk = tokens.slice(i, i + CHUNK_SIZE);

          const response = await admin.messaging().sendEachForMulticast({
            tokens: chunk,
            notification: {
              title: noticeData.heading,
              body: noticeData.details
            },
            data: { url: '/notifications' }
          });

          // 5. Find dead tokens in this specific chunk
          response.responses.forEach((resp, index) => {
            if (!resp.success) {
              const errorCode = resp.error?.code;
              if (
                errorCode === 'messaging/invalid-registration-token' ||
                errorCode === 'messaging/registration-token-not-registered'
              ) {
                deadTokens.push(chunk[index]);
              }
            }
          });
        }

        // 6. Delete all dead tokens from Supabase
        if (deadTokens.length > 0) {
          await supabaseAdmin
            .from('device_tokens')
            .delete()
            .in('token', deadTokens);

          console.log(`Cleaned up ${deadTokens.length} dead tokens.`);
        }

        console.log(`Successfully broadcasted notice to active devices.`);

      } catch (fcmError) {
        // We log the error, but DO NOT throw it. The notice was still saved to the DB!
        console.error("FCM Broadcast failed:", fcmError);
      }
    }

    return { success: true, notice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 6. Delete Notice
export async function deleteNoticeAction(id: string) {
  const { error } = await supabaseAdmin.from('notices').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
// 7. Add Payment, Update Subscriptions, & Send Push Notification
export async function addPaymentAction(paymentData: any) {
  try {
    // --- NEW LOGIC: VERIFY AND SUBTRACT FUND ---
    if (paymentData.purpose === "വാർഷിക വരി" && paymentData.member_id) {
      // Fetch the exact member's current dues
      const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('annual_subs, arrears, name')
        .eq('id', paymentData.member_id)
        .single();

      if (memberError) throw new Error("Could not fetch member details.");

      const parseDue = (val: string | null) => (val && val.toUpperCase() !== 'NA') ? parseFloat(val) : 0;
      const arrearsNum = parseDue(member.arrears);
      const annualNum = parseDue(member.annual_subs);
      const totalDue = arrearsNum + annualNum;
      const paidAmount = parseFloat(paymentData.amount);

      // Check 1: Do they owe nothing?
      if (totalDue === 0) {
        return {
          success: false,
          isDueError: true,
          error: `There is no "വാർഷിക വരി" or "കുടിശ്ശിക" pending for ${member.name}.`
        };
      }

      // Check 2: Are they trying to overpay?
      if (paidAmount > totalDue) {
        return {
          success: false,
          isDueError: true,
          error: `Payment Cancelled! ${member.name} only owes ₹${totalDue} in total (Arrears: ₹${arrearsNum}, Annual: ₹${annualNum}). Cannot accept ₹${paidAmount}.`
        };
      }

      // Calculate Deductions
      let remainingPayment = paidAmount;
      let newArrears = arrearsNum;
      let newAnnual = annualNum;

      // 1. Deduct from Arrears first
      if (newArrears > 0) {
        const deduct = Math.min(newArrears, remainingPayment);
        newArrears -= deduct;
        remainingPayment -= deduct;
      }

      // 2. Deduct remaining from Annual Subs
      if (remainingPayment > 0 && newAnnual > 0) {
        const deduct = Math.min(newAnnual, remainingPayment);
        newAnnual -= deduct;
        remainingPayment -= deduct;
      }

      const formatDue = (original: string | null, newVal: number) => {
        if (original?.toUpperCase() === 'NA' && newVal === 0) return 'NA';
        return newVal.toString();
      };

      // 3. Update the Member's Profile in Supabase
      const { error: updateError } = await supabaseAdmin
        .from('members')
        .update({
          arrears: formatDue(member.arrears, newArrears),
          annual_subs: formatDue(member.annual_subs, newAnnual)
        })
        .eq('id', paymentData.member_id);

      if (updateError) throw new Error("Failed to update member's fund balance.");
    }

    // --- CONTINUE WITH NORMAL PAYMENT SAVING ---
    const { data: payment, error: dbError } = await supabaseAdmin
      .from('payments')
      .insert([{
        bill_no: paymentData.bill_no,
        payment_date: paymentData.payment_date,
        member_id: paymentData.member_id,
        payer_name: paymentData.payer_name,
        pmj_no: paymentData.pmj_no,
        mr_no: paymentData.mr_no,
        amount: paymentData.amount,
        payment_mode: paymentData.payment_mode,
        purpose: paymentData.purpose
      }])
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '23505') throw new Error("Bill Number already exists!");
      throw new Error(`Database Error: ${dbError.message}`);
    }

    // Send Push Notification
    if (paymentData.pmj_no) {
      const { data: tokensData } = await supabaseAdmin.from('device_tokens').select('token').eq('pmj_no', paymentData.pmj_no);

      if (tokensData && tokensData.length > 0) {
        try {
          const admin = await import('firebase-admin');
          if (!admin.apps.length) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
              const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
              const serviceAccount = JSON.parse(buffer.toString('utf8'));
              admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            } else {
              const path = await import('path');
              const serviceAccountPath = path.join(process.cwd(), 'firebase-admin.json');
              if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
                const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
                const serviceAccount = JSON.parse(buffer.toString('utf8'));
                admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
              }
            }
          }

          const tokens = tokensData.map(t => t.token);
          await admin.messaging().sendEachForMulticast({
            tokens,
            notification: {
              title: 'Payment Received',
              body: `ജസാകള്ളാഹു ഖൈറൻ. ${paymentData.purpose} ആവശ്യത്തിനായി ₹${paymentData.amount} വിജയകരമായി ലഭിച്ചിട്ടുണ്ട്. ബിൽ നമ്പർ: ${paymentData.bill_no}. അല്ലാഹു നിങ്ങളുടെ സഹകരണം സ്വീകരിക്കുമാറാകട്ടെ.`
            },
            data: { url: '/notifications' }
          });
        } catch (fcmError) {
          console.error("Payment FCM Broadcast failed:", fcmError);
        }
      }
    }

    return { success: true, payment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8. Mark Payment as Read (For User Dashboard)
export async function markPaymentAsReadAction(paymentId: string) {
  const { error } = await supabaseAdmin
    .from('payments')
    .update({ is_read: true })
    .eq('id', paymentId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function executeYearlyRolloverAction(password: string) {
  try {
    // FIX: Await cookies() because it is asynchronous in Next.js 15
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    // 1. Get current logged in admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return { success: false, error: "Unauthorized access." };

    // 2. VERIFY PASSWORD - Re-authenticate to ensure they are the real admin
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });

    if (authError) {
      return { success: false, error: "Incorrect password. Rollover aborted." };
    }

    // 3. Trigger the Financial Rollover
    const { error: rpcError } = await supabaseAdmin.rpc('process_yearly_rollover', {
      head_amount: 1250,
      dependent_amount: 200
    });

    if (rpcError) throw rpcError;

    // 4. Log the SUCCESS
    await supabaseAdmin.from('logs').insert({
      event_type: 'YEARLY_ROLLOVER',
      status: 'SUCCESS',
      message: 'Manual yearly financial rollover completed successfully.'
    });

    return { success: true };

  } catch (err: any) {
    console.error("Manual Rollover Error:", err);
    // Log the ERROR
    await supabaseAdmin.from('logs').insert({
      event_type: 'YEARLY_ROLLOVER',
      status: 'ERROR',
      message: `Manual rollover failed: ${err.message}`
    });
    return { success: false, error: err.message };
  }
}

// 9. Bulk Delete Payments by Date Range
export async function deletePaymentsByDateRangeAction(fromDate: string, toDate: string) {
  try {
    const { error } = await supabaseAdmin
      .from('payments')
      .delete()
      .gte('payment_date', fromDate)
      .lte('payment_date', toDate);

    if (error) throw new Error(`Delete Error: ${error.message}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}