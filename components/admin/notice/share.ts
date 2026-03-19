"use client";

import { isMobileDevice } from "./utils";

export async function sharePdfOnWhatsApp(blob: Blob, fileName: string, text: string) {
  const file = new File([blob], fileName, { type: "application/pdf" });

  // Native share with file support first
  if (typeof navigator !== "undefined" && "share" in navigator) {
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };

    if (nav.canShare?.({ files: [file] })) {
      await nav.share({
        title: fileName,
        text,
        files: [file],
      });
      return { mode: "native-file" as const };
    }

    try {
      await navigator.share({ title: fileName, text });
      return { mode: "native-text" as const };
    } catch {}
  }

  // WhatsApp web/mobile fallback cannot attach local blob directly.
  const whatsappUrl = `https://${isMobileDevice() ? "api" : "web"}.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  return { mode: "whatsapp-text" as const };
}