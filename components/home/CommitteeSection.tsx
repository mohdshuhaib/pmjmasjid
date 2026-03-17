"use client";

import { Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSLATIONS, Language } from "@/lib/translations";
import type { CommitteeMember } from "@/lib/homepage";

type Props = {
  id?: string;
  lang: Language;
  primaryCommittee: CommitteeMember[];
  secondaryCommittee: CommitteeMember[];
};

export default function CommitteeSection({
  id,
  lang,
  primaryCommittee,
  secondaryCommittee,
}: Props) {
  const t = TRANSLATIONS[lang];

  const renderCard = (member: CommitteeMember, large = false) => (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      className={`rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md ${
        large ? "flex flex-col items-center justify-center" : ""
      }`}
    >
      <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
        <User className="h-6 w-6" />
      </div>

      <h4 className="mb-2 text-lg font-bold text-slate-900">{member.name}</h4>

      <span className="mb-4 inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
        {(t as any)[member.role_key] || member.role_key}
      </span>

      <a
        href={`tel:${member.contact_number}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <Phone className="h-4 w-4 text-slate-500" />
        {member.contact_number}
      </a>
    </motion.div>
  );

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold md:text-3xl">{t.committee}</h2>
      </div>

      {primaryCommittee.length === 0 && secondaryCommittee.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
          {t.noCommittee}
        </div>
      ) : (
        <>
          {primaryCommittee.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {primaryCommittee.map((member) => renderCard(member, true))}
            </div>
          )}

          {secondaryCommittee.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {secondaryCommittee.map((member) => renderCard(member))}
            </div>
          )}
        </>
      )}
    </section>
  );
}