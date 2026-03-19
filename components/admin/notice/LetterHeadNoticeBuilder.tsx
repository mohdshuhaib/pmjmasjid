"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, Loader2, Settings2, Share2, Type } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import NoticePreview from "./NoticePreview";
import NoticePdfDocument from "./NoticePdfDocument";
import TypographyCard from "./TypographyCard";
import TransliterationTextarea from "./TransliterationTextarea";
import { defaultDesignState } from "./constants";
import { FieldKey, NoticeDesignState, PageSize, MarginPreset, Orientation, RoleValue, TypographyConfig, CommitteeContacts } from "./types";
import { buildReferenceCode, sanitizeRefNumber } from "./utils";
import { getCommitteeContacts } from "./getCommitteeContacts";
import { registerPdfFont } from "./registerPdfFont";
import { sharePdfOnWhatsApp } from "./share";

export default function LetterHeadNoticeBuilder() {
  const [designState, setDesignState] = useState<NoticeDesignState>(defaultDesignState);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [contacts, setContacts] = useState<CommitteeContacts>({
    president: "+918547136339",
    secretary: "+919539516653",
  });
  const [localMessage, setLocalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    registerPdfFont();
    const loadContacts = async () => {
      const result = await getCommitteeContacts();
      setContacts(result);
    };

    loadContacts();
  }, []);

  const previewScaleLabel = useMemo(
    () => `${designState.pageSize} • ${designState.orientation} • ${designState.marginPreset}`,
    [designState.pageSize, designState.orientation, designState.marginPreset]
  );

  const updateTypography = (field: FieldKey, next: TypographyConfig) => {
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
    return await pdf(<NoticePdfDocument state={designState} contacts={contacts} />).toBlob();
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
      link.download = `${buildReferenceCode(designState.refNumber)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setLocalMessage({ type: "success", text: "Notice PDF downloaded successfully." });
    } catch (error) {
      console.error(error);
      setLocalMessage({ type: "error", text: "Failed to generate PDF. Check font and logo paths." });
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

      const fileName = `${buildReferenceCode(designState.refNumber)}.pdf`;
      const text = `${designState.heading}\nRef: ${buildReferenceCode(designState.refNumber)}`;

      const result = await sharePdfOnWhatsApp(blob, fileName, text);

      if (result.mode === "whatsapp-text") {
        setLocalMessage({
          type: "success",
          text: "WhatsApp opened with text. Local PDF attachment is only supported where browser native file sharing is available.",
        });
      } else {
        setLocalMessage({ type: "success", text: "Share dialog opened successfully." });
      }
    } catch (error) {
      console.error(error);
      setLocalMessage({ type: "error", text: "Unable to open WhatsApp share." });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[520px_minmax(0,1fr)] gap-6 items-start">
      <div className="space-y-6">
        {localMessage && (
          <div
            className={`p-4 rounded-xl border ${localMessage.type === "success"
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
            <h2 className="text-xl font-bold text-slate-900">Notice Setup</h2>
          </div>

          <TransliterationTextarea
            label="Notice Heading"
            value={designState.heading}
            onChange={(heading) => setDesignState((prev) => ({ ...prev, heading }))}
          />

          <TransliterationTextarea
            label="Detailed Notice Message"
            value={designState.details}
            onChange={(details) => setDesignState((prev) => ({ ...prev, details }))}
            multiline
            rows={8}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notice Date</label>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Reference Number</label>
              <input
                type="text"
                value={designState.refNumber}
                onChange={(e) => setDesignState((prev) => ({ ...prev, refNumber: sanitizeRefNumber(e.target.value) }))}
                placeholder="001"
                className="w-full border border-slate-300 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Final format: {buildReferenceCode(designState.refNumber)}</p>
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Typography Controls</h2>
          </div>

          <TypographyCard field="heading" label="Heading" config={designState.typography.heading} onChange={updateTypography} />
          <TypographyCard field="details" label="Detailed Message" config={designState.typography.details} onChange={updateTypography} />
          <TypographyCard field="meta" label="Reference + Date" config={designState.typography.meta} onChange={updateTypography} />
          <TypographyCard field="confirmedBy" label="Confirmed By" config={designState.typography.confirmedBy} onChange={updateTypography} />

          <div className="pt-2 flex flex-col  gap-2">
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
              onClick={() => setDesignState(defaultDesignState)}
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
        <NoticePreview state={designState} contacts={contacts} />
      </div>
    </div>
  );
}