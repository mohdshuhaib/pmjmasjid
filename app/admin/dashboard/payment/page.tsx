"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Receipt, Search, PlusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { addPaymentAction } from "@/app/admin/actions";
import RecentPayments from "@/components/admin/RecentPayments";

interface Member {
  id: string;
  name: string;
  pmj_no: number | null;
  head_pmj_no: number | null;
  mr_no: number;
}

export default function PaymentDashboard() {
  // --- States ---
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New Due Alert Modal State
  const [dueAlert, setDueAlert] = useState<{ isOpen: boolean, title: string, message: string } | null>(null);

  // Form States
  const [billNo, setBillNo] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");

  // Smart Member Search States
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isCustomMember, setIsCustomMember] = useState(false);
  const [customName, setCustomName] = useState("");

  // Purpose States
  const [purpose, setPurpose] = useState("വാർഷിക വരി");
  const [customPurpose, setCustomPurpose] = useState("");

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // --- Fetch Initial Data ---
  useEffect(() => {
    fetchMembers();
    fetchPayments();
  }, [supabase]);

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('id, name, pmj_no, head_pmj_no, mr_no');
    if (data) setMembers(data);
    setLoadingMembers(false);
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setPayments(data);
    setLoadingPayments(false);
  };

  // --- Search Logic ---
  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    const q = memberSearch.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.mr_no.toString().includes(q) ||
      m.pmj_no?.toString().includes(q) ||
      m.head_pmj_no?.toString().includes(q)
    ).slice(0, 5); // Show top 5 matches
  }, [members, memberSearch]);

  // --- Handle Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const activePurpose = purpose === "custom" ? customPurpose : purpose;
    const activeName = isCustomMember ? customName : selectedMember?.name;
    const activePmj = isCustomMember ? null : (selectedMember?.pmj_no || selectedMember?.head_pmj_no);
    const activeMr = isCustomMember ? null : selectedMember?.mr_no;
    const activeMemberId = isCustomMember ? null : selectedMember?.id;

    if (!activeName || !activePurpose || !billNo || !amount) {
      setMessage({ type: 'error', text: "Please fill all required fields." });
      setSubmitting(false);
      return;
    }

    const payload = {
      bill_no: parseInt(billNo),
      payment_date: paymentDate,
      member_id: activeMemberId,
      payer_name: activeName,
      pmj_no: activePmj,
      mr_no: activeMr,
      amount: parseFloat(amount),
      payment_mode: mode,
      purpose: activePurpose
    };

    const result = await addPaymentAction(payload);

    if (result.success) {
      setMessage({ type: 'success', text: "Payment saved and receipt sent successfully!" });
      // Reset Form
      setBillNo(""); setAmount(""); setMemberSearch(""); setSelectedMember(null); setCustomName(""); setIsCustomMember(false);
      fetchPayments(); // Refresh table
    } else {
      if (result.isDueError) {
        setDueAlert({ isOpen: true, title: "Payment Cancelled", message: result.error || "Unknown error." });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-emerald-600" />
          Payment Management
        </h1>
        <p className="text-slate-500 mt-1">Record payments and instantly notify members.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* --- ADD PAYMENT FORM --- */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" /> New Receipt Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Bill & Date */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bill No *</label>
              <input type="number" required value={billNo} onChange={e => setBillNo(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono" placeholder="e.g. 1001" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Date *</label>
              <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            {/* Smart Member Search */}
            <div className="relative md:col-span-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Who Paid? *</label>
                <button type="button" onClick={() => { setIsCustomMember(!isCustomMember); setSelectedMember(null); setMemberSearch(""); }} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                  {isCustomMember ? "Select Registered Member" : "Add Custom Name (Non-Member)"}
                </button>
              </div>

              {isCustomMember ? (
                <input type="text" required value={customName} onChange={e => setCustomName(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" placeholder="Enter full name of non-member" />
              ) : (
                <div className="relative">
                  {selectedMember ? (
                    <div className="flex items-center justify-between w-full border border-emerald-300 bg-emerald-50 rounded-xl p-3">
                      <div>
                        <p className="font-bold text-slate-800">{selectedMember.name}</p>
                        <p className="text-xs text-slate-500 font-mono">PMJ: {selectedMember.pmj_no || selectedMember.head_pmj_no || 'N/A'} | MR: {selectedMember.mr_no}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedMember(null)} className="text-red-500 text-sm font-bold hover:underline">Change</button>
                    </div>
                  ) : (
                    <>
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={e => setMemberSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        placeholder="Search by Name, PMJ, or MR Number..."
                      />
                      {/* Search Results Dropdown */}
                      {memberSearch && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                          {filteredMembers.length > 0 ? filteredMembers.map(m => (
                            <div key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(""); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center">
                              <span className="font-bold text-slate-800">{m.name}</span>
                              <span className="text-xs text-slate-500 font-mono">MR:{m.mr_no} {m.pmj_no ? `| PMJ:${m.pmj_no}` : `| Head PMJ:${m.head_pmj_no}`}</span>
                            </div>
                          )) : (
                            <div className="p-3 text-sm text-slate-500 text-center">No members found.</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Amount & Mode */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Amount (₹) *</label>
              <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mode *</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="net banking">Net Banking</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Purpose *</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="വാർഷിക വരി">വാർഷിക വരി</option>
                <option value="സർട്ടിഫിക്കറ്റ്">സർട്ടിഫിക്കറ്റ്</option>
                <option value="സംഭാവന">സംഭാവന</option>
                <option value="custom">Other (Custom)</option>
              </select>
              {purpose === "custom" && (
                <input type="text" required value={customPurpose} onChange={e => setCustomPurpose(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 mt-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" placeholder="Enter custom purpose..." />
              )}
            </div>
          </div>

          <button type="submit" disabled={submitting || (!isCustomMember && !selectedMember)} className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {submitting ? "Processing..." : "Save Payment & Send Receipt"}
          </button>
        </form>
      </div>

      {/* --- EXTRACTED RECENT PAYMENTS COMPONENT --- */}
      <RecentPayments
        payments={payments}
        loading={loadingPayments}
        onRefresh={fetchPayments}
      />

      {/* --- DUE BALANCE ERROR MODAL --- */}
      {dueAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{dueAlert.title}</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">{dueAlert.message}</p>
            <button
              onClick={() => setDueAlert(null)}
              className="w-full py-3 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}