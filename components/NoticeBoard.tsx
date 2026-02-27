"use client";

import React, { useState, useEffect } from "react";
import { Bell, ArrowRight, X, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

interface NoticeBoardProps {
  lang: Language;
}

interface Notice {
  id: string;
  heading: string;
  details: string;
  notice_date: string;
  confirmed_by: string;
}

export default function NoticeBoard({ lang }: NoticeBoardProps) {
  const t = TRANSLATIONS[lang];
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    async function fetchLatestNotices() {
      const { data } = await supabase
        .from('notices')
        .select('*')
        .order('notice_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3); // Only fetch the 3 most recent

      if (data) setNotices(data);
      setLoading(false);
    }
    fetchLatestNotices();
  }, [supabase]);

  return (
    <section className="font-anek">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t.noticeBoard}</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 shadow-sm">
          No recent notices available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between h-full"
            >
              <div>
                <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-3 block">
                  {new Date(notice.notice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug line-clamp-2">
                  {notice.heading}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                  {notice.details}
                </p>
              </div>
              <div className="text-emerald-600 flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
                {t.readmore} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show More Divider */}
      {!loading && notices.length > 0 && (
        <div className="relative mt-14 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-slate-200"></div>
          </div>
          <div className="relative px-4" style={{ backgroundColor: 'inherit' }}>
            <Link
              href="/publicnotice"
              className="text-slate-600 font-bold text-sm flex items-center gap-2 hover:text-emerald-700 hover:border-emerald-200 transition-colors bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm hover:shadow-md"
            >
              {t.viewall} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* --- READ MORE MODAL --- */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">

            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg w-fit mb-3">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(selectedNotice.notice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight pr-4">
                  {selectedNotice.heading}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
                {selectedNotice.details}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Authorized by: <strong className="text-slate-700">{selectedNotice.confirmed_by}</strong></span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}