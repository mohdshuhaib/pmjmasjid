"use client";

import { BookOpen, LogIn, Bell, MapPinned, Clock3, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TRANSLATIONS, Language } from "@/lib/translations";

type Props = {
  id?: string;
  lang: Language;
  bylawLink: string;
  mapUrl: string;
};

export default function QuickActions({ id, lang, bylawLink, mapUrl }: Props) {
  const t = TRANSLATIONS[lang];

  const actions = [
    {
      title: t.viewPrayerTimes,
      desc: t.prayerTimes,
      icon: Clock3,
      href: "#prayer-times",
      external: false,
    },
    {
      title: t.openNotices,
      desc: t.noticeBoard,
      icon: Bell,
      href: "#notices",
      external: false,
    },
    {
      title: t.readBylaw,
      desc: t.readBylaw,
      icon: BookOpen,
      href: bylawLink,
      external: true,
    },
    {
      title: t.memberLogin,
      desc: t.fundStatusLink,
      icon: LogIn,
      href: "/login",
      external: false,
      route: true,
    },
    {
      title: t.mapDirections,
      desc: t.openMap,
      icon: MapPinned,
      href: mapUrl,
      external: true,
    },
    {
      title: t.committeeContact,
      desc: t.contactCommittee,
      icon: Users,
      href: "#committee",
      external: false,
    },
  ];

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Clock3 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold md:text-3xl">{t.quickActions}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const card = (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3 text-slate-700 transition group-hover:bg-emerald-100 group-hover:text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900 md:text-lg">{action.title}</h3>
              <p className="text-sm text-slate-600">{action.desc}</p>
            </motion.div>
          );

          if (action.route) {
            return (
              <Link key={action.title} href={action.href}>
                {card}
              </Link>
            );
          }

          if (action.external) {
            return (
              <a key={action.title} href={action.href} target="_blank" rel="noopener noreferrer">
                {card}
              </a>
            );
          }

          return (
            <a key={action.title} href={action.href}>
              {card}
            </a>
          );
        })}
      </div>
    </section>
  );
}