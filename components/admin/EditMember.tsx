"use client";

import React, { useState } from "react";
import { X, Save, ShieldAlert } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export interface Member {
  id: string;
  auth_id: string | null;
  name: string;
  father_name: string | null;
  address: string | null;
  pmj_no: number | null;
  mr_no: number;
  head_pmj_no: number | null;
  annual_subs: string;
  arrears: string;
  book_no: string | null;
  page_no: string | null;
  status: 'active' | 'inactive';
}

interface EditMemberProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
}

export default function EditMember({ member, isOpen, onClose, onSave }: EditMemberProps) {
  const [formData, setFormData] = useState<Member>(member);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Update via Supabase Client (Admins have RLS permission to update)
    const { error: dbError } = await supabase
      .from("members")
      .update({
        name: formData.name,
        father_name: formData.father_name,
        address: formData.address,
        annual_subs: formData.annual_subs,
        arrears: formData.arrears,
        book_no: formData.book_no,
        page_no: formData.page_no,
        status: formData.status
      })
      .eq("id", member.id);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      onSave(formData);
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Member Profile</h2>
            <p className="text-sm text-slate-500">Update details for {member.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="p-3 mb-6 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>}

          <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-6">

            {/* LOCKED FIELDS (Admin cannot edit these to prevent data corruption) */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-3 text-sm">
                <ShieldAlert className="w-4 h-4" /> Secure Identifiers (Locked)
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">PMJ No</label>
                  <input type="text" readOnly value={formData.pmj_no || 'N/A'} className="w-full bg-amber-100/50 border border-amber-200 rounded-lg p-2.5 text-amber-900 cursor-not-allowed outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">MR No</label>
                  <input type="text" readOnly value={formData.mr_no} className="w-full bg-amber-100/50 border border-amber-200 rounded-lg p-2.5 text-amber-900 cursor-not-allowed outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Head PMJ</label>
                  <input type="text" readOnly value={formData.head_pmj_no || 'N/A'} className="w-full bg-amber-100/50 border border-amber-200 rounded-lg p-2.5 text-amber-900 cursor-not-allowed outline-none font-mono" />
                </div>
              </div>
            </div>

            {/* EDITABLE FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Father's Name</label>
                <input type="text" name="father_name" value={formData.father_name || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">House Address</label>
                <textarea name="address" rows={2} value={formData.address || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Book No</label>
                <input type="text" name="book_no" value={formData.book_no || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Page No</label>
                <input type="text" name="page_no" value={formData.page_no || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Annual Subs (₹/NA)</label>
                <input type="text" name="annual_subs" value={formData.annual_subs} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Arrears (₹/NA)</label>
                <input type="text" name="arrears" value={formData.arrears} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-member-form" disabled={loading} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}