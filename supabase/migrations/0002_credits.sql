-- Migrate from a single lifetime pass to a credit-based model.
-- 1 credit = 1 search. New users get a free trial allotment.

-- ---------------------------------------------------------------------------
-- profiles: add credits + a rate-limit timestamp; retire the lifetime flag.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists credits integer not null default 3,
  add column if not exists last_generate_at timestamptz;

-- Backfill: anyone who already held a lifetime pass keeps generous credits.
update public.profiles
   set credits = greatest(credits, 1000)
 where has_lifetime_pass is true;

-- New users get 3 free credits (matches FREE_SIGNUP_CREDITS in the app).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 3)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- purchases: ledger of completed Stripe payments. The unique stripe_event_id
-- makes the webhook idempotent (Stripe retries deliver the same event id).
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_event_id text unique not null,
  stripe_session_id text,
  pack_id text,
  credits integer not null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own"
  on public.purchases for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reserve_credit: atomically spend one credit if the user has any. Returns the
-- remaining balance, or -1 if the user is out of credits. Reserving up front
-- (before the expensive generation) prevents concurrent requests from
-- overspending a single credit.
-- ---------------------------------------------------------------------------
create or replace function public.reserve_credit(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
     set credits = credits - 1,
         last_generate_at = now()
   where id = p_user_id
     and credits > 0
  returning credits into remaining;

  if not found then
    return -1; -- no row updated => out of credits (or missing profile)
  end if;
  return remaining;
end;
$$;

-- ---------------------------------------------------------------------------
-- refund_credit: give a reserved credit back (used when generation fails).
-- ---------------------------------------------------------------------------
create or replace function public.refund_credit(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
     set credits = credits + 1
   where id = p_user_id
  returning credits into remaining;
  return coalesce(remaining, 0);
end;
$$;

-- ---------------------------------------------------------------------------
-- grant_credits: add purchased credits (called by the Stripe webhook).
-- ---------------------------------------------------------------------------
create or replace function public.grant_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
     set credits = credits + p_amount
   where id = p_user_id
  returning credits into remaining;
  return coalesce(remaining, 0);
end;
$$;
