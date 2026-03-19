"use client";

import React from "react";
import { Type } from "lucide-react";
import { FieldKey, TypographyConfig } from "./types";

export default function TypographyCard({
  field,
  label,
  config,
  onChange,
}: {
  field: FieldKey;
  label: string;
  config: TypographyConfig;
  onChange: (field: FieldKey, next: TypographyConfig) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-emerald-600" />
        <h4 className="font-semibold text-slate-800">{label}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Font Size</label>
          <input
            type="number"
            min={8}
            max={40}
            step={0.5}
            value={config.size}
            onChange={(e) => onChange(field, { ...config, size: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Weight</label>
          <select
            value={config.weight}
            onChange={(e) => onChange(field, { ...config, weight: e.target.value as TypographyConfig["weight"] })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-400"
          >
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="semibold">Semi Bold</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Alignment</label>
          <select
            value={config.align}
            onChange={(e) => onChange(field, { ...config, align: e.target.value as TypographyConfig["align"] })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-400"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      </div>
    </div>
  );
}