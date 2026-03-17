"use client";

import { MapPin, Phone, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSLATIONS, Language } from "@/lib/translations";
import type { CommitteeMember } from "@/lib/homepage";

type Props = {
  id?: string;
  lang: Language;
  mapUrl: string;
  committee: CommitteeMember[];
};

export default function ContactMapSection({ id, lang, mapUrl, committee }: Props) {
  const t = TRANSLATIONS[lang];

  const mainContact = committee[0];

  return (
    <section id={id} className="scroll-mt-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">{t.contactCommittee}</h2>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-900">{t.footname}</p>
                <p className="text-slate-600">
                  {t.footadd}
                  <br />
                  {t.kerala}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-900">{t.imamContact}</p>
                <p className="text-slate-600">{t.usthad}</p>
                <a href="tel:+919497007113" className="font-semibold text-emerald-700">
                  +91 94970 07113
                </a>
              </div>
            </div>

            {mainContact && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{t.committeeContact}</p>
                <p className="font-bold text-slate-900">{mainContact.name}</p>
                <a
                  href={`tel:${mainContact.contact_number}`}
                  className="font-semibold text-emerald-700"
                >
                  {mainContact.contact_number}
                </a>
              </div>
            )}

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              <Navigation className="h-4 w-4" />
              {t.mapDirections}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-full min-h-[320px] bg-[url('/map-preview.webp')] bg-cover bg-center">
            <div className="flex h-full min-h-[320px] items-end bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-emerald-200">{t.loadMap}</p>
                <h3 className="mb-3 text-2xl font-bold text-white">{t.masjidName}</h3>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  <Navigation className="h-4 w-4" />
                  {t.openMap}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}