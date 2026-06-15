import Link from "next/link";
import { FREE_SIGNUP_CREDITS } from "@/lib/credits";
import PackCards from "@/components/PackCards";

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,rgba(99,102,241,0.25),transparent)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold tracking-tight">
          Name<span className="gradient-text">Void</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#how" className="text-slate-300 hover:text-white">
            How it works
          </Link>
          <Link href="#pricing" className="text-slate-300 hover:text-white">
            Pricing
          </Link>
          <Link
            href="/app"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-500"
          >
            Launch app
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Powered by live web research
        </div>
        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Find a company name <span className="gradient-text">nobody owns</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-slate-400">
          Describe your idea. NameVoid brainstorms brandable company names, then
          searches the web to tell you which are already taken — with receipts —
          and which are wide open for you to claim.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/app"
            className="glow rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-500"
          >
            Start finding names free
          </Link>
          <Link
            href="#pricing"
            className="rounded-xl border border-white/15 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/5"
          >
            See pricing
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {FREE_SIGNUP_CREDITS} free credits on signup · no credit card required
        </p>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">How it works</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Feature
            title="1. Describe your idea"
            body="Tell us what your company does, the vibe you want, and any words to lean into or avoid."
          />
          <Feature
            title="2. Brainstorm names"
            body="Our naming engine invents a batch of short, distinctive, brandable candidates tailored to your brief."
          />
          <Feature
            title="3. Check availability"
            body="Each name is researched against the live web. Taken names come with evidence URLs. Open names are yours to grab."
          />
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-2 text-center text-3xl font-bold">
          Simple credit pricing
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-slate-400">
          1 credit = 1 search (a full batch of names, each checked for
          availability). Buy once, use anytime — credits never expire.
        </p>
        <PackCards />
        <p className="mt-6 text-center text-xs text-slate-500">
          Every account starts with {FREE_SIGNUP_CREDITS} free credits.
        </p>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <div className="mb-2 flex justify-center gap-4">
          <Link href="/terms" className="hover:text-slate-300">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-slate-300">
            Privacy
          </Link>
        </div>
        © {new Date().getFullYear()} NameVoid · Built with Next.js, Supabase &
        Stripe
      </footer>
    </main>
  );
}
