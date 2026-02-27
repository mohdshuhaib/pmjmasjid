"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Loader2, AlertCircle, UserCircle2 } from "lucide-react";

export default function MemberLogin() {
  const [pmjNo, setPmjNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Silently convert PMJ Number to Email format
    const email = `${pmjNo}@pmjmasjid.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid PMJ Number or Password. Please check and try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh(); // Forces the middleware and layout to re-evaluate the session
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 relative overflow-hidden">

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-emerald-700/5 clip-path-slant pointer-events-none"></div>

      <div className="z-10 w-full max-w-md px-6">
        {/* Back to Home Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors text-sm font-bold mb-6 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
              <UserCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Member Login</h2>
            <p className="text-sm text-slate-500 mt-1">Access your family dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">PMJ Number</label>
              <input
                type="number"
                required
                value={pmjNo}
                onChange={(e) => setPmjNo(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800 font-mono text-lg"
                placeholder="e.g. 105"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login Securely"}
            </button>
          </form>

          {/* Link to Admin Portal */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Are you a committee member?
            </p>
            <Link href="/admin/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors mt-1 inline-block">
              Access Admin Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}