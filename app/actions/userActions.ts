"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNoticeAsRead(noticeId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Upsert the record (so if they click it twice, it doesn't crash)
  const { error } = await supabase
    .from('user_read_notices')
    .upsert({
      user_id: user.id,
      notice_id: noticeId
    }, { onConflict: 'user_id, notice_id' });

  if (error) return { success: false, error: error.message };
  return { success: true };
}