"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSLATIONS, Language } from "@/lib/translations";

type Props = {
  id?: string;
  lang: Language;
  bylawLink: string;
};

export default function BylawBanner({ id, lang, bylawLink }: Props) {
  const t = TRANSLATIONS[lang];

  return (
    <section id={id} className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        className="relative overflow-hidden rounded-3xl bg-emerald-800 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent" />
        <div className="relative flex flex-col items-center justify-between gap-8 p-8 text-center md:flex-row md:p-12 md:text-left">
          <div className="flex flex-col items-center gap-6 text-white md:flex-row">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
              <BookOpen className="h-10 w-10 text-emerald-100" />
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
                {lang === "ml" ? "ജമാഅത്ത് ഭരണഘടന" : "Jama'ath Constitution & Bylaws"}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-emerald-100/90 md:text-base">
                {lang === "ml"
                  ? "പെരുങ്ങുഴി മുസ്‌ലിം ജമാഅത്തിന്റെ ഔദ്യോഗിക ഭരണഘടനയും നിയമാവലികളും വായിക്കുക."
                  : "Read the official constitution, rules, and regulations governing the Perunguzhi Muslim Jama'ath."}
              </p>
            </div>
          </div>

          <a
            href={bylawLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl bg-white px-8 py-4 font-bold text-emerald-900 shadow-xl transition hover:bg-emerald-50"
          >
            {t.readBylaw}
            <ExternalLink className="h-5 w-5 text-emerald-600" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}