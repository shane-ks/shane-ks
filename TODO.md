# Production-Readiness Audit — NameVoid

**Question:** Can this be deployed right now (ignoring missing API keys) and make
money? Is it high quality?

**Verdict:** **Yes — after the fixes below, all of which are implemented in this
branch.** The application code is production-ready: it builds clean
(`npm run build`), unit tests pass (`npm test`), monetization is correct and
abuse-resistant, and the legal/SEO/security baseline a paid product needs is in
place. The only remaining work is **operational configuration** (provisioning
the third-party accounts and running the migrations) — that's expected and
documented in the README, not a code defect.

Each gap found during the review is listed below with its fix. All code tasks
are complete and checked.

---

## 1. Monetization correctness & integrity

- [x] **Switch from lifetime pass to credits.** 1 credit = 1 search; new accounts
  get 3 free credits; credits sold in one-time packs. Pricing lives in a single
  server-trusted catalog (`src/lib/credits.ts`) — the client can never set a
  price or credit amount.
- [x] **Webhook idempotency.** Stripe retries deliver the same event id. A
  `purchases` table with a `unique` `stripe_event_id` makes credit-granting
  exactly-once (`23505` unique-violation → acknowledged as a duplicate). Without
  this, a retried webhook would double-grant credits.
- [x] **Atomic credit accounting + refund on failure.** Credits are *reserved*
  before the expensive AI/web-search work via the `reserve_credit` SQL function
  (`UPDATE … WHERE credits > 0` — atomic), preventing concurrent requests from
  overspending a single credit. If generation fails, the credit is refunded
  (`refund_credit`). A user is never charged for a failed search.
- [x] **Server computes the price.** Checkout resolves the pack by id on the
  server and builds the Stripe line item from `priceCents` — never from the
  request body.

## 2. Cost & abuse control (don't lose money on API spend)

- [x] **Web-search budget cap.** `ANTHROPIC_MAX_WEB_SEARCHES` (default 10) bounds
  the most expensive part of cost-of-goods per credit.
- [x] **Credit gating is the primary cost ceiling** — every search costs a paid
  credit, so total spend is bounded by revenue.
- [x] **Per-user rate limit.** Minimum interval between generations
  (`last_generate_at`) throttles hammering on top of credit gating.
- [x] **Input validation.** Prompt length cap (600 chars) and name-count bounds
  (3–12) prevent oversized/expensive requests.

## 3. Security

- [x] **CSRF / same-origin guard** on state-changing POSTs (`/api/generate`,
  `/api/stripe/checkout`) via Origin/Referer check on top of SameSite cookies.
- [x] **Service-role key is server-only**; RLS restricts every table to the owner;
  entitlement (credits) can never be self-granted — all writes go through the
  service role or `SECURITY DEFINER` functions.
- [x] **Security headers** (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  Referrer-Policy, Permissions-Policy) via `next.config.mjs`; `poweredByHeader`
  disabled.
- [x] **Stripe webhook verifies the signature** against the raw body.
- [x] **Patched Next.js** (15.5.19) — off the version with the published advisory.

## 4. Reliability / correctness

- [x] **Profile self-heal.** If the signup trigger didn't create a profile row,
  the app and `/api/generate` upsert one so credit accounting always has a home.
- [x] **Empty-result handling.** If brainstorming yields no names, the credit is
  refunded and a clear error is returned instead of persisting an empty search.
- [x] **Graceful AI/network failure** — `try/catch` around the model calls returns
  a 502 with a user-facing message and refunds the credit.

## 5. Legal & compliance (required to take payments)

- [x] **Terms of Service** (`/terms`) — includes the "not a trademark search /
  not legal advice" disclaimer and the credits/refund policy.
- [x] **Privacy Policy** (`/privacy`) — discloses data collected and the
  Supabase / Stripe / Anthropic processors.
- [x] Footer links to both from the landing page.

## 6. Discoverability / SEO (a marketing site has to be found)

- [x] Rich metadata + Open Graph / Twitter tags with `metadataBase`.
- [x] Dynamic Open Graph share image (`opengraph-image.tsx`).
- [x] `robots.txt` (app/api/auth routes disallowed) and `sitemap.xml`.
- [x] Favicon (`icon.svg`).

## 7. Quality / maintainability

- [x] **Automated tests** (`npm test`, Node test runner): pricing invariants
  (every pack priced above target COGS, ids unique, exactly one highlighted pack)
  and the model-output parser (JSON extraction, status normalization, evidence
  sanitization, confidence clamping).
- [x] **Accessibility** — labels on the prompt input.
- [x] **Dead-code cleanup** — removed the lifetime-pass flag, RPC, and UI.

---

## Operational setup (account owner, not code — see README)

These require credentials/accounts and so are intentionally out of scope of "the
code is ready," but must be done before go-live:

- [ ] Create a Supabase project; run `supabase/migrations/0001_init.sql` then
  `0002_credits.sql`; add the production redirect URL under Auth → URL config.
- [ ] Set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`).
- [ ] Create the Stripe account; register the webhook endpoint
  (`/api/stripe/webhook`, event `checkout.session.completed`) and set
  `STRIPE_WEBHOOK_SECRET`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- [ ] **Host that allows long serverless functions.** `/api/generate` runs the
  agentic web-search loop and can take up to ~2 minutes; deploy somewhere that
  permits it (e.g. Vercel Pro/Fluid functions or a Node server). `maxDuration` is
  set to 120s.
- [ ] Configure Supabase production SMTP for reliable magic-link email at volume.

## Recommended next (not blockers)

- Error monitoring (e.g. Sentry) for the API routes.
- Domain + social-handle availability checks alongside the web-usage check.
- A receipts/billing history page (the `purchases` table already records them).
