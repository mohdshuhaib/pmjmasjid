"use client";

import React from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Widow } from "@/components/admin/EditWidow";

interface WidowsTableProps {
  widows: Widow[];
  loading: boolean;
  onEdit: (widow: Widow) => void;
  onDelete: (widow: Widow) => void;
}

export default function WidowsTable({ widows, loading, onEdit, onDelete }: WidowsTableProps) {
  return (
    <div className="flex-1 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
          <p>Loading Widows Database...</p>
        </div>
      ) : (
        <div className="h-full overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 shadow-sm z-10">
              <tr>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">SL</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">PMJ No</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Name</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Address</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Book/Page</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Status</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {widows.map((widow, index) => (
                <tr key={widow.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 text-sm">{index + 1}</td>

                  {/* PMJ No */}
                  <td className="p-4 font-mono font-bold text-lg text-slate-800">
                    {widow.pmj_no || 'N/A'}
                  </td>

                  {/* Name */}
                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-base">{widow.name}</p>
                  </td>

                  {/* Address */}
                  <td className="p-4">
                    <div className="max-w-[250px] max-h-16 overflow-y-auto text-sm text-slate-600 pr-2 custom-scrollbar">
                      {widow.address || '-'}
                    </div>
                  </td>

                  {/* Book / Page Pill */}
                  <td className="p-4 text-center">
                    <div className="inline-flex bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <span className="px-2 py-1 text-xs font-bold text-slate-600 border-r border-slate-200">{widow.book_no || '-'}</span>
                      <span className="px-2 py-1 text-xs font-mono text-slate-500">{widow.page_no || '-'}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${widow.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {widow.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(widow)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Edit Record">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(widow)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="Delete Record">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {widows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Scrollbar for the address column */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}