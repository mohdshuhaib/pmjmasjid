import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function AdminLogin() {

  const loginAction = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return redirect("/admin/login?error=Failed");
    redirect("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <form action={loginAction} className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-96 border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Admin Portal</h2>

        <input type="email" name="email" required placeholder="Admin Email" className="w-full bg-slate-700 text-white border-none rounded-lg p-2.5 mb-4" />
        <input type="password" name="password" required placeholder="Password" className="w-full bg-slate-700 text-white border-none rounded-lg p-2.5 mb-6" />

        <button type="submit" className="w-full bg-emerald-600 text-white p-2.5 rounded-lg font-bold hover:bg-emerald-500">
          Access Portal
        </button>
      </form>
    </div>
  );
}