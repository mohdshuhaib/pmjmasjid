"use client";

import React from "react";
import { BlankNoticeDesignState } from "./types";
import { confirmedByMalayalamMap, marginPresetMap, pageDimensionsPx, weightMap } from "./constants";
import { formatDisplayDate } from "./utils";

export default function BlankNoticePreview({ state }: { state: BlankNoticeDesignState }) {
  const dims = pageDimensionsPx[state.pageSize][state.orientation];
  const margin = marginPresetMap[state.marginPreset];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4 md:p-6 overflow-auto">
      <div
        className="mx-auto bg-white shadow-2xl shadow-slate-300/50 relative"
        style={{
          width: dims.width / 2.2,
          minWidth: state.orientation === "landscape" ? 340 : 300,
          maxWidth: "100%",
          aspectRatio: `${dims.width} / ${dims.height}`,
          padding: `${margin / 2.2}px`,
        }}
      >
        <div className="h-full flex flex-col text-slate-800" style={{ fontFamily: '"Anek Malayalam", system-ui, sans-serif' }}>
          <div>
            <h3
              style={{
                fontSize: `${Math.max(state.typography.heading.size / 2.2, 10)}px`,
                fontWeight: weightMap[state.typography.heading.weight] as any,
                textAlign: state.typography.heading.align as any,
                lineHeight: 1.35,
              }}
            >
              {state.heading || "പ്രധാന അറിയിപ്പ്"}
            </h3>

            <p
              className="mt-5 whitespace-pre-wrap break-words"
              style={{
                fontSize: `${Math.max(state.typography.details.size / 2.2, 8)}px`,
                fontWeight: weightMap[state.typography.details.weight] as any,
                textAlign: state.typography.details.align as any,
                lineHeight: 1.7,
              }}
            >
              {state.details}
            </p>
          </div>

          <div className="mt-auto pt-8 flex items-end justify-between gap-4">
            <p
              style={{
                fontSize: `${Math.max(state.typography.meta.size / 2.2, 8)}px`,
                fontWeight: weightMap[state.typography.meta.weight] as any,
                textAlign: "left",
              }}
            >
              {formatDisplayDate(state.noticeDate)}
            </p>

            <p
              style={{
                fontSize: `${Math.max(state.typography.confirmedBy.size / 2.2, 8)}px`,
                fontWeight: weightMap[state.typography.confirmedBy.weight] as any,
                textAlign: "right",
              }}
            >
              {confirmedByMalayalamMap[state.confirmedBy]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}