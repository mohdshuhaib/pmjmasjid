"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Activity, RefreshCw, Loader2, CheckCircle2, XCircle, AlertCircle, Filter } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface LogEntry {
  id: string;
  event_type: string;
  status: string;
  message: string;
  created_at: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "ERROR">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    // Fetch the latest 200 logs
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error("Failed to fetch logs:", error);
    } else {
      setLogs(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [supabase]);

  // Derived unique event types for the filter dropdown
  const uniqueEventTypes = useMemo(() => {
    const types = new Set(logs.map(log => log.event_type));
    return Array.from(types);
  }, [logs]);

  // Filter the logs before rendering
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (statusFilter !== "ALL" && log.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && log.event_type !== typeFilter) return false;
      return true;
    });
  }, [logs, statusFilter, typeFilter]);

  // Helper to format the event type string nicely
  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-600" />
            System Automation Logs
          </h1>
          <p className="text-slate-500 mt-1">Monitor background cron jobs, financial rollovers, and automated reminders.</p>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing || loading}
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-bold shrink-0">
          <Filter className="w-5 h-5" /> Filters:
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success Only</option>
          <option value="ERROR">Errors Only</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
        >
          <option value="ALL">All Event Types</option>
          {uniqueEventTypes.map(type => (
            <option key={type} value={type}>{formatEventType(type)}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Timestamp</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Event Type</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider w-full">Message Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">

              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-400">Loading system logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600 mb-1">No logs found</p>
                    <p className="text-slate-400">Try adjusting your filters or wait for cron jobs to run.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="p-5 text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </td>

                      {/* Status Badge */}
                      <td className="p-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {log.status}
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="p-5">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold font-mono border border-slate-200">
                          {formatEventType(log.event_type)}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="p-5">
                        <p className={`whitespace-normal min-w-[300px] leading-relaxed ${isSuccess ? 'text-slate-700' : 'text-red-600 font-medium'}`}>
                          {log.message}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {!loading && logs.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
            Showing the latest {filteredLogs.length} events from the system.
          </div>
        )}
      </div>

    </div>
  );
}