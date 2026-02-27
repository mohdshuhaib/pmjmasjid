"use client";

import React from "react";
import { Users, UserCheck, WalletCards } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Members</p>
            <p className="text-3xl font-bold text-slate-900">412</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Family Heads</p>
            <p className="text-3xl font-bold text-slate-900">128</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <WalletCards className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Dues</p>
            <p className="text-3xl font-bold text-slate-900">₹ 14,500</p>
          </div>
        </div>

      </div>

      {/* Placeholder for Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Payments</h2>
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
          Payment tracking table will be integrated here soon.
        </div>
      </div>
    </div>
  );
}