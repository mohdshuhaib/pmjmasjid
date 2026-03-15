"use client";

import React, { useState } from "react";
import { FileText, ScrollText } from "lucide-react";
import MarriageCertificatePanel from "@/components/admin/marriage/MarriageCertificatePanel";
import MarriagePermissionPanel from "@/components/admin/marriage/MarriagePermissionPanel";

type ActiveTab = "marriage-certificate" | "marriage-permission";

export default function MarriagePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("marriage-certificate");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-600" />
          Marriage Section
        </h1>
        <p className="text-slate-500 mt-1">
          Generate official marriage and marriage permission certificates.
        </p>
      </div>

      <div className="flex overflow-x-auto gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("marriage-certificate")}
          className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "marriage-certificate"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Marriage Certificate
        </button>

        <button
          onClick={() => setActiveTab("marriage-permission")}
          className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "marriage-permission"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ScrollText className="w-4 h-4" />
          Marriage Permission Certificate
        </button>
      </div>

      {activeTab === "marriage-certificate" ? (
        <MarriageCertificatePanel />
      ) : (
        <MarriagePermissionPanel />
      )}
    </div>
  );
}