# NameVoid

**Find a company name nobody owns.** Describe your idea, NameVoid brainstorms
brandable company names, then researches the live web to tell you which are
already taken — _with evidence URLs_ — and which are wide open to claim.

Built with **Next.js 15** (App Router), **Supabase** (auth + Postgres), and
**Stripe** (one-time $10 lifetime pass). The naming engine is powered by Claude
with the native web-search tool.

---

## How it works

1. **Describe your idea** — a one-line brief about your company.
2. **Brainstorm** — Claude invents a batch of short, distinctive candidate names.
3. **Check availability** — each name is researched against the live web and
   classified as `available`, `taken`, or `uncertain`. Taken names come with
   real evidence URLs of the companies already using them.

### Monetization

- Every signed-in user gets **3 free searches** (`NEXT_PUBLIC_FREE_SEARCH_LIMIT`).
- After that, a **$10 one-time Lifetime Pass** unlocks unlimited searches forever.
- Purchases run through Stripe Checkout; a webhook grants the entitlement.

---

## Tech / architecture

| Concern        | Implementation                                                        |
| -------------- | --------------------------------------------------------------------- |
| Framework      | Next.js 15 App Router, TypeScript, Tailwind CSS                       |
| Auth           | Supabase email magic-link (passwordless)                              |
| Database       | Supabase Postgres with Row Level Security                             |
| Naming engine  | `@anthropic-ai/sdk` + `web_search_20250305` server tool               |
| Payments       | Stripe Checkout (one-time payment) + signature-verified webhook        |
| Entitlement    | `profiles.has_lifetime_pass`, flipped by the webhook (service role)   |

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
      generate/route.ts       Brainstorm + research + persist + quota gate
      me/route.ts             Current user + entitlement
      searches/route.ts       Search history
      stripe/checkout/route.ts
      stripe/webhook/route.ts Grants lifetime pass on payment
  components/
    AppClient.tsx             Main interactive UI
    ResultCard.tsx            Per-name result with evidence links
  lib/
    anthropic.ts              brainstormNames() + researchNames()
    stripe.ts
    supabase/{client,server,admin}.ts
    types.ts
supabase/migrations/0001_init.sql
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
2. Run the migration in `supabase/migrations/0001_init.sql` (SQL Editor, or
   `supabase db push` with the CLI). It creates the `profiles`, `searches`, and
   `name_results` tables, RLS policies, the new-user trigger, and the
   `increment_free_search` RPC.
3. Copy your Project URL + anon key + **service role** key into `.env.local`.
4. **Auth → URL Configuration**: set the Site URL and add
   `http://localhost:3000/auth/callback` (and your production equivalent) as a
   redirect URL.

### 3. Anthropic

Add an `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com).
The naming engine uses the model in `ANTHROPIC_MODEL` (default
`claude-sonnet-4-6`) with the web-search tool.

### 4. Stripe

1. Grab your **secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY`.
2. (Optional) Create a one-time $10 Price and set `STRIPE_LIFETIME_PRICE_ID`.
   If you skip this, checkout uses an inline $10 line item.
3. Set up the webhook → `POST {SITE_URL}/api/stripe/webhook`, listening for
   `checkout.session.completed`. Put the signing secret in
   `STRIPE_WEBHOOK_SECRET`.

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
| `SUPABASE_SERVICE_ROLE_KEY`       | Server-only; writes results, grants pass |
| `ANTHROPIC_API_KEY`               | Naming + web research                    |
| `ANTHROPIC_MODEL`                 | Model id (default `claude-sonnet-4-6`)   |
| `STRIPE_SECRET_KEY`               | Stripe API                               |
| `STRIPE_WEBHOOK_SECRET`           | Verify webhook signatures                |
| `STRIPE_LIFETIME_PRICE_ID`        | Optional; one-time $10 price             |
| `NEXT_PUBLIC_FREE_SEARCH_LIMIT`   | Free searches before paywall (default 3) |

---

## Deploy

Deploys cleanly to Vercel. Set all env vars in the project settings, point
`NEXT_PUBLIC_SITE_URL` at your production domain, add that domain to Supabase
Auth redirect URLs, and register the production Stripe webhook endpoint.

> **Note:** results are AI + web-search assessments, not a legal trademark
> search. Always do formal trademark/registration due diligence before
> committing to a name.
