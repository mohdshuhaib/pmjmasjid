"use client";

import React, { useState, useMemo } from "react";
import { Filter, Loader2, Download, Trash2, AlertTriangle } from "lucide-react";
import { deletePaymentsByDateRangeAction } from "@/app/admin/actions";

interface RecentPaymentsProps {
  payments: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function RecentPayments({ payments, loading, onRefresh }: RecentPaymentsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [step, setStep] = useState<"select" | "confirm">("select"); // 2-step process
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Inline errors
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Extract unique, sorted dates from the available payments
  const availableDates = useMemo(() => {
    const dates = payments.map(p => p.payment_date.split('T')[0]);
    return Array.from(new Set(dates)).sort();
  }, [payments]);

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    const headers = ["Bill No", "Date", "Name of Payer", "PMJ No", "MR No", "Amount", "Payment Mode", "Purpose"];

    const rows = payments.map(p => {
      return [
        p.bill_no,
        new Date(p.payment_date).toLocaleDateString('en-IN'),
        `"${(p.payer_name || '').replace(/"/g, '""')}"`,
        p.pmj_no || 'N/A',
        p.mr_no || 'N/A',
        p.amount,
        p.payment_mode,
        `"${(p.purpose || '').replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `PMJ_Receipts_Export_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DELETE LOGIC ---
  const handleNextStep = () => {
    setErrorMsg(null);
    if (!fromDate || !toDate) {
      setErrorMsg("Please select both From and To dates.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setErrorMsg("'From Date' cannot be after 'To Date'.");
      return;
    }
    setStep("confirm"); // Move to confirmation UI
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    const result = await deletePaymentsByDateRangeAction(fromDate, toDate);

    if (result.success) {
      closeModal();
      onRefresh(); // Refresh the table
    } else {
      setErrorMsg(result.error || "Failed to delete receipts.");
      setStep("select"); // Go back to show the error
    }
    setDeleteLoading(false);
  };

  const closeModal = () => {
    setIsDeleteModalOpen(false);
    setStep("select");
    setFromDate("");
    setToDate("");
    setErrorMsg(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mt-8">

      {/* Table Header & Actions */}
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" /> Recent Transactions
        </h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" /> Bulk Delete
          </button>
          <button
            onClick={handleExportExcel}
            disabled={payments.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">SL</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Date</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Bill No</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">PMJ / MR</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Name</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Amount / Mode</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">No payments recorded yet.</td></tr>
            ) : (
              payments.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500 text-sm">{i + 1}</td>
                  <td className="p-4 font-mono text-slate-600">{new Date(p.payment_date).toLocaleDateString('en-IN')}</td>
                  <td className="p-4 font-bold text-slate-800">#{p.bill_no}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {p.pmj_no ? `PMJ: ${p.pmj_no}` : 'Non-Member'}<br/>
                    {p.mr_no && `MR: ${p.mr_no}`}
                  </td>
                  <td className="p-4 font-bold text-slate-700">{p.payer_name}</td>
                  <td className="p-4">
                    <div className="font-bold text-emerald-700">₹ {p.amount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.payment_mode}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{p.purpose}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">

            {step === "select" ? (
              // --- STEP 1: DATE SELECTION ---
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 text-red-600 rounded-full">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Bulk Delete Receipts</h2>
                    <p className="text-sm text-slate-500">Select date range to delete.</p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">From Date</label>
                    <select
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">-- Select Available Date --</option>
                      {availableDates.map(d => <option key={`from-${d}`} value={d}>{new Date(d).toLocaleDateString('en-IN')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">To Date</label>
                    <select
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">-- Select Available Date --</option>
                      {availableDates.map(d => <option key={`to-${d}`} value={d}>{new Date(d).toLocaleDateString('en-IN')}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Review & Delete
                  </button>
                </div>
              </>
            ) : (
              // --- STEP 2: CONFIRMATION ---
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Are you absolutely sure?</h2>
                <p className="text-slate-600 mb-6">
                  You are about to permanently delete <strong>all receipts</strong> from <strong className="text-slate-900">{new Date(fromDate).toLocaleDateString('en-IN')}</strong> to <strong className="text-slate-900">{new Date(toDate).toLocaleDateString('en-IN')}</strong>.<br/><br/>
                  This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("select")}
                    disabled={deleteLoading}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleteLoading}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Delete All"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}