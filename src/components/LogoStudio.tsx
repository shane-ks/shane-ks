"use client";

import { useEffect, useState } from "react";
import type { BrandKit } from "@/lib/types";
import { LOGO_CREDIT_COST } from "@/lib/credits";
import { svgToDataUri } from "@/lib/svg";

interface Props {
  credits: number;
  onCredits: (credits: number) => void;
  onNeedCredits: () => void;
  seedName?: string;
}

const STYLE_HINTS = [
  "Minimal & modern",
  "Bold & playful",
  "Elegant & premium",
  "Techy & geometric",
  "Earthy & organic",
];

function downloadName(brand: string, style: string) {
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug(brand)}-${slug(style) || "logo"}.svg`;
}

export default function LogoStudio({
  credits,
  onCredits,
  onNeedCredits,
  seedName,
}: Props) {
  const [name, setName] = useState(seedName || "");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [error, setError] = useState<string | null>(null);

  // When a name is sent over from the name finder, adopt it.
  useEffect(() => {
    if (seedName) {
      setName(seedName);
      setKit(null);
      setError(null);
    }
  }, [seedName]);

  const tooPoor = credits < LOGO_CREDIT_COST;

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    setError(null);
    setKit(null);

    try {
      const res = await fetch("/api/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, style }),
      });

      if (res.status === 402) {
        onNeedCredits();
        setError(`Designing a brand kit costs ${LOGO_CREDIT_COST} credits. Top up below.`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong. Please retry.");
      }

      const data = await res.json();
      setKit(data.brandKit as BrandKit);
      if (typeof data.credits === "number") onCredits(data.credits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Design a brand</h1>
      <p className="mt-2 text-slate-400">
        Enter a name and get logo concepts, a color palette, and a font pairing —
        as crisp, downloadable vector files. Each brand kit costs{" "}
        {LOGO_CREDIT_COST} credits.
      </p>

      <form onSubmit={handleGenerate} className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="logo-name" className="sr-only">
              Company name
            </label>
            <input
              id="logo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Company name (e.g. Verdabrew)"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="logo-style" className="sr-only">
              Style direction
            </label>
            <input
              id="logo-style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              maxLength={300}
              placeholder="Style direction (optional)"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STYLE_HINTS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setStyle(h)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
            >
              {h}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !name.trim() || tooPoor}
            className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {loading
              ? "Designing…"
              : `Generate brand kit (${LOGO_CREDIT_COST} credits)`}
          </button>
          {tooPoor && (
            <span className="text-sm text-rose-300">
              Need {LOGO_CREDIT_COST} credits — top up to continue.
            </span>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      )}

      {kit && !loading && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Logo concepts for{" "}
              <span className="gradient-text">{kit.name}</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kit.concepts.map((c, i) => {
                const uri = svgToDataUri(c.svg);
                return (
                  <div
                    key={i}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div className="flex aspect-square items-center justify-center bg-white p-6">
                      {/* Rendered as <img> so SVG can't execute scripts. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uri}
                        alt={`${kit.name} ${c.style} logo`}
                        className="max-h-full max-w-full"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="text-sm font-semibold text-white">
                        {c.style}
                      </div>
                      {c.rationale && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          {c.rationale}
                        </p>
                      )}
                      <a
                        href={uri}
                        download={downloadName(kit.name, c.style)}
                        className="mt-3 inline-block rounded-lg border border-white/15 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-white/10"
                      >
                        Download SVG
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {kit.palette.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Color palette
              </h3>
              <div className="flex flex-wrap gap-3">
                {kit.palette.map((c, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="h-16 w-16 rounded-xl border border-white/10"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} ${c.hex}`}
                    />
                    <div className="mt-1 text-xs text-slate-300">{c.name}</div>
                    <div className="text-[10px] uppercase text-slate-500">
                      {c.hex}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Font pairing
            </h3>
            <div className="flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div>
                <div className="text-xs text-slate-500">Headings</div>
                <div className="text-lg font-semibold text-white">
                  {kit.fonts.heading}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Body</div>
                <div className="text-lg font-semibold text-white">
                  {kit.fonts.body}
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
            {credits} credit{credits === 1 ? "" : "s"} remaining.
          </div>
        </div>
      )}
    </div>
  );
}
