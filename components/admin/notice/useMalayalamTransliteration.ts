"use client";

import { useEffect, useRef, useState } from "react";

export interface TransliterationSuggestion {
  value: string;
}

export function useMalayalamTransliteration(input: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<TransliterationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !input.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://inputtools.google.com/request?text=${encodeURIComponent(
            input
          )}&itc=ml-t-i0-und&num=8`
        );

        const data = await res.json();

        if (data?.[0] === "SUCCESS") {
          const words = data?.[1]?.[0]?.[1] || [];
          setSuggestions(words.map((w: string) => ({ value: w })));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Malayalam transliteration error:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 160);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, enabled]);

  return { suggestions, loading };
}