"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, ArrowUpDown, Loader2, AlertTriangle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import EditNotice, { Notice } from "./EditNotice";
import { deleteNoticeAction } from "@/app/admin/actions";

export default function RecentNotice({ refreshTrigger }: { refreshTrigger: number }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Modals
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    fetchNotices();
  }, [refreshTrigger]);

  const fetchNotices = async () => {
    setLoading(true);
    const { data } = await supabase.from('notices').select('*').order('notice_date', { ascending: false });
    if (data) setNotices(data);
    setLoading(false);
  };

  const sortedNotices = [...notices].sort((a, b) => {
    const dateA = new Date(a.notice_date).getTime();
    const dateB = new Date(b.notice_date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    const result = await deleteNoticeAction(deletingId);
    if (result.success) {
      setNotices(notices.filter(n => n.id !== deletingId));
      setDeletingId(null);
    } else {
      alert("Failed to delete notice: " + result.error);
    }
    setDeleteLoading(false);
  };

  const handleEditSuccess = (updated: Notice) => {
    setNotices(notices.map(n => n.id === updated.id ? updated : n));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Past Notices</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider w-16">SL</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors select-none" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                <div className="flex items-center gap-2">
                  Date <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider w-full">Heading</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
            ) : sortedNotices.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No notices found.</td></tr>
            ) : (
              sortedNotices.map((notice, index) => (
                <tr key={notice.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500 text-sm">{index + 1}</td>
                  <td className="p-4 font-mono text-slate-600 font-medium">
                    {new Date(notice.notice_date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 font-bold text-slate-800 truncate max-w-xs">{notice.heading}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingNotice(notice)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(notice.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
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

      {/* Edit Modal */}
      {editingNotice && (
        <EditNotice notice={editingNotice} isOpen={true} onClose={() => setEditingNotice(null)} onSuccess={handleEditSuccess} />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Notice?</h2>
            <p className="text-slate-500 text-sm mb-6">This action will permanently delete this notice from the database.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} disabled={deleteLoading} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex justify-center items-center">
                {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}