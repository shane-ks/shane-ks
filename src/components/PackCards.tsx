import { CREDIT_PACKS, formatUsd, perCreditLabel } from "@/lib/credits";

interface Props {
  onBuy?: (packId: string) => void;
  busyPack?: string | null;
  compact?: boolean;
}

/**
 * Credit-pack pricing cards. With `onBuy` they render buy buttons (in-app);
 * without it they render a marketing CTA suitable for the landing page.
 */
export default function PackCards({ onBuy, busyPack, compact }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CREDIT_PACKS.map((pack) => {
        const highlighted = Boolean(pack.badge);
        return (
          <div
            key={pack.id}
            className={`relative rounded-2xl border p-6 ${
              highlighted
                ? "border-brand-500/40 bg-gradient-to-b from-white/10 to-white/5 glow"
                : "border-white/10 bg-white/5"
            }`}
          >
            {pack.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                {pack.badge}
              </span>
            )}
            <div className="text-sm font-medium text-brand-300">{pack.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{formatUsd(pack.priceCents)}</span>
              <span className="text-sm text-slate-400">once</span>
            </div>
            <div className="mt-1 text-sm text-slate-300">
              {pack.credits} credits
              <span className="text-slate-500"> · {perCreditLabel(pack)}</span>
            </div>
            {!compact && (
              <p className="mt-3 text-sm text-slate-400">{pack.blurb}</p>
            )}
            {onBuy ? (
              <button
                onClick={() => onBuy(pack.id)}
                disabled={busyPack === pack.id}
                className={`mt-5 w-full rounded-xl px-4 py-2.5 font-semibold disabled:opacity-60 ${
                  highlighted
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-white/15 text-white hover:bg-white/10"
                }`}
              >
                {busyPack === pack.id ? "Redirecting…" : "Buy credits"}
              </button>
            ) : (
              <a
                href="/app"
                className={`mt-5 block w-full rounded-xl px-4 py-2.5 text-center font-semibold ${
                  highlighted
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-white/15 text-white hover:bg-white/10"
                }`}
              >
                Get started
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
