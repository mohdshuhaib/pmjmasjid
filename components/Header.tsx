"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, User } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { MoonIcon } from "@/components/MoonIcon";
import { supabase } from "@/lib/supabase"; // Import your supabase client

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export default function Header({ lang, setLang }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const t = TRANSLATIONS[lang];

  // Check auth state on mount and listen for changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes (e.g., login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Determine the link and text based on auth state
  const authLink = isLoggedIn ? "/dashboard" : "/login";
  const authText = isLoggedIn ? (lang === 'en' ? "Dashboard" : "ഡാഷ്‌ബോർഡ്") : t.login;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-inner">
              <MoonIcon className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-800 leading-tight">
                {t.masjidName}
              </span>
              <span className="text-xs text-emerald-600 font-medium tracking-wide">
                {t.subtitle}
              </span>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${lang === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${lang === 'ml' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                മലയാളം
              </button>
            </div>

            <Link
              href={authLink}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {authText}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={() => setLang(lang === 'en' ? 'ml' : 'en')} className="p-2 text-slate-600 bg-slate-100 rounded-full flex items-center gap-1">
               <Globe className="w-5 h-5"/>
               <span className="text-xs font-bold uppercase">{lang}</span>
             </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl">
          <Link
            href={authLink}
            className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium flex justify-center items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="w-5 h-5" />
            {authText}
          </Link>
        </div>
      )}
    </header>
  );
}