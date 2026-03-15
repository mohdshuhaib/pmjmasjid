"use client";

import React, { useState } from "react";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function AddWidow() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const pmj_no = Number(formData.get("pmj_no"));
    const book_no = formData.get("book_no") as string;
    const page_no = formData.get("page_no") as string;
    const status = formData.get("status") as string;

    const { error } = await supabase.from("widows").insert({
      name,
      address,
      pmj_no,
      book_no,
      page_no,
      status,
    });

    if (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } else {
      setMessage({
        type: "success",
        text: "Widow added successfully!",
      });

      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-4">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold">Widow Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              PMJ Number *
            </label>
            <input
              type="number"
              name="pmj_no"
              required
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Unique PMJ number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              rows={3}
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Book No
            </label>
            <input
              type="text"
              name="book_no"
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. B-12"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Page No
            </label>
            <input
              type="text"
              name="page_no"
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. 45"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Status
            </label>
            <select
              name="status"
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="active">Active</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

        </div>

        <button
          disabled={loading}
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Widow"}
        </button>

      </form>
    </div>
  );
}