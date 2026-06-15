"use client";

import { useEffect, useState } from "react";

type Status = "available" | "taken";

interface DemoName {
  name: string;
  status: Status;
  host?: string;
}

const RUNS: { prompt: string; names: DemoName[] }[] = [
  {
    prompt: "eco-friendly coffee subscription",
    names: [
      { name: "Verdabrew", status: "available" },
      { name: "Roastwell", status: "taken", host: "roastwell.co" },
      { name: "Mosspour", status: "available" },
      { name: "Beanwise", status: "taken", host: "beanwise.com" },
    ],
  },
  {
    prompt: "AI finance app for Gen Z",
    names: [
      { name: "Centvel", status: "available" },
      { name: "Pocketly", status: "taken", host: "pocketly.app" },
      { name: "Fynbo", status: "available" },
      { name: "Dimebox", status: "taken", host: "dimebox.io" },
    ],
  },
  {
    prompt: "recycled-fabric streetwear brand",
    names: [
      { name: "Reweave", status: "available" },
      { name: "Loomback", status: "taken", host: "loomback.com" },
      { name: "Threddle", status: "available" },
      { name: "Wastenot", status: "taken", host: "wastenot.store" },
    ],
  },
];

const BLIPS = [
  { top: "22%", left: "30%", status: "available" as Status, delay: "0s" },
  { top: "62%", left: "66%", status: "taken" as Status, delay: "0.8s" },
  { top: "44%", left: "78%", status: "available" as Status, delay: "1.6s" },
  { top: "70%", left: "28%", status: "taken" as Status, delay: "1.2s" },
];

export default function RadarHero() {
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState("");

  // Cycle through demo runs.
  useEffect(() => {
    const id = setInterval(() => setRun((r) => (r + 1) % RUNS.length), 5600);
    return () => clearInterval(id);
  }, []);

  // Typewriter for the active prompt.
  useEffect(() => {
    const text = RUNS[run].prompt;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [run]);

  const names = RUNS[run].names;

  return (
    <div className="glass glow relative w-full overflow-hidden rounded-3xl p-6">
      {/* header */}
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-slate-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
          </span>
          Scanning the live web
        </span>
        <span className="text-slate-500">NameRadar</span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Radar disc */}
        <div className="relative h-40 w-40 shrink-0">
          <div className="absolute inset-0 rounded-full border border-sky-400/20" />
          <div className="absolute inset-[14%] rounded-full border border-sky-400/20" />
          <div className="absolute inset-[30%] rounded-full border border-sky-400/20" />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-sky-400/15" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-sky-400/15" />
          {/* sweep */}
          <div
            className="radar-sweep absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(56,189,248,0.45), rgba(56,189,248,0.05) 22%, transparent 30%)",
            }}
          />
          {/* blips */}
          {BLIPS.map((b, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{ top: b.top, left: b.left }}
            >
              <span
                className={`blip-pulse absolute inset-0 rounded-full ${
                  b.status === "available" ? "bg-emerald-400" : "bg-rose-400"
                }`}
                style={{ animationDelay: b.delay }}
              />
              <span
                className={`absolute inset-0 rounded-full ${
                  b.status === "available" ? "bg-emerald-300" : "bg-rose-300"
                }`}
              />
            </span>
          ))}
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200" />
        </div>

        {/* Live result feed */}
        <div className="min-w-0 flex-1">
          <div className="truncate rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            <span className="text-slate-500">prompt:</span> {typed}
            <span className="ml-0.5 inline-block w-px animate-pulse bg-slate-300">&nbsp;</span>
          </div>

          <ul key={run} className="mt-3 space-y-2">
            {names.map((n, i) => (
              <li
                key={n.name}
                className="pop-in flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                style={{ animationDelay: `${0.5 + i * 0.45}s` }}
              >
                <span className="truncate font-medium text-white">{n.name}</span>
                {n.status === "available" ? (
                  <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    ✓ Available
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs">
                    <span className="hidden text-slate-500 sm:inline">{n.host}</span>
                    <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-medium text-rose-300">
                      Taken
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
