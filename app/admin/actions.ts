"use server";

import { createClient } from "@supabase/supabase-js";

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
  status: 'active' | 'inactive';
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
    status: (formData.get("status") as 'active' | 'inactive') || 'active'
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
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
          });
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

// 7. Add Payment & Send Push Notification
export async function addPaymentAction(paymentData: any) {
  try {
    // 1. Save to Database
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

    // 2. Send Push Notification (ONLY if they are a registered family - has pmj_no)
    if (paymentData.pmj_no) {
      const { data: tokensData } = await supabaseAdmin
        .from('device_tokens')
        .select('token')
        .eq('pmj_no', paymentData.pmj_no);

      if (tokensData && tokensData.length > 0) {
        try {
          const admin = await import('firebase-admin');
          if (!admin.apps.length) {
            admin.initializeApp({
              credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
            });
          }

          const tokens = tokensData.map(t => t.token);
          await admin.messaging().sendEachForMulticast({
            tokens,
            notification: {
              title: 'Payment Receipt',
              body: `Jazakallah Khair! We received ₹${paymentData.amount} for ${paymentData.purpose}. Bill No: ${paymentData.bill_no}`
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