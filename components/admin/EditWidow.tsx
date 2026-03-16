"use client";

import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Save, X } from "lucide-react";

export interface Widow {
  id: string;
  name: string;
  address: string | null;
  pmj_no: number;
  book_no: string | null;
  page_no: string | null;
  status: "active" | "deceased";
  created_at?: string;
}

export default function EditWidow({
  widow,
  isOpen,
  onClose,
  onSave,
}: {
  widow: Widow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWidow: Widow) => void;
}) {
  const [formData, setFormData] = useState<Widow>(widow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    setFormData(widow);
  }, [widow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from("widows")
      .update({
        name: formData.name,
        address: formData.address,
        pmj_no: formData.pmj_no,
        book_no: formData.book_no,
        page_no: formData.page_no,
        status: formData.status,
      })
      .eq("id", formData.id)
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
    } else if (data) {
      onSave(data);
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Widow Record</h2>
            <p className="text-sm text-slate-500">Update details for {widow.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>}

          <form id="edit-widow-form" onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">House Address</label>
                <textarea rows={2} value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">PMJ Number *</label>
                <input type="number" required value={formData.pmj_no || ""} onChange={(e) => setFormData({ ...formData, pmj_no: parseInt(e.target.value || "0") })} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "deceased" })} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="active">Active</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Book No</label>
                <input type="text" value={formData.book_no || ""} onChange={(e) => setFormData({ ...formData, book_no: e.target.value })} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Page No</label>
                <input type="text" value={formData.page_no || ""} onChange={(e) => setFormData({ ...formData, page_no: e.target.value })} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-widow-form" disabled={loading} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}