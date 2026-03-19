"use client";

import { Font } from "@react-pdf/renderer";
import { FONT_FAMILY, FONT_URL } from "./constants";

let fontRegistered = false;

export function registerPdfFont() {
  if (fontRegistered || typeof window === "undefined") return;

  Font.register({
    family: FONT_FAMILY,
    fonts: [
      { src: FONT_URL, fontWeight: 400 },
      { src: FONT_URL, fontWeight: 500 },
      { src: FONT_URL, fontWeight: 600 },
      { src: FONT_URL, fontWeight: 700 },
      { src: FONT_URL, fontWeight: 800 },
    ],
  });

  fontRegistered = true;
}