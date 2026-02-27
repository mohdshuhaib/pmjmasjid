"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { createBrowserClient } from "@supabase/ssr";
import { Bell, CalendarDays, ChevronDown, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Notice {
  id: string;
  heading: string;
  details: string;
  notice_date: string;
  confirmed_by: string;
}

export default function PublicNoticePage() {
  const [lang, setLang] = useState<Language>("en");
  const t = TRANSLATIONS[lang];

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    async function fetchAllNotices() {
      const { data } = await supabase
        .from('notices')
        .select('*')
        .order('notice_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) setNotices(data);
      setLoading(false);
    }
    fetchAllNotices();
  }, [supabase]);

  const toggleNotice = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={`min-h-screen bg-slate-50 pb-16 ${lang === 'ml' ? 'font-anek' : 'font-inter'}`}>
      <Header lang={lang} setLang={setLang} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">{t.publicnotice}</h1>
              <p className="text-slate-500 mt-1">{t.offannounce}</p>
            </div>
          </div>
        </div>

        {/* Notices Accordion List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
            <p>Loading historical notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Notices Found</h3>
            <p className="text-slate-500 text-sm">There are currently no announcements to display.</p>
          </div>
        ) : (
          <div className="space-y-4 font-anek">
            {notices.map((notice) => {
              const isExpanded = expandedId === notice.id;

              return (
                <div
                  key={notice.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:border-emerald-200"
                >
                  <button
                    onClick={() => toggleNotice(notice.id)}
                    className="w-full text-left p-5 md:p-6 flex items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(notice.notice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <h2 className={`text-lg md:text-xl font-bold transition-colors ${isExpanded ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {notice.heading}
                      </h2>
                    </div>

                    <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 border border-slate-100 ${isExpanded ? 'bg-emerald-100 text-emerald-600 rotate-180 border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2">
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-6 text-[15px] md:text-base">
                        {notice.details}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100 w-fit shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Authorized by: <strong className="text-slate-700">{notice.confirmed_by}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}