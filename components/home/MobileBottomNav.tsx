"use client";

import { Home, Clock3, Bell, LogIn, MapPinned } from "lucide-react";
import Link from "next/link";
import { TRANSLATIONS, Language } from "@/lib/translations";

export default function MobileBottomNav({ lang }: { lang: Language }) {
  const t = TRANSLATIONS[lang];

  const items = [
    { label: t.welcome, icon: Home, href: "#hero", isRoute: false },
    { label: t.prayerTimes, icon: Clock3, href: "#prayer-times", isRoute: false },
    { label: t.noticeBoard, icon: Bell, href: "#notices", isRoute: false },
    { label: t.login, icon: LogIn, href: "/login", isRoute: true },
    { label: t.contactCommittee, icon: MapPinned, href: "#contact", isRoute: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isRoute) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] font-semibold text-slate-700"
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] font-semibold text-slate-700"
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}