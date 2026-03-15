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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setFormData(widow);
  }, [widow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
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

    if (error) {
      alert("Failed to update widow: " + error.message);
    } else if (data) {
      onSave(data);
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Edit Widow</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
            <textarea
              rows={3}
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">PMJ Number</label>
              <input
                type="number"
                value={formData.pmj_no}
                onChange={(e) =>
                  setFormData({ ...formData, pmj_no: parseInt(e.target.value || "0") })
                }
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "deceased",
                  })
                }
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Book No</label>
              <input
                type="text"
                value={formData.book_no || ""}
                onChange={(e) => setFormData({ ...formData, book_no: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Page No</label>
              <input
                type="text"
                value={formData.page_no || ""}
                onChange={(e) => setFormData({ ...formData, page_no: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}