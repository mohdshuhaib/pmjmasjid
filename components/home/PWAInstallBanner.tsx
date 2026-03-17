"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
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
}

export default function PWAInstallBanner({ lang }: { lang: Language }) {
  const t = TRANSLATIONS[lang];
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("pmj-install-dismissed");
    if (dismissed === "true") return;

    const onBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setHidden(false);
    };

    const onInstalled = () => {
      setHidden(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setHidden(true);
  };

  const handleDismiss = () => {
    localStorage.setItem("pmj-install-dismissed", "true");
    setHidden(true);
  };

  return (
    <AnimatePresence>
      {!hidden && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="sticky top-16 z-40 mx-auto mt-3 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{t.installApp}</h3>
                  <p className="text-sm text-slate-600">{t.installAppDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleInstall}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-700"
                >
                  {t.install}
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {t.notNow}
                </button>
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
      )}
    </AnimatePresence>
  );
}