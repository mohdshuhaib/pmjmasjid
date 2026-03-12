"use client";

import React from "react";
import { Search, Users, Download } from "lucide-react";

interface MembersFilterProps {
  totalMembers: number;
  filteredCount: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: "all" | "active" | "deceased" | "fee_exempt";
  setStatusFilter: (val: "all" | "active" | "deceased" | "fee_exempt") => void;
  maritalFilter: "all" | "married" | "single";
  setMaritalFilter: (val: "all" | "married" | "single") => void;
  onExport: () => void;
}

export default function MembersFilter({
  totalMembers,
  filteredCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  maritalFilter,
  setMaritalFilter,
  onExport
}: MembersFilterProps) {
  return (
    <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 pb-4 shadow-sm mb-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Members Directory</h1>
            <p className="text-sm text-slate-500">Showing {filteredCount} of {totalMembers} total members</p>
          </div>
        </div>

        {/* --- NEW: EXPORT BUTTON --- */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Bar */}
        <div className="md:col-span-6 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Address, PMJ or MR No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full py-3 px-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">🟢 Active Members</option>
            <option value="deceased">⚪ Deceased Members</option>
            <option value="fee_exempt">🔵 Fee Exempt Members</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={maritalFilter}
            onChange={(e) => setMaritalFilter(e.target.value as any)}
            className="w-full py-3 px-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium text-slate-700"
          >
            <option value="all">All Marital Status</option>
            <option value="married">Married (Has PMJ)</option>
            <option value="single">Single (Dependent)</option>
          </select>
        </div>
      </div>
    </div>
  );
}