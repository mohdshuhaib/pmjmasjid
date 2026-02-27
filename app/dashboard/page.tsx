import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wallet, Users, CreditCard, User, AlertCircle, MapPin } from "lucide-react";

// Import Modular Components
import Header from "@/components/user/Header";
import Receipts from "@/components/user/Receipts";
import NotificationPermission from "@/components/user/NotificationPermission";

// Helper to safely parse string amounts like "500" or "NA" for math
const parseAmount = (val: string | null) => {
  if (!val || val.toUpperCase() === 'NA') return 0;
  return parseFloat(val) || 0;
};

export default async function MemberDashboard() {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch the Head Member's Details
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (memberError || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">Your account is active, but your member profile could not be located. Please contact the committee.</p>
          <form action={async () => { "use server"; const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }}>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium">Log out</button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Fetch Dependents (Family Members) using the Head's PMJ
  const { data: dependents } = await supabase
    .from("members")
    .select("*")
    .eq("head_pmj_no", member.pmj_no)
    .order("id", { ascending: true });

  // 4. Fetch Recent Payments for the entire family
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("pmj_no", member.pmj_no)
    .order("payment_date", { ascending: false })
    .limit(5);

  // --- 5. CALCULATE UNREAD NOTIFICATIONS BADGE ---
  // A. Unread Global Notices
  const { count: totalNotices } = await supabase
    .from("notices")
    .select("*", { count: 'exact', head: true });

  const { count: readNotices } = await supabase
    .from("user_read_notices")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id);

  const unreadGlobalCount = Math.max(0, (totalNotices || 0) - (readNotices || 0));

  // B. Unread Personal Receipts
  const { count: unreadPersonalCount } = await supabase
    .from("payments")
    .select("*", { count: 'exact', head: true })
    .eq("pmj_no", member.pmj_no)
    .eq("is_read", false);

  const totalUnread = unreadGlobalCount + (unreadPersonalCount || 0);
  // ------------------------------------------------

  // Secure Logout Action
  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  // --- Calculations for Total Family Amounts ---
  const headSubs = parseAmount(member.annual_subs);
  const headArrears = parseAmount(member.arrears);

  const depSubs = dependents?.reduce((acc, dep) => acc + parseAmount(dep.annual_subs), 0) || 0;
  const depArrears = dependents?.reduce((acc, dep) => acc + parseAmount(dep.arrears), 0) || 0;

  const totalFamilySubs = headSubs + depSubs;
  const totalFamilyArrears = headArrears + depArrears;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">

      {/* Navbar receives the combined badge count */}
      <Header logoutAction={handleLogout} unreadCount={totalUnread} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Notification Permission Banner */}
        <NotificationPermission pmj_no={member.pmj_no} />

        {/* Detailed Welcome Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Status Badge */}
          <div className="absolute top-6 right-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {member.status} Member
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar & Name */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-100/50 shrink-0">
                <User className="w-10 h-10" />
              </div>
              <div>
                <p className="text-slate-500 font-medium text-sm mb-1">Family Head Profile</p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{member.name}</h1>
                {member.father_name && (
                  <p className="text-slate-500 text-sm mt-1">S/O: <span className="font-semibold text-slate-700">{member.father_name}</span></p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 w-full grid grid-cols-2 md:flex md:justify-end gap-3 md:gap-4 mt-2 md:mt-0">
              <div className="bg-slate-50 border border-slate-200 p-3 md:px-5 md:py-4 rounded-2xl text-center">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">PMJ No</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-700">{member.pmj_no}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 md:px-5 md:py-4 rounded-2xl text-center">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">MR No</p>
                <p className="text-xl md:text-2xl font-bold text-slate-800">{member.mr_no}</p>
              </div>
            </div>
          </div>

          {/* Address Bar */}
          {member.address && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3 text-slate-600 bg-slate-50/50 p-4 rounded-xl">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed font-medium">{member.address}</p>
            </div>
          )}
        </div>

        {/* TOTAL Financial Overview Cards */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Total Family Dues</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-5 transition-transform hover:scale-[1.01]">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Annual Subs</p>
                <p className="text-3xl font-bold text-slate-900">₹ {totalFamilySubs}</p>
                <p className="text-xs text-slate-500 mt-2">Combined subscription for {1 + (dependents?.length || 0)} members</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-5 transition-transform hover:scale-[1.01]">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Arrears</p>
                <p className="text-3xl font-bold text-red-600">₹ {totalFamilyArrears}</p>
                <p className="text-xs text-slate-500 mt-2">Combined pending arrears</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Individual Breakdowns Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Family Details & Dues</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Member Details</th>
                    <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">MR No</th>
                    <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Subs</th>
                    <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Arrears</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Head Member Row */}
                  <tr className="bg-emerald-50/30">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 inline-block">Head (You)</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 font-medium">{member.mr_no}</td>
                    <td className="p-4 text-right font-medium text-slate-800">{member.annual_subs}</td>
                    <td className="p-4 text-right font-bold text-red-600">{member.arrears}</td>
                  </tr>

                  {/* Dependent Rows */}
                  {dependents && dependents.length > 0 ? (
                    dependents.map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-700">{dep.name}</p>
                          <p className="text-xs text-slate-500 mt-1">Dependent</p>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{dep.mr_no}</td>
                        <td className="p-4 text-right font-medium text-slate-700">{dep.annual_subs}</td>
                        <td className="p-4 text-right font-bold text-red-600">{dep.arrears}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                        No additional family members registered under your PMJ number.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipts Sidebar Component */}
          <div className="lg:col-span-1">
             <Receipts payments={payments} />
          </div>

        </div>
      </main>
    </div>
  );
}