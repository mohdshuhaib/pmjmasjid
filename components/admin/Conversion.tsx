"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Link as LinkIcon, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { convertMemberAction } from "@/app/admin/actions";

interface SingleMember {
  id: string;
  name: string;
  mr_no: number;
  head_pmj_no: number | null;
}

export default function Conversion() {
  const [members, setMembers] = useState<SingleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [selectedMember, setSelectedMember] = useState<SingleMember | null>(null);
  const [newPmjNo, setNewPmjNo] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [pmjStatus, setPmjStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [converting, setConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const fetchSingleMembers = async () => {
    setLoading(true);
    // Fetch members who DO NOT have a PMJ No, but DO have a Head PMJ No
    const { data, error } = await supabase
      .from('members')
      .select('id, name, mr_no, head_pmj_no')
      .is('pmj_no', null)
      .not('head_pmj_no', 'is', null)
      .order('mr_no', { ascending: true });

    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSingleMembers();
  }, [supabase]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.mr_no.toString().includes(q) ||
      m.head_pmj_no?.toString().includes(q)
    );
  }, [members, searchQuery]);

  // --- PMJ Checker Logic ---
  const checkPmjUniqueness = async () => {
    if (!newPmjNo) return;
    setIsChecking(true);
    setPmjStatus("idle");
    setConversionMessage(null); // Clear any previous errors

    const { data } = await supabase
      .from('members')
      .select('id')
      .eq('pmj_no', parseInt(newPmjNo))
      .single();

    if (data) {
      setPmjStatus("invalid"); // Already exists
    } else {
      setPmjStatus("valid"); // Is unique
    }
    setIsChecking(false);
  };

  // --- Handle Final Conversion ---
  const handleConvert = async () => {
    if (!selectedMember || pmjStatus !== "valid") return;
    setConverting(true);
    setConversionMessage(null);

    const result = await convertMemberAction(selectedMember.id, selectedMember.mr_no, parseInt(newPmjNo));

    if (result.success) {
      setConversionMessage({ type: 'success', text: "Member successfully converted to Family Head!" });
      fetchSingleMembers(); // Refresh the table in the background

      // Wait 2 seconds so user can see success message, then close automatically
      setTimeout(() => {
        closeModal();
      }, 2000);
    } else {
      setConversionMessage({ type: 'error', text: result.error || "Conversion failed." });
      setConverting(false); // Re-enable button so they can try again if there's an error
    }
  };

  const closeModal = () => {
    setSelectedMember(null);
    setNewPmjNo("");
    setPmjStatus("idle");
    setConversionMessage(null);
    setConverting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Convert to Family Head</h2>
          <p className="text-sm text-slate-500">Select a dependent to assign them a PMJ Number.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dependents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">SL</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">MR No</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Current Head PMJ</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m, index) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500 text-sm">{index + 1}</td>
                    <td className="p-4 font-mono font-bold text-slate-600">{m.mr_no}</td>
                    <td className="p-4 font-bold text-slate-800">{m.name}</td>
                    <td className="p-4 font-mono text-slate-500">{m.head_pmj_no}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-sm rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <LinkIcon className="w-4 h-4" /> Convert
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">No dependents found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CONVERSION MODAL --- */}
      {selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 relative">
            <button onClick={closeModal} disabled={converting && conversionMessage?.type === 'success'} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-1">Convert Member</h2>
            <p className="text-sm text-slate-500 mb-6">Assign a PMJ No to <strong>{selectedMember.name}</strong> (MR: {selectedMember.mr_no})</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assign New PMJ Number</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newPmjNo}
                    disabled={converting}
                    onChange={(e) => { setNewPmjNo(e.target.value); setPmjStatus("idle"); setConversionMessage(null); }}
                    className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-lg disabled:opacity-50 disabled:bg-slate-50"
                    placeholder="e.g. 501"
                  />
                  <button
                    type="button"
                    onClick={checkPmjUniqueness}
                    disabled={!newPmjNo || isChecking || converting}
                    className="px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                  >
                    {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
                  </button>
                </div>
              </div>

              {/* Status Indicator for Verification */}
              {pmjStatus === "valid" && !conversionMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" /> PMJ Number is available!
                </div>
              )}
              {pmjStatus === "invalid" && !conversionMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-200">
                  <XCircle className="w-5 h-5" /> This PMJ Number is already taken.
                </div>
              )}

              {/* Conversion Result Message (Success / Error) */}
              {conversionMessage && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 border ${conversionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                  {conversionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                  <span className="leading-tight">{conversionMessage.text}</span>
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={pmjStatus !== "valid" || converting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {converting && !conversionMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Conversion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}