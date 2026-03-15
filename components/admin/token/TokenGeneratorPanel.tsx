"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Loader2,
  Plus,
  Settings,
  Users,
  HeartHandshake,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { generateTokenPdf, TokenRecord } from "./tokenPdfUtils";

interface TokenHeader {
  id: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

interface SourceRow {
  id: string;
  name: string;
  address: string | null;
  pmj_no: number | null;
}

type SourceType = "members" | "widows";

export default function TokenGeneratorPanel() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [sourceType, setSourceType] = useState<SourceType>("members");
  const [headers, setHeaders] = useState<TokenHeader[]>([]);
  const [selectedHeaderId, setSelectedHeaderId] = useState<string>("");
  const [newHeader, setNewHeader] = useState("");
  const [showAddHeader, setShowAddHeader] = useState(false);

  const [rows, setRows] = useState<SourceRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [loadingHeaders, setLoadingHeaders] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [startPmjNo, setStartPmjNo] = useState("1");
  const [endPmjNo, setEndPmjNo] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    fetchHeaders();
  }, []);

  useEffect(() => {
    fetchRows();
  }, [sourceType]);

  const fetchHeaders = async () => {
    setLoadingHeaders(true);

    const { data, error } = await supabase
      .from("token_headers")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      showMessage("error", error.message);
    } else {
      setHeaders(data || []);
      if ((data || []).length > 0) {
        setSelectedHeaderId(data![0].id);
      }
    }

    setLoadingHeaders(false);
  };

  const fetchRows = async () => {
    setLoadingRows(true);

    const tableName = sourceType === "members" ? "members" : "widows";

    const { data, error } = await supabase
      .from(tableName)
      .select("id, name, address, pmj_no")
      .eq("status", "active")
      .not("pmj_no", "is", null)
      .order("pmj_no", { ascending: true });

    if (error) {
      showMessage("error", error.message);
      setRows([]);
    } else {
      setRows(data || []);
      if ((data || []).length > 0) {
        setStartPmjNo(String(data![0].pmj_no ?? 1));
        setEndPmjNo(String(data![data!.length - 1].pmj_no ?? ""));
      } else {
        setStartPmjNo("1");
        setEndPmjNo("");
      }
    }

    setLoadingRows(false);
  };

  const handleAddHeader = async () => {
    const trimmed = newHeader.trim();
    if (!trimmed) return;

    const nextOrder =
      headers.length > 0
        ? Math.max(...headers.map((h) => h.display_order || 0)) + 1
        : 1;

    const { error } = await supabase.from("token_headers").insert([
      {
        label: trimmed,
        display_order: nextOrder,
        is_active: true,
      },
    ]);

    if (error) {
      showMessage("error", error.message);
      return;
    }

    showMessage("success", "Header added successfully.");
    setNewHeader("");
    setShowAddHeader(false);
    fetchHeaders();
  };

  const selectedHeaderLabel =
    headers.find((h) => h.id === selectedHeaderId)?.label || "Token";

  const filteredRecords = useMemo<TokenRecord[]>(() => {
    const start = Number(startPmjNo || 0);
    const end = Number(endPmjNo || 0);

    if (!start || !end || end < start) return [];

    return rows
      .filter((row) => {
        const pmj = row.pmj_no ?? 0;
        return pmj >= start && pmj <= end;
      })
      .sort((a, b) => (a.pmj_no ?? 0) - (b.pmj_no ?? 0))
      .map((row) => ({
        ...row,
        source: sourceType,
      }));
  }, [rows, startPmjNo, endPmjNo, sourceType]);

  const previewRecords = filteredRecords.slice(0, 15);

  const handleGeneratePdf = async () => {
    if (!selectedHeaderId) {
      showMessage("error", "Please select a header.");
      return;
    }

    if (filteredRecords.length === 0) {
      showMessage("error", "No records found in the selected PMJ range.");
      return;
    }

    setGenerating(true);

    try {
      await generateTokenPdf({
        records: filteredRecords,
        headerLabel: selectedHeaderLabel,
        logoPath: "/logo.png",
      });
      showMessage("success", "Token PDF generated successfully.");
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to generate token PDF.");
    }

    setGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">
              Token Generator Settings
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Data Source
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType("members")}
                className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${sourceType === "members"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-white text-slate-700 border-slate-200"
                  }`}
              >
                <Users className="w-4 h-4" />
                Members
              </button>

              <button
                type="button"
                onClick={() => setSourceType("widows")}
                className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${sourceType === "widows"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-white text-slate-700 border-slate-200"
                  }`}
              >
                <HeartHandshake className="w-4 h-4" />
                Widows
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Header
            </label>

            <div className="flex gap-2">
              <select
                value={selectedHeaderId}
                onChange={(e) => setSelectedHeaderId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                disabled={loadingHeaders}
              >
                {headers.map((header) => (
                  <option key={header.id} value={header.id}>
                    {header.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddHeader((s) => !s)}
                className="px-3 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddHeader && (
              <div className="mt-3 flex gap-2">
                <input
                  value={newHeader}
                  onChange={(e) => setNewHeader(e.target.value)}
                  placeholder="New header name"
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddHeader}
                  className="px-4 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Start PMJ No
              </label>
              <input
                type="number"
                value={startPmjNo}
                onChange={(e) => setStartPmjNo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                End PMJ No
              </label>
              <input
                type="number"
                value={endPmjNo}
                onChange={(e) => setEndPmjNo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-1">
            <p>
              Total selected records:{" "}
              <strong className="text-slate-900">{filteredRecords.length}</strong>
            </p>
            <p>
              Pages required:{" "}
              <strong className="text-slate-900">
                {Math.ceil(filteredRecords.length / 15) || 0}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={generating || loadingRows || loadingHeaders}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Download Token PDF
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl border ${message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
              }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="xl:col-span-8 sticky top-24">
        <div className="bg-slate-200/50 p-4 md:p-8 rounded-2xl border border-slate-300 overflow-auto">
          {loadingRows ? (
            <div className="p-10 text-center text-slate-500">Loading preview...</div>
          ) : previewRecords.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No records found for the selected PMJ range.
            </div>
          ) : (
            <div className="bg-white mx-auto w-full max-w-[900px] aspect-[210/297] shadow-2xl p-4">
              <div className="grid grid-cols-3 gap-3 h-full">
                {previewRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className="border border-slate-700 rounded-xl p-2 flex flex-col"
                  >
                    <div className="text-center">
                      <div className="font-bold text-[10px] leading-tight">
                        Perunguzhi Muslim Jama&apos;ath Masjid
                      </div>
                      <div className="text-[8px] text-slate-600">Token Card</div>
                    </div>

                    <div className="mt-1 border-t pt-1.5 flex items-center gap-2">
                      <img
                        src="/logo.png"
                        alt="Masjid Logo"
                        className="w-9 h-9 object-contain shrink-0"
                      />
                      <div className="font-bold text-[11px] leading-tight text-center flex-1">
                        {selectedHeaderLabel}
                      </div>
                    </div>

                    <div className="mt-1 border-t pt-1.5 grid grid-cols-[1fr,1.9fr,1fr] gap-1 flex-1">
                      <div className="border-r pr-1 text-center">
                        <div className="text-[8px] font-semibold text-slate-500 leading-tight">
                          <div>PMJ</div>
                          <div>Number</div>
                        </div>
                        <div className="font-bold text-[20px] mt-2 leading-none">
                          {record.pmj_no}
                        </div>
                      </div>

                      <div className="border-r px-1 text-center">
                        <div className="text-[8px] font-semibold text-slate-500">
                          Name
                        </div>
                        <div className="font-bold text-[11px] mt-2 leading-tight break-words">
                          {record.name}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-[8px] font-semibold text-slate-500 leading-tight">
                          <div>Token</div>
                          <div>Number</div>
                        </div>
                        <div className="font-bold text-[20px] mt-2 leading-none">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {Array.from({ length: Math.max(0, 15 - previewRecords.length) }).map(
                  (_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="border border-dashed border-slate-300 rounded-xl"
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}