"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  LogOut,
  Settings,
  Heart,
  Venus,
  MicVocal,
  Tickets,
  UserCog,
  Info,
  IndianRupee,
  Logs,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/admin/login");
  };

  const navSections = [
    {
      title: "Main",
      links: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "Members", href: "/admin/dashboard/members", icon: Users },
        { name: "Widows", href: "/admin/dashboard/widows", icon: Venus },
        { name: "Notice", href: "/admin/dashboard/notice", icon: Info },
      ],
    },
    {
      title: "Management",
      links: [
        { name: "Manage Members", href: "/admin/dashboard/manage", icon: UserCog },
        { name: "Marriage Section", href: "/admin/dashboard/marriage", icon: Heart },
        { name: "Manage Azan", href: "/admin/dashboard/azan", icon: MicVocal },
      ],
    },
    {
      title: "Finance",
      links: [
        { name: "Payments", href: "/admin/dashboard/payment", icon: IndianRupee },
        { name: "Token Counter", href: "/admin/dashboard/token", icon: Tickets },
      ],
    },
    {
      title: "System",
      links: [
        { name: "Logs", href: "/admin/dashboard/logs", icon: Logs },
        { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 shadow-xl">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-lg">
          A
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg">Admin Portal</span>
          <span className="text-xs text-emerald-400">
            PMJ Masjid
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar px-3 py-4 space-y-6">

        {navSections.map((section) => (
          <div key={section.title}>

            <p className="px-4 mb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

          </div>
        ))}

      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <span className="font-bold text-lg">Admin Portal</span>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-slate-800 rounded-md text-emerald-400"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">

          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-50 h-full w-64 bg-slate-900 transform transition-transform duration-300">

            <button
              onClick={() => setIsOpen(false)}
              className="absolute -right-12 top-4 p-2 bg-slate-800 text-white rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <SidebarContent />

          </div>

        </div>
      )}
    </>
  );
}