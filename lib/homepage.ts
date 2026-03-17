import { createClient } from "@supabase/supabase-js";

export type PrayerSettings = {
  id: number;
  fajr_offset: number;
  sunrise_offset: number;
  dhuhr_offset: number;
  asr_offset: number;
  maghrib_offset: number;
  isha_offset: number;
  jumuah_time: string;
  eid_time: string;
  hijri_offset: number;
};

export type Notice = {
  id: string;
  heading: string;
  details: string;
  notice_date: string;
  confirmed_by: string;
  created_at?: string;
};

export type CommitteeMember = {
  id: string;
  name: string;
  role_key: string;
  contact_number: string;
  display_order: number;
};

export type PrayerTimingsApi = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchPrayerTimings(): Promise<PrayerTimingsApi | null> {
  try {
    const res = await fetch(
      "https://api.aladhan.com/v1/timings?latitude=8.631732&longitude=76.808162&method=1",
      {
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();

    return json?.data?.timings ?? null;
  } catch {
    return null;
  }
}

export async function fetchPrayerSettings(): Promise<PrayerSettings> {
  const fallback: PrayerSettings = {
    id: 1,
    fajr_offset: 0,
    sunrise_offset: 0,
    dhuhr_offset: 0,
    asr_offset: 0,
    maghrib_offset: 0,
    isha_offset: 0,
    jumuah_time: "01:00 PM",
    eid_time: "08:00 AM",
    hijri_offset: -1,
  };

  try {
    const { data } = await supabase
      .from("prayer_settings")
      .select("*")
      .eq("id", 1)
      .single();

    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchLatestNotices(): Promise<Notice[]> {
  try {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("notice_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4);

    return data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCommitteeMembers(): Promise<CommitteeMember[]> {
  try {
    const { data } = await supabase
      .from("committee_members")
      .select("*")
      .order("display_order", { ascending: true });

    return (data ?? []).sort((a, b) => {
      const priority = (role: string) => {
        const normalized = role.toLowerCase().trim();
        const order: Record<string, number> = {
          president: 1,
          secretary: 2,
          treasurer: 3,
          khateeb: 4,
          imam: 5,
          "vice president": 6,
          "joint secretary": 7,
          member: 8,
        };
        return order[normalized] ?? 99;
      };

      return priority(a.role_key) - priority(b.role_key) || a.display_order - b.display_order;
    });
  } catch {
    return [];
  }
}

export async function getHomepageData() {
  const [timings, settings, notices, committee] = await Promise.all([
    fetchPrayerTimings(),
    fetchPrayerSettings(),
    fetchLatestNotices(),
    fetchCommitteeMembers(),
  ]);

  return {
    timings,
    settings,
    notices,
    committee,
  };
}