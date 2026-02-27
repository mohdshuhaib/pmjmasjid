"use client";

import React, { useState, useEffect } from "react";
import { Clock, Save, CheckCircle2, AlertCircle, Settings2, Moon, Sun, Sunrise, Sunset, Users, Star, Calendar } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

interface PrayerSettings {
  fajr_offset: number;
  sunrise_offset: number;
  dhuhr_offset: number;
  asr_offset: number;
  maghrib_offset: number;
  isha_offset: number;
  jumuah_time: string;
  eid_time: string;
  hijri_offset: number;
}

export default function AzanSettings() {
  const [settings, setSettings] = useState<PrayerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('prayer_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('prayer_settings')
      .update({
        fajr_offset: settings.fajr_offset,
        sunrise_offset: settings.sunrise_offset,
        dhuhr_offset: settings.dhuhr_offset,
        asr_offset: settings.asr_offset,
        maghrib_offset: settings.maghrib_offset,
        isha_offset: settings.isha_offset,
        jumuah_time: settings.jumuah_time,
        eid_time: settings.eid_time,
        hijri_offset: settings.hijri_offset,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Prayer & Hijri timings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  const handleChange = (field: keyof PrayerSettings, value: string | number) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-emerald-600" />
          Time & Date Settings
        </h1>
        <p className="text-slate-500 mt-1">Adjust daily API offsets, Hijri dates, and set static times for Jumu'ah and Eid.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* Hijri Calendar Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Hijri Calendar Adjustment</h2>
              <p className="text-sm text-slate-500">Adjust the current Islamic date forward or backward by days (e.g. -1, 0, 1).</p>
            </div>
          </div>
          <div className="max-w-xs">
            <OffsetInput label="Hijri Offset (Days)" icon={Moon} value={settings?.hijri_offset} onChange={(v) => handleChange('hijri_offset', v)} unit="DAYS" />
          </div>
        </div>

        {/* Dynamic Offsets Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">API Adjustments (Minutes)</h2>
              <p className="text-sm text-slate-500">Enter a number to add or subtract minutes from the Aladhan API time (e.g., 5, -2, 0).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OffsetInput label="Fajr" icon={Moon} value={settings?.fajr_offset} onChange={(v) => handleChange('fajr_offset', v)} unit="MINS" />
            <OffsetInput label="Sunrise" icon={Sunrise} value={settings?.sunrise_offset} onChange={(v) => handleChange('sunrise_offset', v)} unit="MINS" />
            <OffsetInput label="Dhuhr" icon={Sun} value={settings?.dhuhr_offset} onChange={(v) => handleChange('dhuhr_offset', v)} unit="MINS" />
            <OffsetInput label="Asr" icon={Sun} value={settings?.asr_offset} onChange={(v) => handleChange('asr_offset', v)} unit="MINS" />
            <OffsetInput label="Maghrib" icon={Sunset} value={settings?.maghrib_offset} onChange={(v) => handleChange('maghrib_offset', v)} unit="MINS" />
            <OffsetInput label="Isha" icon={Moon} value={settings?.isha_offset} onChange={(v) => handleChange('isha_offset', v)} unit="MINS" />
          </div>
        </div>

        {/* Static Times Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Star className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Static Prayer Times</h2>
              <p className="text-sm text-slate-500">Set the exact display text for fixed prayers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <Users className="w-4 h-4 text-emerald-600" /> Jumu'ah Time
              </label>
              <input
                type="text"
                required
                value={settings?.jumuah_time || ""}
                onChange={(e) => handleChange('jumuah_time', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                placeholder="e.g. 01:00 PM"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <Star className="w-4 h-4 text-emerald-600" /> Eid Time
              </label>
              <input
                type="text"
                required
                value={settings?.eid_time || ""}
                onChange={(e) => handleChange('eid_time', e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                placeholder="e.g. 08:00 AM"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Adjustments"}
        </button>
      </form>
    </div>
  );
}

// Small helper component for the offset inputs
function OffsetInput({ label, icon: Icon, value, onChange, unit }: { label: string, icon: any, value: number | undefined, onChange: (val: number) => void, unit: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-700 font-bold">
        <Icon className="w-4 h-4 text-slate-400" /> {label}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-20 border border-slate-300 rounded-lg p-2 text-center outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
        />
        <span className="text-xs text-slate-500 font-bold">{unit}</span>
      </div>
    </div>
  );
}