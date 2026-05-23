"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileText,
  HeartHandshake,
  LayoutGrid,
  Loader2,
  Plus,
  Save,
  Settings,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import {
  ensureMalayalamFontLoaded,
  generatePdfFromRenderedPages,
  getListSubtitle,
  getSafeFileName,
  MASJID_TITLE_ML,
  paginateListRecords,
  paginateTokenRecords,
  TOKEN_LAYOUTS,
  TokenLayoutOption,
  TokenPdfRecord,
  TokenRecord,
} from "./tokenPdfUtils";

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
type PreviewMode = "tokens" | "list";
type PdfJobType = "tokens" | "list";

const A4_PREVIEW_WIDTH = 900;
const A4_PREVIEW_HEIGHT = Math.round((A4_PREVIEW_WIDTH * 297) / 210);

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

  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [editingHeaderLabel, setEditingHeaderLabel] = useState("");

  const [rows, setRows] = useState<SourceRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [loadingHeaders, setLoadingHeaders] = useState(true);
  const [generating, setGenerating] = useState<PdfJobType | null>(null);
  const [pdfProgress, setPdfProgress] = useState<{
    percent: number;
    message: string;
    currentPage: number;
    totalPages: number;
  } | null>(null);

  const [startPmjNo, setStartPmjNo] = useState("1");
  const [endPmjNo, setEndPmjNo] = useState("");

  const [layoutOption, setLayoutOption] = useState<TokenLayoutOption>("1x15");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("tokens");
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  const [tokenStartNumbers, setTokenStartNumbers] = useState<{
    members: string;
    widows: string;
  }>({
    members: "1",
    widows: "1",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const hiddenTokenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hiddenListRefs = useRef<(HTMLDivElement | null)[]>([]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    ensureMalayalamFontLoaded().catch(() => { });
    fetchHeaders();
  }, []);

  useEffect(() => {
    fetchRows();
  }, [sourceType]);

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableWidth = el.clientWidth || A4_PREVIEW_WIDTH;
      const availableHeight =
        typeof window === "undefined"
          ? A4_PREVIEW_HEIGHT
          : Math.max(520, window.innerHeight - 250);
      const widthScale = availableWidth / A4_PREVIEW_WIDTH;
      const heightScale = availableHeight / A4_PREVIEW_HEIGHT;
      const nextScale = Math.max(0.34, Math.min(1, widthScale, heightScale));

      setPreviewScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    setPreviewPageIndex(0);
  }, [previewMode, sourceType, layoutOption, startPmjNo, endPmjNo, tokenStartNumbers]);

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
        setSelectedHeaderId((prev) => prev || data![0].id);
      } else {
        setSelectedHeaderId("");
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

  const handleStartEditHeader = () => {
    const current = headers.find((h) => h.id === selectedHeaderId);
    if (!current) return;

    setEditingHeaderId(current.id);
    setEditingHeaderLabel(current.label);
  };

  const handleSaveEditHeader = async () => {
    if (!editingHeaderId) return;

    const trimmed = editingHeaderLabel.trim();
    if (!trimmed) {
      showMessage("error", "Header label cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("token_headers")
      .update({ label: trimmed })
      .eq("id", editingHeaderId);

    if (error) {
      showMessage("error", error.message);
      return;
    }

    showMessage("success", "Header updated successfully.");
    setEditingHeaderId(null);
    setEditingHeaderLabel("");
    fetchHeaders();
  };

  const handleDeleteHeader = async () => {
    if (!selectedHeaderId) return;

    const current = headers.find((h) => h.id === selectedHeaderId);
    if (!current) return;

    const confirmed = window.confirm(
      `Delete header "${current.label}"?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("token_headers")
      .delete()
      .eq("id", selectedHeaderId);

    if (error) {
      showMessage("error", error.message);
      return;
    }

    showMessage("success", "Header deleted successfully.");
    setEditingHeaderId(null);
    setEditingHeaderLabel("");
    fetchHeaders();
  };

  const selectedHeaderLabel =
    headers.find((h) => h.id === selectedHeaderId)?.label || "Token";

  const filteredBaseRecords = useMemo<TokenRecord[]>(() => {
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

  const tokenStartNumber = Number(tokenStartNumbers[sourceType] || 1);

  const preparedRecords = useMemo<TokenPdfRecord[]>(() => {
    return filteredBaseRecords.map((record, index) => ({
      ...record,
      token_no: tokenStartNumber + index,
    }));
  }, [filteredBaseRecords, tokenStartNumber]);

  const tokenPages = useMemo(
    () => paginateTokenRecords(preparedRecords, layoutOption),
    [preparedRecords, layoutOption]
  );

  const listPages = useMemo(
    () => paginateListRecords(preparedRecords),
    [preparedRecords]
  );

  const previewPages = previewMode === "tokens" ? tokenPages : listPages;
  const previewPageCount = previewPages.length;
  const currentPreviewPage =
    previewPages[Math.min(previewPageIndex, Math.max(0, previewPageCount - 1))] || [];

  useEffect(() => {
    if (previewPageIndex > Math.max(0, previewPageCount - 1)) {
      setPreviewPageIndex(0);
    }
  }, [previewPageCount, previewPageIndex]);

  const waitForPaint = () =>
    new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });

  const handleGeneratePdf = async (jobType: PdfJobType) => {
    if (!selectedHeaderId) {
      showMessage("error", "Please select a header.");
      return;
    }

    if (preparedRecords.length === 0) {
      showMessage("error", "No records found in the selected PMJ range.");
      return;
    }

    const pageElements =
      jobType === "tokens"
        ? (hiddenTokenRefs.current.slice(0, tokenPages.length).filter(Boolean) as HTMLElement[])
        : (hiddenListRefs.current.slice(0, listPages.length).filter(Boolean) as HTMLElement[]);

    if (pageElements.length === 0) {
      showMessage("error", "Printable pages are not ready yet.");
      return;
    }

    setGenerating(jobType);
    setPdfProgress({
      percent: 1,
      message: "Getting printable pages ready...",
      currentPage: 0,
      totalPages: pageElements.length,
    });
    await waitForPaint();

    try {
      await ensureMalayalamFontLoaded();

      const safeHeader = getSafeFileName(selectedHeaderLabel);
      const safeSource = sourceType === "members" ? "Members" : "Widows";
      const safeLayout = layoutOption.replace("x", "_");
      const documentLabel = jobType === "tokens" ? "token" : "list";
      const fileName =
        jobType === "tokens"
          ? `Token_${safeSource}_${safeHeader}_${safeLayout}.pdf`
          : `Token_List_${safeSource}_${safeHeader}.pdf`;

      await generatePdfFromRenderedPages({
        pageElements,
        documentLabel,
        fileName,
        onProgress: (progress) => {
          setPdfProgress(progress);
        },
      });

      showMessage(
        "success",
        jobType === "tokens"
          ? "Token PDF generated successfully."
          : "List PDF generated successfully."
      );
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        jobType === "tokens"
          ? "Failed to generate token PDF."
          : "Failed to generate list PDF."
      );
    }

    setGenerating(null);
    window.setTimeout(() => setPdfProgress(null), 1200);
  };

  return (
    <>
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
                  title="Add header"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleStartEditHeader}
                  className="px-3 rounded-lg border border-slate-300 hover:bg-slate-50"
                  title="Edit header"
                  disabled={!selectedHeaderId}
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDeleteHeader}
                  className="px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  title="Delete header"
                  disabled={!selectedHeaderId}
                >
                  <Trash2 className="w-4 h-4" />
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

              {editingHeaderId && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={editingHeaderLabel}
                    onChange={(e) => setEditingHeaderLabel(e.target.value)}
                    placeholder="Edit header"
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEditHeader}
                    className="px-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHeaderId(null);
                      setEditingHeaderLabel("");
                    }}
                    className="px-3 rounded-lg border border-slate-300 hover:bg-slate-50"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                A4 Token Layout
              </label>

              <div className="grid grid-cols-2 gap-3">
                {Object.values(TOKEN_LAYOUTS).map((layout) => (
                  <button
                    key={layout.key}
                    type="button"
                    onClick={() => setLayoutOption(layout.key)}
                    className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${layoutOption === layout.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200"
                      }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    {layout.label}
                  </button>
                ))}
              </div>
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

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Custom Token Start Number ({sourceType})
              </label>
              <input
                type="number"
                min={1}
                value={tokenStartNumbers[sourceType]}
                onChange={(e) =>
                  setTokenStartNumbers((prev) => ({
                    ...prev,
                    [sourceType]: e.target.value,
                  }))
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-2">
              <p>
                Total selected records:{" "}
                <strong className="text-slate-900">{preparedRecords.length}</strong>
              </p>
              <p>
                Token pages:{" "}
                <strong className="text-slate-900">{tokenPages.length}</strong>
              </p>
              <p>
                List pages:{" "}
                <strong className="text-slate-900">{listPages.length}</strong>
              </p>
              <p>
                Current token start:{" "}
                <strong className="text-slate-900">{tokenStartNumber}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGeneratePdf("tokens")}
                disabled={!!generating || loadingRows || loadingHeaders}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {generating === "tokens" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                Download Token PDF
              </button>

              <button
                type="button"
                onClick={() => handleGeneratePdf("list")}
                disabled={!!generating || loadingRows || loadingHeaders}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {generating === "list" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                Download List PDF
              </button>
            </div>

            {pdfProgress && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="font-bold text-slate-900">
                      {pdfProgress.message}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {pdfProgress.currentPage > 0
                        ? `Page ${pdfProgress.currentPage} of ${pdfProgress.totalPages}`
                        : `${pdfProgress.totalPages} pages queued`}
                    </div>
                  </div>
                  <div className="font-black text-emerald-700">
                    {Math.round(pdfProgress.percent)}%
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${pdfProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
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

        <div className="xl:col-span-8 xl:sticky xl:top-24">
          <div className="bg-slate-200/60 p-4 md:p-6 rounded-2xl border border-slate-300 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode("tokens")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${previewMode === "tokens"
                    ? "bg-white text-slate-900 border-slate-300 shadow-sm"
                    : "bg-transparent text-slate-600 border-transparent"
                    }`}
                >
                  <Eye className="w-4 h-4" />
                  Token Preview
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode("list")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${previewMode === "list"
                    ? "bg-white text-slate-900 border-slate-300 shadow-sm"
                    : "bg-transparent text-slate-600 border-transparent"
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  List Preview
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPageIndex((prev) => Math.max(0, prev - 1))
                  }
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
                  disabled={previewPageIndex <= 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700">
                  Page {previewPageCount === 0 ? 0 : previewPageIndex + 1} / {previewPageCount}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewPageIndex((prev) =>
                      Math.min(Math.max(0, previewPageCount - 1), prev + 1)
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
                  disabled={previewPageIndex >= previewPageCount - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loadingRows ? (
              <div className="p-10 text-center text-slate-500">Loading preview...</div>
            ) : preparedRecords.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No records found for the selected PMJ range.
              </div>
            ) : (
              <div ref={previewWrapRef} className="w-full overflow-auto">
                <div
                  className="mx-auto relative"
                  style={{
                    width: `${A4_PREVIEW_WIDTH * previewScale}px`,
                    height: `${A4_PREVIEW_HEIGHT * previewScale}px`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width: A4_PREVIEW_WIDTH,
                      height: A4_PREVIEW_HEIGHT,
                      transform: `scale(${previewScale})`,
                    }}
                  >
                    {previewMode === "tokens" ? (
                      <TokenA4Page
                        records={currentPreviewPage}
                        headerLabel={selectedHeaderLabel}
                        layoutOption={layoutOption}
                      />
                    ) : (
                      <ListA4Page
                        records={currentPreviewPage}
                        sourceType={sourceType}
                        showTopHeading={previewPageIndex === 0}
                        pageNumber={previewPageIndex + 1}
                        totalPages={listPages.length}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed -left-[20000px] top-0 opacity-0 pointer-events-none">
        <div className="w-[900px]">
          {tokenPages.map((pageRecords, index) => (
            <div
              key={`token-hidden-${index}`}
              ref={(el) => {
                hiddenTokenRefs.current[index] = el;
              }}
            >
              <TokenA4Page
                records={pageRecords}
                headerLabel={selectedHeaderLabel}
                layoutOption={layoutOption}
              />
            </div>
          ))}

          {listPages.map((pageRecords, index) => (
            <div
              key={`list-hidden-${index}`}
              ref={(el) => {
                hiddenListRefs.current[index] = el;
              }}
            >
              <ListA4Page
                records={pageRecords}
                sourceType={sourceType}
                showTopHeading={index === 0}
                pageNumber={index + 1}
                totalPages={listPages.length}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TokenA4Page({
  records,
  headerLabel,
  layoutOption,
}: {
  records: TokenPdfRecord[];
  headerLabel: string;
  layoutOption: TokenLayoutOption;
}) {
  const layout = TOKEN_LAYOUTS[layoutOption];

  return (
    <div className="relative w-[900px] aspect-[210/297] bg-white shadow-2xl p-6 font-anek-malayalam overflow-hidden">
      <TokenCutMarks layoutOption={layoutOption} />

      <div
        className="grid h-full gap-4 relative z-10"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
        }}
      >
        {records.map((record) => (
          <PremiumTokenCard
            key={record.id}
            record={record}
            headerLabel={headerLabel}
            large={layoutOption === "1x8"}
          />
        ))}

        {Array.from({ length: Math.max(0, layout.perPage - records.length) }).map(
          (_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/20"
            />
          )
        )}
      </div>
    </div>
  );
}

function TokenCutMarks({
  layoutOption,
}: {
  layoutOption: TokenLayoutOption;
}) {
  const layout = TOKEN_LAYOUTS[layoutOption];

  const verticalMarks = Array.from({ length: layout.cols - 1 });
  const horizontalMarks = Array.from({ length: layout.rows - 1 });

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Vertical cut marks */}
      {verticalMarks.map((_, i) => {
        const left = ((i + 1) / layout.cols) * 100;
        return (
          <React.Fragment key={`v-${i}`}>
            <div
              className="absolute top-1 h-4 border-l border-dashed border-slate-400"
              style={{ left: `${left}%` }}
            />
            <div
              className="absolute bottom-1 h-4 border-l border-dashed border-slate-400"
              style={{ left: `${left}%` }}
            />
          </React.Fragment>
        );
      })}

      {/* Horizontal cut marks */}
      {horizontalMarks.map((_, i) => {
        const top = ((i + 1) / layout.rows) * 100;
        return (
          <React.Fragment key={`h-${i}`}>
            <div
              className="absolute left-1 w-4 border-t border-dashed border-slate-400"
              style={{ top: `${top}%` }}
            />
            <div
              className="absolute right-1 w-4 border-t border-dashed border-slate-400"
              style={{ top: `${top}%` }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PremiumTokenCard({
  record,
  headerLabel,
  large,
}: {
  record: TokenPdfRecord;
  headerLabel: string;
  large: boolean;
}) {
  return (
    <div className="relative rounded-[26px] p-[2px] bg-gradient-to-br from-amber-300 via-slate-700 to-amber-200 shadow-[0_14px_38px_rgba(15,23,42,0.14)]">
      <div className="relative h-full rounded-[24px] bg-white border border-slate-300 px-3 py-3 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-6 h-6 border-t-[2.5px] border-l-[2.5px] border-amber-300 rounded-tl-xl" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-[2.5px] border-r-[2.5px] border-amber-300 rounded-tr-xl" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[2.5px] border-l-[2.5px] border-amber-300 rounded-bl-xl" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[2.5px] border-r-[2.5px] border-amber-300 rounded-br-xl" />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-100/30 blur-2xl rounded-full" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="text-center">
            <div
              className={`font-extrabold text-slate-900 leading-tight ${large ? "text-[19px]" : "text-[11px]"
                }`}
            >
              {MASJID_TITLE_ML}
            </div>
            <div
              className={`font-semibold tracking-[0.2em] text-slate-500 ${large ? "text-[11px]" : "text-[8px]"
                }`}
            >
              TOKEN CARD
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-3">
            <div
              className={`rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 ${large ? "w-12 h-12" : "w-10 h-10"
                }`}
            >
              <img
                src="/logo.png"
                alt="Masjid Logo"
                className={`${large ? "w-9 h-9" : "w-7 h-7"} object-contain`}
              />
            </div>

            <div
              className={`font-extrabold text-center leading-tight text-slate-800 flex-1 ${large ? "text-[19px]" : "text-[13px]"
                }`}
            >
              {headerLabel}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-[1fr,2fr,1fr] gap-2 flex-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 text-center px-2 py-2 flex flex-col shadow-sm">
              <div
                className={`font-bold tracking-wide text-slate-500 leading-tight ${large ? "text-[11px]" : "text-[8.5px]"
                  }`}
              >
                <div>PMJ</div>
                <div>NUMBER</div>
              </div>

              <div
                className={`font-black text-emerald-700 leading-none my-auto drop-shadow-sm ${large ? "text-[37px]" : "text-[26px]"
                  }`}
              >
                {record.pmj_no}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white text-center px-2 py-2 flex flex-col shadow-sm">
              <div
                className={`font-bold tracking-wide text-slate-500 ${large ? "text-[11px]" : "text-[8.5px]"
                  }`}
              >
                NAME
              </div>

              <div
                className={`font-black text-slate-900 leading-tight my-auto break-words ${large ? "text-[19px]" : "text-[14px]"
                  }`}
              >
                {record.name}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 text-center px-2 py-2 flex flex-col shadow-sm">
              <div
                className={`font-bold tracking-wide text-amber-700 leading-tight ${large ? "text-[11px]" : "text-[8.5px]"
                  }`}
              >
                <div>TOKEN</div>
                <div>NUMBER</div>
              </div>

              <div
                className={`font-black text-rose-700 leading-none my-auto drop-shadow-sm ${large ? "text-[37px]" : "text-[26px]"
                  }`}
              >
                {record.token_no}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListA4Page({
  records,
  sourceType,
  showTopHeading,
  pageNumber,
  totalPages,
}: {
  records: TokenPdfRecord[];
  sourceType: SourceType;
  showTopHeading: boolean;
  pageNumber?: number;
  totalPages?: number;
}) {
  const getRowHeightClass = (name: string) => {
    const length = (name || "").trim().length;

    if (length <= 26) return "min-h-[54px]";
    if (length <= 46) return "min-h-[73px]";
    if (length <= 70) return "min-h-[92px]";
    return "min-h-[108px]";
  };

  const getNameSizeClass = (name: string) => {
    const length = (name || "").trim().length;

    if (length <= 46) return "text-[16px]";
    if (length <= 70) return "text-[14px]";
    return "text-[12.5px]";
  };

  return (
    <div className="relative w-[900px] aspect-[210/297] bg-white shadow-2xl p-8 font-anek-malayalam overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/logo.png"
          alt="Watermark"
          className="w-80 h-80 object-contain opacity-[0.06]"
        />
      </div>

      <div className="relative h-full flex flex-col z-10">
        {showTopHeading && (
          <div className="text-center mb-4">
            <div className="text-[21px] font-extrabold text-slate-900">
              {MASJID_TITLE_ML}
            </div>
            <div className="text-[16px] font-bold text-slate-700 mt-1">
              {getListSubtitle(sourceType)}
            </div>
          </div>
        )}

        <div className="border border-slate-700 bg-white overflow-hidden">
          <div className="grid grid-cols-[110px,1.8fr,130px,150px] bg-slate-50 font-bold text-[13px] text-slate-800">
            <div className="border-r border-slate-700 p-3 text-center">PMJ No</div>
            <div className="border-r border-slate-700 p-3 text-center">Name</div>
            <div className="border-r border-slate-700 p-3 text-center">Token No</div>
            <div className="p-3 text-center">Remarks</div>
          </div>

          {records.map((record) => (
            <div
              key={record.id}
              className={`grid grid-cols-[110px,1.8fr,130px,150px] text-slate-800 border-t border-slate-700 ${getRowHeightClass(record.name)}`}
            >
              <div className="border-r border-slate-700 px-3 py-2 text-center font-black text-[18px] text-emerald-700 flex items-center justify-center">
                {record.pmj_no}
              </div>

              <div
                className={`border-r border-slate-700 px-3 py-2 font-black leading-snug break-words flex items-center ${getNameSizeClass(record.name)}`}
              >
                {record.name}
              </div>

              <div className="border-r border-slate-700 px-3 py-2 text-center font-black text-[18px] text-rose-700 flex items-center justify-center">
                {record.token_no}
              </div>

              <div className="px-3 py-2 bg-white" />
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2 text-center text-[11px] text-slate-500">
          {pageNumber && totalPages ? `List Page ${pageNumber} of ${totalPages}` : ""}
        </div>
      </div>
    </div>
  );
}
