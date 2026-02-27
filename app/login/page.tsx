import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function MemberLogin() {

  const loginAction = async (formData: FormData) => {
    "use server";
    const pmjNo = formData.get("pmjNo") as string;
    const password = formData.get("password") as string;

    // Silently convert PMJ Number to Email format
    const email = `${pmjNo}@pmjmasjid.com`;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // In production, you might want to return an error state instead of redirecting
      return redirect("/login?error=Invalid credentials");
    }

    redirect("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <form action={loginAction}>
          <h2 className="text-2xl font-bold mb-6 text-center text-emerald-700">Member Login</h2>

          <label className="block text-sm font-medium text-slate-700 mb-1">PMJ Number</label>
          <input
            type="number"
            name="pmjNo"
            required
            className="w-full border border-slate-300 rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. 15"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full border border-slate-300 rounded-lg p-2.5 mb-6 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <button type="submit" className="w-full bg-emerald-600 text-white p-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
            Login securely
          </button>
        </form>

        {/* Link to Admin Portal */}
        <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Are you a committee member? <br />
          <Link href="/admin/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline mt-1 inline-block">
            Go to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}