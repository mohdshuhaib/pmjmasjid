"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, ArrowRight, BookOpen, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { TRANSLATIONS, Language } from "@/lib/translations";
import type { PrayerSettings, PrayerTimingsApi } from "@/lib/homepage";
import { getHijriDate } from "@/lib/prayerUtils";
import { parseTimeToDate } from "@/lib/prayer-helpers";

type Props = {
  id?: string;
  lang: Language;
  timings: PrayerTimingsApi | null;
  settings: PrayerSettings;
  bylawLink: string;
};

type PrayerCandidate = {
  name: string;
  date: Date;
};

export default function HeroSection({ id, lang, timings, settings, bylawLink }: Props) {
  const t = TRANSLATIONS[lang];
  const [countdown, setCountdown] = useState("00:00:00");
  const [nextPrayerName, setNextPrayerName] = useState("...");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [hijriDateStr, setHijriDateStr] = useState("");

  useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString(lang === "ml" ? "ml-IN" : "en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setHijriDateStr(getHijriDate(settings.hijri_offset));
  }, [lang, settings.hijri_offset]);

  const isNight = useMemo(() => {
    if (!timings?.Sunrise || !timings?.Maghrib) {
      const hour = new Date().getHours();
      return hour >= 18 || hour < 6;
    }

    const now = new Date();
    const sunrise = parseTimeToDate(timings.Sunrise);
    const maghrib = parseTimeToDate(timings.Maghrib);

    return now < sunrise || now >= maghrib;
  }, [timings]);

  useEffect(() => {
    if (!timings) return;

    const updateTimer = () => {
      const now = new Date();

      const prayers: PrayerCandidate[] = [];

      const push = (label: string, time?: string, dayOffset = 0) => {
        if (!time) return;
        prayers.push({
          name: label,
          date: parseTimeToDate(time, dayOffset),
        });
      };

      push(t.fajr || "Fajr", timings.Fajr);
      push(t.dhuhr || "Dhuhr", timings.Dhuhr);
      push(t.asr || "Asr", timings.Asr);
      push(t.maghrib || "Maghrib", timings.Maghrib);
      push(t.isha || "Isha", timings.Isha);

      push(t.fajr || "Fajr", timings.Fajr, 1);
      push(t.dhuhr || "Dhuhr", timings.Dhuhr, 1);
      push(t.asr || "Asr", timings.Asr, 1);
      push(t.maghrib || "Maghrib", timings.Maghrib, 1);
      push(t.isha || "Isha", timings.Isha, 1);

      const next = prayers
        .filter((p) => p.date.getTime() > now.getTime())
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

      if (!next) return;

      const diff = next.date.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setNextPrayerName(next.name);
      setCountdown(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [timings, t]);

  return (
    <section
      id={id}
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-slate-950 scroll-mt-24"
    >
      <Image
        src={isNight ? "/hero-night.webp" : "/hero-day.webp"}
        alt="PMJ Masjid"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/75" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8"
      >
        <p className="mb-4 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
          {t.officialPortal}
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
          {t.homepage}
        </h1>

        <div className="mb-10 flex flex-col items-center gap-3 text-emerald-50 md:flex-row md:gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-300" />
            <span>{currentDateStr}</span>
          </div>
          <span className="hidden text-emerald-300/50 md:block">|</span>
          <span>{hijriDateStr}</span>
        </div>

        <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md md:p-8">
          <p className="mb-2 text-sm font-semibold uppercase text-emerald-300">
            {t.nextJamaat}
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{nextPrayerName}</h2>
          <div className="text-5xl font-bold tracking-tight text-emerald-300 md:text-7xl">
            {countdown}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#prayer-times"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            {t.viewPrayerTimes} <ArrowRight className="h-4 w-4" />
          </a>

          <a
            href="#notices"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
          >
            <Bell className="h-4 w-4" />
            {t.openNotices}
          </a>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
          >
            <User className="h-4 w-4" />
            {t.memberLogin}
          </Link>

          <a
            href={bylawLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
          >
            <BookOpen className="h-4 w-4" />
            {t.readBylaw}
          </a>
        </div>
      </motion.div>
    </section>
  );
}