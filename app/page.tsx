"use client";

import React, { useState } from "react";
import { MapPin, Phone, Heart, User, ArrowRight } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { MoonIcon } from "@/components/MoonIcon";
import Header from "@/components/Header";
import HeroCountdown from "@/components/HeroCountdown";
import PrayerTimes from "@/components/PrayerTimes";
import NoticeBoard from "@/components/NoticeBoard";
import CommitteeMembers from "@/components/CommitteeMembers";
import Link from 'next/link';

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const t = TRANSLATIONS[lang];

  return (
    <div className={`bg-slate-50 flex flex-col ${lang === 'ml' ? 'font-anek' : 'font-inter'}`}>

      {/* --- HEADER --- */}
      <Header lang={lang} setLang={setLang} />

      {/* --- HERO SECTION --- */}
      <HeroCountdown lang={lang} />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-20">

        <PrayerTimes lang={lang} />

        <NoticeBoard lang={lang} />

        <CommitteeMembers lang={lang} />

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 pt-16 pb-8 border-t-4 border-emerald-600 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

            {/* Info Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                   <MoonIcon className="text-emerald-500 w-6 h-6" /> {t.masjidName}
                </h3>
                <p className="text-slate-400">{t.subtitle}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                  <p className="leading-relaxed">
                    {t.footname}<br />
                    {t.footadd}<br />
                    {t.kerala}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t.imamContact}</p>
                    <p className="text-white text-lg">+91 94970 07113</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <Link href="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  <User className="w-4 h-4" />
                  {t.fundStatusLink} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Map Column */}
            <div className="w-full h-64 lg:h-full min-h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1606.5350263966393!2d76.81422194274934!3d8.631811123646973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ea99cf3770ad%3A0xd786ad5de15274f1!2sPerunguzhi%20Juma%20Masjid!5e0!3m2!1sen!2sin!4v1771643098036!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} {t.masjidName}. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              {t.madeWith} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {t.by}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}