"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { useMalayalamTransliteration } from "./useMalayalamTransliteration";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
}

function getWordBoundaries(text: string, cursor: number) {
  const left = text.slice(0, cursor);
  const right = text.slice(cursor);

  const startMatch = left.match(/[^\s,.;:!?()[\]{}"'`~@#$%^&*+=<>/\\|-]+$/);
  const start = startMatch ? cursor - startMatch[0].length : cursor;

  const endMatch = right.match(/^[^\s,.;:!?()[\]{}"'`~@#$%^&*+=<>/\\|-]*/);
  const end = cursor + (endMatch?.[0]?.length || 0);

  return {
    before: text.slice(0, start),
    word: text.slice(start, cursor),
    afterWord: text.slice(end),
    fullWord: text.slice(start, end),
    start,
    end,
  };
}

export default function TransliterationTextarea({
  label,
  value,
  onChange,
  multiline = false,
  rows = 6,
}: Props) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const suggestionItemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [transliterationEnabled, setTransliterationEnabled] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const parts = useMemo(() => getWordBoundaries(value, cursor), [value, cursor]);
  const transliterationQuery = parts.fullWord || parts.word;
  const { suggestions, loading } = useMalayalamTransliteration(
    transliterationQuery,
    transliterationEnabled
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [transliterationQuery]);

  useEffect(() => {
    const active = suggestionItemRefs.current[selectedIndex];
    if (active) {
      active.scrollIntoView({
        block: "nearest",
        inline: "center",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, suggestions]);

  const selectedSuggestion = suggestions[selectedIndex]?.value || "";

  const setCaretPosition = (pos: number) => {
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(pos, pos);
      setCursor(pos);
    });
  };


  const moveSelection = (direction: 1 | -1) => {
    if (!suggestions.length) return;
    setSelectedIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return suggestions.length - 1;
      if (next >= suggestions.length) return 0;
      return next;
    });
  };

  const applySuggestion = (replacement?: string, addTrailingSpace = false) => {
    const chosen = replacement || selectedSuggestion;
    if (!chosen) return;

    const nextValue = `${parts.before}${chosen}${addTrailingSpace ? " " : ""}${parts.afterWord}`;
    onChange(nextValue);

    const nextPos = (parts.before + chosen + (addTrailingSpace ? " " : "")).length;
    setCaretPosition(nextPos);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const hasSuggestions = suggestions.length > 0 && transliterationQuery.trim().length > 0;

    if (!hasSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection(1);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection(-1);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      applySuggestion();
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      applySuggestion();
      return;
    }

    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      applySuggestion();
      return;
    }

    if (e.key === " " && selectedSuggestion) {
      e.preventDefault();
      applySuggestion(undefined, true);
    }
  };


  const commonClass =
    "w-full rounded-2xl border border-slate-300 p-4 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  const textStyle: React.CSSProperties = {
    fontFamily: '"Anek Malayalam", system-ui, sans-serif',
    fontSize: "16px",
    lineHeight: "1.75",
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="block text-sm font-bold text-slate-700">{label}</label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTransliterationEnabled((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              transliterationEnabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Languages className="h-4 w-4" />
            {transliterationEnabled ? "Manglish On" : "Manglish Off"}
          </button>
        </div>
      </div>

      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            rows={rows}
            onChange={(e) => {
              onChange(e.target.value);
              setCursor(e.target.selectionStart || 0);
            }}
            onClick={(e) => setCursor(e.currentTarget.selectionStart || 0)}
            onKeyUp={(e) => setCursor(e.currentTarget.selectionStart || 0)}
            onKeyDown={handleKeyDown}
            className={commonClass}
            style={{ ...textStyle, caretColor: "#111827" }}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setCursor(e.target.selectionStart || 0);
            }}
            onClick={(e) => setCursor(e.currentTarget.selectionStart || 0)}
            onKeyUp={(e) => setCursor(e.currentTarget.selectionStart || 0)}
            onKeyDown={handleKeyDown}
            className={commonClass}
            style={{ ...textStyle, caretColor: "#111827" }}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        )}
      </div>

      {transliterationEnabled && transliterationQuery && (loading || suggestions.length > 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
            Malayalam suggestions
          </div>

          <div
            className="flex gap-2 overflow-x-auto px-2 py-2 scrollbar-thin"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {loading ? (
              <div className="px-3 py-2 text-sm text-slate-500">Loading...</div>
            ) : (
              suggestions.map((item, index) => (
                <button
                  key={`${item.value}-${index}`}
                  ref={(el) => {
                    suggestionItemRefs.current[index] = el;
                  }}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applySuggestion(item.value)}
                  className={`shrink-0 min-h-[44px] px-4 py-2 rounded-2xl text-sm md:text-base border font-medium transition ${
                    index === selectedIndex
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 active:bg-emerald-50 active:border-emerald-200"
                  }`}
                >
                  {item.value}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Suggestions stay in the bar only. Keyboard: use ↑ ↓ to switch, Tab or → to accept, Space to commit.
      </p>
    </div>
  );
}