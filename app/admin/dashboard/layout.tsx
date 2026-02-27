import React from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}