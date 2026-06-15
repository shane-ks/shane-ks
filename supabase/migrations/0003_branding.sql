-- Branding / logo generation.
-- A "brand kit" (logo concepts + palette + fonts) costs multiple credits, so we
-- need credit functions that reserve/refund an arbitrary amount atomically.

-- ---------------------------------------------------------------------------
-- reserve_credits: atomically spend N credits if the user has at least N.
-- Returns the remaining balance, or -1 if the user can't afford it. Reserving
-- up front (before expensive generation) prevents concurrent overspend.
-- ---------------------------------------------------------------------------
create or replace function public.reserve_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  if p_amount is null or p_amount < 1 then
    return -1;
  end if;

  update public.profiles
     set credits = credits - p_amount,
         last_generate_at = now()
   where id = p_user_id
     and credits >= p_amount
  returning credits into remaining;

  if not found then
    return -1; -- insufficient credits (or missing profile)
  end if;
  return remaining;
end;
$$;

-- ---------------------------------------------------------------------------
-- refund_credits: give N reserved credits back (used when generation fails).
-- ---------------------------------------------------------------------------
create or replace function public.refund_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
     set credits = credits + greatest(coalesce(p_amount, 0), 0)
   where id = p_user_id
  returning credits into remaining;
  return coalesce(remaining, 0);
end;
$$;

-- ---------------------------------------------------------------------------
-- brand_kits: a generated logo/branding set for a name.
--   palette  = [{ "name": "...", "hex": "#RRGGBB" }]
--   fonts    = { "heading": "...", "body": "..." }
--   concepts = [{ "style": "...", "rationale": "...", "svg": "<svg>...</svg>" }]
-- ---------------------------------------------------------------------------
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  prompt text,
  palette jsonb not null default '[]'::jsonb,
  fonts jsonb not null default '{}'::jsonb,
  concepts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.brand_kits enable row level security;

drop policy if exists "brand_kits_select_own" on public.brand_kits;
create policy "brand_kits_select_own"
  on public.brand_kits for select
  using (auth.uid() = user_id);

create index if not exists brand_kits_user_id_created_idx
  on public.brand_kits (user_id, created_at desc);
