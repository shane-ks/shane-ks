import Link from "next/link";

const FREE_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_SEARCH_LIMIT || 3);

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
          Describe your idea. NameVoid brainstorms brandable names, then searches
          the web to tell you which are already taken — with receipts — and which
          are wide open for you to claim.
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
          {FREE_LIMIT} free searches · no credit card required
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

      <section id="pricing" className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">
          One price. Forever.
        </h2>
        <div className="glow rounded-3xl border border-brand-500/30 bg-gradient-to-b from-white/10 to-white/5 p-8 text-center">
          <div className="text-sm font-medium uppercase tracking-wider text-brand-300">
            Lifetime Pass
          </div>
          <div className="mt-3 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold">$10</span>
            <span className="text-slate-400">once</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Pay once, search forever. No subscription, no renewals.
          </p>
          <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm text-slate-300">
            {[
              "Unlimited name searches",
              "Live web availability checks",
              "Evidence URLs for taken names",
              "Full searchable history",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/app"
            className="mt-8 inline-block w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-500"
          >
            Get the Lifetime Pass
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            Start with {FREE_LIMIT} free searches first.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} NameVoid · Built with Next.js, Supabase &
        Stripe
      </footer>
    </main>
  );
}
