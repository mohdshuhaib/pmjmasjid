"use client";

import React, { useState } from "react";
import { CalendarDays, CheckCircle2, ChevronDown, BellRing, Globe2, User, ArrowLeft } from "lucide-react";
import PersonalAlert from "./PersonalAlert";
import Header from "./Header";
import { markNoticeAsRead } from "@/app/actions/userActions";
import Link from "next/link";

interface Notice {
  id: string;
  heading: string;
  details: string;
  notice_date: string;
  confirmed_by: string;
}

interface Payment {
  id: string;
  bill_no: string;
  payment_date: string;
  payer_name: string;
  mr_no: string | null;
  pmj_no: string | null;
  amount: number;
  purpose: string;
  payment_mode: string;
  is_read: boolean;
}

interface NotificationsClientProps {
  notices: Notice[];
  initialReadIds: string[];
  payments: Payment[];
  logoutAction: () => void;
}

export default function NotificationsClient({ notices, initialReadIds, payments, logoutAction }: NotificationsClientProps) {
  const [activeTab, setActiveTab] = useState<"global" | "personal">("global");
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  // Track read status locally so badges update instantly without page reload
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(new Set(initialReadIds));

  // Track unread payments locally (initially populate with IDs where is_read is false)
  const initialUnreadPayments = payments.filter(p => !p.is_read).map(p => p.id);
  const [unreadPaymentIds, setUnreadPaymentIds] = useState<Set<string>>(new Set(initialUnreadPayments));

  // Dynamically calculate unread counts based on the LIVE state
  const unreadGlobalCount = notices.filter(n => !readNoticeIds.has(n.id)).length;
  const unreadPersonalCount = unreadPaymentIds.size;
  const totalUnread = unreadGlobalCount + unreadPersonalCount;

  // Handler for Global Notices
  const handleNoticeToggle = async (noticeId: string) => {
    if (expandedNoticeId !== noticeId) {
      setExpandedNoticeId(noticeId);
      if (!readNoticeIds.has(noticeId)) {
        const newReadIds = new Set(readNoticeIds);
        newReadIds.add(noticeId);
        setReadNoticeIds(newReadIds);
        markNoticeAsRead(noticeId); // Database update
      }
    } else {
      setExpandedNoticeId(null);
    }
  };

  // Handler for Personal Payments (called by PersonalAlert component)
  const handlePaymentRead = (paymentId: string) => {
    const newUnreadIds = new Set(unreadPaymentIds);
    newUnreadIds.delete(paymentId);
    setUnreadPaymentIds(newUnreadIds);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">

      {/* Header receives the live, instant totalUnread count */}
      <Header logoutAction={logoutAction} unreadCount={totalUnread} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl text-emerald-600 flex items-center justify-center shrink-0">
            <BellRing className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Updates & Alerts</h1>
            <p className="text-sm text-slate-500 mt-1">Stay connected with your masjid community.</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* --- TABS --- */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-full max-w-sm mx-auto md:mx-0">
            <button
              onClick={() => setActiveTab("global")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'global' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Globe2 className="w-4 h-4" /> Global
              {unreadGlobalCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadGlobalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'personal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User className="w-4 h-4" /> Personal
              {unreadPersonalCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadPersonalCount}
                </span>
              )}
            </button>
          </div>

          {/* --- GLOBAL TAB CONTENT --- */}
          {activeTab === "global" && (
            <div className="space-y-4 animate-in font-anek fade-in slide-in-from-bottom-4 duration-300">
              {notices.length > 0 ? (
                notices.map((notice) => {
                  const isUnread = !readNoticeIds.has(notice.id);
                  const isExpanded = expandedNoticeId === notice.id;

                  return (
                    <div
                      key={notice.id}
                      className={`bg-white border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${isUnread ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200'}`}
                    >
                      <button
                        onClick={() => handleNoticeToggle(notice.id)}
                        className="w-full text-left p-5 md:p-6 flex items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {isUnread && <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50 animate-pulse"></span>}
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md shrink-0 w-fit">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {new Date(notice.notice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <h2 className={`text-lg md:text-xl pr-4 ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {notice.heading}
                          </h2>
                        </div>

                        <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 ${isExpanded ? 'bg-emerald-100 text-emerald-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100 bg-white animate-in slide-in-from-top-2">
                          <div className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6 text-[15px]">
                            {notice.details}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Authorized by: <strong className="text-slate-700">{notice.confirmed_by}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <Globe2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Announcements</h3>
                  <p className="text-slate-500 text-sm">You're all caught up! Global notices will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* --- PERSONAL TAB CONTENT --- */}
          {activeTab === "personal" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <PersonalAlert payments={payments} onRead={handlePaymentRead} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}