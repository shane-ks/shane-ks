"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Wordmark from "@/components/Wordmark";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/app` },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Wordmark className="text-xl" />
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          {sent ? (
            <div className="text-center">
              <div className="mb-3 text-4xl">📬</div>
              <h1 className="text-xl font-semibold">Check your inbox</h1>
              <p className="mt-2 text-sm text-slate-400">
                We sent a magic sign-in link to{" "}
                <span className="text-white">{email}</span>. Click it to log in.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">Sign in</h1>
              <p className="mt-1 text-sm text-slate-400">
                Enter your email and we&apos;ll send you a magic link — no
                password needed.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500"
                />
                {error && (
                  <p className="text-sm text-rose-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing you agree to the terms of service.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
