"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Heart, User, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import Header from "@/components/Header";
import HeroCountdown from "@/components/HeroCountdown";
import PrayerTimes from "@/components/PrayerTimes";
import NoticeBoard from "@/components/NoticeBoard";
import CommitteeMembers from "@/components/CommitteeMembers";
import Link from 'next/link';

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const t = TRANSLATIONS[lang];

  // BYLAW GOOGLE DRIVE LINK - Paste your actual link here!
  const BYLAW_LINK = "https://drive.google.com/file/d/1xd-yKDwCJpnvSXrxeZYHmgvXoRWO9bqL/view?usp=sharing";

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

        {/* --- BYLAW BANNER (NEW) --- */}
        <div className="bg-emerald-800 rounded-3xl shadow-xl overflow-hidden relative transition-transform hover:-translate-y-1 duration-300">
          {/* Subtle Background Pattern/Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 to-transparent"></div>

          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6 text-white">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20 shadow-inner">
                <BookOpen className="w-10 h-10 text-emerald-100" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                  {lang === 'ml' ? 'ജമാഅത്ത് ഭരണഘടന' : 'Jama\'ath Constitution & Bylaws'}
                </h2>
                <p className="text-emerald-100/90 max-w-xl text-sm md:text-base leading-relaxed">
                  {lang === 'ml'
                    ? 'പെരുങ്ങുഴി മുസ്‌ലിം ജമാഅത്തിന്റെ ഔദ്യോഗിക ഭരണഘടനയും (Bylaw) നിയമാവലികളും വായിച്ചു മനസ്സിലാക്കുക.'
                    : 'Read the official constitution, rules, and regulations governing the Perunguzhi Muslim Jama\'ath.'}
                </p>
              </div>
            </div>

            <a
              href={BYLAW_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center gap-3 shrink-0 whitespace-nowrap group"
            >
              {lang === 'ml' ? 'വായിക്കുക' : 'Read Bylaw'}
              <ExternalLink className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

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
                  <Image
                    src="/logo.png"
                    alt="PMJ Masjid Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {t.masjidName}
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
                    <p className="text-white text-sm">Usthad Rafi Baqavi</p>
                    <p className="text-white text-sm">+91 94970 07113</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-4 sm:gap-8">
                {/* Member Login Link */}
                <Link href="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  <User className="w-4 h-4" />
                  {t.fundStatusLink} <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Footer Bylaw Link */}
                <a href={BYLAW_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  <BookOpen className="w-4 h-4" />
                  {lang === 'ml' ? 'നിയമാവലി (Bylaw)' : 'Jama\'ath Bylaw'} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Map Column */}
            <div className="w-full h-64 lg:h-full min-h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <iframe
                src="https://maps.google.com/maps?q=8.631893944994628,76.81538546473199&t=&z=16&ie=UTF8&iwloc=&output=embed"
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
            <p>© {new Date().getFullYear()} {t.masjidName}. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              {t.madeWith} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {t.by}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}