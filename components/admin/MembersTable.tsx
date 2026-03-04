"use client";

import React from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Member } from "@/components/admin/EditMember";

interface MembersTableProps {
  members: Member[];
  loading: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export default function MembersTable({ members, loading, onEdit, onDelete }: MembersTableProps) {
  return (
    <div className="flex-1 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
          <p>Loading Member Database...</p>
        </div>
      ) : (
        <div className="h-full overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 shadow-sm z-10">
              <tr>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">SL</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">PMJ No</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">MR No</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Member Details</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Address</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Book/Page</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Financials</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Status</th>
                <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member, index) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 text-sm">{index + 1}</td>

                  {/* PMJ No Logic */}
                  <td className="p-4 font-mono font-bold text-lg">
                    {member.pmj_no ? (
                      <span className="text-slate-800">{member.pmj_no}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-red-500">{member.head_pmj_no || 'N/A'}</span>
                        <span className="text-[10px] text-red-400 uppercase tracking-wider">Head PMJ</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-600 text-lg">{member.mr_no}</td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-base">{member.name}</p>
                    <p className="text-xs text-slate-500">S/O: <span className="font-medium text-slate-600">{member.father_name || 'N/A'}</span></p>
                  </td>

                  <td className="p-4">
                    <div className="max-w-[200px] max-h-16 overflow-y-auto text-sm text-slate-600 pr-2 custom-scrollbar">
                      {member.address || '-'}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="inline-flex bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <span className="px-2 py-1 text-xs font-bold text-slate-600 border-r border-slate-200">{member.book_no || '-'}</span>
                      <span className="px-2 py-1 text-xs font-mono text-slate-500">{member.page_no || '-'}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">
                        Subs: {member.annual_subs}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${member.arrears === '0' || member.arrears === 'NA' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'}`}>
                        Due: {member.arrears}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {member.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(member)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Edit Member">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(member)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="Delete Member">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    No members found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Hide Scrollbar styling for Address container */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}