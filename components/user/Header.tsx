import React from "react";
import Link from "next/link";
import Image from "next/image"; // 1. Added Next.js Image component
import { LogOut, Bell } from "lucide-react";

// 2. Removed the inline MoonIcon function

interface HeaderProps {
  logoutAction: () => void;
  unreadCount?: number; // Optional prop for the notification badge
}

export default function Header({ logoutAction, unreadCount = 0 }: HeaderProps) {
  return (
    <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link href="/dashboard" className="flex items-center gap-3">
            {/* Increased from 32px to 48px (w-12 h-12) */}
            <Image
              src="/logo.png"
              alt="PMJ Masjid Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover shadow-sm"
              priority
            />
            <span className="font-bold text-xl tracking-wide hidden sm:block">PMJ Masjid Portal</span>
            <span className="font-bold text-xl tracking-wide sm:hidden">PMJ</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Notification Bell with Badge */}
            <Link
              href="/notifications"
              className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-600 rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-emerald-700 rounded-full animate-in zoom-in">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Logout Button */}
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-emerald-100 hover:text-white transition-colors text-sm font-medium bg-emerald-800/50 hover:bg-emerald-800 px-4 py-2 rounded-lg">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </header>
  );
}