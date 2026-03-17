"use client";

import React, { useMemo, useState } from "react";
import { Heart, MapPin, Phone, BookOpen, ArrowRight, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import { TRANSLATIONS, Language } from "@/lib/translations";
import type { CommitteeMember, Notice, PrayerSettings, PrayerTimingsApi } from "@/lib/homepage";

import HeroSection from "@/components/home/HeroSection";
import TodayAtAGlance from "@/components/home/TodayAtAGlance";
import QuickActions from "@/components/home/QuickActions";
import PrayerTimesSection from "@/components/home/PrayerTimesSection";
import NoticesSection from "@/components/home/NoticesSection";
import BylawBanner from "@/components/home/BylawBanner";
import CommitteeSection from "@/components/home/CommitteeSection";
import ContactMapSection from "@/components/home/ContactMapSection";
import PWAInstallBanner from "@/components/home/PWAInstallBanner";
import MobileBottomNav from "@/components/home/MobileBottomNav";

type Props = {
  data: {
    timings: PrayerTimingsApi | null;
    settings: PrayerSettings;
    notices: Notice[];
    committee: CommitteeMember[];
  };
};

export default function HomePageClient({ data }: Props) {
  const [lang, setLang] = useState<Language>("en");
  const t = TRANSLATIONS[lang];

  const BYLAW_LINK =
    "https://drive.google.com/file/d/19AbRhTsBo6eW1YjXGAZo1sHZ0tUiWXe9/view?usp=sharing";

  const latestNotice = data.notices?.[0] ?? null;

  const mapUrl =
    "https://maps.app.goo.gl/BwaNenTh7MQJL6Yn6";

  const primaryCommittee = useMemo(
    () =>
      data.committee.filter((m) =>
        ["president", "secretary", "treasurer", "khateeb", "imam"].includes(
          m.role_key.toLowerCase().trim()
        )
      ),
    [data.committee]
  );

  const secondaryCommittee = useMemo(
    () =>
      data.committee.filter(
        (m) =>
          !["president", "secretary", "treasurer", "khateeb", "imam"].includes(
            m.role_key.toLowerCase().trim()
          )
      ),
    [data.committee]
  );

  return (
    <div className="bg-slate-50 font-anek text-slate-900">

      <Header lang={lang} setLang={setLang} />

      <PWAInstallBanner lang={lang} />

      <HeroSection
        id="hero"
        lang={lang}
        timings={data.timings}
        settings={data.settings}
        bylawLink={BYLAW_LINK}
      />

      <main className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-28 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <TodayAtAGlance
          id="today"
          lang={lang}
          timings={data.timings}
          settings={data.settings}
          latestNotice={latestNotice}
        />

        <QuickActions
          id="quick-actions"
          lang={lang}
          bylawLink={BYLAW_LINK}
          mapUrl={mapUrl}
        />

        <PrayerTimesSection
          id="prayer-times"
          lang={lang}
          timings={data.timings}
          settings={data.settings}
        />

        <NoticesSection id="notices" lang={lang} notices={data.notices} />

        <BylawBanner id="bylaw" lang={lang} bylawLink={BYLAW_LINK} />

        <CommitteeSection
          id="committee"
          lang={lang}
          primaryCommittee={primaryCommittee}
          secondaryCommittee={secondaryCommittee}
        />

        <ContactMapSection
          id="contact"
          lang={lang}
          mapUrl={mapUrl}
          committee={primaryCommittee}
        />
      </main>

      <footer className="border-t-4 border-emerald-600 bg-slate-900 pb-8 pt-16 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-5">
              <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                <Image
                  src="/logo.png"
                  alt="PMJ Masjid Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                {t.masjidName}
              </h3>
              <p className="text-slate-400">{t.officialPortal}</p>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold text-white">{t.importantLinks}</h4>
              <div className="flex flex-col gap-3">
                <a href="#prayer-times" className="inline-flex items-center gap-2 hover:text-emerald-400">
                  <ArrowRight className="h-4 w-4" />
                  {t.viewPrayerTimes}
                </a>
                <a href="#notices" className="inline-flex items-center gap-2 hover:text-emerald-400">
                  <ArrowRight className="h-4 w-4" />
                  {t.openNotices}
                </a>
                <a
                  href={BYLAW_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-emerald-400"
                >
                  <BookOpen className="h-4 w-4" />
                  {t.readBylaw}
                </a>
                <Link href="/login" className="inline-flex items-center gap-2 hover:text-emerald-400">
                  <User className="h-4 w-4" />
                  {t.memberLogin}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">{t.contactCommittee}</h4>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />
                <p>
                  {t.footname}
                  <br />
                  {t.footadd}
                  <br />
                  {t.kerala}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500" />
                <p>+91 94970 07113</p>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                {t.openMap}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm text-slate-500 md:flex-row">
            <p>
              © {new Date().getFullYear()} {t.masjidName}. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 mb-10 md:mb-0">
              {t.madeWith} <Heart className="h-4 w-4 fill-red-500 text-red-500" /> {t.by}
            </p>
          </div>
        </div>
      </footer>

      <MobileBottomNav lang={lang} />
    </div>
  );
}