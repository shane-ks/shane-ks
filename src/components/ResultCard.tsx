import type { NameResult } from "@/lib/types";

const STATUS_STYLES: Record<
  NameResult["status"],
  { label: string; badge: string; ring: string }
> = {
  available: {
    label: "Available",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    ring: "border-emerald-500/20",
  },
  taken: {
    label: "Taken",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    ring: "border-white/10",
  },
  uncertain: {
    label: "Uncertain",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    ring: "border-white/10",
  },
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ResultCard({
  result,
  onCreateLogo,
}: {
  result: NameResult;
  onCreateLogo?: (name: string) => void;
}) {
  const style = STATUS_STYLES[result.status];

  return (
    <div
      className={`rounded-2xl border ${style.ring} bg-white/5 p-5 transition hover:bg-white/[0.07]`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">{result.name}</h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {result.reasoning && (
        <p className="mt-2 text-sm text-slate-400">{result.reasoning}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${result.confidence}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">
          {result.confidence}% confidence
        </span>
      </div>

      {result.evidence.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Evidence
          </div>
          <ul className="space-y-1">
            {result.evidence.map((e, i) => (
              <li key={i}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-brand-300 hover:text-brand-200"
                >
                  <span className="truncate">{e.title || hostname(e.url)}</span>
                  <span className="shrink-0 text-xs text-slate-500 group-hover:text-slate-400">
                    {hostname(e.url)} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onCreateLogo && (
        <button
          onClick={() => onCreateLogo(result.name)}
          className="mt-4 w-full rounded-lg border border-brand-500/30 bg-brand-600/10 px-3 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-600/20"
        >
          🎨 Design a logo for {result.name}
        </button>
      )}
    </div>
  );
}
