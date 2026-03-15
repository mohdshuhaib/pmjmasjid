"use client";

import React from "react";
import { Ticket } from "lucide-react";
import TokenGeneratorPanel from "@/components/admin/token/TokenGeneratorPanel";

export default function TokenPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-emerald-600" />
          Token Generator
        </h1>
        <p className="text-slate-500 mt-1">
          Generate printable token cards from members and widows records.
        </p>
      </div>

      <TokenGeneratorPanel />
    </div>
  );
}