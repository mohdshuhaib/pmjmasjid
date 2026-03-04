"use client";

import React, { useState, useEffect } from "react";
import { DatabaseBackup, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { executeYearlyRolloverAction } from "@/app/admin/actions";

export default function YearlyRollover() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [lastLog, setLastLog] = useState<{ created_at: string, status: string, message: string } | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const fetchLastLog = async () => {
    const { data } = await supabase
      .from('logs')
      .select('created_at, status, message')
      .eq('event_type', 'YEARLY_ROLLOVER')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) setLastLog(data);
  };

  useEffect(() => {
    fetchLastLog();
  }, [supabase]);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (!confirm("CRITICAL WARNING: This will update the financial records of ALL members. Are you absolutely sure you want to proceed?")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await executeYearlyRolloverAction(password);

    if (result.success) {
      setMessage({ type: 'success', text: "Success! The financial year has been rolled over." });
      setPassword("");
      fetchLastLog(); // Refresh log
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <DatabaseBackup className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Year Rollover</h2>
          <p className="text-sm text-slate-500">Manually trigger the Varshika Vari rollover process.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <strong>Warning: Destructive Action</strong>
          <p className="mt-1">Executing this will instantly add all unpaid Annual Subscriptions into Arrears, and apply a fresh ₹1250 charge for Heads and ₹200 for Dependents. This should only be done ONCE per year.</p>
        </div>
      </div>

      {/* Last Run Log */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last System Execution</h3>
        {lastLog ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              {lastLog.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              <span className="font-bold text-slate-700 text-sm">{new Date(lastLog.created_at).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-slate-600 font-mono">{lastLog.message}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No previous records found.</p>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleExecute} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400"/> Verify Admin Password to Proceed
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
            placeholder="Enter your admin password..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <DatabaseBackup className="w-5 h-5" />}
          {loading ? "Processing Database Rollover..." : "Execute Financial Rollover"}
        </button>
      </form>
    </div>
  );
}