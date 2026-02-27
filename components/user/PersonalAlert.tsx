"use client";

import React, { useState } from 'react';
import { Receipt, CalendarDays, CheckCircle2, ChevronDown } from 'lucide-react';
import { markPaymentAsReadAction } from '@/app/admin/actions';

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

interface PersonalAlertProps {
  payments: Payment[];
  onRead: (id: string) => void;
}

export default function PersonalAlert({ payments, onRead }: PersonalAlertProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (payment: Payment) => {
    if (expandedId !== payment.id) {
      setExpandedId(payment.id);
      if (!payment.is_read) {
        markPaymentAsReadAction(payment.id); // Update DB in background
        onRead(payment.id); // Immediately update local state to clear the red badge
      }
    } else {
      setExpandedId(null);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center shadow-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Digital Receipts</h3>
        <p className="text-slate-500 text-sm">Your payment receipts will securely appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const isExpanded = expandedId === payment.id;
        const isUnread = !payment.is_read;

        // Custom Logic for 'വാർഷിക വരി' breakdown
        let displayPurpose = payment.purpose;
        if (payment.purpose === "വാർഷിക വരി") {
          displayPurpose = "വാർഷിക വരി (പെരുന്നാൾ പടികൾ, റമദാൻ, നബിദിനം, ഭക്ഷണം)";
        }

        return (
          <div key={payment.id} className={`bg-white border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${isUnread ? 'border-blue-300 bg-blue-50/10' : 'border-slate-200'}`}>

            {/* Clickable Header */}
            <button
              onClick={() => handleToggle(payment)}
              className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${isUnread ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg md:text-xl font-bold ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                    Payment Received: ₹{payment.amount}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-500">
                    <span>Bill #{payment.bill_no}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{new Date(payment.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {/* Detailed Digital Receipt View */}
            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2">
                <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm font-mono text-sm relative overflow-hidden mt-4">

                  {/* Decorative Receipt Edges */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmMThmNmY2Ii8+PC9zdmc+')] bg-repeat-x"></div>

                  <div className="text-center mb-6 pt-2 border-b border-dashed border-slate-300 pb-4">
                    <h2 className="font-anek font-bold text-lg text-slate-800">പെരുങ്ങുഴി മുസ്‌ലിം ജമാഅത്ത്</h2>
                    <p className="text-xs text-slate-500 font-inter mt-1">Official Digital Receipt</p>
                  </div>

                  <div className="space-y-3 text-slate-600">
                    <div className="flex justify-between"><span className="text-slate-400">Bill No:</span> <strong className="text-slate-800">{payment.bill_no}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Date:</span> <strong className="text-slate-800">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Name:</span> <strong className="text-slate-800 truncate max-w-[150px]">{payment.payer_name}</strong></div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">IDs:</span>
                      <strong className="text-slate-800">MR:{payment.mr_no || 'N/A'} {payment.pmj_no && `| PMJ:${payment.pmj_no}`}</strong>
                    </div>

                    <div className="flex justify-between"><span className="text-slate-400">Mode:</span> <strong className="uppercase text-slate-800">{payment.payment_mode}</strong></div>

                    <div className="border-t border-dashed border-slate-300 pt-3 mt-3">
                      <span className="text-slate-400 block mb-1">Purpose:</span>
                      <strong className="text-slate-800 block leading-snug font-anek">{displayPurpose}</strong>
                    </div>

                    <div className="border-t-2 border-slate-800 pt-3 mt-3 flex justify-between items-center text-base">
                      <span className="text-slate-800 font-bold">TOTAL AMOUNT</span>
                      <strong className="text-emerald-600 text-lg">₹ {payment.amount}</strong>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8 opacity-20 absolute bottom-4 right-4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}