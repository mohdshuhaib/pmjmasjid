"use client";

import React, { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export interface Notice {
  id: string;
  heading: string;
  details: string;
  notice_date: string;
  confirmed_by: string;
}

interface EditNoticeProps {
  notice: Notice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedNotice: Notice) => void;
}

export default function EditNotice({ notice, isOpen, onClose, onSuccess }: EditNoticeProps) {
  const [formData, setFormData] = useState<Notice>(notice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase
      .from("notices")
      .update({
        heading: formData.heading,
        details: formData.details,
        notice_date: formData.notice_date,
        confirmed_by: formData.confirmed_by
      })
      .eq("id", notice.id);

    if (dbError) {
      setError(dbError.message);
    } else {
      onSuccess(formData);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Edit Notice</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>}

          <form id="edit-notice-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Heading</label>
              <input type="text" name="heading" required value={formData.heading} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Notice Details</label>
              <textarea name="details" required rows={4} value={formData.details} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                <input type="date" name="notice_date" required value={formData.notice_date} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirmed By</label>
                <select name="confirmed_by" required value={formData.confirmed_by} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="Secretary">Secretary</option>
                  <option value="President">President</option>
                  <option value="Vice President">Vice President</option>
                  <option value="Joint Secretary">Joint Secretary</option>
                  <option value="Committee">Committee</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
          <button type="submit" form="edit-notice-form" disabled={loading} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Updates
          </button>
        </div>
      </div>
    </div>
  );
}