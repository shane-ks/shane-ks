# NameRadar

**Find the company name nobody's using — then design its brand.** Describe your
idea, NameRadar brainstorms brandable company names, scans the live web to tell
you which are already taken — _with evidence URLs_ — and which are wide open to
claim, then turns any winner into logo concepts and a brand kit.

Built with **Next.js 15** (App Router), **Supabase** (auth + Postgres), and
**Stripe** (one-time credit packs). Both the naming engine (with the native
web-search tool) and the logo/brand designer are powered by Claude.

---

## How it works

1. **Describe your idea** — a one-line brief about your company.
2. **Brainstorm** — Claude invents a batch of short, distinctive candidate names.
3. **Check availability** — each name is researched against the live web and
   classified as `available`, `taken`, or `uncertain`. Taken names come with
   real evidence URLs of the companies already using them.
4. **Design the brand** — turn any name into several vector (SVG) logo concepts
   plus a color palette and font pairing, all downloadable.

### Monetization — credits

One shared pool of credits funds everything:

- **1 credit = 1 name search** (a full batch of names, each availability-checked).
- **2 credits = 1 brand kit** (several logo concepts + palette + fonts).
- New accounts start with **3 free credits**.
- Credits are sold in **one-time packs** (no subscription) — buy once, use
  anytime, credits never expire:

| Pack | Price | Credits | Per credit |
| ------- | ----- | ------- | ---------- |
| Starter | $5    | 10      | $0.50      |
| Pro ⭐   | $15   | 40      | $0.375     |
| Studio  | $40   | 120     | $0.33      |

Packs are defined server-side in `src/lib/credits.ts` (the client can never set
a price). Prices sit above cost-of-goods (Anthropic web search at $10/1,000
plus Opus 4.8 tokens ≈ $0.30–0.45/search with the search cap in place; the bulk
Studio tier is deliberately thinner-margin).
Purchases run through Stripe Checkout; a signature-verified, **idempotent**
webhook grants the credits.

---

## Tech / architecture

| Concern        | Implementation                                                        |
| -------------- | --------------------------------------------------------------------- |
| Framework      | Next.js 15 App Router, TypeScript, Tailwind CSS                       |
| Auth           | Supabase email magic-link (passwordless)                              |
| Database       | Supabase Postgres with Row Level Security                             |
| Naming engine  | `@anthropic-ai/sdk` + `web_search_20250305` server tool               |
| Brand engine   | Claude generates self-contained SVG logos + palette + fonts (sanitized) |
| Payments       | Stripe Checkout (one-time credit packs) + idempotent webhook            |
| Entitlement    | `profiles.credits`, spent atomically per action, granted by the webhook |

Key paths:

```
src/
  app/
    page.tsx                  Landing / marketing page
    login/page.tsx            Magic-link sign in
    app/page.tsx              The product (auth-gated)
    auth/callback/route.ts    Magic-link redirect handler
    auth/signout/route.ts
    api/
      generate/route.ts       Brainstorm + research + persist + credit gate
      logo/route.ts           Generate a brand kit + credit gate (2 credits)
      me/route.ts             Current user + credit balance
      searches/route.ts       Search history
      stripe/checkout/route.ts
      stripe/webhook/route.ts Grants credits on payment
  components/
    AppClient.tsx             Main interactive UI (Find names / Design a brand)
    ResultCard.tsx            Per-name result with evidence + "design a logo"
    LogoStudio.tsx            Brand-kit generator UI
  lib/
    anthropic.ts              brainstormNames() + researchNames()
    logo.ts                   generateBrandKit() — SVG logos + palette + fonts
    svg.ts                    SVG sanitizer + data-URI helper (unit-tested)
    stripe.ts
    credits.ts                credit packs + per-action costs (server-trusted)
    parse.ts                  pure model-output parsing helpers (unit-tested)
    request.ts                same-origin/CSRF guard
    supabase/{client,server,admin}.ts
    types.ts
supabase/migrations/
  0001_init.sql               profiles, searches, name_results, RLS
  0002_credits.sql            credits, purchases (idempotency), credit RPCs
  0003_branding.sql           brand_kits + multi-credit reserve/refund RPCs
test/                         unit tests (npm test)
```

---

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations in order — `0001_init.sql`, `0002_credits.sql`, then
   `0003_branding.sql` (SQL Editor, or `supabase db push` with the CLI). They
   create the `profiles`, `searches`, `name_results`, `purchases`, and
   `brand_kits` tables, RLS policies, the new-user trigger, and the credit RPCs
   (`reserve_credit(s)`, `refund_credit(s)`, `grant_credits`).
3. Copy your Project URL + anon key + **service role** key into `.env.local`.
4. **Auth → URL Configuration**: set the Site URL and add
   `http://localhost:3000/auth/callback` (and your production equivalent) as a
   redirect URL.

### 3. Anthropic

Add an `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com).
The naming engine (with the web-search tool) and the logo/brand designer both
use the model in `ANTHROPIC_MODEL` (default `claude-opus-4-8` for the
highest-quality output; set `claude-sonnet-4-6` to roughly halve token cost).

### 4. Stripe

1. Grab your **secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY`.
2. No products to create — checkout builds each credit pack as an inline price
   from `src/lib/credits.ts`. Edit that file to change packs/pricing.
3. Set up the webhook → `POST {SITE_URL}/api/stripe/webhook`, listening for
   `checkout.session.completed`. Put the signing secret in
   `STRIPE_WEBHOOK_SECRET`. (The webhook is idempotent — safe across retries.)

   For local testing:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 5. Run

```bash
npm run dev
# open http://localhost:3000
```

---

## Environment variables

See `.env.example`. Summary:

| Variable                          | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | Base URL for redirects / auth callbacks  |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anon/publishable key            |
| `SUPABASE_SERVICE_ROLE_KEY`       | Server-only; writes results, grants credits |
| `ANTHROPIC_API_KEY`               | Naming + web research                    |
| `ANTHROPIC_MODEL`                 | Model id (default `claude-opus-4-8`)     |
| `ANTHROPIC_MAX_WEB_SEARCHES`      | Per-search web-search cap (default 10)   |
| `STRIPE_SECRET_KEY`               | Stripe API                               |
| `STRIPE_WEBHOOK_SECRET`           | Verify webhook signatures                |

---

## Tests

```bash
npm test   # Node test runner — pricing invariants + model-output parsing
```

## Deploy

Deploys cleanly to Vercel. Set all env vars in the project settings, point
`NEXT_PUBLIC_SITE_URL` at your production domain, add that domain to Supabase
Auth redirect URLs, and register the production Stripe webhook endpoint.

> **Long functions:** `/api/generate` runs an agentic web-search loop and can
> take up to ~2 minutes (`maxDuration = 120`). Deploy on a host that allows it
> (Vercel Pro/Fluid functions, or a Node server) — the default Vercel Hobby 10s
> limit will cut searches short.

See `TODO.md` for the full production-readiness audit.

> **Note:** results are AI + web-search assessments, not a legal trademark
> search. Always do formal trademark/registration due diligence before
> committing to a name.
