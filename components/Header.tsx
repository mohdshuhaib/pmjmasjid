"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Globe,
  User,
  ShieldCheck,
  Clock3,
  Bell,
  BookOpen,
  Users,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSLATIONS, Language } from "@/lib/translations";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export default function Header({ lang, setLang }: HeaderProps) {
  const t = TRANSLATIONS[lang];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async (user: any) => {
      if (!user) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuthStatus(session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthLoading(true);
      checkAuthStatus(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const authConfig = useMemo(() => {
    if (authLoading) {
      return {
        href: "#",
        text: lang === "en" ? "Loading..." : "ലോഡിംഗ്...",
        icon: User,
        disabled: true,
      };
    }

    if (!isLoggedIn) {
      return {
        href: "/login",
        text: t.login,
        icon: User,
        disabled: false,
      };
    }

    if (isAdmin) {
      return {
        href: "/admin/dashboard",
        text: lang === "en" ? "Admin Portal" : "അഡ്മിൻ പോർട്ടൽ",
        icon: ShieldCheck,
        disabled: false,
      };
    }

    return {
      href: "/dashboard",
      text: lang === "en" ? "Dashboard" : "ഡാഷ്‌ബോർഡ്",
      icon: User,
      disabled: false,
    };
  }, [authLoading, isLoggedIn, isAdmin, lang, t.login]);

  const AuthIcon = authConfig.icon;

  const navItems = [
    {
      label: lang === "en" ? "Prayer" : "നമസ്കാരം",
      href: "#prayer-times",
      icon: Clock3,
    },
    {
      label: lang === "en" ? "Notices" : "അറിയിപ്പുകൾ",
      href: "#notices",
      icon: Bell,
    },
    {
      label: lang === "en" ? "Bylaw" : "നിയമാവലി",
      href: "#bylaw",
      icon: BookOpen,
    },
    {
      label: lang === "en" ? "Committee" : "കമ്മിറ്റി",
      href: "#committee",
      icon: Users,
    },
    {
      label: lang === "en" ? "Contact" : "ബന്ധപ്പെടുക",
      href: "#contact",
      icon: MapPin,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-slate-200 bg-white/92 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-white/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="PMJ Masjid Logo"
              width={56}
              height={56}
              className="h-14 w-14 rounded-2xl object-cover transition-transform group-hover:scale-105"
              priority
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-xl">
                {t.masjidName}
              </p>
              <p className="truncate text-xs font-medium tracking-wide text-emerald-700">
                {t.subtitle}
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-700"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1">
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    lang === "en"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("ml")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    lang === "ml"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  മലയാളം
                </button>
              </div>

              {authConfig.disabled ? (
                <div className="flex items-center gap-2 rounded-full bg-slate-200 px-6 py-2.5 text-sm font-medium text-slate-500">
                  <User className="h-4 w-4" />
                  {authConfig.text}
                </div>
              ) : (
                <Link
                  href={authConfig.href}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 font-medium text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                >
                  <AuthIcon className="h-4 w-4" />
                  {authConfig.text}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setLang(lang === "en" ? "ml" : "en")}
              className="flex items-center gap-1 rounded-full bg-slate-100 p-2 text-slate-700"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" />
              <span className="text-xs font-bold uppercase">{lang}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-full border-t border-slate-200 bg-white shadow-xl lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </a>
                  );
                })}

                <div className="my-2 border-t border-slate-100" />

                {authConfig.disabled ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-medium text-slate-500">
                    <User className="h-5 w-5" />
                    {authConfig.text}
                  </div>
                ) : (
                  <Link
                    href={authConfig.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
                  >
                    <AuthIcon className="h-5 w-5" />
                    {authConfig.text}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}