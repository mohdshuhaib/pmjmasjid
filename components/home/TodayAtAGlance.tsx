"use client";

import { CalendarDays, Clock3, Bell, Star } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSLATIONS, Language } from "@/lib/translations";
import type { Notice, PrayerSettings, PrayerTimingsApi } from "@/lib/homepage";

type Props = {
  id?: string;
  lang: Language;
  timings: PrayerTimingsApi | null;
  settings: PrayerSettings;
  latestNotice: Notice | null;
};

export default function TodayAtAGlance({ id, lang, latestNotice, timings }: Props) {
  const t = TRANSLATIONS[lang];

  const today = new Date().toLocaleDateString(lang === "ml" ? "ml-IN" : "en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const items = [
    {
      icon: CalendarDays,
      label: t.today,
      value: today,
    },
    {
      icon: Clock3,
      label: t.sunrise,
      value: timings?.Sunrise,
    },
    {
      icon: Star,
      label: t.updatedToday,
      value: t.viewPrayerTimes,
    },
    {
      icon: Bell,
      label: t.latestNotice,
      value: latestNotice?.heading || t.noNotices,
    },
  ];

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
          <Star className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold md:text-3xl">{t.todayAtAGlance}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              </div>
              <p className="line-clamp-2 text-lg font-bold text-slate-900">{item.value}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}