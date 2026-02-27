"use client";

import React, { useEffect, useState } from "react";
import {
  Clock, Sunrise, Sun, Sunset, Moon,
  Users, Star, CloudFog, Loader2
} from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { fetchAladhanTimings } from "@/lib/prayerActions";
import { createBrowserClient } from '@supabase/ssr';

interface PrayerTimesProps {
  lang: Language;
}

// Helper: Add or subtract minutes from a 24-hour time string ("05:12" + 5 mins => "05:17")
const applyOffset = (timeStr: string, offsetMins: number) => {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;

  const date = new Date();
  date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  date.setMinutes(date.getMinutes() + (offsetMins || 0));

  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Helper: Convert 24-Hour to 12-Hour format AM/PM
const convertTo12Hour = (timeStr: string | null) => {
  if (!timeStr) return "N/A";
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return "N/A";

  const hour = parseInt(match[1]);
  const min = parseInt(match[2]);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${hour12.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${period}`;
};

// Helper: Calculate Jama'at Time from an ADJUSTED 24-hour time
const calculateJamaat = (adjustedTimeStr: string | null, offsetMins: number) => {
  if (!adjustedTimeStr) return "N/A";

  // Calculate Jama'at by adding Jama'at offset to the adjusted Azan time
  const jamaat24 = applyOffset(adjustedTimeStr, offsetMins);
  return convertTo12Hour(jamaat24);
};

export default function PrayerTimes({ lang }: PrayerTimesProps) {
  const t = TRANSLATIONS[lang];
  const [timings, setTimings] = useState<any>(null);
  const [dbSettings, setDbSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    async function loadData() {
      // Run API fetch and DB fetch in parallel for speed
      const [apiData, { data: settings }] = await Promise.all([
        fetchAladhanTimings(),
        supabase.from('prayer_settings').select('*').eq('id', 1).single()
      ]);

      setTimings(apiData);
      setDbSettings(settings || { fajr_offset: 0, sunrise_offset: 0, dhuhr_offset: 0, asr_offset: 0, maghrib_offset: 0, isha_offset: 0, jumuah_time: "01:00 PM", eid_time: "08:00 AM" });
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // Construct prayers only after both datasets are loaded
  const getPrayers = () => {
    if (!timings || !dbSettings) return [];

    // 1. Apply Supabase manual offsets to API times
    const adjFajr = applyOffset(timings.Fajr, dbSettings.fajr_offset);
    const adjSunrise = applyOffset(timings.Sunrise, dbSettings.sunrise_offset);
    const adjDhuhr = applyOffset(timings.Dhuhr, dbSettings.dhuhr_offset);
    const adjAsr = applyOffset(timings.Asr, dbSettings.asr_offset);
    const adjMaghrib = applyOffset(timings.Maghrib, dbSettings.maghrib_offset);
    const adjIsha = applyOffset(timings.Isha, dbSettings.isha_offset);

    return [
      { id: 'fajr', name: t.fajr || 'Fajr', icon: CloudFog, azan: convertTo12Hour(adjFajr), jamaat: calculateJamaat(adjFajr, 30) },
      { id: 'sunrise', name: t.sunrise || 'Sunrise', icon: Sunrise, azan: convertTo12Hour(adjSunrise), jamaat: "-" },
      { id: 'dhuhr', name: t.dhuhr || 'Dhuhr', icon: Sun, azan: convertTo12Hour(adjDhuhr), jamaat: calculateJamaat(adjDhuhr, 15) },
      { id: 'asr', name: t.asr || 'Asr', icon: Sun, azan: convertTo12Hour(adjAsr), jamaat: calculateJamaat(adjAsr, 15) },
      { id: 'maghrib', name: t.maghrib || 'Maghrib', icon: Sunset, azan: convertTo12Hour(adjMaghrib), jamaat: calculateJamaat(adjMaghrib, 15) },
      { id: 'isha', name: t.isha || 'Isha', icon: Moon, azan: convertTo12Hour(adjIsha), jamaat: calculateJamaat(adjIsha, 15) },
    ];
  };

  const prayers = getPrayers();

  const staticPrayers = dbSettings ? [
    { id: 'jumuah', name: t.jumuah || 'Jumuah', icon: Users, time: dbSettings.jumuah_time },
    { id: 'eid', name: (t as any).eid || 'Eid', icon: Star, time: dbSettings.eid_time },
  ] : [];

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t.prayerTimes}</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
            <p>Loading precise prayer timings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 font-semibold text-slate-600 uppercase tracking-wider text-sm">{t.prayer}</th>
                  <th className="p-5 font-semibold text-slate-600 uppercase tracking-wider text-sm">{t.azan}</th>
                  <th className="p-5 font-semibold text-emerald-700 uppercase tracking-wider text-sm bg-emerald-50/50">{t.jamaat}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">

                {/* Regular Prayers */}
                {prayers.map((prayer, idx) => {
                  const Icon = prayer.icon;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5 font-bold text-slate-800 flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        {prayer.name}
                      </td>
                      <td className="p-5 text-slate-500 font-mono text-lg font-medium">{prayer.azan}</td>
                      <td className="p-5 text-emerald-700 font-mono font-bold text-lg bg-emerald-50/30 group-hover:bg-emerald-50/50 transition-colors">
                        {prayer.jamaat}
                      </td>
                    </tr>
                  );
                })}

                {/* Divider */}
                <tr>
                  <td colSpan={3} className="bg-slate-50 p-2 border-y border-slate-100"></td>
                </tr>

                {/* Special Static Prayers (One Column) */}
                {staticPrayers.map((prayer, idx) => {
                  const Icon = prayer.icon;
                  return (
                    <tr key={`static-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5 font-bold text-slate-800 flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        {prayer.name}
                      </td>
                      <td colSpan={2} className="p-0 border-l border-white bg-blue-50/30 group-hover:bg-blue-50/50 transition-colors">
                        <div className="w-full h-full p-5 flex items-center gap-3">
                          <span className="text-blue-700 font-mono font-bold text-lg">{prayer.time}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
                            Fixed Time
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}