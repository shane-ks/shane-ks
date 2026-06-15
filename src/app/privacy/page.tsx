import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — NameRadar",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-brand-300 hover:text-brand-200">
        ← Back
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 15, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">What we collect</h2>
          <p>
            We collect your email address (for passwordless sign-in), the search
            prompts you submit, the names and results we generate for you, and
            your credit balance and purchase history.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">How we use it</h2>
          <p>
            Your data is used to operate the service: authenticating you, running
            and storing your searches, tracking credits, and processing payments.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Processors</h2>
          <p>
            We rely on third-party processors to provide the service:{" "}
            <strong>Supabase</strong> (authentication and database),{" "}
            <strong>Stripe</strong> (payments — we never see or store your card
            details), and <strong>Anthropic</strong> (the AI that brainstorms and
            researches names; your prompts are sent to it to generate results).
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Data retention</h2>
          <p>
            Your searches and results are stored so you can revisit them. You may
            request deletion of your account and associated data at any time.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Your rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct,
            or delete your personal data. Contact us to exercise them.
          </p>
        </section>
      </div>
    </main>
  );
}
