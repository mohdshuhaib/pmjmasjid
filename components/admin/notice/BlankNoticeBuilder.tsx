"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, Eye, Loader2, Settings2, Share2, Type } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import TransliterationTextarea from "./TransliterationTextarea";
import TypographyCard from "./TypographyCard";
import BlankNoticePreview from "./BlankNoticePreview";
import BlankNoticePdfDocument from "./BlankNoticePdfDocument";
import { defaultBlankNoticeState } from "./constants";
import { BlankNoticeDesignState, Orientation, PageSize, MarginPreset, RoleValue, TypographyConfig } from "./types";
import { registerPdfFont } from "./registerPdfFont";
import { sharePdfOnWhatsApp } from "./share";

export default function BlankNoticeBuilder() {
  const [designState, setDesignState] = useState<BlankNoticeDesignState>(defaultBlankNoticeState);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [localMessage, setLocalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    registerPdfFont();
  }, []);

  const previewScaleLabel = useMemo(
    () => `${designState.pageSize} • ${designState.orientation} • ${designState.marginPreset}`,
    [designState.pageSize, designState.orientation, designState.marginPreset]
  );

  const updateTypography = (
    field: "heading" | "details" | "meta" | "confirmedBy",
    next: TypographyConfig
  ) => {
    setDesignState((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: next,
      },
    }));
  };

  const generatePdfBlob = async () => {
    registerPdfFont();
    return await pdf(<BlankNoticePdfDocument state={designState} />).toBlob();
  };

  const handlePdfDownload = async () => {
    try {
      setDownloading(true);
      setLocalMessage(null);
      const blob = await generatePdfBlob();
      setLastBlob(blob);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `blank-notice-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setLocalMessage({ type: "success", text: "Blank notice PDF downloaded successfully." });
    } catch (error) {
      console.error(error);
      setLocalMessage({ type: "error", text: "Failed to generate PDF." });
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setSharing(true);
      setLocalMessage(null);
      const blob = lastBlob ?? (await generatePdfBlob());
      setLastBlob(blob);

      const result = await sharePdfOnWhatsApp(blob, `blank-notice-${Date.now()}.pdf`, designState.heading);
      setLocalMessage({
        type: "success",
        text:
          result.mode === "whatsapp-text"
            ? "WhatsApp opened with text. Local PDF attachment depends on browser native file sharing support."
            : "Share dialog opened successfully.",
      });
    } catch (error) {
      console.error(error);
      setLocalMessage({ type: "error", text: "Unable to open share." });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[520px_minmax(0,1fr)] gap-6 items-start">
      <div className="space-y-6">
        {localMessage && (
          <div
            className={`p-4 rounded-xl border ${
              localMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {localMessage.text}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Blank Notice Setup</h2>
          </div>

          <TransliterationTextarea
            label="Heading"
            value={designState.heading}
            onChange={(heading) => setDesignState((prev) => ({ ...prev, heading }))}
          />

          <TransliterationTextarea
            label="Detailed Content"
            value={designState.details}
            onChange={(details) => setDesignState((prev) => ({ ...prev, details }))}
            multiline
            rows={10}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={designState.noticeDate}
                onChange={(e) => setDesignState((prev) => ({ ...prev, noticeDate: e.target.value }))}
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmed By</label>
              <select
                value={designState.confirmedBy}
                onChange={(e) => setDesignState((prev) => ({ ...prev, confirmedBy: e.target.value as RoleValue }))}
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
              >
                <option value="Secretary">Secretary</option>
                <option value="President">President</option>
                <option value="Vice President">Vice President</option>
                <option value="Joint Secretary">Joint Secretary</option>
                <option value="Committee">Committee</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Page Size</label>
              <select
                value={designState.pageSize}
                onChange={(e) => setDesignState((prev) => ({ ...prev, pageSize: e.target.value as PageSize }))}
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Orientation</label>
              <select
                value={designState.orientation}
                onChange={(e) => setDesignState((prev) => ({ ...prev, orientation: e.target.value as Orientation }))}
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Margins</label>
            <select
              value={designState.marginPreset}
              onChange={(e) => setDesignState((prev) => ({ ...prev, marginPreset: e.target.value as MarginPreset }))}
              className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="narrow">Narrow</option>
              <option value="standard">Standard</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Typography Controls</h2>
          </div>

          <TypographyCard field="heading" label="Heading" config={designState.typography.heading} onChange={updateTypography as any} />
          <TypographyCard field="details" label="Detailed Content" config={designState.typography.details} onChange={updateTypography as any} />
          <TypographyCard field="meta" label="Date" config={designState.typography.meta} onChange={updateTypography as any} />
          <TypographyCard field="confirmedBy" label="Confirmed By" config={designState.typography.confirmedBy} onChange={updateTypography as any} />

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handlePdfDownload}
              disabled={downloading}
              className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {downloading ? "Generating PDF..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              disabled={sharing}
              className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {sharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              {sharing ? "Opening Share..." : "Share to WhatsApp"}
            </button>

            <button
              type="button"
              onClick={() => setDesignState(defaultBlankNoticeState)}
              className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700"
            >
              Reset Layout
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-semibold">
            {previewScaleLabel}
          </span>
        </div>
        <BlankNoticePreview state={designState} />
      </div>
    </div>
  );
}