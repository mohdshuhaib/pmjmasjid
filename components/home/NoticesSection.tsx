"use client";

import { useEffect, useState } from "react";
import { Bell, ArrowRight, X, CalendarDays, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TRANSLATIONS, Language } from "@/lib/translations";
import type { Notice } from "@/lib/homepage";

type Props = {
  id?: string;
  lang: Language;
  notices: Notice[];
};

export default function NoticesSection({ id, lang, notices }: Props) {
  const t = TRANSLATIONS[lang];
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedNotice(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const featured = notices[0];
  const others = notices.slice(1);

  return (
    <section id={id} className="scroll-mt-24 font-anek">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Bell className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold md:text-3xl">{t.noticeBoard}</h2>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          {t.noNotices}
        </div>
      ) : (
        <>
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="mb-6 cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              onClick={() => setSelectedNotice(featured)}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-600">
                {new Date(featured.notice_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">{featured.heading}</h3>
              <p className="line-clamp-3 text-slate-600">{featured.details}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => setSelectedNotice(notice)}
                className="flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-emerald-600">
                    {new Date(notice.notice_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900">{notice.heading}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600">{notice.details}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 border-t border-slate-100 pt-4 text-sm font-semibold text-emerald-600">
                  {t.readmore} <ArrowRight className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative mb-4 mt-12 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-slate-200" />
            </div>
            <div className="relative bg-slate-50 px-4">
              <Link
                href="/publicnotice"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
              >
                {t.viewall} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNotice(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 p-6">
                <div>
                  <div className="mb-3 flex w-fit items-center gap-2 rounded-lg bg-emerald-100/60 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(selectedNotice.notice_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <h2 className="pr-4 text-2xl font-bold leading-tight text-slate-900">
                    {selectedNotice.heading}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedNotice(null)}
                  className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700 md:text-base">
                  {selectedNotice.details}
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>
                    Authorized by:{" "}
                    <strong className="text-slate-700">{selectedNotice.confirmed_by}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="w-full rounded-xl bg-slate-900 px-6 py-2.5 font-bold text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}