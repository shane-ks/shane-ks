import { BRAND } from "@/lib/brand";

/** Inline radar glyph used in the logo. */
function RadarGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="wm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="none" stroke="url(#wm)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="url(#wm)" strokeWidth="1.5" opacity="0.7" />
      <path d="M12 12 L12 3" stroke="url(#wm)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12 L20 9" stroke="url(#wm)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill="url(#wm)" />
    </svg>
  );
}

export default function Wordmark({
  className = "",
  showGlyph = true,
}: {
  className?: string;
  showGlyph?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      {showGlyph && <RadarGlyph className="h-5 w-5" />}
      <span>
        {BRAND.prefix}
        <span className="gradient-text">{BRAND.accent}</span>
      </span>
    </span>
  );
}
