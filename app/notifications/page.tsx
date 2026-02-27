import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationsClient from "@/components/user/NotificationsClient";

export default async function NotificationsPage() {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch the user's member profile to get their PMJ Number
  const { data: member } = await supabase
    .from("members")
    .select("pmj_no")
    .eq("auth_id", user.id)
    .single();

  // 3. Fetch all public notices
  const { data: notices } = await supabase
    .from("notices")
    .select("*")
    .order("notice_date", { ascending: false })
    .order("created_at", { ascending: false });

  // 4. Fetch which notices this user has read
  const { data: readRecords } = await supabase
    .from("user_read_notices")
    .select("notice_id")
    .eq("user_id", user.id);

  const readIds = readRecords?.map(r => r.notice_id) || [];

  // 5. Fetch Family Payments (Digital Receipts)
  let payments: any[] = [];
  if (member && member.pmj_no) {
    const { data: paymentData } = await supabase
      .from("payments")
      .select("*")
      .eq("pmj_no", member.pmj_no)
      .order("created_at", { ascending: false });

    if (paymentData) payments = paymentData;
  }

  // Secure Logout Action
  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <NotificationsClient
      notices={notices || []}
      initialReadIds={readIds}
      payments={payments}
      logoutAction={handleLogout}
    />
  );
}