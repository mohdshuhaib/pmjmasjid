"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, User, ShieldCheck } from "lucide-react";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { MoonIcon } from "@/components/MoonIcon";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export default function Header({ lang, setLang }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Helper function to check session and role
    const checkAuthStatus = async (user: any) => {
      if (!user) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        return;
      }

      setIsLoggedIn(true);
      // Fetch user role to determine which dashboard to link to
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (data?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuthStatus(session?.user);
    });

    // Listen for auth changes (e.g., login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuthStatus(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Determine the link, text, and icon based on auth state and role
  let authLink = "/login";
  let authText = t.login;
  let AuthIcon = User;

  if (isLoggedIn) {
    if (isAdmin) {
      authLink = "/admin/dashboard";
      authText = lang === 'en' ? "Admin Portal" : "അഡ്മിൻ പോർട്ടൽ";
      AuthIcon = ShieldCheck;
    } else {
      authLink = "/dashboard";
      authText = lang === 'en' ? "Dashboard" : "ഡാഷ്‌ബോർഡ്";
      AuthIcon = User;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo area wrapped in Link */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <MoonIcon className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                {t.masjidName}
              </span>
              <span className="text-xs text-emerald-600 font-medium tracking-wide">
                {t.subtitle}
              </span>
            </div>
          </Link>

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
              <AuthIcon className="w-4 h-4" />
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
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl animate-in slide-in-from-top-2">
          <Link
            href={authLink}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-medium flex justify-center items-center gap-2 shadow-sm transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <AuthIcon className="w-5 h-5" />
            {authText}
          </Link>
        </div>
      )}
    </header>
  );
}