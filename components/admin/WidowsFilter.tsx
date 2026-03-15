"use client";

import React from "react";
import { Search } from "lucide-react";

export default function WidowsFilter({
  totalWidows,
  filteredCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: {
  totalWidows: number;
  filteredCount: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: "all" | "active" | "deceased";
  setStatusFilter: (value: "all" | "active" | "deceased") => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Widows</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {filteredCount} of {totalWidows} records
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, address, PMJ, book, page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "deceased")
            }
            className="border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>
    </div>
  );
}