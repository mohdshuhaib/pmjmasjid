"use client";

import React, { useMemo } from "react";
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Users,
  Star,
  CloudFog,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { TRANSLATIONS, Language } from "@/lib/translations";
import type { PrayerSettings, PrayerTimingsApi } from "@/lib/homepage";
import { applyOffset, calculateJamaat, convertTo12Hour } from "@/lib/prayer-helpers";

type Props = {
  id?: string;
  lang: Language;
  timings: PrayerTimingsApi | null;
  settings: PrayerSettings;
};

export default function PrayerTimesSection({ id, lang, timings, settings }: Props) {
  const t = TRANSLATIONS[lang];

  const prayers = useMemo(() => {
    if (!timings) return null;

    const adjFajr = applyOffset(timings.Fajr, settings.fajr_offset);
    const adjSunrise = applyOffset(timings.Sunrise, settings.sunrise_offset);
    const adjDhuhr = applyOffset(timings.Dhuhr, settings.dhuhr_offset);
    const adjAsr = applyOffset(timings.Asr, settings.asr_offset);
    const adjMaghrib = applyOffset(timings.Maghrib, settings.maghrib_offset);
    const adjIsha = applyOffset(timings.Isha, settings.isha_offset);

    return [
      { id: "fajr", name: t.fajr, icon: CloudFog, azan: convertTo12Hour(adjFajr), jamaat: calculateJamaat(adjFajr, 30) },
      { id: "sunrise", name: t.sunrise, icon: Sunrise, azan: convertTo12Hour(adjSunrise), jamaat: "-" },
      { id: "dhuhr", name: t.dhuhr, icon: Sun, azan: convertTo12Hour(adjDhuhr), jamaat: calculateJamaat(adjDhuhr, 15) },
      { id: "asr", name: t.asr, icon: Sun, azan: convertTo12Hour(adjAsr), jamaat: calculateJamaat(adjAsr, 15) },
      { id: "maghrib", name: t.maghrib, icon: Sunset, azan: convertTo12Hour(adjMaghrib), jamaat: calculateJamaat(adjMaghrib, 15) },
      { id: "isha", name: t.isha, icon: Moon, azan: convertTo12Hour(adjIsha), jamaat: calculateJamaat(adjIsha, 15) },
    ];
  }, [timings, settings, t]);

  const staticPrayers = [
    { id: "jumuah", name: t.jumuah, icon: Users, time: settings.jumuah_time },
    { id: "eid", name: t.eid, icon: Star, time: settings.eid_time },
  ];

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 shadow-sm">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{t.prayerTimes}</h2>
          <p className="text-sm text-slate-500">{t.updatedToday}</p>
        </div>
      </div>

      {!prayers ? (
        <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-bold">{t.prayerUnavailable}</h3>
              <p className="mt-1 text-sm text-slate-600">
                Please try again later.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-5 text-sm font-semibold uppercase tracking-wider text-slate-600">{t.prayer}</th>
                  <th className="p-5 text-sm font-semibold uppercase tracking-wider text-slate-600">{t.azan}</th>
                  <th className="bg-emerald-50/60 p-5 text-sm font-semibold uppercase tracking-wider text-emerald-700">{t.jamaat}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prayers.map((prayer) => {
                  const Icon = prayer.icon;
                  return (
                    <tr key={prayer.id} className="transition hover:bg-slate-50">
                      <td className="flex items-center gap-4 p-5 font-bold text-slate-900">
                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        {prayer.name}
                      </td>
                      <td className="p-5 font-mono text-lg text-slate-600">{prayer.azan}</td>
                      <td className="bg-emerald-50/30 p-5 font-mono text-lg font-bold text-emerald-700">
                        {prayer.jamaat}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td colSpan={3} className="bg-slate-50 p-2" />
                </tr>

                {staticPrayers.map((prayer) => {
                  const Icon = prayer.icon;
                  return (
                    <tr key={prayer.id} className="transition hover:bg-slate-50">
                      <td className="flex items-center gap-4 p-5 font-bold text-slate-900">
                        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        {prayer.name}
                      </td>
                      <td colSpan={2} className="bg-blue-50/40 p-5 font-mono text-lg font-bold text-blue-700">
                        {prayer.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {prayers.map((prayer, i) => {
              const Icon = prayer.icon;
              return (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{prayer.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.azan}</p>
                      <p className="mt-1 font-mono text-base font-bold text-slate-900">{prayer.azan}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{t.jamaat}</p>
                      <p className="mt-1 font-mono text-base font-bold text-emerald-800">{prayer.jamaat}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {staticPrayers.map((prayer) => {
              const Icon = prayer.icon;
              return (
                <div key={prayer.id} className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{prayer.name}</h3>
                  </div>
                  <p className="font-mono text-lg font-bold text-blue-700">{prayer.time}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}