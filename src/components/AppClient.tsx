"use client";

import { useCallback, useEffect, useState } from "react";
import type { NameResult } from "@/lib/types";
import ResultCard from "./ResultCard";

interface Props {
  email: string;
  initialHasPass: boolean;
  initialUsed: number;
  freeLimit: number;
}

const EXAMPLES = [
  "A cozy specialty coffee roaster with a nautical theme",
  "An AI-powered personal finance app for Gen Z",
  "A sustainable streetwear brand made from recycled fabric",
  "A B2B cybersecurity startup for small law firms",
];

export default function AppClient({
  email,
  initialHasPass,
  initialUsed,
  freeLimit,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NameResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hasPass, setHasPass] = useState(initialHasPass);
  const [used, setUsed] = useState(initialUsed);
  const [limitHit, setLimitHit] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const remaining = hasPass ? null : Math.max(0, freeLimit - used);

  const refreshMe = useCallback(async () => {
    const res = await fetch("/api/me");
    if (!res.ok) return;
    const data = await res.json();
    if (data.authenticated) {
      setHasPass(data.hasPass);
      setUsed(data.freeSearchesUsed);
    }
  }, []);

  // If we just came back from a successful Stripe checkout, refresh entitlement.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      // Webhooks can lag a moment; poll a few times.
      let tries = 0;
      const tick = async () => {
        await refreshMe();
        tries += 1;
        if (tries < 5) setTimeout(tick, 1500);
      };
      tick();
      window.history.replaceState({}, "", "/app");
    }
  }, [refreshMe]);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setLimitHit(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, count }),
      });

      if (res.status === 402) {
        setLimitHit(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong. Please retry.");
      }

      const data = await res.json();
      setResults(data.results as NameResult[]);
      if (data.usage) {
        setHasPass(data.usage.hasPass);
        setUsed(data.usage.freeSearchesUsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.message || "Could not start checkout.");
    } finally {
      setUpgrading(false);
    }
  }

  const available = results?.filter((r) => r.status === "available") ?? [];
  const taken = results?.filter((r) => r.status !== "available") ?? [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-bold">
            Name<span className="gradient-text">Void</span>
          </a>
          <div className="flex items-center gap-4 text-sm">
            {hasPass ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                ★ Lifetime Pass
              </span>
            ) : (
              <span className="text-slate-400">
                {remaining} free {remaining === 1 ? "search" : "searches"} left
              </span>
            )}
            <span className="hidden text-slate-500 sm:inline">{email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-slate-400 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Find an unclaimed name</h1>
        <p className="mt-2 text-slate-400">
          Describe your company and we&apos;ll brainstorm names, then check each
          one against the live web.
        </p>

        {/* Prompt form */}
        <form onSubmit={handleGenerate} className="mt-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. A sustainable streetwear brand made from recycled ocean plastic, playful and bold…"
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {loading ? "Searching the web…" : "Brainstorm & check"}
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              Names:
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-white outline-none focus:border-brand-500"
              >
                {[5, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </form>

        {/* Example chips */}
        {!results && !loading && (
          <div className="mt-6">
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Try an example
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Limit reached → upgrade */}
        {limitHit && (
          <div className="glow mt-6 rounded-2xl border border-brand-500/30 bg-gradient-to-b from-white/10 to-white/5 p-6 text-center">
            <h2 className="text-xl font-semibold">You&apos;re out of free searches</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Unlock unlimited name searches forever with the Lifetime Pass —
              just $10, paid once.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="mt-5 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {upgrading ? "Redirecting…" : "Get Lifetime Pass — $10"}
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-1 text-xl font-semibold text-emerald-300">
                ✓ Available · {available.length}
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                No meaningful existing use found — these look open to claim.
              </p>
              {available.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {available.map((r) => (
                    <ResultCard key={r.name} result={r} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  None this round — try tweaking your prompt for more options.
                </p>
              )}
            </section>

            {taken.length > 0 && (
              <section>
                <h2 className="mb-1 text-xl font-semibold text-rose-300">
                  Already in use · {taken.length}
                </h2>
                <p className="mb-4 text-sm text-slate-500">
                  These names map to existing companies — see the evidence.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {taken.map((r) => (
                    <ResultCard key={r.name} result={r} />
                  ))}
                </div>
              </section>
            )}

            {!hasPass && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
                {remaining} free {remaining === 1 ? "search" : "searches"}{" "}
                remaining.{" "}
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="font-semibold text-brand-300 hover:text-brand-200"
                >
                  Upgrade to unlimited for $10 →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
