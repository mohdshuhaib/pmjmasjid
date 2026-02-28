import React from "react";
import { Users, UserCheck, WalletCards, ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Helper to safely parse string amounts like "500" or "NA" for math
const parseAmount = (val: string | null) => {
  if (!val || val.toUpperCase() === 'NA') return 0;
  return parseFloat(val) || 0;
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Run all database queries concurrently for maximum speed
  const [
    { count: totalMembers },
    { count: familyHeads },
    { data: financialData },
    { data: recentPayments }
  ] = await Promise.all([
    // 1. Get Total Members Count
    supabase.from('members').select('*', { count: 'exact', head: true }),

    // 2. Get Family Heads Count (Members who have a PMJ Number)
    supabase.from('members').select('*', { count: 'exact', head: true }).not('pmj_no', 'is', null),

    // 3. Get Financial Data to calculate pending dues (Only active members)
    supabase.from('members').select('annual_subs, arrears').eq('status', 'active'),

    // 4. Get Latest 5 Payments
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  // Calculate Total Pending Dues safely
  const totalPendingDues = financialData?.reduce((acc, member) => {
    return acc + parseAmount(member.annual_subs) + parseAmount(member.arrears);
  }, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, Admin. Here's a live look at the Jamath records.</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Members</p>
            <p className="text-3xl font-bold text-slate-900">{totalMembers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Family Heads</p>
            <p className="text-3xl font-bold text-slate-900">{familyHeads || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <WalletCards className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Dues</p>
            <p className="text-3xl font-bold text-slate-900">
              ₹ {totalPendingDues.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

      </div>

      {/* --- RECENT PAYMENTS TABLE --- */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Recent Payments
          </h2>
          <Link
            href="/admin/dashboard/payment"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Bill No</th>
                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Payer Name</th>
                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPayments && recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-600 text-sm">
                      {new Date(payment.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-bold text-slate-800">#{payment.bill_no}</td>
                    <td className="p-4 font-semibold text-slate-700">{payment.payer_name}</td>
                    <td className="p-4 font-bold text-emerald-700">₹ {payment.amount}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                        {payment.payment_mode}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="w-8 h-8 mb-3 opacity-20" />
                      <p>No payments recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}