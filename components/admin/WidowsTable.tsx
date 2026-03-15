"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Widow } from "./EditWidow";

export default function WidowsTable({
  widows,
  loading,
  onEdit,
  onDelete,
}: {
  widows: Widow[];
  loading: boolean;
  onEdit: (widow: Widow) => void;
  onDelete: (widow: Widow) => void;
}) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-auto h-full">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3 font-bold">PMJ No</th>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Address</th>
              <th className="px-4 py-3 font-bold">Book No</th>
              <th className="px-4 py-3 font-bold">Page No</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Loading widows...
                </td>
              </tr>
            ) : widows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No widows found.
                </td>
              </tr>
            ) : (
              widows.map((widow) => (
                <tr key={widow.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-800">{widow.pmj_no}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{widow.name}</td>
                  <td className="px-4 py-3 text-slate-600">{widow.address || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{widow.book_no || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{widow.page_no || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        widow.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {widow.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(widow)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(widow)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}