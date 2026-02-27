"use client";

import React, { useState } from "react";
import { Send, BellRing, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { sendNoticeAction } from "@/app/admin/actions";
import RecentNotice from "@/components/admin/RecentNotice";

export default function NoticePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // This state is passed to RecentNotice. Incrementing it forces the child to re-fetch data.
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSendNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await sendNoticeAction(formData);

    if (result.success) {
      setMessage({ type: 'success', text: "Notice saved and broadcasted successfully!" });
      (e.target as HTMLFormElement).reset();
      setRefreshKey(prev => prev + 1); // Trigger table refresh
    } else {
      setMessage({ type: 'error', text: result.error || "Failed to send notice." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BellRing className="w-8 h-8 text-emerald-600" />
          Broadcast Notice
        </h1>
        <p className="text-slate-500 mt-1">Send important announcements via Push Notifications to all members.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* --- COMPOSE NOTICE FORM --- */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSendNotice} className="space-y-6">

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notice Heading *</label>
            <input
              type="text"
              name="heading"
              required
              placeholder="e.g. Important General Body Meeting"
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Notice Message *</label>
            <textarea
              name="details"
              required
              rows={5}
              placeholder="Type the full announcement here..."
              className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 leading-relaxed resize-y"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notice Date *</label>
              <input
                type="date"
                name="notice_date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmed By *</label>
              <select
                name="confirmed_by"
                required
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
              >
                <option value="Secretary">Secretary</option>
                <option value="President">President</option>
                <option value="Vice President">Vice President</option>
                <option value="Joint Secretary">Joint Secretary</option>
                <option value="Committee">Committee</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              {loading ? "Sending Broadcast..." : "Send Notice to All Members"}
            </button>
          </div>
        </form>
      </div>

      {/* --- RECENT NOTICES TABLE --- */}
      <RecentNotice refreshTrigger={refreshKey} />

    </div>
  );
}