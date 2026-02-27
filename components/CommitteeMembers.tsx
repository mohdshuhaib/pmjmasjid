"use client";

import React, { useState, useEffect } from "react";
import { User, Phone } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { supabase } from "@/lib/supabase";

interface CommitteeMember {
  id: string;
  name: string;
  role_key: string;
  contact_number: string;
  display_order: number;
}

interface CommitteeMembersProps {
  lang: Language;
}

export default function CommitteeMembers({ lang }: CommitteeMembersProps) {
  const t = TRANSLATIONS[lang];
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [loadingCommittee, setLoadingCommittee] = useState(true);

  // Fetch committee members from Supabase
  useEffect(() => {
    async function fetchCommittee() {
      const { data, error } = await supabase
        .from('committee_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error("Error fetching committee:", error);
      } else {
        setCommitteeMembers(data || []);
      }
      setLoadingCommittee(false);
    }

    fetchCommittee();
  }, []);

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{t.committee}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {loadingCommittee ? (
          // Loading Skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm animate-pulse">
              <div className="h-5 w-3/4 bg-slate-200 rounded mb-4"></div>
              <div className="h-6 w-1/2 bg-emerald-100 rounded-full mb-4"></div>
              <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
            </div>
          ))
        ) : committeeMembers.length > 0 ? (
          // Fetched Data
          committeeMembers.map((member) => (
            <div key={member.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{member.name}</h4>

              {/* We use t[member.role_key] to auto-translate "president", "secretary", etc. */}
              <span className="text-sm font-medium text-emerald-600 mb-4 bg-emerald-50 px-4 py-1.5 rounded-full">
                {(t as any)[member.role_key] || member.role_key}
              </span>

              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full justify-center">
                <Phone className="w-4 h-4 text-slate-400" /> {member.contact_number}
              </div>
            </div>
          ))
        ) : (
          // Fallback if empty database
          <div className="col-span-full text-center text-slate-500 py-8 bg-white rounded-3xl border border-slate-200 border-dashed">
            No committee members found in database.
          </div>
        )}

      </div>
    </section>
  );
}