"use client";

import React from "react";
import { NoticeDesignState } from "./types";
import { buildReferenceCode, formatDisplayDate } from "./utils";
import { confirmedByMalayalamMap, LOGO_URL, marginPresetMap, pageDimensionsPx, weightMap } from "./constants";

export default function NoticePreview({ state }: { state: NoticeDesignState }) {
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
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
              <div>
                <p className="text-[7px] md:text-[9px] font-bold text-emerald-700">Perunguzhi Muslim Jama&apos;ath</p>
                <p className="text-[8px] md:text-[9px]">Perunguzhi P.O, Thiruvananthapuram</p>
                <p className="text-[8px] md:text-[9px]">PIN: 695305, Since: 1995</p>
              </div>

              <div className="text-center">
                <img src={LOGO_URL} alt="logo" className="w-8 h-8 md:w-12 md:h-12 object-contain mx-auto" />
                <p className="text-[7px] md:text-[8px] font-medium">Reg. No. 5753/RA</p>
              </div>

              <div className="text-right">
                <p className="text-[6px] md:text-[8px] font-bold text-emerald-700">പെരുങ്ങുഴി മുസ്ലിം ജമാഅത്ത്</p>
                <p className="text-[8px] md:text-[9px]">പെരുങ്ങുഴി പി.ഒ, തിരുവനന്തപുരം</p>
                <p className="text-[8px] md:text-[9px]">പിൻ: 695305, 1995 മുതൽ</p>
              </div>
            </div>

            <div className="mt-2 space-y-[2px]">
              <div className="border-t border-red-700" />
              <div className="border-t border-rose-300" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[8px] md:text-[10px] font-semibold">
            <p>Ref.: {buildReferenceCode(state.refNumber)}</p>
            <p>Date: {formatDisplayDate(state.noticeDate)}</p>
          </div>

          <div className="mt-5 px-1">
            <h3
              className="leading-snug"
              style={{
                fontSize: `${Math.max(state.typography.heading.size / 2.2, 10)}px`,
                fontWeight: weightMap[state.typography.heading.weight] as any,
                textAlign: state.typography.heading.align as any,
              }}
            >
              {state.heading || "പ്രധാന അറിയിപ്പ്"}
            </h3>

            <p
              className="mt-4 whitespace-pre-wrap break-words"
              style={{
                fontSize: `${Math.max(state.typography.details.size / 2.2, 8)}px`,
                fontWeight: weightMap[state.typography.details.weight] as any,
                textAlign: state.typography.details.align as any,
                lineHeight: 1.7,
              }}
            >
              {state.details}
            </p>

            <div className="mt-6 flex justify-end">
              <p
                style={{
                  fontSize: `${Math.max(state.typography.confirmedBy.size / 2.2, 8)}px`,
                  fontWeight: weightMap[state.typography.confirmedBy.weight] as any,
                }}
              >
                {confirmedByMalayalamMap[state.confirmedBy]}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="space-y-[2px]">
              <div className="border-t border-red-700" />
              <div className="border-t border-rose-300" />
            </div>
            <p className="text-center text-[6px] md:text-[8px] font-semibold text-emerald-700 mt-1.5 leading-snug">
              Perunguzhi Muslim Jama&apos;ath, Perunguzhi P.O, Azhoor VIA, 695305,
              Thiruvananthapuram
            </p>
            <p className="text-center text-[5px] md:text-[6px] leading-snug text-slate-600">
              Mobile: +918547136339, +919539516653, +919497007113, Email: techpmj@gmail.com,
              Website: pmjmasjid.vercel.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}