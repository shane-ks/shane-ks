import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LOGO_CREDIT_COST } from "@/lib/credits";
import type { NameResult } from "@/lib/types";
import Wordmark from "@/components/Wordmark";
import RadarHero from "@/components/RadarHero";
import ResultCard from "@/components/ResultCard";
import PackCards from "@/components/PackCards";

// Static, trusted sample logos for the branding showcase (safe to inline).
const WORDMARK_SVG = `<svg viewBox="0 0 240 80" width="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="34" r="7" fill="#10b981"/><path d="M20 27c-5 3-5 11 0 14 5-3 5-11 0-14z" fill="#fff"/><text x="38" y="48" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#0f172a">Verda<tspan fill="#10b981">brew</tspan></text></svg>`;
const MONOGRAM_SVG = `<svg viewBox="0 0 120 120" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="104" height="104" rx="26" fill="#0f172a"/><path d="M40 42l20 40 20-40" fill="none" stroke="#10b981" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const EMBLEM_SVG = `<svg viewBox="0 0 120 120" width="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="50" fill="none" stroke="#4f46e5" stroke-width="3"/><circle cx="60" cy="60" r="40" fill="none" stroke="#4f46e5" stroke-width="1" opacity="0.4"/><path d="M60 44c-9 5-9 22 0 27 9-5 9-22 0-27z" fill="#10b981"/><text x="60" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="#0f172a">VERDABREW</text></svg>`;
const ABSTRACT_SVG = `<svg viewBox="0 0 120 120" width="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="48" cy="56" r="28" fill="#10b981" opacity="0.85"/><circle cx="72" cy="56" r="28" fill="#4f46e5" opacity="0.7"/><circle cx="60" cy="44" r="20" fill="#0f172a"/></svg>`;

const SHOWCASE: NameResult[] = [
  {
    name: "Verdabrew",
    status: "available",
    confidence: 94,
    reasoning: "No active company or registered brand found under this exact name.",
    evidence: [],
  },
  {
    name: "Northwind Labs",
    status: "taken",
    confidence: 90,
    reasoning: "An established software consultancy already operates under this name.",
    evidence: [
      { title: "Northwind Labs — Software Studio", url: "https://northwindlabs.com" },
    ],
  },
  {
    name: "Mosspour",
    status: "available",
    confidence: 88,
    reasoning: "No meaningful existing use detected across the web.",
    evidence: [],
  },
  {
    name: "Lumora",
    status: "taken",
    confidence: 86,
    reasoning: "Used by an existing smart-lighting brand with an active storefront.",
    evidence: [
      { title: "Lumora — Smart Lighting", url: "https://lumora.com" },
      { title: "Lumora on Crunchbase", url: "https://crunchbase.com/lumora" },
    ],
  },
];

function StepCard({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20 text-lg font-bold text-brand-300">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group glass rounded-xl px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-white">
        {q}
        <span className="ml-4 text-slate-400 transition group-open:rotate-45">＋</span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{a}</p>
    </details>
  );
}

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Animated aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora absolute -left-40 top-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="aurora absolute right-[-10%] top-[20%] h-[30rem] w-[30rem] rounded-full bg-sky-500/20 blur-[120px]" style={{ animationDelay: "5s" }} />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Wordmark className="text-xl" />
          <nav className="flex items-center gap-5 text-sm">
            <Link href="#how" className="hidden text-slate-300 hover:text-white sm:block">
              How it works
            </Link>
            <Link href="#pricing" className="hidden text-slate-300 hover:text-white sm:block">
              Pricing
            </Link>
            <Link
              href="/app"
              className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-500"
            >
              Launch app
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2 lg:pt-24">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live web research · powered by Claude Opus 4.8
          </div>
          <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Find the company name{" "}
            <span className="gradient-text">nobody&apos;s using</span>.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-slate-400">
            Describe your idea. {BRAND.name} brainstorms brandable names, then
            scans the live web to show you which are wide open to claim — and
            which are already taken, <span className="text-slate-200">with proof</span>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="glow rounded-xl bg-brand-600 px-7 py-3.5 text-center text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Get started
            </Link>
            <Link
              href="#how"
              className="rounded-xl border border-white/15 px-7 py-3.5 text-center text-base font-semibold text-white transition hover:bg-white/5"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>✓ Pay only for what you use</span>
            <span>✓ Evidence for every taken name</span>
            <span>✓ Credits never expire</span>
          </div>
        </div>

        <div className="fade-up" style={{ animationDelay: "0.15s" }}>
          <RadarHero />
        </div>
      </section>

      {/* Logo / trust strip */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 text-sm text-slate-400">
          <span>🔎 Real web search, not guesses</span>
          <span>🧾 Receipts for taken names</span>
          <span>🎨 Logos &amp; brand kits</span>
          <span>♾️ Credits never expire</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          From idea to an open name in three steps
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
          No more typing names into a domain registrar one by one.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <StepCard
            n="1"
            title="Describe your idea"
            body="Tell us what your company does, the vibe you want, and any words to lean into or avoid."
          />
          <StepCard
            n="2"
            title="Brainstorm names"
            body="The engine invents a batch of short, distinctive, brandable candidates tailored to your brief."
          />
          <StepCard
            n="3"
            title="Scan availability"
            body="Each name is researched against the live web. Taken names come with evidence URLs; open ones are yours to grab."
          />
        </div>
      </section>

      {/* Results showcase */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">See what a scan looks like</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Every result is sorted into available vs. taken — with confidence
              and the exact sources behind each verdict.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SHOWCASE.map((r) => (
              <ResultCard key={r.name} result={r} />
            ))}
          </div>
        </div>
      </section>

      {/* Branding feature */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-xs text-brand-200">
              🎨 New
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Found a winner? Design its brand in a click.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Turn any available name into logo concepts, a color palette, and a
              font pairing — as crisp, downloadable vector files. {LOGO_CREDIT_COST}{" "}
              credits per brand kit.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Wordmark", svg: WORDMARK_SVG },
              { label: "Monogram", svg: MONOGRAM_SVG },
              { label: "Emblem", svg: EMBLEM_SVG },
              { label: "Abstract mark", svg: ABSTRACT_SVG },
            ].map((t) => (
              <div
                key={t.label}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div
                  className="flex aspect-square items-center justify-center bg-white p-6"
                  dangerouslySetInnerHTML={{ __html: t.svg }}
                />
                <div className="p-3 text-center text-xs font-medium text-slate-300">
                  {t.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Sample concepts for the name “Verdabrew.”
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Simple credit pricing
        </h2>
        <p className="mx-auto mb-12 mt-3 max-w-xl text-center text-slate-400">
          One pool of credits for everything: a name scan costs 1 credit, a full
          brand kit costs {LOGO_CREDIT_COST}. Buy once, use anytime — credits
          never expire.
        </p>
        <PackCards />
        <p className="mt-6 text-center text-xs text-slate-500">
          No subscription — pay only for what you use, and credits never expire.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">Questions</h2>
        <div className="space-y-3">
          <Faq
            q="How does NameRadar know if a name is taken?"
            a="For each candidate, it runs live web searches looking for an existing company, product, startup, or registered brand using that exact name. If it finds a real, active organization, the name is marked taken and the source URLs are shown as evidence."
          />
          <Faq
            q="Is this a trademark or domain search?"
            a="No. Results are an AI + web-research assessment of real-world usage, not a legal trademark search or domain registration check. Always do formal trademark and registration due diligence before adopting a name."
          />
          <Faq
            q="What is a credit?"
            a="One credit runs one full scan — a batch of brandable names, each checked against the live web. Credits are a one-time purchase (no subscription), and a credit is automatically refunded if a scan fails."
          />
          <Faq
            q="Can it design a logo too?"
            a={`Yes. Once you've found an open name, generate a brand kit for it — ${LOGO_CREDIT_COST} credits gets you several distinct logo concepts as downloadable vector (SVG) files, plus a matching color palette and font pairing.`}
          />
          <Faq
            q="Do credits expire?"
            a="Never. Credit packs are a one-time purchase with no subscription. Buy them when you need them and use them whenever."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="glow relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-600/20 to-sky-500/10 p-10 text-center sm:p-14">
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Your next company name is out there — open.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Stop second-guessing. Scan the web and claim a name that&apos;s
            actually yours.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Get started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <Wordmark className="text-base" />
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/app" className="hover:text-slate-300">
              Launch app
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} {BRAND.name} · Built with Next.js, Supabase
          &amp; Stripe
        </p>
      </footer>
    </main>
  );
}
