"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { getHijriDate } from "@/lib/prayerUtils";
import { fetchAladhanTimings } from "@/lib/prayerActions";
import { createBrowserClient } from '@supabase/ssr';

interface HeroCountdownProps {
  lang: Language;
}

export default function HeroCountdown({ lang }: HeroCountdownProps) {
  const t = TRANSLATIONS[lang];

  // UI States
  const [nextPrayerName, setNextPrayerName] = useState<string>("...");
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [hijriDateStr, setHijriDateStr] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Data States
  const [apiTimings, setApiTimings] = useState<any>(null);
  const [dbSettings, setDbSettings] = useState<any>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // 1. Fetch initial API & Supabase data on mount
  useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));

    // We don't set the Hijri date immediately here anymore,
    // we wait for the database offset to load!

    async function loadData() {
      const [apiData, { data: settings }] = await Promise.all([
        fetchAladhanTimings(),
        supabase.from('prayer_settings').select('*').eq('id', 1).single()
      ]);
      setApiTimings(apiData);

      const safeSettings = settings || {
        fajr_offset: 0, dhuhr_offset: 0, asr_offset: 0,
        maghrib_offset: 0, isha_offset: 0, jumuah_time: "01:00 PM",
        hijri_offset: -1 // Default Kerala offset
      };

      setDbSettings(safeSettings);
      // Fetch Hijri date dynamically using the database offset
      setHijriDateStr(getHijriDate(safeSettings.hijri_offset));

      setIsLoaded(true);
    }
    loadData();
  }, [lang, supabase]);

  // 2. Countdown Timer Engine
  useEffect(() => {
    if (!apiTimings || !dbSettings) return;

    const timer = setInterval(() => {
      const now = new Date();
      const candidates: { key: string, name: string, date: Date }[] = [];

      // Helper 1: Calculate exact Jama'at Date object from 24h API time + offsets
      const pushPrayer = (key: string, name: string, time24: string, dbOffset: number, jamaatOffset: number, isTomorrow: boolean) => {
        if (!time24) return;
        const [h, m] = time24.split(':').map(Number);
        const d = new Date();
        if (isTomorrow) d.setDate(d.getDate() + 1);
        d.setHours(h, m + (dbOffset || 0) + jamaatOffset, 0, 0);
        candidates.push({ key, name, date: d });
      };

      // Helper 2: Parse static 12-hour time (e.g., "01:00 PM") for Jumu'ah
      const pushJumuah = (time12h: string, isTomorrow: boolean) => {
        if (!time12h) return;
        const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return;

        let hours = parseInt(match[1]);
        const mins = parseInt(match[2]);
        if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;

        const d = new Date();
        if (isTomorrow) d.setDate(d.getDate() + 1);
        d.setHours(hours, mins, 0, 0);
        candidates.push({ key: 'jumuah', name: t.jumuah || 'Jumuah', date: d });
      };

      // Generate all Jama'at times for Today and Tomorrow to ensure seamless midnight transitions
      [false, true].forEach(isTomorrow => {
        const targetDate = new Date();
        if (isTomorrow) targetDate.setDate(targetDate.getDate() + 1);
        const isFriday = targetDate.getDay() === 5;

        // Note: Excluded Sunrise and Eid intentionally
        pushPrayer('fajr', t.fajr || 'Fajr', apiTimings.Fajr, dbSettings.fajr_offset, 30, isTomorrow);

        if (isFriday) {
          pushJumuah(dbSettings.jumuah_time, isTomorrow);
        } else {
          pushPrayer('dhuhr', t.dhuhr || 'Dhuhr', apiTimings.Dhuhr, dbSettings.dhuhr_offset, 15, isTomorrow);
        }

        pushPrayer('asr', t.asr || 'Asr', apiTimings.Asr, dbSettings.asr_offset, 15, isTomorrow);
        pushPrayer('maghrib', t.maghrib || 'Maghrib', apiTimings.Maghrib, dbSettings.maghrib_offset, 15, isTomorrow);
        pushPrayer('isha', t.isha || 'Isha', apiTimings.Isha, dbSettings.isha_offset, 15, isTomorrow);
      });

      // Find the absolute FIRST prayer time that is in the future
      const futurePrayers = candidates.filter(c => c.date.getTime() > now.getTime());
      futurePrayers.sort((a, b) => a.date.getTime() - b.date.getTime());

      const nextJamaat = futurePrayers[0];

      if (nextJamaat) {
        const diff = nextJamaat.date.getTime() - now.getTime();
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
        setNextPrayerName(nextJamaat.name);
      }

    }, 1000);

    return () => clearInterval(timer);
  }, [apiTimings, dbSettings, t]);

  return (
    <div className="relative w-full min-h-[93vh] flex items-center justify-center overflow-hidden bg-slate-900">

      {/* Background Image with CSS Animations:
        - animate-[pulse_20s_ease-in-out_infinite]: Slow, subtle breathing effect.
        - scale-105: Ensures edges don't show during transformations.
        - transition-opacity/blur: Smooth fade-in on mount for a premium feel.
      */}
      <div
        className={`absolute inset-0 z-0 scale-105 animate-[pulse_20s_ease-in-out_infinite] transition-all duration-1000 ${
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`}
        style={{
          backgroundImage: "url('/4kpmj.webp')",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Hero Content Wrapper - Fades in once data is ready */}
      <div className={`relative z-10 text-center px-4 flex flex-col items-center transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
          {t.welcome}
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-emerald-50 mb-10 text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>{currentDateStr}</span>
          </div>
          <div className="hidden md:block text-emerald-400/50">|</div>
          <div className="flex items-center gap-2 font-medium">
            <span>{hijriDateStr}</span>
          </div>
        </div>

        {/* Live Countdown Box */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full min-h-[180px] flex flex-col justify-center relative overflow-hidden">

          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center text-emerald-300">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm uppercase tracking-widest font-medium">Syncing Times...</span>
            </div>
          ) : (
            <>
              {/* Subtle glass shine effect */}
              <div className="absolute -inset-1/2 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform rotate-45 pointer-events-none"></div>

              <p className="text-emerald-300 font-medium uppercase tracking-widest text-sm mb-2 relative z-10">
                {t.nextJamaat}
              </p>

              <div className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-4 relative z-10">
                <span>{nextPrayerName}</span>
              </div>

              <div className="text-5xl md:text-7xl font-mono font-bold text-emerald-400 drop-shadow-md tracking-tight relative z-10 flex justify-center">
                {/* Pulse animation explicitly on the colons for a ticking clock effect */}
                {countdown.split(':').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <span>{part}</span>
                    {i !== arr.length - 1 && <span className="animate-pulse opacity-75 mx-1">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}