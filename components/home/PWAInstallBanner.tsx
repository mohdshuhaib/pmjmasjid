"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSLATIONS, Language } from "@/lib/translations";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

type BannerMode = "none" | "android" | "ios";

export default function PWAInstallBanner({ lang }: { lang: Language }) {
  const t = TRANSLATIONS[lang];

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);
  const [bannerMode, setBannerMode] = useState<BannerMode>("none");

  const isIos = useMemo(() => {
    if (typeof window === "undefined") return false;

    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleMobile =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    return isAppleMobile;
  }, []);

  const isSafari = useMemo(() => {
    if (typeof window === "undefined") return false;

    const ua = window.navigator.userAgent.toLowerCase();
    return /safari/.test(ua) && !/crios|fxios|edgios|chrome|android/.test(ua);
  }, []);

  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Auto-hide permanently if already installed/opened as app
    if (isStandalone) {
      setHidden(true);
      setBannerMode("none");
      return;
    }

    const dismissed = localStorage.getItem("pmj-install-dismissed");
    if (dismissed === "true") {
      setHidden(true);
      return;
    }

    // iPhone/iPad Safari manual install banner
    if (isIos && isSafari) {
      setBannerMode("ios");
      setHidden(false);
    }

    const onBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();

      // If browser supports real install prompt, prefer that
      setDeferredPrompt(e);
      setBannerMode("android");
      setHidden(false);
    };

    const onInstalled = () => {
      setHidden(true);
      setBannerMode("none");
      setDeferredPrompt(null);
      localStorage.setItem("pmj-install-dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isIos, isSafari, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setHidden(true);
      setBannerMode("none");
      localStorage.setItem("pmj-install-dismissed", "true");
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pmj-install-dismissed", "true");
    setHidden(true);
  };

  if (bannerMode === "none" || hidden) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="sticky top-[88px] z-40 mx-auto w-full max-w-7xl px-4 pt-3 pb-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                {bannerMode === "android" ? (
                  <Download className="h-5 w-5" />
                ) : (
                  <Share className="h-5 w-5" />
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900">{t.installApp}</h3>

                {bannerMode === "android" ? (
                  <p className="text-sm text-slate-600">{t.installAppDesc}</p>
                ) : (
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>
                      {lang === "ml"
                        ? "iPhone/iPad ൽ ഇൻസ്റ്റാൾ ചെയ്യാൻ Safari ൽ ഈ സൈറ്റ് തുറക്കുക."
                        : "To install on iPhone/iPad, open this site in Safari."}
                    </p>
                    <p className="flex flex-wrap items-center gap-1">
                      <span>
                        {lang === "ml"
                          ? "പിന്നീട്"
                          : "Then tap"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                        <Share className="h-4 w-4" />
                        {lang === "ml" ? "Share" : "Share"}
                      </span>
                      <span>
                        {lang === "ml"
                          ? "എന്ന് തിരഞ്ഞെടുക്കി"
                          : "and choose"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                        <PlusSquare className="h-4 w-4" />
                        {lang === "ml" ? "Add to Home Screen" : "Add to Home Screen"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {bannerMode === "android" ? (
                <button
                  onClick={handleInstall}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-700"
                >
                  {t.install}
                </button>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {lang === "ml" ? "മനസ്സിലായി" : "Got it"}
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close install banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}